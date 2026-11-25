/**
 * Builds a large-n trace off the main thread: a 1000-value bubble sort takes
 * most of a second to trace, which would otherwise freeze the page.
 */
import { traceRun, traceTransfer, type RunTrace } from "./trace";

export interface TraceRequest {
  slug: string;
  input: number[];
  target?: number;
}

export interface TraceReply {
  trace: RunTrace | undefined;
}

self.onmessage = (e: MessageEvent<TraceRequest>) => {
  const { slug, input, target } = e.data;
  const trace = traceRun(slug, input, target);
  const reply: TraceReply = { trace };
  self.postMessage(reply, { transfer: trace ? traceTransfer(trace) : [] });
};
