import {
  algorithmOgImage,
  OG_CONTENT_TYPE,
  OG_SIZE,
} from "@/components/og-card";
import { algorithmParams } from "@/components/pages/algorithm";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Algoritmalar: algoritma görseli";

export function generateStaticParams() {
  return algorithmParams();
}

export default function Image({
  params,
}: {
  params: Promise<{ category: string; algorithm: string }>;
}) {
  return algorithmOgImage("tr", params);
}
