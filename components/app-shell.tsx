"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Binary, Menu, PanelLeftOpen, X } from "lucide-react";
import { LangProvider, useLang } from "@/lib/i18n";
import SidebarNav from "./sidebar-nav";
import ThemeToggle from "./theme-toggle";
import LangToggle from "./lang-toggle";

function Shell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Desktop sidebar: collapsible; when closed the content spans (and centres
  // on) the full viewport width.
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { t } = useLang();

  return (
    <div className="min-h-dvh">
      {/* Desktop sidebar */}
      {sidebarOpen && (
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-zinc-200 bg-white lg:block dark:border-zinc-800 dark:bg-zinc-950">
          <SidebarNav onCollapse={() => setSidebarOpen(false)} />
        </aside>
      )}

      {/* Re-open button once the sidebar is collapsed */}
      {!sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label={t("nav.expand")}
          title={t("nav.expand")}
          className="fixed left-4 top-4 z-30 hidden size-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 shadow-sm transition-colors hover:text-zinc-900 lg:flex dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <PanelLeftOpen className="size-4.5" />
        </button>
      )}

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur lg:hidden dark:border-zinc-800 dark:bg-zinc-950/90">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label={t("nav.open")}
          className="flex size-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <Menu className="size-5" />
        </button>
        <span className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <Binary className="size-4" />
          </span>
          Flowy
        </span>
        <div className="ml-auto flex items-center gap-2">
          <LangToggle />
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl lg:hidden dark:bg-zinc-950"
            >
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label={t("nav.close")}
                className="absolute right-3 top-4 flex size-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <X className="size-5" />
              </button>
              <SidebarNav onNavigate={() => setDrawerOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Content */}
      <main className={`pt-14 lg:pt-0 ${sidebarOpen ? "lg:pl-72" : ""}`}>
        {children}
      </main>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider>
      <Shell>{children}</Shell>
    </LangProvider>
  );
}
