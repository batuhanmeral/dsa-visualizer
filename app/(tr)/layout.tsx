import type { ReactNode } from "react";
import RootDocument, { rootMetadata } from "@/components/root-document";

export const metadata = rootMetadata;

export default function TurkishLayout({ children }: { children: ReactNode }) {
  return <RootDocument lang="tr">{children}</RootDocument>;
}
