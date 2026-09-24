/**
 * Loop invariants: the statement that is true *right now*, at whatever point
 * the run has reached.
 *
 * A step note says what just happened; an invariant says why the algorithm is
 * allowed to do it. Together they answer "why this step?" — which is the part a
 * trace of operations never shows on its own. Several algorithms change
 * invariant between phases (heap sort builds, then extracts), so
 * `lib/invariants.ts` picks which of these applies.
 */
export const en = {
  // Sorting
  "inv.bubble": "The last {locked} element(s) are in final position; nothing before them is larger.",
  "inv.select": "A[0..{i}-1] is sorted and holds the {i} smallest values — they will never move again.",
  "inv.insert": "A[0..{i}-1] is sorted. The key is held aside, so the gap in the array is not a lost value.",
  "inv.shell": "Every chain {gap} apart is sorted. Smaller gaps inherit that work, so the final pass has little left to do.",
  "inv.merge.split": "Splitting only divides the range — no value moves until a merge.",
  "inv.merge.merge": "Both halves being merged are already sorted, so the smaller of the two heads is the smallest value left.",
  "inv.quick.partition": "Everything left of i is < pivot; everything between i and j is ≥ pivot. The pivot lands between them.",
  "inv.quick.placed": "The pivot is at its final index: every value left of it is smaller, every value right of it is not.",
  "inv.heapsort.build": "Every subtree below the current index already satisfies the heap property, so sifting one node down is enough.",
  "inv.heapsort.extract": "A[i+1..n-1] holds the largest values, sorted and final; A[0..i] is still a valid max-heap.",
  "inv.counting.count": "counts[v] is the number of times v has been seen so far — no comparisons are involved.",
  "inv.counting.place": "Walking the input backwards keeps equal keys in their original order, which is what makes the sort stable.",
  "inv.radix": "The array is sorted by every digit processed so far. Because each pass is stable, earlier passes are not undone.",
  "inv.bucket": "Each bucket holds only values from its own range, so concatenating sorted buckets gives a sorted array.",

  // Searching
  "inv.linear": "Every index before i has been checked and is not the target.",
  "inv.binary": "If the target is present it lies in [{lo}..{hi}] — everything outside has been ruled out by order alone.",
  "inv.jump.blocks": "Every block end passed so far was smaller than the target, so the target cannot be in those blocks.",
  "inv.jump.scan": "The target, if present, is in this block: its end is ≥ the target and the previous end was <.",
  "inv.interp": "The target, if present, lies in [{lo}..{hi}]. The probe guesses where by assuming values spread evenly.",

  // Graphs
  "inv.bfs": "The queue holds nodes of at most two adjacent layers, so nodes come out in non-decreasing distance from the source.",
  "inv.dfs": "Every node on the stack is an ancestor of the current one; the path from the source is exactly that stack.",
  "inv.dijkstra": "Every visited node has its final shortest distance. That holds only because no edge weight is negative.",
  "inv.bellman": "After k passes, every shortest path using at most k edges has been found. V−1 passes cover every simple path.",
  "inv.topo": "Every node emitted so far has had all of its prerequisites emitted before it.",
  "inv.prim": "The chosen edges form one tree, and each was the cheapest edge leaving it — the cut property makes that safe.",
  "inv.kruskal": "The kept edges form a forest; each was the lightest edge joining two different components.",
  "inv.astar": "For a closed node, g is final. That needs h never to overestimate the remaining distance.",
  "inv.floyd": "dist[i][j] is the shortest path that stops over only at nodes < k.",

  // Trees
  "inv.bst": "For every node, the whole left subtree is smaller and the whole right subtree is larger — so one comparison rules out half the tree.",
  "inv.avl": "Every node's subtree heights differ by at most 1, which keeps the height O(log n) and the search path short.",
  "inv.heap": "Every parent is ≥ both children, so the maximum is always at the root.",
  "inv.trie": "The path from the root spells a prefix; a node's descendants are exactly the words extending it.",
  "inv.segment": "Each node stores the sum of its range, so any query is a handful of whole ranges rather than a scan.",
  "inv.unionfind": "Each element points towards its set's root; two elements are in one set exactly when they share that root.",

  // Dynamic programming
  "inv.lcs": "dp[i][j] is the answer for the first i of a and the first j of b — already final, never revisited.",
  "inv.knapsack": "dp[i][c] is the best value using only the first i items within capacity c.",
  "inv.edit": "dp[i][j] is the cheapest way to turn the first i of a into the first j of b.",
  "inv.coin": "dp[i][a] is the fewest coins making a from the first i denominations (∞ if it cannot be made).",
  "inv.fib": "dp[i] is final once written; each subproblem is solved exactly once, which is what removes the exponential blow-up.",
  "inv.kadane": "cur is the largest sum of a run ending exactly at i; best is the largest seen anywhere.",
  "inv.lis": "dp[i] is the longest increasing run ending exactly at i.",

  // Greedy
  "inv.activity": "Taking the earliest finisher leaves the most room for the rest — so a greedy choice is never worse than an optimal one.",
  "inv.frac": "The bag holds the best value per unit of weight taken so far; splitting one item is what makes greedy optimal here.",
  "inv.job": "Each job sits in the latest free hour before its deadline, which keeps earlier hours open for jobs yet to come.",
  "inv.huffman": "Merging the two lightest trees puts the rarest symbols deepest, so their long codes cost the least.",

  // Backtracking
  "inv.queens": "Every queen already on the board is safe from every other. A partial board is never illegal, only incomplete.",
  "inv.sudoku": "Every filled cell satisfies its row, column and box. A digit is only placed when it still holds.",
  "inv.maze": "The marked cells form one open path from the entrance to the current cell, with no repeats.",
  "inv.subsets": "The current list is a decision made for each of the first i elements: in or out.",
  "inv.perms": "Positions 0..k-1 are fixed; the rest is a permutation of the values not used yet.",

  // String matching
  "inv.kmp": "lps[i] is the longest proper prefix of p[0..i] that is also its suffix. That is why i never moves backwards: on a mismatch only j slides.",
  "inv.rk": "The window hash equals the hash of those m characters. Equal hashes may still differ, so a hit is verified; differing hashes never can, so a miss is free.",
  "inv.z": "z[i] is the length of the longest substring starting at i that matches a prefix of the text.",
  "inv.manacher": "p[i] is the radius of the palindrome centred at i. Inside the known window that radius is mirrored, so no character is compared twice.",
  "inv.bm": "Comparing right to left means a mismatched character that does not occur in the pattern lets the whole pattern skip past it.",

  // Data structures
  "inv.list": "Each node points to the next; the head is the only entry point, so a push is O(1) and an index lookup is not.",
  "inv.stack": "`top` indexes the most recently pushed item — the only one that can be removed.",
  "inv.queue": "Items leave from `front` and arrive at `rear`, both wrapping around, so order is preserved with no shifting.",
  "inv.hash": "Every key sits in bucket hash(key), so a lookup scans one chain instead of the whole table.",

  // Math
  "inv.sieve": "Every number still uncrossed below p² has no factor ≤ p, so it is prime.",
  "inv.gcd": "gcd(a, b) = gcd(b, a mod b), so every step shrinks the pair without changing the answer.",
  "inv.extgcd": "Every row satisfies r = s·a + t·b, so when r reaches the gcd the coefficients come with it.",
  "inv.pow": "result · base^exp is the answer throughout; each round halves the exponent.",
} as const;

