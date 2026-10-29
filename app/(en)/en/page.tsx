import type { Metadata } from "next";
import HomePage from "@/components/pages/home";
import { homeMetadata } from "@/lib/seo";

export const metadata: Metadata = homeMetadata("en");

export default function Page() {
  return <HomePage />;
}
