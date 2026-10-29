import type { Metadata } from "next";
import HomePage from "@/components/pages/home";
import JsonLd from "@/components/json-ld";
import { homeMetadata, websiteJsonLd } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = homeMetadata("tr");

export default function Page() {
  return (
    <>
      <JsonLd data={websiteJsonLd("tr", siteUrl)} />
      <HomePage />
    </>
  );
}
