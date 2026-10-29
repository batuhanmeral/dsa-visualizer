import type { Metadata } from "next";
import CategoryPage, {
  categoryMetadata,
  categoryParams,
} from "@/components/pages/category";

interface Props {
  params: Promise<{ category: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return categoryParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  return categoryMetadata(category);
}

export default async function Page({ params }: Props) {
  const { category } = await params;
  return <CategoryPage lang="en" categorySlug={category} />;
}
