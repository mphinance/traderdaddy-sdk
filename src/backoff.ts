/**
 * backoff.ts — Exponential backoff with jitter for rate-limited calls.
 *
 * Ported from DaddyBoard's `poller.js` backoff maths (base 2s, cap 60s,
 * ±1s jitter). Retries only on `RateLimitError`; any other error propagates
 * on the first throw.
 */

import { RateLimitError } from './errors.js';

export interface BackoffOptions {
  /** Max retry attempts after the first failure. Default 4. Set 0 to disable. */
  retries?: number;
  /** Base delay in ms (doubles each attempt). Default 2000. */
  baseMs?: number;
  /** Delay ceiling in ms. Default 60000. */
  capMs?: number;
  /** Max random jitter added to each delay, in ms. Default 1000. */
  jitterMs?: number;
  /** Called before each backoff sleep. */
  onRetry?: (info: { attempt: number; delayMs: number; error: RateLimitError }) => void;
  /** Injectable sleep (defaults to setTimeout). Handy in tests. */
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Compute the jittered delay for a given 0-based attempt index. */
export function backoffDelayMs(attempt: number, opts: BackoffOptions = {}): number {
  const baseMs = opts.baseMs ?? 2_000;
  const capMs = opts.capMs ?? 60_000;
  const jitterMs = opts.jitterMs ?? 1_000;
  const delay = Math.min(baseMs * 2 ** attempt, capMs);
  return delay + Math.random() * jitterMs;
}

/**
 * Run `fn`, retrying on `RateLimitError` with exponential backoff. Re-throws
 * the last `RateLimitError` once `retries` is exhausted; any non-rate-limit
 * error is thrown immediately.
 */
export async function withBackoff<T>(
  fn: () => Promise<T>,
  opts: BackoffOptions = {},
): Promise<T> {
  const retries = opts.retries ?? 4;
  const sleep = opts.sleep ?? defaultSleep;

  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (err) {
      if (!(err instanceof RateLimitError) || attempt >= retries) throw err;
      // Honor a server-supplied `Retry-After` when it asks for a longer wait
      // than our own backoff curve; never retry sooner than the server allows.
      const delayMs = Math.max(backoffDelayMs(attempt, opts), err.retryAfterMs ?? 0);
      opts.onRetry?.({ attempt: attempt + 1, delayMs, error: err });
      await sleep(delayMs);
      attempt++;
    }
  }
}
