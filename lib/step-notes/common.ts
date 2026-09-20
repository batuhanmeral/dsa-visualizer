/**
 * Step-note templates shared by more than one algorithm family.
 *
 * Every dictionary module in this folder exports `en` (the source of truth for
 * the key set) and `tr`. Placeholders are `{name}`; a value that starts with
 * `@` is itself a note key and is resolved before interpolation, which is how
 * enumerated words (digit places, directions…) stay translatable.
 */
export const en = {
  "n.sort.done": "Array sorted.",
  "n.sort.nothing": "Nothing to sort.",
} as const;

export const tr: Partial<Record<keyof typeof en, string>> = {
  "n.sort.done": "Dizi sıralandı.",
  "n.sort.nothing": "Sıralanacak bir şey yok.",
};
