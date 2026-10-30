import type { ReactNode } from "react";
import { htmlClassName, themeBootScript } from "@/components/document-head";
import type { Lang } from "@/lib/locale";
import AppShell from "./app-shell";
import "@/app/globals.css";

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
