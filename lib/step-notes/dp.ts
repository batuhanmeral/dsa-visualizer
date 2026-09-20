/** Step notes for the dynamic-programming engines (`lib/simulations/dp.ts`). */
export const en = {
  // LCS
  "n.lcs.base": "Row {i}, col {j}: an empty string has no subsequence.",
  "n.lcs.baseSet": "Base case → dp[{i}][{j}] = 0.",
  "n.lcs.compare": "Compare a[{i}]='{ca}' with b[{j}]='{cb}'.",
  "n.lcs.match":
    "Match! Extend the diagonal: dp[{i}][{j}] = dp[{pi}][{pj}] + 1 = {value}.",
  "n.lcs.noMatch": "No match — carry the best neighbour: max({up}, {left}) = {value}.",
  "n.lcs.done":
    "Done. The longest common subsequence of \"{a}\" and \"{b}\" has length {value}.",

  // 0/1 Knapsack
  "n.knap.base": "Base case (no items or no capacity) → dp[{i}][{c}] = 0.",
  "n.knap.tooHeavy":
    "Item {i} (w={w}) is heavier than capacity {c} — skip it: dp[{i}][{c}] = {value}.",
  "n.knap.choose":
    "Item {i}: skip={skip} vs take={take} ({prev}+{v}). Best = {value}.",
  "n.knap.done": "Done. Max value within capacity {W} is {value}.",

  // Edit distance
  "n.edit.baseRow": "Turning \"\" into the first {j} of \"{b}\" needs {j} inserts.",
  "n.edit.baseRowSet": "Base row → dp[0][{j}] = {j}.",
  "n.edit.baseCol": "Turning the first {i} of \"{a}\" into \"\" needs {i} deletes.",
  "n.edit.baseColSet": "Base column → dp[{i}][0] = {i}.",
  "n.edit.same": "a[{i}]='{ca}' == b[{j}]='{cb}' — no edit needed.",
  "n.edit.carry": "Carry the diagonal: dp[{i}][{j}] = dp[{pi}][{pj}] = {value}.",
  "n.edit.differ": "'{ca}' != '{cb}' — take 1 + the cheapest edit.",
  "n.edit.min": "1 + min(replace {rep}, delete {del}, insert {ins}) = {value}.",
  "n.edit.done": "Done. Edit distance between \"{a}\" and \"{b}\" is {value}.",

  // Coin change
  "n.coin.zero": "Amount 0 costs nothing.",
  "n.coin.zeroSet": "dp[{i}][0] = 0.",
  "n.coin.noCoins": "No coins available for amount {a}.",
  "n.coin.unreachable": "Unreachable → dp[0][{a}] = ∞.",
  "n.coin.tooBig": "Coin {coin} > amount {a} — can't use it.",
  "n.coin.inherit": "Inherit above: dp[{i}][{a}] = {value}.",
  "n.coin.ask": "Use coin {coin}? skip={skip} vs take={take}.",
  "n.coin.min": "dp[{i}][{a}] = min({skip}, {take}) = {value}.",
  "n.coin.impossible": "Done. Amount {amount} cannot be made from these coins.",
  "n.coin.done": "Done. Minimum coins for {amount} is {value}.",

  // Floyd-Warshall
  "n.floyd.start": "Start from the edge matrix: dist[i][j] = direct edge (∞ = none).",
  "n.floyd.round": "Round k = {k}: may any pair improve by stopping over at node {k}?",
  "n.floyd.noPath":
    "dist[{i}][{k}] + dist[{k}][{j}] = {ik} + {kj} — no path through {k}.",
  "n.floyd.via":
    "Via {k}: {ik} + {kj} = {sum} vs current dist[{i}][{j}] = {ij}.",
  "n.floyd.update": "Shorter — dist[{i}][{j}] = {sum} (through node {k}).",
  "n.floyd.done": "Done. dist[i][j] is now the shortest path between every pair.",

  // Fibonacci
  "n.fib.base0": "Base case: dp[0] = 0.",
  "n.fib.base1": "Base case: dp[1] = 1.",
  "n.fib.step": "dp[{i}] = dp[{a}] + dp[{b}] = {va} + {vb} = {sum}.",
  "n.fib.done": "Done. The {n}th Fibonacci number is {value}.",

  // Kadane
  "n.kadane.empty": "No values to scan — enter at least one number.",
  "n.kadane.start": "Start: best = cur = a[0] = {value}.",
  "n.kadane.ask": "Extend the run ({cur} + {value} = {sum}) or restart at {value}?",
  "n.kadane.extend": "Extend — the prefix helps: cur = {cur}.",
  "n.kadane.restart": "Restart — the prefix only drags the sum down: cur = {cur}.",
  "n.kadane.newBest": "New best subarray sum: {best}.",
  "n.kadane.done": "Done. Maximum subarray sum is {best}.",

  // LIS
  "n.lis.empty": "No values to scan — enter at least one number.",
  "n.lis.init": "dp[{i}] = 1 — value {value} on its own.",
  "n.lis.ask": "Can {value} extend the run ending at {prev}? ({prev} < {value}?)",
  "n.lis.extend": "Yes — dp[{i}] = dp[{j}] + 1 = {value}.",
  "n.lis.best": "Longest increasing subsequence so far: {best}.",
  "n.lis.done": "Done. The longest increasing subsequence has length {best}.",

} as const;

