/** Step notes for the ten sorting engines (`lib/simulations/sorting.ts`). */
export const en = {
  // Bubble sort
  "n.bubble.start": "Starting Bubble Sort on {n} elements.",
  "n.bubble.compare": "Comparing {a} and {b}.",
  "n.bubble.swap": "{big} > {small} — swapping them.",
  "n.bubble.passDone": "Pass {pass} complete — {value} is locked in place.",
  "n.bubble.noSwaps": "No swaps this pass — the rest is already sorted.",

  // Selection sort
  "n.select.start": "Starting Selection Sort on {n} elements.",
  "n.select.assume": "Pass {pass}: assume {value} is the minimum of the unsorted part.",
  "n.select.compare": "Comparing {value} with current minimum {min}.",
  "n.select.newMin": "{value} is the new minimum.",
  "n.select.swap": "Swapping minimum {value} into position {index}.",
  "n.select.locked": "{value} is locked at position {index}.",

  // Insertion sort
  "n.insert.start": "Starting Insertion Sort on {n} elements.",
  "n.insert.pick": "Picking key {key} to insert into the sorted prefix.",
  "n.insert.ask": "Is {value} greater than key {key}?",
  "n.insert.shift": "Yes — shifting {value} one slot right.",
  "n.insert.place": "Placing key {key} at position {index}.",

  // Shell sort
  "n.shell.start": "Starting Shell Sort on {n} elements.",
  "n.shell.gap": "Gap = {gap}: comparing elements {gap} apart.",
  "n.shell.take": "Take key {key} at index {index}.",
  "n.shell.compare": "{value} > key {key} — shift it up by {gap}.",
  "n.shell.moved": "Moved {value} to index {index}.",
  "n.shell.place": "Place key {key} at index {index}.",

  // Merge sort
  "n.merge.start": "Starting Merge Sort on {n} elements.",
  "n.merge.split": "Split [{lo}..{hi}] at index {mid}.",
  "n.merge.merging": "Merging sorted halves [{lo}..{mid}] and [{rlo}..{hi}].",
  "n.merge.compare": "Compare {a} and {b} — smaller goes first.",
  "n.merge.write": "Write {value} to index {index}.",
  "n.merge.copyRest": "Copy remaining {value} to index {index}.",

  // Quick sort
  "n.quick.start": "Starting Quick Sort on {n} elements.",
  "n.quick.pivot": "Pivot = {pivot} (last of [{lo}..{hi}]).",
  "n.quick.ask": "Is {value} < pivot {pivot}?",
  "n.quick.swap": "Yes — swap {value} into the smaller-than-pivot region.",
  "n.quick.place": "Place pivot {pivot} at its final index {index}.",

  // Heap sort
  "n.heapsort.start": "Starting Heap Sort on {n} elements.",
  "n.heapsort.build": "Build a max-heap from the bottom up.",
  "n.heapsort.heapifyAt": "Heapify the subtree rooted at index {index}.",
  "n.heapsort.left": "Left child {child} vs {parent}.",
  "n.heapsort.right": "Right child {child} vs {parent}.",
  "n.heapsort.swapDown": "Swap {value} down to restore the max-heap.",
  "n.heapsort.ready": "Heap ready — repeatedly extract the maximum.",
  "n.heapsort.moveMax": "Move the max {value} to index {index}.",
  "n.heapsort.locked": "{value} locked — re-heapify the first {size}.",

  // Counting sort
  "n.counting.start": "Starting Counting Sort on {n} elements.",
  "n.counting.assumeMax": "Assume the maximum value is {max}.",
  "n.counting.ask": "Is {value} greater than current max {max}?",
  "n.counting.newMax": "New maximum {max} — counts array needs {slots} slots.",
  "n.counting.clear": "Clear counts[0..{max}] to zero.",
  "n.counting.tally": "Tally {value} — count[{value}] is now {count}.",
  "n.counting.prefix": "Prefix-sum the counts: each slot holds a final position.",
  "n.counting.stable":
    "Walk the input backwards: {value} claims slot {slot}, so equal keys keep their original order.",
  "n.counting.copyBack": "Copy back: {value} takes its sorted index {index}.",

  // Bucket sort
  "n.bucket.start": "Starting Bucket Sort on {n} elements ({buckets} buckets).",
  "n.bucket.assumeMax": "Assume the maximum value is {max}.",
  "n.bucket.ask": "Is {value} greater than current max {max}?",
  "n.bucket.newMax": "New maximum {max}.",
  "n.bucket.width": "Bucket width = {size}: value v goes to bucket v / {size}.",
  "n.bucket.into": "{value} → bucket {bucket} [{lo}..{hi}].",
  "n.bucket.sortBucket": "Sort bucket {bucket}: [{values}].",
  "n.bucket.concat": "Concatenate bucket {bucket}: write {value} to index {index}.",

  // Radix sort
  "n.radix.start": "Starting Radix Sort on {n} elements.",
  "n.radix.pass": "Pass on the {place} digit (exp = {exp}).",
  "n.radix.digit": "{value} → {place} digit is {digit}.",
  "n.radix.stable":
    "Place {value} at slot {slot} of the {place} pass — counting sort keeps ties in order.",
  "n.radix.reorder": "Stably reorder the array by the {place} digit.",
  "n.radix.place.ones": "ones",
  "n.radix.place.tens": "tens",
  "n.radix.place.hundreds": "hundreds",
  "n.radix.place.power": "10^{placeExp}",
} as const;

