/** Step notes for the greedy engines (`lib/simulations/greedy.ts`). */
export const en = {
  // Activity selection
  "n.activity.empty": "No activities — add at least one interval.",
  "n.activity.sorted": "Activities are sorted by finish time — earliest finisher first.",
  "n.activity.first":
    "The earliest finisher [{start}, {end}] is always safe — select it.",
  "n.activity.ask": "Does [{start}, {end}] start after the last finish ({last})?",
  "n.activity.take": "Yes — no overlap. Select [{start}, {end}].",
  "n.activity.frontier": "Move the frontier: last finish is now {last}.",
  "n.activity.reject": "No — it starts at {start} < {last}, so it overlaps. Reject it.",
  "n.activity.done":
    "Done. Selected {selected} of {total} activities — the maximum possible.",

  // Fractional knapsack
  "n.frac.empty": "No items — add at least one.",
  "n.frac.sorted": "Items are sorted by value/weight ratio — best value per kg first.",
  "n.frac.start": "Start with an empty bag: capacity {capacity} remaining.",
  "n.frac.ask":
    "Item {i} (w={w}, v={v}, ratio {ratio}): does it fit in the remaining {remaining}?",
  "n.frac.whole": "It fits — take all of it. Remaining capacity: {remaining}.",
  "n.frac.addWhole": "Add its full value: total = {total}.",
  "n.frac.partial": "Only {remaining} of {w} fits — take a {remaining}/{w} fraction.",
  "n.frac.addPartial":
    "Add the partial value {v} × {remaining}/{w} = {part} → total = {total}.",
  "n.frac.full": "The bag is full.",
  "n.frac.done": "Done. Maximum value in the bag: {total}.",

  // Job sequencing
  "n.job.empty": "No jobs — add at least one.",
  "n.job.sorted": "Jobs are sorted by profit — most profitable first.",
  "n.job.freeHours": "All {hours} hours start free.",
  "n.job.ask": "Job {id} (deadline {deadline}, profit {profit}): is hour {t} free?",
  "n.job.schedule": "Hour {t} is free — schedule job {id} there.",
  "n.job.addProfit": "Add its profit: total = {total}.",
  "n.job.skip": "No free hour at or before job {id}'s deadline — skip it.",
  "n.job.done": "Done. Scheduled {count} jobs for a total profit of {total}.",

  // Huffman
  "n.huff.empty": "Nothing to encode — enter some letters.",
  "n.huff.single":
    "Only one distinct character — it gets the single-bit code 0 and there is no tree to build.",
  "n.huff.start": "Start with {count} single-leaf trees, one per character.",
  "n.huff.pick": "Pick the two lightest trees: {a} and {b}.",
  "n.huff.merge":
    "Merge them under a new node of frequency {sum} ({fa} + {fb}).",
  "n.huff.shrink": "The forest shrinks to {count} tree(s).",
  "n.huff.complete": "One tree left — the Huffman tree is complete.",
  "n.huff.leafRoot": "Leaf '{ch}' is the root → code {code}.",
  "n.huff.leaf": "Leaf '{ch}' reached along {path} → code {code}.",
  "n.huff.done": "Done. Frequent characters got short codes: {codes}.",
  "n.huff.internal": "internal ({freq})",
  "n.huff.leafLabel": "'{ch}' ({freq})",
} as const;

export const tr: Partial<Record<keyof typeof en, string>> = {
  "n.activity.empty": "Etkinlik yok — en az bir aralık ekleyin.",
  "n.activity.sorted": "Etkinlikler bitiş zamanına göre sıralandı — en erken biten önce.",
  "n.activity.first":
    "En erken biten [{start}, {end}] her zaman güvenlidir — seçiliyor.",
  "n.activity.ask": "[{start}, {end}] son bitişten ({last}) sonra mı başlıyor?",
  "n.activity.take": "Evet — çakışma yok. [{start}, {end}] seçiliyor.",
  "n.activity.frontier": "Sınır ilerletiliyor: son bitiş artık {last}.",
  "n.activity.reject": "Hayır — {start} < {last} olduğu için çakışıyor. Reddediliyor.",
  "n.activity.done":
    "Tamamlandı. {total} etkinlikten {selected} tanesi seçildi — mümkün olan en fazla sayı.",

  "n.frac.empty": "Eşya yok — en az bir tane ekleyin.",
  "n.frac.sorted": "Eşyalar değer/ağırlık oranına göre sıralandı — kilo başına en değerli önce.",
  "n.frac.start": "Boş çantayla başlanıyor: kalan kapasite {capacity}.",
  "n.frac.ask":
    "Eşya {i} (a={w}, d={v}, oran {ratio}): kalan {remaining} kapasiteye sığıyor mu?",
  "n.frac.whole": "Sığıyor — tamamı alınıyor. Kalan kapasite: {remaining}.",
  "n.frac.addWhole": "Tam değeri ekleniyor: toplam = {total}.",
  "n.frac.partial": "{w} ağırlığın yalnızca {remaining} kadarı sığıyor — {remaining}/{w} kesri alınıyor.",
  "n.frac.addPartial":
    "Kısmi değer ekleniyor: {v} × {remaining}/{w} = {part} → toplam = {total}.",
  "n.frac.full": "Çanta doldu.",
  "n.frac.done": "Tamamlandı. Çantadaki en yüksek değer: {total}.",

  "n.job.empty": "İş yok — en az bir tane ekleyin.",
  "n.job.sorted": "İşler kâra göre sıralandı — en kârlı önce.",
  "n.job.freeHours": "{hours} saatin tamamı boş başlıyor.",
  "n.job.ask": "İş {id} (son tarih {deadline}, kâr {profit}): {t}. saat boş mu?",
  "n.job.schedule": "{t}. saat boş — iş {id} oraya yerleştiriliyor.",
  "n.job.addProfit": "Kârı ekleniyor: toplam = {total}.",
  "n.job.skip": "İş {id} için son tarihine kadar boş saat yok — atlanıyor.",
  "n.job.done": "Tamamlandı. {count} iş planlandı, toplam kâr {total}.",

  "n.huff.empty": "Kodlanacak bir şey yok — birkaç harf girin.",
  "n.huff.single":
    "Yalnızca tek bir farklı karakter var — tek bitlik 0 kodunu alır ve kurulacak bir ağaç yoktur.",
  "n.huff.start": "Her karakter için birer yapraklı {count} ağaçla başlanıyor.",
  "n.huff.pick": "En hafif iki ağaç seçiliyor: {a} ve {b}.",
  "n.huff.merge":
    "Frekansı {sum} ({fa} + {fb}) olan yeni bir düğüm altında birleştiriliyor.",
  "n.huff.shrink": "Orman {count} ağaca iniyor.",
  "n.huff.complete": "Tek ağaç kaldı — Huffman ağacı tamamlandı.",
  "n.huff.leafRoot": "'{ch}' yaprağı kökün kendisi → kod {code}.",
  "n.huff.leaf": "'{ch}' yaprağına {path} yolundan ulaşıldı → kod {code}.",
  "n.huff.done": "Tamamlandı. Sık karakterler kısa kod aldı: {codes}.",
  "n.huff.internal": "ara düğüm ({freq})",
  "n.huff.leafLabel": "'{ch}' ({freq})",
};
