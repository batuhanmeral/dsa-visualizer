// UI string dictionary. `en` is the source of truth (its keys type `t`); `tr`
// is a partial override that falls back to English for any missing key. Content
// strings that live in `lib/data.ts` (algorithm names/summaries, category
// names/taglines) are translated separately in `lib/content-i18n.ts`.
//
// NOTE: the per-step play-by-play `note` strings produced by the simulation
// generators are intentionally left English for now (see .docs/PROGRESS.md).

export const en = {
  // Shared transport (aria/title)
  reset: "Reset",
  stepBack: "Step back",
  stepForward: "Step forward",
  play: "Play",
  pause: "Pause",

  // Shell / navigation
  "brand.tagline": "DSA Visualizer",
  "nav.overview": "Overview",
  "nav.open": "Open navigation",
  "nav.close": "Close navigation",
  "nav.collapse": "Collapse sidebar",
  "nav.expand": "Expand sidebar",
  "toggle.lang": "Switch language",
  "toggle.theme.dark": "Switch to dark",
  "toggle.theme.light": "Switch to light",

  // Home
  "home.badge": "{count} algorithms · {categories} categories",
  "home.title.pre": "See algorithms ",
  "home.title.accent": "think",
  "home.title.post": ".",
  "home.subtitle":
    "An interactive workspace for learning data structures and algorithms. Pick a topic, watch every step unfold, and follow along in the code — at your own pace.",

  // Category page
  "cat.time": "Time",
  "cat.space": "Space",

  // Not found
  "nf.title": "Page not found",
  "nf.desc": "This algorithm hasn't been charted yet.",
  "nf.back": "Back to overview",

  // Workspace
  "ws.compare": "Compare",
  "ws.compare.title": "Race this algorithm against another on the same input",
  "ws.apply": "Apply",
  "ws.random": "Random",
  "ws.random.title": "Random input",
  "ws.share": "Share",
  "ws.copied": "Copied",
  "ws.share.title": "Copy a link that reopens this exact input and step",
  "ws.input.aria": "Input numbers",
  "ws.input.placeholder": "e.g. 23, 7, 41, 15",
  "ws.target.aria": "Target value",
  "ws.maxNumbers": "max {n} numbers (0–999)",
  "ws.lang.c": "C",
  "ws.lang.pseudo": "Pseudocode",
  "ws.autoSorted": " · input is sorted automatically",
  "ws.copy": "Copy",
  "ws.timeline": "Simulation timeline",
  "ws.status.running": "Running",
  "ws.status.done": "Done",
  "ws.status.idle": "Idle",
  "ws.hint.search":
    "Looking for {target} — matches are highlighted. Step-by-step animation coming next.",
  "ws.hint.sort":
    "Your input, ready to sort. Step-by-step animation coming next.",
  "ws.ds.preview":
    "Your input, staged as {name} elements. Interactive operations (insert, remove, …) arrive with the simulation engine.",
  "ws.viz.title": "Visualization Area",
  "ws.viz.desc":
    "The animated {name} visualization will render here. Use the controls above to drive playback.",

  // Side panel tabs + about section
  "ws.tab.code": "Code",
  "ws.tab.about": "About",
  "ws.tab.growth": "Growth",
  "ws.invariant": "Invariant",
  "graph.weight.less": "Decrease this edge's weight",
  "graph.weight.more": "Increase this edge's weight",
  "graph.directed": "Directed",
  "graph.undirected": "Undirected",
  "graph.directed.title": "Switch between directed and undirected edges",
  "graph.deleteNode": "Delete {id}",
  "ws.shape": "Input",
  "ws.shape.title": "Load an input shape that shows a best or worst case",
  "ws.shape.random": "Random",
  "ws.shape.sorted": "Already sorted",
  "ws.shape.reversed": "Reverse sorted",
  "ws.shape.nearly": "Nearly sorted",
  "ws.shape.equal": "All equal",
  "ws.shape.fewUnique": "Few distinct values",
  "ws.shape.wideRange": "Wide value range",
  "stat.total": "operations",
  "stat.totalHint":
    "Comparisons, swaps, moves and probes so far. This algorithm is {o}; open the Growth tab to see the count for n = {n} against that curve.",
  "growth.hint.ops":
    "Comparisons, swaps, moves and probes on the same random input at growing sizes — this is what the O(…) bound is about.",
  "growth.hint.steps":
    "Animation frames, narration included. The shape matches the operations, but the constant is the visualization's, not the algorithm's.",
  "growth.metric.ops": "operations",
  "growth.metric.steps": "steps",
  "growth.theory": "{o}, fitted to the measurements",
  "growth.legend.theory": "{o} (fitted)",
  "growth.legend.live": "your input (n = {n})",
  "growth.live": "your input — n={n}: {value}",
  "growth.steps": "steps",
  "growth.others": "other algorithms ({n})",
  "growth.table": "Show data table",
  "info.how": "How it works",
  "info.best": "Best case",
  "info.worst": "Worst case",
  "info.use": "When to use it",

  // Legends (sorting / searching)
  "legend.compare": "compare",
  "legend.swap": "swap",
  "legend.shift": "shift",
  "legend.select": "select",
  "legend.sorted": "sorted",
  "legend.checking": "checking",
  "legend.found": "found",
  "legend.eliminated": "eliminated",

  // Stat counters
  "stat.comparisons": "comparisons",
  "stat.swaps": "swaps",
  "stat.moves": "moves",
  "stat.probes": "probes",

  // Graphs
  "graph.legend.current": "current",
  "graph.legend.frontier": "frontier",
  "graph.legend.visited": "visited",
  "graph.legend.treeEdge": "tree edge",
  "graph.start.node": "Start node",
  "graph.start.source": "Source",
  "graph.start.start": "Start",
  "graph.goal": "Goal",
  "graph.edit": "Edit graph",
  "graph.editing": "Editing edges",
  "graph.reset": "Reset",
  "graph.reset.title": "Restore preset graph",
  "graph.addNode": "Add node",
  "graph.editHint":
    "Click two nodes to toggle the edge between them. Drag a node to move it, shift-click to delete it, and click a weight to adjust it. Weights stay ≥ 1: the adjacency matrix uses 0 to mean \"no edge\".",
  "graph.order": "order",

  // Dynamic programming
  "dp.legend.computing": "computing",
  "dp.legend.readsFrom": "reads from",
  "dp.legend.filled": "filled",
  "dp.stringA": "String A",
  "dp.stringB": "String B",
  "dp.match": "chars match",
  "dp.noMatch": "no match",
  "dp.charsDiffer": "chars differ",
  "dp.items": "Items",
  "dp.cap": "cap {n}",
  "dp.coins": "Coins",
  "dp.amount": "amount {n}",
  "dp.n": "n",
  "dp.k": "k",
  "dp.fwNote": "round k = allowed stopover",
  "dp.sequence": "Sequence",
  "dp.lisNote": "dp = length of LIS ending at each value",
  "dp.kadaneNote": "cur = best subarray sum ending at each value",

  // Trees
  "tree.legend.current": "current",
  "tree.legend.compare": "compare",
  "tree.legend.insert": "insert",
  "tree.legend.remove": "remove",
  "tree.legend.rotate": "rotate",
  "tree.insert": "Insert",
  "tree.search": "Search",
  "tree.delete": "Delete",
  "tree.push": "Push",
  "tree.pops": "Pops",
  "tree.words": "Words",
  "tree.array": "Array",
  "tree.queryLo": "Query lo",
  "tree.queryHi": "hi",
  "tree.unions": "Unions",
  "tree.find": "Find",

  // Strings
  "str.legend.pointer": "pointer",
  "str.legend.match": "match",
  "str.legend.mismatch": "mismatch",
  "str.legend.window": "window",
  "str.text": "Text",
  "str.pattern": "Pattern",

  // Greedy
  "greedy.legend.considering": "considering",
  "greedy.legend.selected": "selected",
  "greedy.legend.rejected": "rejected",
  "greedy.legend.taken": "taken whole",
  "greedy.legend.fraction": "taken fraction",
  "greedy.legend.picked": "picked (two minima)",
  "greedy.legend.merged": "merged",
  "greedy.legend.codeEmitted": "code emitted",
  "greedy.activityHint": "Sorted by finish time — the line marks the last finish.",
  "greedy.jobsHint": "Sorted by profit — each job grabs the latest free hour.",
  "greedy.capacity": "capacity {n}",
  "greedy.total": "total",
  "greedy.bag": "Bag",
  "greedy.hour": "hour",
  "greedy.text": "Text",
  "greedy.codes": "Codes",

  // Math / number theory
  "math.legend.prime": "prime",
  "math.legend.crossing": "crossing out",
  "math.legend.crossed": "crossed",
  "math.legend.currentBit": "current bit",
  "math.legend.doneBit": "processed bit",
  "math.n": "n",
  "math.a": "a",
  "math.b": "b",
  "math.base": "Base",
  "math.exp": "Exp",
  "math.mod": "Mod",
  "math.extNote": "every row keeps r = s·a + t·b",

  // Backtracking
  "bt.legend.trying": "trying",
  "bt.legend.placed": "placed",
  "bt.legend.conflict": "conflict",
  "bt.legend.backtrack": "backtrack",
  "bt.legend.scanning": "scanning",
  "bt.legend.rejectBacktrack": "reject/backtrack",
  "bt.legend.onPath": "on path",
  "bt.legend.deadEnd": "dead end",
  "bt.legend.choose": "choose",
  "bt.legend.recorded": "recorded",
  "bt.boardSize": "Board size",
  "bt.sudokuHint":
    "Solving one preset puzzle — watch digits get tried, placed and undone.",
  "bt.mazeHint":
    "Rat starts top-left, exit is bottom-right. Walls are dark cells.",
  "bt.building": "building",
  "bt.recordedCount": "recorded ({n})",
  "bt.set": "Set",
  "bt.elements": "Elements",
  "bt.found": "found {n} / {total}",
  "bt.empty": "empty",
  "bt.noneYet": "none yet",

  // Data structures
  "ds.pickOp": "Pick an operation to begin.",
  "ds.value": "Value",
  "ds.push": "Push",
  "ds.pop": "Pop",
  "ds.clear": "Clear",
  "ds.enqueue": "Enqueue",
  "ds.dequeue": "Dequeue",
  "ds.pushFront": "Push front",
  "ds.remove": "Remove",
  "ds.insert": "Insert",
  "ds.contains": "Contains",
  "ds.stackEmpty": "stack is empty",
  "ds.queueEmpty": "queue is empty",
  "ds.head": "head",
  "ds.top": "← top",
  "ds.front": "front",
  "ds.rear": "rear",

  // Compare mode
  "cmp.vs": "vs",
  "cmp.steps": "{n} steps",
  "cmp.racing": "Racing on the same input — {a} vs {b}.",
  "cmp.tie": "Tie — both finished in {n} steps.",
  "cmp.wins": "{name} wins: {a} vs {b} steps.",
} as const;

