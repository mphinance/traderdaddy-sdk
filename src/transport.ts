/**
 * transport.ts — Isomorphic MCP JSON-RPC transport over StreamableHTTP.
 *
 * Ported from DaddyBoard's `mcpClient.js`. The public endpoint
 * (`POST /api/v1/mcp`) is a *stateless* StreamableHTTP transport: a bare
 * `tools/call` is accepted directly — no `initialize` handshake — so we issue
 * exactly ONE POST per tool call (sending a handshake would triple the request
 * count against the per-key rate limit).
 *
 * Responses may be `application/json` or `text/event-stream` (SSE); both are
 * handled. The real payload lives at `result.content[0].text` and is JSON.
 *
 * Depends only on the global `fetch` / `AbortController` — no Node-only APIs —
 * so it runs in Node ≥18 and the browser alike. A custom `fetch` may be
 * injected for non-standard runtimes or testing.
 */

import { HttpError, JsonRpcError, RateLimitError } from './errors.js';
import type { ToolArgs } from './types.js';

export const DEFAULT_BASE_URL = 'https://api.traderdaddy.pro';
const MCP_PATH = '/api/v1/mcp';
const DEFAULT_TIMEOUT_MS = 45_000;

/** Minimal fetch signature the transport needs (matches the DOM `fetch`). */
export type FetchLike = (
  input: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    signal?: AbortSignal;
  },
) => Promise<{
  status: number;
  statusText: string;
  ok: boolean;
  headers: { get(name: string): string | null };
  text(): Promise<string>;
}>;

/** A transport turns a tool name + args into a typed payload. */
export interface Transport {
  callTool<T>(name: string, args?: ToolArgs): Promise<T>;
}

export interface HttpTransportOptions {
  apiKey: string;
  baseUrl?: string;
  /** Per-request timeout in ms. Default 45000. */
  timeoutMs?: number;
  /** Inject a `fetch` implementation. Defaults to the global `fetch`. */
  fetch?: FetchLike;
}

interface JsonRpcEnvelope {
  error?: { code: number; message: string };
  result?: { content?: Array<{ text?: string }> };
}

let _requestId = 1;
function nextId(): number {
  return _requestId++;
}

/** Parse the response body, handling both SSE and JSON content-types. */
async function parseBody(
  response: Awaited<ReturnType<FetchLike>>,
): Promise<JsonRpcEnvelope> {
  const ct = response.headers.get('content-type') ?? '';
  const text = await response.text();

  if (ct.includes('text/event-stream')) {
    // Find the last non-empty `data: …` line.
    let lastData: string | null = null;
    for (const line of text.split('\n')) {
      if (line.startsWith('data:')) {
        const candidate = line.slice(5).trim();
        if (candidate) lastData = candidate;
      }
    }
    if (!lastData) throw new HttpError(response.status, 'SSE response contained no data lines');
    return JSON.parse(lastData) as JsonRpcEnvelope;
  }

  return JSON.parse(text) as JsonRpcEnvelope;
}

export class HttpTransport implements Transport {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: FetchLike;

  constructor(opts: HttpTransportOptions) {
    this.apiKey = opts.apiKey;
    this.baseUrl = (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const f = opts.fetch ?? (globalThis.fetch as unknown as FetchLike | undefined);
    if (!f) {
      throw new Error(
        'No fetch implementation found. Upgrade to Node ≥18, or pass `{ fetch }` in the options.',
      );
    }
    this.fetchImpl = f;
  }

  /** Both auth styles the endpoint accepts — belt and suspenders. */
  private headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      'X-API-Key': this.apiKey,
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  async callTool<T>(name: string, args: ToolArgs = {}): Promise<T> {
    const body = {
      jsonrpc: '2.0',
      id: nextId(),
      method: 'tools/call',
      params: { name, arguments: args },
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Awaited<ReturnType<FetchLike>>;
    try {
      response = await this.fetchImpl(`${this.baseUrl}${MCP_PATH}`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    if (response.status === 429) {
      throw new RateLimitError('HTTP 429 from MCP endpoint');
    }
    if (!response.ok) {
      throw new HttpError(response.status, response.statusText);
    }

    const parsed = await parseBody(response);

    if (parsed.error) {
      const { code, message } = parsed.error;
      // -32000 is the endpoint's rate-limit signal.
      if (code === -32000) throw new RateLimitError(`JSON-RPC -32000: ${message}`);
      throw new JsonRpcError(code, message);
    }

    const content = parsed.result?.content;
    const payload = content?.[0]?.text;
    if (typeof payload !== 'string') {
      throw new HttpError(response.status, `Unexpected MCP result shape for tool ${name}`);
    }

    return JSON.parse(payload) as T;
  }
}