export const tr: Partial<Record<keyof typeof en, string>> = {
  "n.bubble.start": "{n} eleman üzerinde Bubble Sort başlıyor.",
  "n.bubble.compare": "{a} ile {b} karşılaştırılıyor.",
  "n.bubble.swap": "{big} > {small} — yerlerini değiştiriyoruz.",
  "n.bubble.passDone": "{pass}. tur bitti — {value} yerine kilitlendi.",
  "n.bubble.noSwaps": "Bu turda takas olmadı — gerisi zaten sıralı.",

  "n.select.start": "{n} eleman üzerinde Selection Sort başlıyor.",
  "n.select.assume": "{pass}. tur: sırasız kısmın en küçüğü {value} varsayılıyor.",
  "n.select.compare": "{value}, mevcut minimum {min} ile karşılaştırılıyor.",
  "n.select.newMin": "Yeni minimum {value}.",
  "n.select.swap": "Minimum {value}, {index}. konuma taşınıyor.",
  "n.select.locked": "{value}, {index}. konumda kilitlendi.",

  "n.insert.start": "{n} eleman üzerinde Insertion Sort başlıyor.",
  "n.insert.pick": "Sıralı öne eklenecek anahtar {key} seçiliyor.",
  "n.insert.ask": "{value}, anahtar {key} değerinden büyük mü?",
  "n.insert.shift": "Evet — {value} bir kutu sağa kayıyor.",
  "n.insert.place": "Anahtar {key}, {index}. konuma yerleştiriliyor.",

  "n.shell.start": "{n} eleman üzerinde Shell Sort başlıyor.",
  "n.shell.gap": "Boşluk = {gap}: {gap} adım uzaktaki elemanlar karşılaştırılıyor.",
  "n.shell.take": "{index}. indeksteki anahtar {key} alınıyor.",
  "n.shell.compare": "{value} > anahtar {key} — {gap} kadar yukarı kaydırılıyor.",
  "n.shell.moved": "{value}, {index}. indekse taşındı.",
  "n.shell.place": "Anahtar {key}, {index}. indekse yerleştiriliyor.",

  "n.merge.start": "{n} eleman üzerinde Merge Sort başlıyor.",
  "n.merge.split": "[{lo}..{hi}] aralığı {mid}. indeksten bölünüyor.",
  "n.merge.merging": "Sıralı yarılar birleştiriliyor: [{lo}..{mid}] ve [{rlo}..{hi}].",
  "n.merge.compare": "{a} ile {b} karşılaştırılıyor — küçük olan öne geçer.",
  "n.merge.write": "{value}, {index}. indekse yazılıyor.",
  "n.merge.copyRest": "Kalan {value}, {index}. indekse kopyalanıyor.",

  "n.quick.start": "{n} eleman üzerinde Quick Sort başlıyor.",
  "n.quick.pivot": "Pivot = {pivot} ([{lo}..{hi}] aralığının sonu).",
  "n.quick.ask": "{value} < pivot {pivot} mı?",
  "n.quick.swap": "Evet — {value}, pivottan küçükler bölgesine taşınıyor.",
  "n.quick.place": "Pivot {pivot}, nihai {index}. indeksine yerleşiyor.",

  "n.heapsort.start": "{n} eleman üzerinde Heap Sort başlıyor.",
  "n.heapsort.build": "Aşağıdan yukarıya bir max-heap kuruluyor.",
  "n.heapsort.heapifyAt": "{index}. indeksteki alt ağaç heapify ediliyor.",
  "n.heapsort.left": "Sol çocuk {child} ile {parent} karşılaştırılıyor.",
  "n.heapsort.right": "Sağ çocuk {child} ile {parent} karşılaştırılıyor.",
  "n.heapsort.swapDown": "Max-heap düzenini korumak için {value} aşağı iniyor.",
  "n.heapsort.ready": "Heap hazır — en büyük tekrar tekrar çekiliyor.",
  "n.heapsort.moveMax": "En büyük {value}, {index}. indekse taşınıyor.",
  "n.heapsort.locked": "{value} kilitlendi — ilk {size} eleman yeniden heapify ediliyor.",

  "n.counting.start": "{n} eleman üzerinde Counting Sort başlıyor.",
  "n.counting.assumeMax": "En büyük değer {max} varsayılıyor.",
  "n.counting.ask": "{value}, mevcut maksimum {max} değerinden büyük mü?",
  "n.counting.newMax": "Yeni maksimum {max} — sayaç dizisi {slots} göze ihtiyaç duyar.",
  "n.counting.clear": "counts[0..{max}] sıfırlanıyor.",
  "n.counting.tally": "{value} sayılıyor — count[{value}] artık {count}.",
  "n.counting.prefix": "Sayaçların kümülatif toplamı: her göz bir nihai konum tutar.",
  "n.counting.stable":
    "Girdi sondan başa taranıyor: {value}, {slot}. gözü alıyor — böylece eşit anahtarlar özgün sırasını korur.",
  "n.counting.copyBack": "Geri kopyalama: {value}, sıralı {index}. indeksine yerleşiyor.",

  "n.bucket.start": "{n} eleman üzerinde Bucket Sort başlıyor ({buckets} kova).",
  "n.bucket.assumeMax": "En büyük değer {max} varsayılıyor.",
  "n.bucket.ask": "{value}, mevcut maksimum {max} değerinden büyük mü?",
  "n.bucket.newMax": "Yeni maksimum {max}.",
  "n.bucket.width": "Kova genişliği = {size}: v değeri v / {size} kovasına gider.",
  "n.bucket.into": "{value} → kova {bucket} [{lo}..{hi}].",
  "n.bucket.sortBucket": "{bucket} numaralı kova sıralanıyor: [{values}].",
  "n.bucket.concat": "{bucket} numaralı kova ekleniyor: {value} → {index}. indeks.",

  "n.radix.start": "{n} eleman üzerinde Radix Sort başlıyor.",
  "n.radix.pass": "{place} basamağı üzerinde tur (exp = {exp}).",
  "n.radix.digit": "{value} → {place} basamağı {digit}.",
  "n.radix.stable":
    "{place} turunda {value}, {slot}. gözü alıyor — counting sort eşitleri sırada tutar.",
  "n.radix.reorder": "Dizi, {place} basamağına göre kararlı biçimde yeniden diziliyor.",
  "n.radix.place.ones": "birler",
  "n.radix.place.tens": "onlar",
  "n.radix.place.hundreds": "yüzler",
  "n.radix.place.power": "10^{placeExp}",
};
