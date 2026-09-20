/** Step notes for the eight graph engines (`lib/simulations/graphs.ts`). */
export const en = {
  // BFS
  "n.bfs.markSource": "Mark source {node} as visited.",
  "n.bfs.enqueueSource": "Enqueue {node}. Queue: [{queue}].",
  "n.bfs.notEmpty": "Queue not empty — keep exploring.",
  "n.bfs.dequeue": "Dequeue {node} — it is next in FIFO order.",
  "n.bfs.visit": "Visit {node}. Output: {order}.",
  "n.bfs.neighbourSeen": "Look at neighbour {to} of {from} — already visited, skip.",
  "n.bfs.neighbourNew": "Look at neighbour {to} of {from} — undiscovered.",
  "n.bfs.mark": "Mark {node} as visited.",
  "n.bfs.enqueue": "Enqueue {node}. Queue: [{queue}].",
  "n.bfs.done": "Queue empty — BFS complete. Order: {order}.",

  // DFS
  "n.dfs.enter": "Enter dfs({node}) — mark {node} visited.",
  "n.dfs.visit": "Visit {node}. Output: {order}.",
  "n.dfs.neighbourSeen": "Neighbour {to} of {from} — already visited, skip.",
  "n.dfs.neighbourNew": "Neighbour {to} of {from} — dive in.",
  "n.dfs.recurse": "Recurse: dfs({node}).",
  "n.dfs.back": "Back in dfs({node}); continue its neighbours.",
  "n.dfs.return": "dfs({node}) returns — backtrack.",
  "n.dfs.done": "DFS complete. Order: {order}.",

  // Dijkstra
  "n.dijkstra.init": "Initialise every distance to ∞.",
  "n.dijkstra.source": "Distance to source {node} is 0.",
  "n.dijkstra.pick": "Nearest unvisited node is {node} (distance {dist}).",
  "n.dijkstra.lock": "Lock in {node} — its shortest distance is final.",
  "n.dijkstra.relax":
    "Edge {from}→{to} (weight {w}): {du} + {w} = {sum} vs {dv}.",
  "n.dijkstra.update": "Shorter — update dist[{to}] = {value}.",
  "n.dijkstra.done": "Done. Distances from {src} → {summary}.",

  // Bellman-Ford
  "n.bellman.init": "Initialise every distance to ∞.",
  "n.bellman.source": "Distance to source {node} is 0.",
  "n.bellman.relax":
    "Pass {pass}: relax {from}→{to} (w {w}): {du} + {w} = {sum} vs {dv}.",
  "n.bellman.update": "Shorter — update dist[{to}] = {value}.",
  "n.bellman.converged": "Pass {pass} changed nothing — distances have converged.",
  "n.bellman.checkCycle":
    "V−1 passes are done. One more sweep: any edge that still relaxes proves a negative cycle.",
  "n.bellman.negativeCycle":
    "Edge {from}→{to} still relaxes ({du} + {w} < {dv}) — a negative cycle is reachable from {src}, so no shortest path exists.",
  "n.bellman.noCycle": "No edge relaxes any further — there is no negative cycle.",
  "n.bellman.done": "Done. Distances from {src} → {summary}.",

  // Topological sort
  "n.topo.indegrees": "Count in-degrees (badge under each node).",
  "n.topo.seed": "Seed the queue with in-degree-0 nodes: [{queue}].",
  "n.topo.dequeue": "Dequeue {node}.",
  "n.topo.emit": "Emit {node}. Order: {order}.",
  "n.topo.removeReady":
    "Remove edge {from}→{to}; in-degree of {to} is now {indeg} — ready.",
  "n.topo.remove": "Remove edge {from}→{to}; in-degree of {to} is now {indeg}.",
  "n.topo.done": "Done. Topological order: {order}.",
  "n.topo.cycle":
    "Only {emitted} of {total} nodes could be emitted — the remaining {left} sit on a cycle, so this graph has no topological order.",

  // Prim
  "n.prim.start": "Start from {node}: key[{node}] = 0, all others ∞.",
  "n.prim.addStart": "Add start node {node} to the MST.",
  "n.prim.add": "Add {node} via edge {from}–{to} (w {w}). MST weight {weight}.",
  "n.prim.consider": "Edge {from}–{to} (w {w}) vs current key[{to}] = {key}.",
  "n.prim.cheaper": "Cheaper — key[{to}] = {w}, parent = {from}.",
  "n.prim.done": "Done. Minimum spanning tree weight is {weight}.",

  // Kruskal
  "n.kruskal.makeSets": "Put each node in its own set (badge = set root).",
  "n.kruskal.sorted": "Sort edges by weight: {edges}.",
  "n.kruskal.consider": "Edge {from}–{to} (w {w}): roots {ra} and {rb}.",
  "n.kruskal.keep": "Different sets — union them and keep the edge. MST weight {weight}.",
  "n.kruskal.cycle": "Same set — this edge would form a cycle, skip it.",
  "n.kruskal.done": "Done. Minimum spanning tree weight is {weight}.",

  // A*
  "n.astar.start": "Goal is {goal}. g[{src}] = 0, f[{src}] = h = {h}.",
  "n.astar.pick": "Lowest f is node {node} (g {g} + h {h} = {f}).",
  "n.astar.reached": "Reached the goal {goal}! Shortest cost = {cost}.",
  "n.astar.close": "Close {node} — its best cost is settled.",
  "n.astar.relax": "Edge {from}→{to} (w {w}): g {g} + {w} = {sum} vs {gv}.",
  "n.astar.better": "Better — g[{to}] = {g}, f[{to}] = {f}.",
  "n.astar.exhausted": "The open set is empty — goal {goal} is unreachable from {src}.",

  "n.graph.inf": "∞",
} as const;

