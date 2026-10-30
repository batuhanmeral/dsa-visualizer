export type ShareState = { values: number[]; target?: number; step: number };
export type ShareDefaults = { values: number[]; target?: number };

/** Query string for the current state; "" while it still equals the defaults. */
export function shareQuery(state: ShareState, defaults: ShareDefaults): string {
  const isDefault =
    state.step === 0 &&
    state.target === defaults.target &&
    state.values.length === defaults.values.length &&
    state.values.every((v, i) => v === defaults.values[i]);
  if (isDefault) return "";

  const p = new URLSearchParams();
  p.set("input", state.values.join(","));
  if (state.target !== undefined) p.set("target", String(state.target));
  p.set("step", String(state.step));
  return p.toString();
}
