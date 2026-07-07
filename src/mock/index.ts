/**
 * @traderdaddy/sdk/mock — first-class keyless demo mode.
 *
 * `MockTransport` satisfies the same `Transport` interface the live
 * `HttpTransport` does, resolving each tool call from a typed fixture instead
 * of the network. This is the mechanism that lets every downstream app in the
 * daddy-* family inherit keyless demo mode for free: `new TraderDaddy({ mock: true })`
 * simply swaps in this transport.
 *
 * The raw fixtures are re-exported too, for tests, Storybook, and screenshots.
 */

import type { Transport } from '../transport.js';
import type { ToolArgs } from '../types.js';
import * as fixtures from './fixtures.js';

export * as fixtures from './fixtures.js';

type FixtureValue = unknown | ((args?: ToolArgs) => unknown);

/** A `Transport` that serves typed fixtures with no network and no API key. */
export class MockTransport implements Transport {
  /** Simulated per-call latency in ms (0 = resolve on the microtask queue). */
  private readonly latencyMs: number;

  constructor(opts: { latencyMs?: number } = {}) {
    this.latencyMs = opts.latencyMs ?? 0;
  }

  async callTool<T>(name: string, args: ToolArgs = {}): Promise<T> {
    const fixture = (fixtures as Record<string, FixtureValue>)[name];
    if (fixture === undefined) {
      throw new Error(`No mock fixture for tool: ${name}`);
    }
    if (this.latencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.latencyMs));
    }
    const value = typeof fixture === 'function' ? fixture(args) : fixture;
    // Deep-clone so callers can't mutate the shared fixture between calls.
    return structuredClone(value) as T;
  }
}
