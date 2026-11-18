import { getAlgoInfo } from "@/lib/algo-info";
import type { Lang } from "@/lib/locale";
import { translate } from "@/lib/translate";

interface AlgoExplainerProps {
  lang: Lang;
  slug: string;
  name: string;
  summary: string;
}

// Content of the About tab, rendered on the server so crawlers get it in the initial HTML.
export default function AlgoExplainer({ lang, slug, name, summary }: AlgoExplainerProps) {
  const info = getAlgoInfo(slug, lang);
  if (!info) return null;

  const blocks = [
    { key: "explainer.best", text: info.best },
    { key: "explainer.worst", text: info.worst },
    { key: "explainer.use", text: info.use },
  ] as const;

  return (
    <>
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        {translate(lang, "explainer.title", { name })}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
        {summary}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
        {info.how}
      </p>
      <div className="mt-4 space-y-4">
        {blocks.map(
          ({ key, text }) =>
            text && (
              <div key={key}>
                <h3 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {translate(lang, key)}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {text}
                </p>
              </div>
            )
        )}
      </div>
    </>
  );
}
