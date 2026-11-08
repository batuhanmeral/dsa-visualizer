export type PanelTab = "about" | "code" | "growth";

const TAB_ORDER: readonly PanelTab[] = ["about", "code", "growth"];

/** The code panel's tabs, in display order; Code is always there. */
export function availableTabs(hasAbout: boolean, hasGrowth: boolean): PanelTab[] {
  return TAB_ORDER.filter(
    (tab) =>
      tab === "code" ||
      (tab === "about" && hasAbout) ||
      (tab === "growth" && hasGrowth)
  );
}

// About is the default so the server-rendered explainer is what loads first.
export function initialTab(tabs: readonly PanelTab[]): PanelTab {
  return tabs.includes("about") ? "about" : "code";
}

// Stepping the run means the reader wants to follow the code, not the prose.
export function tabAfterUserAdvance(tab: PanelTab): PanelTab {
  return tab === "about" ? "code" : tab;
}

/** WAI-ARIA tabs keyboard model: arrows wrap, Home/End jump, others are ignored. */
export function tabIndexForKey(
  current: number,
  key: string,
  count: number
): number | null {
  switch (key) {
    case "ArrowRight":
      return (current + 1) % count;
    case "ArrowLeft":
      return (current - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return null;
  }
}
