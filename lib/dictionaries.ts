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
  "ws.autoSorted": " · input is sorted automatically",
  "ws.copy": "Copy",
  "ws.line": "line",
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
  "graph.editHint": "Click two nodes to add or remove the edge between them.",
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
  "dp.sequence": "Sequence",
  "dp.lisNote": "dp = length of LIS ending at each value",

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
  "ws.autoSorted": " · girdi otomatik sıralanır",
  "ws.copy": "Kopyala",
  "ws.line": "satır",
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
  "graph.editHint": "İki düğüme tıklayarak aralarındaki kenarı ekleyin ya da kaldırın.",
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
  "dp.sequence": "Dizi",
  "dp.lisNote": "dp = her değerde biten EAA uzunluğu",

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
