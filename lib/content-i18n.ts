// Turkish translations for the content that lives in `lib/data.ts` (category
// names/taglines, algorithm names/summaries). English is the source of truth in
// data.ts; these are overrides keyed by slug. Helpers return the English value
// unchanged for `lang === "en"` or when a Turkish string is missing.

import type { Lang } from "./i18n";

const categoryTr: Record<string, { name: string; tagline: string }> = {
  sorting: { name: "Sıralama", tagline: "Veriyi adım adım düzenleme" },
  searching: { name: "Arama", tagline: "Değerleri hızlıca bulma" },
  "data-structures": {
    name: "Veri Yapıları",
    tagline: "Verinin nasıl düzenlendiği",
  },
  graphs: { name: "Graflar", tagline: "Gezinme ve en kısa yollar" },
  "dynamic-programming": {
    name: "Dinamik Programlama",
    tagline: "Optimal alt yapı ve hafızalama",
  },
  greedy: {
    name: "Açgözlü Algoritmalar",
    tagline: "Yerel en iyi seçimler",
  },
  backtracking: {
    name: "Geri İzleme",
    tagline: "Keşfet, hızlı başarısız ol, geri al",
  },
  math: {
    name: "Matematik / Sayı Teorisi",
    tagline: "Asallar, OBEB ve modüler aritmetik",
  },
  trees: { name: "Ağaçlar", tagline: "Hiyerarşiler, dengeleme ve sorgular" },
  strings: { name: "Dizeler", tagline: "Desen eşleme ve palindromlar" },
};

