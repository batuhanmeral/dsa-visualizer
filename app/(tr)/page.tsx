import type { Metadata } from "next";
import HomePage from "@/components/pages/home";
import { homeMetadata } from "@/lib/seo";

export const metadata: Metadata = homeMetadata("tr");

export default function Page() {
  return <HomePage />;
}