export const tr: Partial<Record<keyof typeof en, string>> = {
  "n.lcs.base": "Satır {i}, kolon {j}: boş dizginin alt dizisi yoktur.",
  "n.lcs.baseSet": "Taban durum → dp[{i}][{j}] = 0.",
  "n.lcs.compare": "a[{i}]='{ca}' ile b[{j}]='{cb}' karşılaştırılıyor.",
  "n.lcs.match":
    "Eşleşme! Köşegen uzatılıyor: dp[{i}][{j}] = dp[{pi}][{pj}] + 1 = {value}.",
  "n.lcs.noMatch": "Eşleşme yok — en iyi komşu taşınıyor: max({up}, {left}) = {value}.",
  "n.lcs.done":
    "Tamamlandı. \"{a}\" ve \"{b}\" dizgilerinin en uzun ortak alt dizisinin uzunluğu {value}.",

  "n.knap.base": "Taban durum (eşya yok veya kapasite yok) → dp[{i}][{c}] = 0.",
  "n.knap.tooHeavy":
    "Eşya {i} (a={w}), {c} kapasitesinden ağır — atlanıyor: dp[{i}][{c}] = {value}.",
  "n.knap.choose":
    "Eşya {i}: atla={skip}, al={take} ({prev}+{v}). En iyi = {value}.",
  "n.knap.done": "Tamamlandı. {W} kapasitesiyle en yüksek değer {value}.",

  "n.edit.baseRow": "\"\" dizgisini \"{b}\" dizgisinin ilk {j} karakterine çevirmek {j} ekleme gerektirir.",
  "n.edit.baseRowSet": "Taban satır → dp[0][{j}] = {j}.",
  "n.edit.baseCol": "\"{a}\" dizgisinin ilk {i} karakterini \"\" yapmak {i} silme gerektirir.",
  "n.edit.baseColSet": "Taban kolon → dp[{i}][0] = {i}.",
  "n.edit.same": "a[{i}]='{ca}' == b[{j}]='{cb}' — düzenleme gerekmiyor.",
  "n.edit.carry": "Köşegen taşınıyor: dp[{i}][{j}] = dp[{pi}][{pj}] = {value}.",
  "n.edit.differ": "'{ca}' != '{cb}' — 1 + en ucuz düzenleme alınıyor.",
  "n.edit.min": "1 + min(değiştir {rep}, sil {del}, ekle {ins}) = {value}.",
  "n.edit.done": "Tamamlandı. \"{a}\" ile \"{b}\" arasındaki düzenleme uzaklığı {value}.",

  "n.coin.zero": "0 tutarının maliyeti yok.",
  "n.coin.zeroSet": "dp[{i}][0] = 0.",
  "n.coin.noCoins": "{a} tutarı için kullanılabilir bozuk para yok.",
  "n.coin.unreachable": "Erişilemez → dp[0][{a}] = ∞.",
  "n.coin.tooBig": "Para {coin} > tutar {a} — kullanılamaz.",
  "n.coin.inherit": "Üstteki devralınıyor: dp[{i}][{a}] = {value}.",
  "n.coin.ask": "{coin} kullanılsın mı? atla={skip}, al={take}.",
  "n.coin.min": "dp[{i}][{a}] = min({skip}, {take}) = {value}.",
  "n.coin.impossible": "Tamamlandı. {amount} tutarı bu paralarla oluşturulamaz.",
  "n.coin.done": "Tamamlandı. {amount} için en az para sayısı {value}.",

  "n.floyd.start": "Kenar matrisinden başlanıyor: dist[i][j] = doğrudan kenar (∞ = yok).",
  "n.floyd.round": "Tur k = {k}: herhangi bir çift {k} düğümünde mola vererek iyileşir mi?",
  "n.floyd.noPath":
    "dist[{i}][{k}] + dist[{k}][{j}] = {ik} + {kj} — {k} üzerinden yol yok.",
  "n.floyd.via":
    "{k} üzerinden: {ik} + {kj} = {sum}, mevcut dist[{i}][{j}] = {ij}.",
  "n.floyd.update": "Daha kısa — dist[{i}][{j}] = {sum} ({k} düğümü üzerinden).",
  "n.floyd.done": "Tamamlandı. dist[i][j] artık her çift arasındaki en kısa yol.",

  "n.fib.base0": "Taban durum: dp[0] = 0.",
  "n.fib.base1": "Taban durum: dp[1] = 1.",
  "n.fib.step": "dp[{i}] = dp[{a}] + dp[{b}] = {va} + {vb} = {sum}.",
  "n.fib.done": "Tamamlandı. {n}. Fibonacci sayısı {value}.",

  "n.kadane.empty": "Taranacak değer yok — en az bir sayı girin.",
  "n.kadane.start": "Başlangıç: best = cur = a[0] = {value}.",
  "n.kadane.ask": "Diziyi uzat ({cur} + {value} = {sum}) mı, {value} ile baştan başla mı?",
  "n.kadane.extend": "Uzat — önek işe yarıyor: cur = {cur}.",
  "n.kadane.restart": "Baştan başla — önek toplamı yalnızca aşağı çekiyor: cur = {cur}.",
  "n.kadane.newBest": "Yeni en iyi alt dizi toplamı: {best}.",
  "n.kadane.done": "Tamamlandı. En büyük alt dizi toplamı {best}.",

  "n.lis.empty": "Taranacak değer yok — en az bir sayı girin.",
  "n.lis.init": "dp[{i}] = 1 — {value} tek başına.",
  "n.lis.ask": "{value}, {prev} ile biten diziyi uzatabilir mi? ({prev} < {value}?)",
  "n.lis.extend": "Evet — dp[{i}] = dp[{j}] + 1 = {value}.",
  "n.lis.best": "Şimdiye kadarki en uzun artan alt dizi: {best}.",
  "n.lis.done": "Tamamlandı. En uzun artan alt dizinin uzunluğu {best}.",

};
