import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import type { Lang } from "@/lib/locale";
import AppShell from "./app-shell";
import "@/app/globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "latin-ext"],
});

/** Shared with global-not-found, which renders outside both root layouts. */
export const htmlClassName = `${inter.variable} ${jetbrainsMono.variable} h-full antialiased`;

export const rootMetadata: Metadata = {
  title: {
    default: "Algoritmalar — DSA Visualizer",
    template: "%s · Algoritmalar",
  },
  description:
    "An interactive platform for visualizing data structures and algorithms — sorting, graphs, dynamic programming, and backtracking.",
};

// Runs before first paint: applies the saved theme (or OS preference) so there
// is no flash of the wrong colour scheme before React hydrates.
export const themeBootScript = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=(t==='light'||t==='dark')?t:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');}catch(e){}})();`;

export default function RootDocument({
  lang,
  children,
}: {
  lang: Lang;
  children: ReactNode;
}) {
  return (
    // The boot script sets data-theme before hydration.
    <html lang={lang} suppressHydrationWarning className={htmlClassName}>
      {/* App Router root document; the rule only recognises files under app/. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="min-h-full">
        <AppShell lang={lang}>{children}</AppShell>
      </body>
    </html>
  );
}
