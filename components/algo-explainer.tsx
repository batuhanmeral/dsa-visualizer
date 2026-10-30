import { getAlgoInfo } from "@/lib/algo-info";
import type { Lang } from "@/lib/locale";
import { translate } from "@/lib/translate";

interface AlgoExplainerProps {
  lang: Lang;
  slug: string;
  name: string;
}

// Server-rendered copy of the About tab so crawlers get it in the initial HTML.
export default function AlgoExplainer({ lang, slug, name }: AlgoExplainerProps) {
  const info = getAlgoInfo(slug, lang);
  if (!info) return null;

  const headingId = `explainer-${slug}`;
  const blocks = [
    { key: "explainer.best", text: info.best },
    { key: "explainer.worst", text: info.worst },
    { key: "explainer.use", text: info.use },
  ] as const;

  return (
    <section
      aria-labelledby={headingId}
      className="mx-4 mb-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60 lg:mx-6 lg:mb-6"
    >
      <h2
        id={headingId}
        className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
      >
        {translate(lang, "explainer.title", { name })}
      </h2>
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
    </section>
  );
}
