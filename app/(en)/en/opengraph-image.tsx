import { HOME_OG_TEXT, OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/components/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Algoritmalar: data structures and algorithms";

export default function Image() {
  return ogCard({ ...HOME_OG_TEXT.en });
}
