import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { siteUrl } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

// Only the code panel uses it, so it must not compete with the first paint on
// slow connections; it swaps in once loaded.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "latin-ext"],
  preload: false,
});

/** Shared with global-not-found, which renders outside both root layouts. */
export const htmlClassName = `${inter.variable} ${jetbrainsMono.variable} h-full antialiased`;

export const rootMetadata: Metadata = {
  metadataBase: siteUrl,
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
