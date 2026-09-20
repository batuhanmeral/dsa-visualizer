/** Step notes for the four searching engines (`lib/simulations/searching.ts`). */
export const en = {
  "n.linear.start": "Scanning {n} elements for {target}.",
  "n.linear.probe": "Is arr[{index}] = {value} equal to {target}?",
  "n.linear.match": "Match! {target} is at index {index}.",
  "n.linear.absent": "{target} is not in the array — return -1.",

  "n.binary.start": "Searching a sorted array of {n} for {target}.",
  "n.binary.probe": "Window [{lo}..{hi}] — check the middle arr[{mid}] = {value}.",
  "n.binary.match": "Match! {target} is at index {index}.",
  "n.binary.right": "{value} < {target} — discard the left half.",
  "n.binary.left": "{value} > {target} — discard the right half.",
  "n.binary.empty": "Window is empty — {target} is not present.",

  "n.jump.empty": "Empty array — nothing to search.",
  "n.jump.start": "Sorted array of {n} — jump size = ⌊√{n}⌋ = {jump}.",
  "n.jump.blockEnd":
    "Block end arr[{index}] = {value} < {target} — jump past this block.",
  "n.jump.pastEnd": "Jumped past the end — {target} is not present.",
  "n.jump.scanBlock": "Target may be in block [{lo}..{hi}] — scan it linearly.",
  "n.jump.step": "arr[{index}] = {value} < {target} — step forward.",
  "n.jump.blockDone": "Reached the block end — {target} is not present.",
  "n.jump.match": "Match! {target} is at index {index}.",
  "n.jump.absent": "{target} is not present — return -1.",

  "n.interp.start": "Searching a sorted array of {n} for {target}.",
  "n.interp.single": "Window is a single cell — check arr[{index}] = {value}.",
  "n.interp.match": "Match! {target} is at index {index}.",
  "n.interp.singleMiss": "{value} ≠ {target} — not present.",
  "n.interp.flat":
    "All values in [{lo}..{hi}] equal {value} — match at index {index}.",
  "n.interp.estimate": "Estimate pos = {pos} from value {target} in [{lo}..{hi}].",
  "n.interp.right": "{value} < {target} — search the right part.",
  "n.interp.left": "{value} > {target} — search the left part.",
  "n.interp.outside": "{target} is outside the remaining window — not present.",
} as const;

export const tr: Partial<Record<keyof typeof en, string>> = {
  "n.linear.start": "{target} için {n} eleman taranıyor.",
  "n.linear.probe": "arr[{index}] = {value}, {target} değerine eşit mi?",
  "n.linear.match": "Bulundu! {target}, {index}. indekste.",
  "n.linear.absent": "{target} dizide yok — -1 döndürülüyor.",

  "n.binary.start": "{n} elemanlı sıralı dizide {target} aranıyor.",
  "n.binary.probe": "Pencere [{lo}..{hi}] — orta eleman arr[{mid}] = {value} kontrol ediliyor.",
  "n.binary.match": "Bulundu! {target}, {index}. indekste.",
  "n.binary.right": "{value} < {target} — sol yarı eleniyor.",
  "n.binary.left": "{value} > {target} — sağ yarı eleniyor.",
  "n.binary.empty": "Pencere boşaldı — {target} mevcut değil.",

  "n.jump.empty": "Dizi boş — aranacak bir şey yok.",
  "n.jump.start": "{n} elemanlı sıralı dizi — atlama boyu = ⌊√{n}⌋ = {jump}.",
  "n.jump.blockEnd":
    "Blok sonu arr[{index}] = {value} < {target} — bu blok atlanıyor.",
  "n.jump.pastEnd": "Dizinin sonu geçildi — {target} mevcut değil.",
  "n.jump.scanBlock": "Hedef [{lo}..{hi}] bloğunda olabilir — doğrusal taranıyor.",
  "n.jump.step": "arr[{index}] = {value} < {target} — bir adım ileri.",
  "n.jump.blockDone": "Blok sonuna gelindi — {target} mevcut değil.",
  "n.jump.match": "Bulundu! {target}, {index}. indekste.",
  "n.jump.absent": "{target} mevcut değil — -1 döndürülüyor.",

  "n.interp.start": "{n} elemanlı sıralı dizide {target} aranıyor.",
  "n.interp.single": "Pencere tek göze indi — arr[{index}] = {value} kontrol ediliyor.",
  "n.interp.match": "Bulundu! {target}, {index}. indekste.",
  "n.interp.singleMiss": "{value} ≠ {target} — mevcut değil.",
  "n.interp.flat":
    "[{lo}..{hi}] aralığındaki tüm değerler {value} — {index}. indekste eşleşme.",
  "n.interp.estimate": "[{lo}..{hi}] aralığındaki {target} değerinden pos = {pos} tahmin ediliyor.",
  "n.interp.right": "{value} < {target} — sağ kısım aranıyor.",
  "n.interp.left": "{value} > {target} — sol kısım aranıyor.",
  "n.interp.outside": "{target} kalan pencerenin dışında — mevcut değil.",
};