export type TKey = keyof typeof en;

export const tr: Partial<Record<TKey, string>> = {
  // Shared transport
  reset: "Sıfırla",
  stepBack: "Geri adım",
  stepForward: "İleri adım",
  play: "Oynat",
  pause: "Duraklat",

  // Shell / navigation
  "brand.tagline": "DSA Visualizer",
  "nav.overview": "Genel Bakış",
  "nav.open": "Menüyü aç",
  "nav.close": "Menüyü kapat",
  "nav.collapse": "Kenar çubuğunu kapat",
  "nav.expand": "Kenar çubuğunu aç",
  "toggle.lang": "Dili değiştir",
  "toggle.theme.dark": "Koyu temaya geç",
  "toggle.theme.light": "Açık temaya geç",

  // Home
  "home.badge": "{count} algoritma · {categories} kategori",
  "home.title.pre": "Algoritmaların ",
  "home.title.accent": "düşünmesini",
  "home.title.post": " izle.",
  "home.subtitle":
    "Veri yapılarını ve algoritmaları öğrenmek için etkileşimli bir çalışma alanı. Bir konu seç, her adımın nasıl işlediğini izle ve kodu kendi hızında takip et.",

  // Category page
  "cat.time": "Süre",
  "cat.space": "Alan",

  // Not found
  "nf.title": "Sayfa bulunamadı",
  "nf.desc": "Bu algoritma henüz eklenmedi.",
  "nf.back": "Genel bakışa dön",

  // Workspace
  "ws.compare": "Karşılaştır",
  "ws.compare.title":
    "Bu algoritmayı aynı girdi üzerinde başka biriyle yarıştır",
  "ws.apply": "Uygula",
  "ws.random": "Rastgele",
  "ws.random.title": "Rastgele girdi",
  "ws.share": "Paylaş",
  "ws.copied": "Kopyalandı",
  "ws.share.title": "Bu girdiyi ve adımı yeniden açan bir bağlantı kopyala",
  "ws.input.aria": "Girdi sayıları",
  "ws.input.placeholder": "örn. 23, 7, 41, 15",
  "ws.target.aria": "Hedef değer",
  "ws.maxNumbers": "en fazla {n} sayı (0–999)",
  "ws.lang.c": "C",
  "ws.lang.pseudo": "Sözde kod",
  "ws.autoSorted": " · girdi otomatik sıralanır",
  "ws.copy": "Kopyala",
  "ws.timeline": "Simülasyon zaman çizelgesi",
  "ws.status.running": "Çalışıyor",
  "ws.status.done": "Bitti",
  "ws.status.idle": "Boşta",
  "ws.hint.search":
    "{target} aranıyor — eşleşmeler vurgulanır. Adım adım animasyon yakında.",
  "ws.hint.sort":
    "Girdin sıralanmaya hazır. Adım adım animasyon yakında.",
  "ws.ds.preview":
    "Girdin {name} elemanları olarak hazırlandı. Etkileşimli işlemler (ekle, sil, …) simülasyon motoruyla gelir.",
  "ws.viz.title": "Görselleştirme Alanı",
  "ws.viz.desc":
    "Animasyonlu {name} görselleştirmesi burada oluşur. Oynatmayı yukarıdaki kontrollerle sür.",

  // Side panel tabs + about section
  "ws.tab.code": "Kod",
  "ws.tab.about": "Açıklama",
  "ws.tab.growth": "Büyüme",
  "ws.invariant": "Değişmez",
  "graph.weight.less": "Bu kenarın ağırlığını azalt",
  "graph.weight.more": "Bu kenarın ağırlığını artır",
  "graph.directed": "Yönlü",
  "graph.undirected": "Yönsüz",
  "graph.directed.title": "Yönlü ve yönsüz kenarlar arasında geçiş yap",
  "graph.deleteNode": "{id} sil",
  "ws.shape": "Girdi",
  "ws.shape.title": "En iyi ya da en kötü durumu gösteren bir girdi şekli yükle",
  "ws.shape.random": "Rastgele",
  "ws.shape.sorted": "Zaten sıralı",
  "ws.shape.reversed": "Ters sıralı",
  "ws.shape.nearly": "Neredeyse sıralı",
  "ws.shape.equal": "Tümü eşit",
  "ws.shape.fewUnique": "Az sayıda farklı değer",
  "ws.shape.wideRange": "Geniş değer aralığı",
  "stat.total": "işlem",
  "stat.totalHint":
    "Şimdiye kadarki karşılaştırma, takas, hareket ve yoklama sayısı. Bu algoritma {o}; n = {n} için bu sayının eğriye oturuşunu Büyüme sekmesinde görebilirsiniz.",
  "growth.hint.ops":
    "Aynı rastgele girdide, büyüyen boyutlarda karşılaştırma, takas, hareket ve yoklama sayısı — O(…) sınırının konusu tam olarak bu.",
  "growth.hint.steps":
    "Anlatım adımları dahil animasyon kareleri. Şekil işlem sayısıyla aynı, ama sabit çarpan algoritmanın değil görselleştirmenin.",
  "growth.metric.ops": "işlem",
  "growth.metric.steps": "adım",
  "growth.theory": "{o}, ölçümlere oturtuldu",
  "growth.legend.theory": "{o} (oturtulmuş)",
  "growth.legend.live": "sizin girdiniz (n = {n})",
  "growth.live": "sizin girdiniz — n={n}: {value}",
  "growth.steps": "adım",
  "growth.others": "diğer algoritmalar ({n})",
  "growth.table": "Veri tablosunu göster",
  "info.how": "Nasıl çalışır?",
  "info.best": "En iyi durum",
  "info.worst": "En kötü durum",
  "info.use": "Ne zaman kullanılır?",

  // Legends
  "legend.compare": "karşılaştır",
  "legend.swap": "takas",
  "legend.shift": "kaydır",
  "legend.select": "seç",
  "legend.sorted": "sıralı",
  "legend.checking": "kontrol",
  "legend.found": "bulundu",
  "legend.eliminated": "elendi",

  // Stats
  "stat.comparisons": "karşılaştırma",
  "stat.swaps": "takas",
  "stat.moves": "hareket",
  "stat.probes": "sondaj",

  // Graphs
  "graph.legend.current": "mevcut",
  "graph.legend.frontier": "sınır",
  "graph.legend.visited": "ziyaret edildi",
  "graph.legend.treeEdge": "ağaç kenarı",
  "graph.start.node": "Başlangıç düğümü",
  "graph.start.source": "Kaynak",
  "graph.start.start": "Başlangıç",
  "graph.goal": "Hedef",
  "graph.edit": "Grafı düzenle",
  "graph.editing": "Kenarlar düzenleniyor",
  "graph.reset": "Sıfırla",
  "graph.reset.title": "Hazır grafı geri yükle",
  "graph.addNode": "Düğüm ekle",
  "graph.editHint":
    "İki düğüme tıklayarak aralarındaki kenarı ekleyip kaldırın. Düğümü sürükleyerek taşıyın, shift ile tıklayarak silin, ağırlığa tıklayarak değiştirin. Ağırlıklar ≥ 1 kalır: komşuluk matrisinde 0, \"kenar yok\" demektir.",
  "graph.order": "sıra",

  // DP
  "dp.legend.computing": "hesaplanıyor",
  "dp.legend.readsFrom": "okuduğu",
  "dp.legend.filled": "dolu",
  "dp.stringA": "Dize A",
  "dp.stringB": "Dize B",
  "dp.match": "karakterler eşleşiyor",
  "dp.noMatch": "eşleşme yok",
  "dp.charsDiffer": "karakterler farklı",
  "dp.items": "Öğeler",
  "dp.cap": "kap. {n}",
  "dp.coins": "Paralar",
  "dp.amount": "tutar {n}",
  "dp.n": "n",
  "dp.k": "k",
  "dp.fwNote": "k turu = izinli ara durak",
  "dp.sequence": "Dizi",
  "dp.lisNote": "dp = her değerde biten EAA uzunluğu",
  "dp.kadaneNote": "cur = her değerde biten en iyi alt dizi toplamı",

  // Trees
  "tree.legend.current": "mevcut",
  "tree.legend.compare": "karşılaştır",
  "tree.legend.insert": "ekle",
  "tree.legend.remove": "sil",
  "tree.legend.rotate": "döndür",
  "tree.insert": "Ekle",
  "tree.search": "Ara",
  "tree.delete": "Sil",
  "tree.push": "Ekle",
  "tree.pops": "Çıkar",
  "tree.words": "Kelimeler",
  "tree.array": "Dizi",
  "tree.queryLo": "Sorgu alt",
  "tree.queryHi": "üst",
  "tree.unions": "Birleştirmeler",
  "tree.find": "Bul",

  // Strings
  "str.legend.pointer": "işaretçi",
  "str.legend.match": "eşleşme",
  "str.legend.mismatch": "uyumsuz",
  "str.legend.window": "pencere",
  "str.text": "Metin",
  "str.pattern": "Desen",

  // Greedy
  "greedy.legend.considering": "değerlendiriliyor",
  "greedy.legend.selected": "seçildi",
  "greedy.legend.rejected": "reddedildi",
  "greedy.legend.taken": "tamamı alındı",
  "greedy.legend.fraction": "kesri alındı",
  "greedy.legend.picked": "seçilen (iki en küçük)",
  "greedy.legend.merged": "birleştirildi",
  "greedy.legend.codeEmitted": "kod üretildi",
  "greedy.activityHint":
    "Bitiş zamanına göre sıralı — çizgi son bitişi gösterir.",
  "greedy.jobsHint":
    "Kâra göre sıralı — her iş en geç boş saati kapar.",
  "greedy.capacity": "kapasite {n}",
  "greedy.total": "toplam",
  "greedy.bag": "Çanta",
  "greedy.hour": "saat",
  "greedy.text": "Metin",
  "greedy.codes": "Kodlar",

  // Math / number theory
  "math.legend.prime": "asal",
  "math.legend.crossing": "eleniyor",
  "math.legend.crossed": "elendi",
  "math.legend.currentBit": "aktif bit",
  "math.legend.doneBit": "işlenen bit",
  "math.n": "n",
  "math.a": "a",
  "math.b": "b",
  "math.base": "Taban",
  "math.exp": "Üs",
  "math.mod": "Mod",
  "math.extNote": "her satırda r = s·a + t·b korunur",

  // Backtracking
  "bt.legend.trying": "deneniyor",
  "bt.legend.placed": "yerleşti",
  "bt.legend.conflict": "çakışma",
  "bt.legend.backtrack": "geri izleme",
  "bt.legend.scanning": "taranıyor",
  "bt.legend.rejectBacktrack": "red/geri izleme",
  "bt.legend.onPath": "yolda",
  "bt.legend.deadEnd": "çıkmaz",
  "bt.legend.choose": "seç",
  "bt.legend.recorded": "kaydedildi",
  "bt.boardSize": "Tahta boyutu",
  "bt.sudokuHint":
    "Hazır bir bulmaca çözülüyor — rakamların denenip yerleştirilip geri alınışını izleyin.",
  "bt.mazeHint":
    "Fare sol üstten başlar, çıkış sağ alttadır. Duvarlar koyu hücrelerdir.",
  "bt.building": "oluşturuluyor",
  "bt.recordedCount": "kaydedilen ({n})",
  "bt.set": "Küme",
  "bt.elements": "Elemanlar",
  "bt.found": "{n} / {total} bulundu",
  "bt.empty": "boş",
  "bt.noneYet": "henüz yok",

  // Data structures
  "ds.pickOp": "Başlamak için bir işlem seçin.",
  "ds.value": "Değer",
  "ds.push": "Ekle",
  "ds.pop": "Çıkar",
  "ds.clear": "Temizle",
  "ds.enqueue": "Sıraya ekle",
  "ds.dequeue": "Sıradan çıkar",
  "ds.pushFront": "Başa ekle",
  "ds.remove": "Sil",
  "ds.insert": "Ekle",
  "ds.contains": "İçeriyor mu",
  "ds.stackEmpty": "yığın boş",
  "ds.queueEmpty": "kuyruk boş",
  "ds.head": "baş",
  "ds.top": "← tepe",
  "ds.front": "ön",
  "ds.rear": "arka",

  // Compare
  "cmp.vs": "vs",
  "cmp.steps": "{n} adım",
  "cmp.racing": "Aynı girdide yarışıyor — {a} vs {b}.",
  "cmp.tie": "Berabere — ikisi de {n} adımda bitti.",
  "cmp.wins": "{name} kazandı: {a} - {b} adım.",
};