export const tr: Partial<Record<keyof typeof en, string>> = {
  "inv.bubble": "Son {locked} eleman nihai yerinde; onlardan önce daha büyük bir değer yok.",
  "inv.select": "A[0..{i}-1] sıralı ve en küçük {i} değeri tutuyor — bir daha yer değiştirmeyecekler.",
  "inv.insert": "A[0..{i}-1] sıralı. Anahtar elde tutulduğu için dizideki boşluk kaybolmuş bir değer değil.",
  "inv.shell": "{gap} aralıklı her zincir sıralı. Küçük boşluklar bu işi devralır, bu yüzden son turda yapacak iş az kalır.",
  "inv.merge.split": "Bölme yalnızca aralığı ikiye ayırır — birleştirme olmadan hiçbir değer yer değiştirmez.",
  "inv.merge.merge": "Birleştirilen iki yarı da zaten sıralı, dolayısıyla iki baştan küçük olan kalan en küçük değerdir.",
  "inv.quick.partition": "i'nin solundaki her şey < pivot; i ile j arasındaki her şey ≥ pivot. Pivot ikisinin arasına oturur.",
  "inv.quick.placed": "Pivot nihai indeksinde: solundaki her değer küçük, sağındaki her değer değil.",
  "inv.heapsort.build": "Mevcut indeksin altındaki her alt ağaç heap özelliğini zaten sağlıyor, bu yüzden tek düğümü aşağı süzmek yeterli.",
  "inv.heapsort.extract": "A[i+1..n-1] en büyük değerleri sıralı ve nihai tutuyor; A[0..i] hâlâ geçerli bir max-heap.",
  "inv.counting.count": "counts[v], v'nin şimdiye kadar kaç kez görüldüğüdür — hiç karşılaştırma yapılmaz.",
  "inv.counting.place": "Girdiyi sondan başa taramak eşit anahtarları özgün sırasında tutar; sıralamayı kararlı yapan budur.",
  "inv.radix": "Dizi, işlenen tüm basamaklara göre sıralı. Her tur kararlı olduğu için önceki turlar bozulmaz.",
  "inv.bucket": "Her kova yalnızca kendi aralığından değer tutar, bu yüzden sıralı kovaları birleştirmek sıralı dizi verir.",

  "inv.linear": "i'den önceki her indeks kontrol edildi ve hedef değil.",
  "inv.binary": "Hedef varsa [{lo}..{hi}] aralığındadır — dışarıdaki her şey yalnızca sıralılık sayesinde elendi.",
  "inv.jump.blocks": "Şimdiye kadar geçilen her blok sonu hedeften küçüktü, dolayısıyla hedef o bloklarda olamaz.",
  "inv.jump.scan": "Hedef varsa bu blokta: bloğun sonu ≥ hedef, önceki bloğun sonu ise < hedefti.",
  "inv.interp": "Hedef varsa [{lo}..{hi}] aralığındadır. Yoklama, değerlerin eşit dağıldığını varsayarak yeri tahmin eder.",

  "inv.bfs": "Kuyruk en fazla iki komşu katmandan düğüm tutar, bu yüzden düğümler kaynağa uzaklığı azalmayacak sırada çıkar.",
  "inv.dfs": "Yığındaki her düğüm mevcut düğümün atasıdır; kaynaktan gelen yol tam olarak o yığındır.",
  "inv.dijkstra": "Ziyaret edilen her düğümün en kısa mesafesi nihaidir. Bu ancak hiçbir kenar ağırlığı negatif değilse geçerlidir.",
  "inv.bellman": "k tur sonra, en fazla k kenar kullanan tüm en kısa yollar bulunmuştur. V−1 tur her basit yolu kapsar.",
  "inv.topo": "Şimdiye kadar yayınlanan her düğümün tüm ön koşulları ondan önce yayınlanmıştır.",
  "inv.prim": "Seçilen kenarlar tek bir ağaç oluşturur ve her biri o ağaçtan çıkan en ucuz kenardı — kesim özelliği bunu güvenli kılar.",
  "inv.kruskal": "Tutulan kenarlar bir orman oluşturur; her biri iki farklı bileşeni birleştiren en hafif kenardı.",
  "inv.astar": "Kapatılmış bir düğüm için g nihaidir. Bunun için h'nin kalan mesafeyi asla fazla tahmin etmemesi gerekir.",
  "inv.floyd": "dist[i][j], yalnızca k'dan küçük düğümlerde mola veren en kısa yoldur.",

  "inv.bst": "Her düğüm için sol alt ağacın tamamı küçük, sağ alt ağacın tamamı büyüktür — bu yüzden tek karşılaştırma ağacın yarısını eler.",
  "inv.avl": "Her düğümün alt ağaç yükseklikleri en fazla 1 fark eder; bu yüksekliği O(log n) ve arama yolunu kısa tutar.",
  "inv.heap": "Her ebeveyn iki çocuğundan da ≥ olduğu için maksimum her zaman köktedir.",
  "inv.trie": "Kökten gelen yol bir ön ek yazar; bir düğümün torunları tam olarak onu uzatan kelimelerdir.",
  "inv.segment": "Her düğüm kendi aralığının toplamını tutar, bu yüzden her sorgu tarama değil birkaç tam aralıktır.",
  "inv.unionfind": "Her eleman kümesinin kökünü gösterir; iki eleman tam olarak aynı kökü paylaştıklarında aynı kümededir.",

  "inv.lcs": "dp[i][j], a'nın ilk i ve b'nin ilk j karakteri için cevaptır — zaten nihai, bir daha ziyaret edilmez.",
  "inv.knapsack": "dp[i][c], yalnızca ilk i eşyayı kullanarak c kapasitesinde elde edilen en yüksek değerdir.",
  "inv.edit": "dp[i][j], a'nın ilk i karakterini b'nin ilk j karakterine çevirmenin en ucuz yoludur.",
  "inv.coin": "dp[i][a], ilk i para biriminden a tutarını oluşturan en az para sayısıdır (oluşturulamıyorsa ∞).",
  "inv.fib": "dp[i] yazıldığı anda nihaidir; her alt problem tam bir kez çözülür — üstel patlamayı kaldıran budur.",
  "inv.kadane": "cur, tam olarak i'de biten bir dizinin en büyük toplamıdır; best ise her yerde görülen en büyüğüdür.",
  "inv.lis": "dp[i], tam olarak i'de biten en uzun artan dizidir.",

  "inv.activity": "En erken biteni almak geri kalana en çok yeri bırakır — bu yüzden açgözlü seçim optimalden hiç kötü değildir.",
  "inv.frac": "Çanta, ağırlık birimi başına en iyi değeri tutar; burada açgözlülüğü optimal yapan, bir eşyayı bölebilmektir.",
  "inv.job": "Her iş son tarihinden önceki en geç boş saate yerleşir; bu, gelecek işler için erken saatleri açık tutar.",
  "inv.huffman": "En hafif iki ağacı birleştirmek en nadir sembolleri en derine koyar, böylece uzun kodları en az maliyetli olur.",

  "inv.queens": "Tahtadaki her vezir diğerlerinden güvendedir. Kısmi bir tahta asla kuraldışı değil, yalnızca eksiktir.",
  "inv.sudoku": "Dolu her göz satır, kolon ve kutu kuralını sağlar. Bir rakam ancak kural hâlâ geçerliyken yerleştirilir.",
  "inv.maze": "İşaretli gözler girişten mevcut göze kadar tek bir açık yol oluşturur, tekrar içermez.",
  "inv.subsets": "Mevcut liste, ilk i eleman için verilmiş bir karardır: içinde ya da dışında.",
  "inv.perms": "0..k-1 konumları sabittir; geri kalan, henüz kullanılmamış değerlerin bir permütasyonudur.",

  "inv.kmp": "lps[i], p[0..i]'nin hem öz öneki hem soneki olan en uzun parçanın uzunluğudur. i'nin hiç geri gitmemesinin nedeni bu: uyuşmazlıkta yalnızca j kayar.",
  "inv.rk": "Pencere özeti, o m karakterin özetine eşittir. Eşit özetler yine farklı olabilir, bu yüzden isabet doğrulanır; farklı özetler asla eşleşemez, bu yüzden ıskalama bedavaya gelir.",
  "inv.z": "z[i], i'de başlayıp metnin bir önekiyle eşleşen en uzun parçanın uzunluğudur.",
  "inv.manacher": "p[i], i merkezli palindromun yarıçapıdır. Bilinen pencere içinde bu yarıçap aynalanır, böylece hiçbir karakter iki kez karşılaştırılmaz.",
  "inv.bm": "Sağdan sola karşılaştırmak, desende hiç bulunmayan bir uyuşmaz karakterin tüm desenin onun ötesine atlamasına izin verir.",

  "inv.list": "Her düğüm sonrakini gösterir; head tek giriş noktasıdır, bu yüzden başa ekleme O(1) iken indeksle erişim değildir.",
  "inv.stack": "`top`, en son eklenen öğeyi gösterir — kaldırılabilecek tek öğe odur.",
  "inv.queue": "Öğeler `front`'tan çıkar, `rear`'a gelir; ikisi de başa döner, böylece sıra kaydırma yapılmadan korunur.",
  "inv.hash": "Her anahtar hash(anahtar) kovasında durur, bu yüzden arama tüm tabloyu değil tek zinciri tarar.",

  "inv.sieve": "p² altında hâlâ çizilmemiş her sayının ≤ p bir çarpanı yoktur, dolayısıyla asaldır.",
  "inv.gcd": "gcd(a, b) = gcd(b, a mod b) olduğundan her adım cevabı değiştirmeden çifti küçültür.",
  "inv.extgcd": "Her satır r = s·a + t·b eşitliğini sağlar; r gcd'ye ulaştığında katsayılar da onunla gelir.",
  "inv.pow": "result · base^exp baştan sona cevaptır; her tur üssü yarıya indirir.",
};
