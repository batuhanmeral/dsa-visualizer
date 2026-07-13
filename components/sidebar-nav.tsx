"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Binary, LayoutDashboard } from "lucide-react";
import { categories } from "@/lib/data";
import ThemeToggle from "./theme-toggle";

interface SidebarNavProps {
  onNavigate?: () => void;
}

export default function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center gap-3 px-5 py-5"
      >
        <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <Binary className="size-5" />
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-semibold tracking-tight">
            DSA Visualizer
          </span>
          <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">
            Learn by watching
          </span>
        </span>
      </Link>

      {/* Nav */}
      <nav className="scrollbar-slim flex-1 overflow-y-auto px-3 pb-6">
        <Link
          href="/"
          onClick={onNavigate}
          className={`mb-4 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname === "/"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
          }`}
        >
          <LayoutDashboard className="size-4" />
          Overview
        </Link>

        <ul className="space-y-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <li key={category.slug}>
                <div className="mb-1.5 flex items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  <Icon className="size-3.5" />
                  {category.name}
                </div>
                <ul className="space-y-0.5">
                  {category.algorithms.map((algorithm) => {
                    const href = `/${category.slug}/${algorithm.slug}`;
                    const isActive = pathname === href;
                    return (
                      <li key={algorithm.slug}>
                        <Link
                          href={href}
                          onClick={onNavigate}
                          aria-current={isActive ? "page" : undefined}
                          className={`relative flex items-center rounded-lg py-2 pl-6 pr-3 text-sm transition-colors ${
                            isActive
                              ? "bg-emerald-500/10 font-medium text-emerald-600 dark:text-emerald-400"
                              : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
                          }`}
                        >
                          {isActive && (
                            <span className="absolute left-2 h-4 w-0.5 rounded-full bg-emerald-500" />
                          )}
                          {algorithm.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-zinc-200 px-5 py-3 text-[11px] text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
        <span>v0.1 · Platform shell</span>
        <ThemeToggle className="-mr-1.5" />
      </div>
    </div>
  );
}
