import {
  categoryOgImage,
  OG_CONTENT_TYPE,
  OG_SIZE,
} from "@/components/og-card";
import { categoryParams } from "@/components/pages/category";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Algoritmalar: category preview";

export function generateStaticParams() {
  return categoryParams();
}

export default function Image({ params }: { params: Promise<{ category: string }> }) {
  return categoryOgImage("en", params);
}
