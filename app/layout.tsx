import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import AppShell from "@/components/app-shell";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: {
    default: "Algorhythm — DSA Visualizer",
    template: "%s · Algorhythm",
  },
  description:
    "An interactive platform for visualizing data structures and algorithms — sorting, graphs, dynamic programming, and backtracking.",
};

// Runs before first paint: applies the saved theme (or OS preference) and the
// saved language (or the browser's) so there is no flash of the wrong colour
// scheme, and <html lang> is correct, before React hydrates.
const bootScript = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=(t==='light'||t==='dark')?t:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');var l=localStorage.getItem('lang');if(l!=='tr'&&l!=='en'){l=(navigator.language||'en').toLowerCase().indexOf('tr')===0?'tr':'en';}document.documentElement.dataset.lang=l;document.documentElement.lang=l;}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
