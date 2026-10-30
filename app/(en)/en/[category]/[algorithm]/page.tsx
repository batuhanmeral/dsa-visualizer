import type { Metadata } from "next";
import AlgorithmPage, {
  algorithmMetadata,
  algorithmParams,
} from "@/components/pages/algorithm";

interface Props {
  params: Promise<{ category: string; algorithm: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return algorithmParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, algorithm } = await params;
  return algorithmMetadata("en", category, algorithm);
}

export default async function Page({ params }: Props) {
  const { category, algorithm } = await params;
  return (
    <AlgorithmPage lang="en" categorySlug={category} algorithmSlug={algorithm} />
  );
}