export const tr: Partial<Record<keyof typeof en, string>> = {
  "n.bfs.markSource": "Kaynak {node} ziyaret edildi olarak işaretleniyor.",
  "n.bfs.enqueueSource": "{node} kuyruğa eklendi. Kuyruk: [{queue}].",
  "n.bfs.notEmpty": "Kuyruk boş değil — keşfe devam.",
  "n.bfs.dequeue": "{node} kuyruktan çıkarıldı — FIFO sırasında sıradaki o.",
  "n.bfs.visit": "{node} ziyaret edildi. Çıktı: {order}.",
  "n.bfs.neighbourSeen": "{from} düğümünün komşusu {to} — zaten ziyaret edilmiş, atlanıyor.",
  "n.bfs.neighbourNew": "{from} düğümünün komşusu {to} — henüz keşfedilmemiş.",
  "n.bfs.mark": "{node} ziyaret edildi olarak işaretleniyor.",
  "n.bfs.enqueue": "{node} kuyruğa eklendi. Kuyruk: [{queue}].",
  "n.bfs.done": "Kuyruk boşaldı — BFS tamamlandı. Sıra: {order}.",

  "n.dfs.enter": "dfs({node}) çağrıldı — {node} ziyaret edildi olarak işaretlendi.",
  "n.dfs.visit": "{node} ziyaret edildi. Çıktı: {order}.",
  "n.dfs.neighbourSeen": "{from} düğümünün komşusu {to} — zaten ziyaret edilmiş, atlanıyor.",
  "n.dfs.neighbourNew": "{from} düğümünün komşusu {to} — içine dalınıyor.",
  "n.dfs.recurse": "Özyineleme: dfs({node}).",
  "n.dfs.back": "dfs({node}) içine dönüldü; komşularına devam.",
  "n.dfs.return": "dfs({node}) dönüyor — geri izleme.",
  "n.dfs.done": "DFS tamamlandı. Sıra: {order}.",

  "n.dijkstra.init": "Tüm mesafeler ∞ olarak başlatılıyor.",
  "n.dijkstra.source": "Kaynak {node} düğümüne mesafe 0.",
  "n.dijkstra.pick": "Ziyaret edilmemiş en yakın düğüm {node} (mesafe {dist}).",
  "n.dijkstra.lock": "{node} kilitlendi — en kısa mesafesi kesinleşti.",
  "n.dijkstra.relax":
    "Kenar {from}→{to} (ağırlık {w}): {du} + {w} = {sum}, mevcut {dv}.",
  "n.dijkstra.update": "Daha kısa — dist[{to}] = {value} güncellendi.",
  "n.dijkstra.done": "Tamamlandı. {src} kaynağından mesafeler → {summary}.",

  "n.bellman.init": "Tüm mesafeler ∞ olarak başlatılıyor.",
  "n.bellman.source": "Kaynak {node} düğümüne mesafe 0.",
  "n.bellman.relax":
    "{pass}. tur: {from}→{to} gevşetiliyor (a {w}): {du} + {w} = {sum}, mevcut {dv}.",
  "n.bellman.update": "Daha kısa — dist[{to}] = {value} güncellendi.",
  "n.bellman.converged": "{pass}. turda hiçbir şey değişmedi — mesafeler yakınsadı.",
  "n.bellman.checkCycle":
    "V−1 tur bitti. Bir tur daha: hâlâ gevşeyen bir kenar varsa negatif döngü vardır.",
  "n.bellman.negativeCycle":
    "{from}→{to} kenarı hâlâ gevşiyor ({du} + {w} < {dv}) — {src} kaynağından erişilebilir bir negatif döngü var, dolayısıyla en kısa yol tanımsız.",
  "n.bellman.noCycle": "Hiçbir kenar daha fazla gevşemiyor — negatif döngü yok.",
  "n.bellman.done": "Tamamlandı. {src} kaynağından mesafeler → {summary}.",

  "n.topo.indegrees": "İç dereceler sayılıyor (her düğümün altındaki rozet).",
  "n.topo.seed": "Kuyruk iç derecesi 0 olan düğümlerle dolduruluyor: [{queue}].",
  "n.topo.dequeue": "{node} kuyruktan çıkarıldı.",
  "n.topo.emit": "{node} yayınlandı. Sıra: {order}.",
  "n.topo.removeReady":
    "{from}→{to} kenarı kaldırıldı; {to} düğümünün iç derecesi artık {indeg} — hazır.",
  "n.topo.remove": "{from}→{to} kenarı kaldırıldı; {to} düğümünün iç derecesi artık {indeg}.",
  "n.topo.done": "Tamamlandı. Topolojik sıra: {order}.",
  "n.topo.cycle":
    "{total} düğümün yalnızca {emitted} tanesi yayınlanabildi — kalan {left} düğüm bir döngü üzerinde, yani bu grafın topolojik sırası yok.",

  "n.prim.start": "{node} düğümünden başlanıyor: key[{node}] = 0, diğerleri ∞.",
  "n.prim.addStart": "Başlangıç düğümü {node} MST'ye ekleniyor.",
  "n.prim.add": "{node}, {from}–{to} kenarıyla ekleniyor (a {w}). MST ağırlığı {weight}.",
  "n.prim.consider": "Kenar {from}–{to} (a {w}), mevcut key[{to}] = {key} ile karşılaştırılıyor.",
  "n.prim.cheaper": "Daha ucuz — key[{to}] = {w}, ebeveyn = {from}.",
  "n.prim.done": "Tamamlandı. Minimum kapsayan ağacın ağırlığı {weight}.",

  "n.kruskal.makeSets": "Her düğüm kendi kümesine konuyor (rozet = küme kökü).",
  "n.kruskal.sorted": "Kenarlar ağırlığa göre sıralanıyor: {edges}.",
  "n.kruskal.consider": "Kenar {from}–{to} (a {w}): kökler {ra} ve {rb}.",
  "n.kruskal.keep": "Farklı kümeler — birleştirilip kenar tutuluyor. MST ağırlığı {weight}.",
  "n.kruskal.cycle": "Aynı küme — bu kenar döngü oluşturur, atlanıyor.",
  "n.kruskal.done": "Tamamlandı. Minimum kapsayan ağacın ağırlığı {weight}.",

  "n.astar.start": "Hedef {goal}. g[{src}] = 0, f[{src}] = h = {h}.",
  "n.astar.pick": "En küçük f değeri {node} düğümünde (g {g} + h {h} = {f}).",
  "n.astar.reached": "Hedef {goal}'e ulaşıldı! En kısa maliyet = {cost}.",
  "n.astar.close": "{node} kapatıldı — en iyi maliyeti kesinleşti.",
  "n.astar.relax": "Kenar {from}→{to} (a {w}): g {g} + {w} = {sum}, mevcut {gv}.",
  "n.astar.better": "Daha iyi — g[{to}] = {g}, f[{to}] = {f}.",
  "n.astar.exhausted": "Açık küme boşaldı — hedef {goal}, {src} kaynağından erişilemez.",

  "n.graph.inf": "∞",
};
