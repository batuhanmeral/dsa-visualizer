"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Braces, Check, Copy, ScrollText } from "lucide-react";
// Type-only: the code table itself must stay on the server.
import type { AlgoCode } from "@/lib/algo-code";
import { codeFor } from "@/lib/code-layout";
import type { TKey } from "@/lib/dictionaries";
import type { CodeLang } from "@/lib/highlight";
import { useLang } from "@/lib/i18n";
import { tabIndexForKey, type PanelTab } from "@/lib/panel-tab";
import CodeView from "./code-view";

const TAB_LABEL: Record<PanelTab, TKey> = {
  about: "ws.tab.about",
  code: "ws.tab.code",
};

export const GROWTH_SECTION_ID = "growth";

const COPIED_FEEDBACK_MS = 1500;

interface CodePanelProps {
  tabs: readonly PanelTab[];
  activeTab: PanelTab;
  onTabChange: (tab: PanelTab) => void;
  about?: ReactNode;
  growth?: ReactNode;
  code: AlgoCode;
  codeLang: CodeLang;
  onCodeLangChange: (lang: CodeLang) => void;
  activeLine: number;
}

/** Code viewer with About and Code tabs (WAI-ARIA tabs pattern). */
export default function CodePanel({
  tabs,
  activeTab,
  onTabChange,
  about,
  growth,
  code,
  codeLang,
  onCodeLangChange,
  activeLine,
}: CodePanelProps) {
  const { t } = useLang();
  const idPrefix = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [codeCopied, setCodeCopied] = useState(false);
  const showCode = activeTab === "code";
  const shownCode = codeFor(code, codeLang);
  const tabId = (tab: PanelTab) => `${idPrefix}-tab-${tab}`;
  const panelId = (tab: PanelTab) => `${idPrefix}-panel-${tab}`;

  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const next = tabIndexForKey(tabs.indexOf(activeTab), e.key, tabs.length);
    if (next === null) return;
    e.preventDefault();
    onTabChange(tabs[next]);
    tabRefs.current[next]?.focus();
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(shownCode);
      setCodeCopied(true);
      window.setTimeout(() => setCodeCopied(false), COPIED_FEEDBACK_MS);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  const nextLang: CodeLang = codeLang === "c" ? "pseudo" : "c";
  const toggleLabel = t(nextLang === "pseudo" ? "ws.code.showPseudo" : "ws.code.showC");
  const cornerButtonClass =
    "flex size-10 items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-claude-500 lg:size-7";
  const idleIconClass =
    "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100";
  const codeActions = (
    <>
      <button
        type="button"
        onClick={() => onCodeLangChange(nextLang)}
        aria-label={toggleLabel}
        title={toggleLabel}
        className={`${cornerButtonClass} ${idleIconClass}`}
      >
        {nextLang === "pseudo" ? (
          <ScrollText aria-hidden className="size-4 lg:size-3.5" />
        ) : (
          <Braces aria-hidden className="size-4 lg:size-3.5" />
        )}
      </button>
      <button
        type="button"
        onClick={copyCode}
        aria-label={t("ws.copy")}
        title={t("ws.copy")}
        className={`${cornerButtonClass} ${
          codeCopied
            ? "text-claude-600 dark:text-claude-400"
            : idleIconClass
        }`}
      >
        {codeCopied ? (
          <Check aria-hidden className="size-4 lg:size-3.5" />
        ) : (
          <Copy aria-hidden className="size-4 lg:size-3.5" />
        )}
      </button>
      <span aria-live="polite" className="sr-only">
        {codeCopied ? t("ws.copied") : ""}
      </span>
    </>
  );

  const panelContent = (tab: PanelTab): ReactNode => {
    // Keep the explainer in the server HTML even when Code is selected.
    if (tab === "about") {
      const growthHeadingId = `${idPrefix}-growth-heading`;
      return (
        <>
          {about}
          {growth && (
            <section id={GROWTH_SECTION_ID} aria-labelledby={growthHeadingId} className="mt-5 scroll-mt-18 lg:scroll-mt-0">
              <h3 id={growthHeadingId} className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {t("explainer.growth")}
              </h3>
              {growth}
            </section>
          )}
        </>
      );
    }
    if (tab !== activeTab) return null;
    return (
      <CodeView code={shownCode} activeLine={activeLine} lang={codeLang} corner={codeActions} />
    );
  };

  return (
    <section
      aria-label={t("ws.code.aria")}
      className={`flex min-h-85 flex-col overflow-hidden rounded-2xl border lg:min-h-0 ${
        showCode
          ? "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
          : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60"
      }`}
    >
      <div className="flex items-center border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
        <div
          role="tablist"
          aria-label={t("ws.tabs.aria")}
          className="flex items-center gap-0.5"
        >
          {tabs.map((tab, i) => {
            const selected = tab === activeTab;
            return (
              <button
                key={tab}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={tabId(tab)}
                aria-selected={selected}
                aria-controls={panelId(tab)}
                tabIndex={selected ? 0 : -1}
                onClick={() => onTabChange(tab)}
                onKeyDown={onTabKeyDown}
                className={`min-h-10 rounded-md px-2.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-claude-500 lg:min-h-7 ${
                  selected
                    ? "bg-claude-500/15 text-claude-600 dark:text-claude-400"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                {t(TAB_LABEL[tab])}
              </button>
            );
          })}
        </div>
      </div>
      {tabs.map((tab) => (
        <div
          key={tab}
          role="tabpanel"
          id={panelId(tab)}
          aria-labelledby={tabId(tab)}
          hidden={tab !== activeTab}
          // The code panel's own buttons are Tab stops, so it needs none itself.
          tabIndex={tab === "code" ? undefined : 0}
          className={`focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-claude-500 ${
            tab === "about"
              ? "scrollbar-slim flex-1 overflow-y-auto p-5"
              : "flex min-h-0 flex-1 flex-col"
          }`}
        >
          {panelContent(tab)}
        </div>
      ))}
    </section>
  );
}
