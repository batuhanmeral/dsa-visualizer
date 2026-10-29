import type { ReactNode } from "react";
import RootDocument from "@/components/root-document";
import { rootMetadata } from "@/components/document-head";

export const metadata = rootMetadata;

export default function EnglishLayout({ children }: { children: ReactNode }) {
  return <RootDocument lang="en">{children}</RootDocument>;
}
