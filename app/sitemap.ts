import type { MetadataRoute } from "next";
import { sitemapEntries } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries(siteUrl);
}