const algoTr: Record<string, { name: string; summary: string }> = {
  // ── Sorting ──
  "bubble-sort": {
    name: "Kabarcık Sıralaması",
    summary:
      "Sıra dışı komşu elemanları tekrar tekrar takas eder; her geçişte en büyük değeri sona taşır.",
  },
  "selection-sort": {
    name: "Seçmeli Sıralama",
    summary:
      "Sıralanmamış kısımda en küçük elemanı arar ve onu sıralı önekin bir sonraki konumuna takas eder.",
  },
  "insertion-sort": {
    name: "Eklemeli Sıralama",
    summary:
      "Sıralı öneki her seferinde bir eleman büyütür; yeni eleman yerine oturana dek büyük değerleri sağa kaydırır.",
  },
  "shell-sort": {
    name: "Shell Sıralaması",
    summary:
      "Küçülen aralıklarla eklemeli sıralama: uzak elemanlar önce hareket eder, böylece son geçişte az iş kalır.",
  },
  "merge-sort": {
    name: "Birleştirmeli Sıralama",
    summary:
      "Diziyi özyinelemeli olarak ikiye böler, her yarıyı sıralar, sonra iki sıralı yarıyı birleştirir.",
  },
  "quick-sort": {
    name: "Hızlı Sıralama",
    summary:
      "Diziyi bir eksen etrafında bölen, sonra her iki yanı özyinelemeli sıralayan böl-ve-yönet sıralaması.",
  },
  "heap-sort": {
    name: "Yığın Sıralaması",
    summary:
      "Bir maksimum yığın kurar, sonra kökü tekrar tekrar sona taşıyıp küçülen öneki yeniden yığınlaştırır.",
  },
  "radix-sort": {
    name: "Taban Sıralaması",
    summary:
      "Karşılaştırmasız sıralar: en düşükten en yüksek basamağa kadar her basamak için kararlı sayma geçişi yapar.",
  },
  "counting-sort": {
    name: "Sayarak Sıralama",
    summary:
      "Her değerin kaç kez geçtiğini sayar, sayımları önek toplamıyla son konumlara çevirir, sonra her elemanı doğrudan yerleştirir — karşılaştırmasız.",
  },
  "bucket-sort": {
    name: "Kovalı Sıralama",
    summary:
      "Değerleri birkaç aralık kovasına dağıtır, her kovayı sıralar, sonra birleştirir — veri düzgün yayıldığında hızlıdır.",
  },

  // ── Searching ──
  "linear-search": {
    name: "Doğrusal Arama",
    summary:
      "Hedef bulunana dek diziyi eleman eleman gezer — sıralı olsun olmasın her dizide çalışır.",
  },
  "binary-search": {
    name: "İkili Arama",
    summary:
      "Ortadaki elemanı hedefle karşılaştırarak sıralı aralığı her adımda ikiye böler.",
  },
  "jump-search": {
    name: "Atlamalı Arama",
    summary:
      "Sıralı dizide √n boyutunda sabit bloklarla ileri sıçrayarak hedefi tutabilecek bloğu bulur, sonra o bloğu doğrusal tarar.",
  },
  "interpolation-search": {
    name: "Aradeğerlemeli Arama",
    summary:
      "Sonda konumunu, hedefin değerinin pencerenin uçlarına oranından tahmin eder — düzgün yayılmış veride O(log log n)'e yakındır.",
  },

  // ── Data structures ──
  "linked-list": {
    name: "Bağlı Liste",
    summary:
      "İşaretçilerle zincirlenmiş düğümler: başa O(1) ekleme, arama ya da silme için sırayla gezinme.",
  },
  stack: {
    name: "Yığın",
    summary:
      "LIFO kap: ekleme ve çıkarma aynı uçtan olur, yani son giren ilk çıkar.",
  },
  queue: {
    name: "Kuyruk",
    summary:
      "Dairesel tampon olarak gerçeklenen FIFO kap: arkadan eklenir, önden çıkarılır.",
  },
  "hash-table": {
    name: "Hash Tablosu",
    summary:
      "Anahtarları bir hash fonksiyonuyla kovalara eşler; çakışmalar her kovanın içinde bağlı liste olarak zincirlenir.",
  },
  "union-find": {
    name: "Union-Find (Ayrık Küme)",
    summary:
      "Küme ormanı: find köke yürür ve arkasındaki yolu düzleştirir, union düşük rütbeli kökü yükseğin altına asar.",
  },

  // ── Graphs ──
  bfs: {
    name: "Enlemesine Arama (BFS)",
    summary:
      "Bir kuyruk kullanarak grafı seviye seviye keşfeder — ağırlıksız graflarda en kısa yolların temelidir.",
  },
  dfs: {
    name: "Derinlemesine Arama (DFS)",
    summary:
      "Geri izlemeden önce her dalda olabildiğince derine dalar — özyineleme veya yığınla gerçeklenir.",
  },
  dijkstra: {
    name: "Dijkstra Algoritması",
    summary:
      "Negatif olmayan kenarlı ağırlıklı bir grafta kaynak düğümden diğer tüm düğümlere en kısa yolu bulur.",
  },
  "bellman-ford": {
    name: "Bellman-Ford",
    summary:
      "Her kenarı V−1 kez gevşeterek negatif kenar ağırlıklarında da çalışan, kaynaktan en kısa yollar.",
  },
  "topological-sort": {
    name: "Topolojik Sıralama",
    summary:
      "Bir YYG'nin düğümlerini her kenar ileri bakacak şekilde doğrusal sıralar — Kahn algoritması giriş derecesi 0 olan düğümleri ayıklar.",
  },
  prim: {
    name: "Prim MST",
    summary:
      "Bir başlangıç düğümünden minimum kapsayan ağacı büyütür; her zaman yeni bir düğüme ulaşan en ucuz kenarı ekler.",
  },
  kruskal: {
    name: "Kruskal MST",
    summary:
      "Kenarları ağırlık sırasına göre ekleyerek minimum kapsayan ağaç kurar; döngü kenarlarını birleştir-bul ile reddeder.",
  },
  "a-star": {
    name: "A* Arama",
    summary:
      "Bir sezgiselle yönlendirilen en-iyi-öncelikli en kısa yol: en düşük g + düz-çizgi tahminine sahip düğümü genişletir.",
  },
  "floyd-warshall": {
    name: "Floyd-Warshall",
    summary:
      "Dinamik programlamayla tüm-çiftler en kısa yol: k turu her çifte, k düğümünde mola vermenin yolu kısaltıp kısaltmadığını sorar.",
  },

  // ── Dynamic programming ──
  lcs: {
    name: "En Uzun Ortak Alt Dizi",
    summary:
      "Alt problem yanıtlarından 2 boyutlu bir tablo kurarak iki dizenin paylaştığı en uzun alt diziyi bulur.",
  },
  knapsack: {
    name: "0/1 Sırt Çantası",
    summary:
      "Bir ağırlık sınırı altında toplam değeri en büyükler; her öğe için al ya da bırak kararını verir.",
  },
  "edit-distance": {
    name: "Düzenleme Mesafesi",
    summary:
      "Bir dizeyi diğerine çevirmek için en az tek-karakter ekleme, silme veya değiştirme (Levenshtein).",
  },
  "coin-change": {
    name: "Bozuk Para",
    summary:
      "Her birimden sınırsız bulunduğunda, hedef tutara ulaşan en az sayıda bozuk para.",
  },
  fibonacci: {
    name: "Fibonacci (Tablolama)",
    summary:
      "Fibonacci dizisini aşağıdan yukarıya kurar; her terim kendinden önceki ikinin toplamıdır — tekrar iş yok.",
  },
  kadane: {
    name: "Kadane Algoritması",
    summary:
      "Tek geçişte maksimum alt dizi toplamı: süregelen toplam yardım ettikçe uzat, negatife dönünce mevcut elemandan yeniden başla.",
  },
  lis: {
    name: "En Uzun Artan Alt Dizi",
    summary:
      "Kesin artan (bitişik olması gerekmeyen) en uzun değer dizisi; dp[i] = i'de biten en iyi alt dizi ile.",
  },

  // ── Greedy ──
  "activity-selection": {
    name: "Etkinlik Seçimi",
    summary:
      "Her zaman en erken biteni alarak çakışmayan en fazla sayıda etkinliği seçer.",
  },
  "fractional-knapsack": {
    name: "Kesirli Sırt Çantası",
    summary:
      "Öğeler bölünebildiğinde ağırlık sınırı altında değeri en büyükler: öğeleri değer/ağırlık sırasıyla al, sonuncuyu kesirli böl.",
  },
  "job-sequencing": {
    name: "İş Sıralama",
    summary:
      "Son teslim tarihli birim işleri en yüksek kâr için planlar: her işi (en kârlı önce) son teslim tarihinden önceki en geç boş saate açgözlüce yerleştirir.",
  },
  "huffman-coding": {
    name: "Huffman Kodlaması",
    summary:
      "Optimal önek kodu kurar: en düşük frekanslı iki ağacı tekrar tekrar birleştirir, sonra kodları kök-yaprak yollarından okur.",
  },

  // ── Backtracking ──
  "n-queens": {
    name: "N-Vezir",
    summary:
      "N×N tahtaya, hiçbiri birbirine saldırmayacak şekilde N vezir yerleştirir; çakışma çıktığı an yerleştirmeleri geri alır.",
  },
  sudoku: {
    name: "Sudoku Çözücü",
    summary:
      "Boş hücreleri teker teker doldurur; 1–9 rakamlarını dener ve bir rakam kuralları bozduğunda geri izler.",
  },
  "rat-in-a-maze": {
    name: "Labirentteki Fare",
    summary:
      "Bir ızgarada sol üstten sağ alta bir yol bulur; rotayı işaretler ve çıkmazlarda geri alır.",
  },
  subsets: {
    name: "Alt Kümeler",
    summary:
      "Her eleman için alma ya da dışarıda bırakma diye dallanarak bir kümenin tüm alt kümelerini üretir.",
  },
  permutations: {
    name: "Permütasyonlar",
    summary:
      "Her konumu sırayla sabitleyip takas ederek, sonra takası geri alarak bir kümenin tüm sıralamalarını üretir.",
  },

  // ── Trees ──
  bst: {
    name: "İkili Arama Ağacı",
    summary:
      "Her sol alt ağacın daha küçük, her sağ alt ağacın daha büyük olduğu sıralı ağaç — ekleme, arama ve silme tek bir kök-yaprak yolunu izler.",
  },
  avl: {
    name: "AVL Ağacı",
    summary:
      "Kendini dengeleyen bir İAA: her eklemeden sonra denge faktörlerini kontrol eder ve yükseklik O(log n) kalsın diye döndürür.",
  },
  heap: {
    name: "İkili Yığın",
    summary:
      "Dizide saklanan tam ikili ağaç; ekleme bir değeri yukarı süzer, çıkarma son elemanı aşağı indirerek maksimum yığın düzenini korur.",
  },
  trie: {
    name: "Trie (Önek Ağacı)",
    summary:
      "Karakterlerle anahtarlanan ağaç: her kök-düğüm yolu bir önek yazar, böylece ekleme ve arama yalnızca kelime uzunluğu kadar maliyetlidir.",
  },
  "segment-tree": {
    name: "Segment Ağacı",
    summary:
      "Dizi aralıkları üzerinde bir ikili ağaç: her düğüm bir toplam saklar, böylece aralık sorguları O(log n) kapsayıcı düğümü birleştirerek O(log n)'de çözülür.",
  },

  // ── Strings ──
  kmp: {
    name: "KMP",
    summary:
      "Knuth-Morris-Pratt: bir uyumsuzluk metni asla yeniden taramasın diye en-uzun-önek-sonek tablosunu önceden hesaplar — doğrusal zamanda desen eşleme.",
  },
  "rabin-karp": {
    name: "Rabin-Karp",
    summary:
      "Deseni ve her metin penceresini yuvarlanan bir hash ile hashler; yalnızca hash'ler çakıştığında karakter karakter doğrular.",
  },
  "z-algorithm": {
    name: "Z-Algoritması",
    summary:
      "Her konum için, oradan başlayıp dizenin önekiyle eşleşen en uzun alt dizenin uzunluğunu hesaplar — bir [l, r) penceresini yeniden kullanarak.",
  },
  manacher: {
    name: "Manacher Algoritması",
    summary:
      "Merkezler etrafında genişleyip yarıçapları mevcut palindrom boyunca yansıtarak en uzun palindrom alt dizeyi doğrusal zamanda bulur.",
  },

  // ── Math / Number Theory ──
  "sieve-of-eratosthenes": {
    name: "Eratosthenes Kalburu",
    summary:
      "Her asalın katlarını karesinden başlayarak eleyerek n'e kadar tüm asalları bulur.",
  },
  "euclidean-gcd": {
    name: "Öklid Algoritması (OBEB)",
    summary:
      "(a, b) çiftini kalan sıfır olana dek (b, a mod b) ile değiştirerek en büyük ortak böleni hesaplar.",
  },
  "fast-exponentiation": {
    name: "Hızlı Üs Alma",
    summary:
      "Tabanı karesini alarak ve yalnızca üssün 1-bitlerinde çarparak baseᵉˣᵖ mod m'yi O(log üs) sürede hesaplar.",
  },
};

export function catName(slug: string, enName: string, lang: Lang): string {
  return lang === "tr" ? categoryTr[slug]?.name ?? enName : enName;
}
export function catTagline(slug: string, enTagline: string, lang: Lang): string {
  return lang === "tr" ? categoryTr[slug]?.tagline ?? enTagline : enTagline;
}
export function algoName(slug: string, enName: string, lang: Lang): string {
  return lang === "tr" ? algoTr[slug]?.name ?? enName : enName;
}
export function algoSummary(
  slug: string,
  enSummary: string,
  lang: Lang
): string {
  return lang === "tr" ? algoTr[slug]?.summary ?? enSummary : enSummary;
}
