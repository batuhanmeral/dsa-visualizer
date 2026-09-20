/** Step notes for the string-matching engines (`lib/simulations/strings.ts`). */
export const en = {
  "n.str.tooLong":
    "The pattern ({m} characters) is longer than the text ({n}) — it cannot occur.",
  "n.str.noPattern": "Enter a pattern to search for.",
  "n.str.noText": "Enter some text to search in.",

  // KMP
  "n.kmp.lps0": "lps[0] = 0 — a single character has no proper prefix.",
  "n.kmp.compare": "Compare p[{i}]='{pi}' with p[{len}]='{pl}'.",
  "n.kmp.extend": "Match — extend prefix, lps[{i}] = {len}.",
  "n.kmp.fallback": "Mismatch — fall back to len = lps[{from}] = {len}.",
  "n.kmp.zero": "Mismatch with len 0 — lps[{i}] = 0.",
  "n.kmp.scan": "Compare t[{i}]='{ti}' with p[{j}]='{pj}'.",
  "n.kmp.hit": "Full match found at index {start}.",
  "n.kmp.continue": "Continue — shift j to lps[m-1] = {j}.",
  "n.kmp.advance": "Match — advance both pointers.",
  "n.kmp.reuse": "Mismatch — reuse table, j = lps[j-1] = {j}.",
  "n.kmp.advanceI": "Mismatch with j = 0 — advance i.",

  // Rabin-Karp
  "n.rk.precompute": "Precompute pattern hash and hash of the first window.",
  "n.rk.equal": "Window at {i}: compare hashes {th} vs {ph} — equal.",
  "n.rk.differ": "Window at {i}: compare hashes {th} vs {ph} — differ.",
  "n.rk.verify": "Hash hit — verifying characters ({k}/{m}).",
  "n.rk.confirmed": "Confirmed match at index {i}.",
  "n.rk.spurious": "Spurious hit — characters differ at offset {k}.",
  "n.rk.roll": "Roll the hash forward: drop '{out}', add '{in}'.",

  // Shared scan outcome
  "n.str.located": "Scan complete — pattern located.",
  "n.str.absent": "Scan complete — pattern not present.",
  "n.bm.done": "Done — {count} match(es) found.",
  "n.str.countOne": "Done — 1 match found (at index {indices}).",
  "n.str.countMany": "Done — {count} matches found (at indices {indices}).",
  "n.str.countNone": "Done — no match found.",

  // Z-algorithm
  "n.z.first": "z[0] = n by definition.",
  "n.z.seed": "Inside [l,r): seed z[{i}] = min({a}, z[{b}]) = {value}.",
  "n.z.extend": "Extend match: s[{a}]='{ca}' == s[{b}].",
  "n.z.value": "z[{i}] = {value}.",
  "n.z.window": "New rightmost window [{l}, {r}).",
  "n.z.done": "Z-array complete.",

  // Manacher
  "n.man.start": "Center c and right edge r start at 0.",
  "n.man.mirror": "Inside window: mirror p[{i}] from p[{mirror}] → {value}.",
  "n.man.expand": "Expand: '{a}' == '{b}'.",
  "n.man.value": "p[{i}] = {value}.",
  "n.man.center": "New center c={c}, right edge r={r}.",
  "n.man.done": "Longest palindrome: \"{pal}\" (length {len}).",
  "n.man.empty": "Enter some text to find a palindrome in.",

  // Boyer-Moore
  "n.bm.lastNew": "last['{ch}'] = {i} — rightmost occurrence so far.",
  "n.bm.lastOver": "last['{ch}'] = {i} — overwrites {prev}.",
  "n.bm.align": "Align pattern at s = {s}; compare right to left.",
  "n.bm.match": "p[{j}]='{pj}' == t[{ti}]='{tv}'.",
  "n.bm.mismatch": "Mismatch: p[{j}]='{pj}' != t[{ti}]='{bad}'.",
  "n.bm.full": "Full match at index {s}.",
  "n.bm.jumpPast": "'{bad}' is not in the pattern — jump past it (shift {shift}).",
  "n.bm.alignUnder":
    "last['{bad}'] = {lo} — align it under the mismatch (shift {shift}).",
} as const;

export const tr: Partial<Record<keyof typeof en, string>> = {
  "n.str.tooLong":
    "Desen ({m} karakter) metinden ({n}) uzun — hiç geçemez.",
  "n.str.noPattern": "Aranacak bir desen girin.",
  "n.str.noText": "İçinde arama yapılacak bir metin girin.",

  "n.kmp.lps0": "lps[0] = 0 — tek karakterin öz öneki yoktur.",
  "n.kmp.compare": "p[{i}]='{pi}' ile p[{len}]='{pl}' karşılaştırılıyor.",
  "n.kmp.extend": "Eşleşme — önek uzatılıyor, lps[{i}] = {len}.",
  "n.kmp.fallback": "Uyuşmazlık — len = lps[{from}] = {len} değerine dönülüyor.",
  "n.kmp.zero": "len 0 ile uyuşmazlık — lps[{i}] = 0.",
  "n.kmp.scan": "t[{i}]='{ti}' ile p[{j}]='{pj}' karşılaştırılıyor.",
  "n.kmp.hit": "{start}. indekste tam eşleşme bulundu.",
  "n.kmp.continue": "Devam — j, lps[m-1] = {j} yapılıyor.",
  "n.kmp.advance": "Eşleşme — iki gösterge de ilerliyor.",
  "n.kmp.reuse": "Uyuşmazlık — tablo yeniden kullanılıyor, j = lps[j-1] = {j}.",
  "n.kmp.advanceI": "j = 0 ile uyuşmazlık — i ilerletiliyor.",

  "n.rk.precompute": "Desen özeti ve ilk pencerenin özeti ön hesaplanıyor.",
  "n.rk.equal": "{i}. penceredeki özetler karşılaştırılıyor: {th} ve {ph} — eşit.",
  "n.rk.differ": "{i}. penceredeki özetler karşılaştırılıyor: {th} ve {ph} — farklı.",
  "n.rk.verify": "Özet tuttu — karakterler doğrulanıyor ({k}/{m}).",
  "n.rk.confirmed": "{i}. indekste eşleşme doğrulandı.",
  "n.rk.spurious": "Yanlış alarm — karakterler {k}. konumda farklı.",
  "n.rk.roll": "Özet ileri yuvarlanıyor: '{out}' çıkıyor, '{in}' giriyor.",

  "n.str.located": "Tarama tamamlandı — desen bulundu.",
  "n.str.absent": "Tarama tamamlandı — desen mevcut değil.",
  "n.bm.done": "Tamamlandı — {count} eşleşme bulundu.",
  "n.str.countOne": "Tamamlandı — 1 eşleşme bulundu ({indices}. indekste).",
  "n.str.countMany": "Tamamlandı — {count} eşleşme bulundu ({indices} indekslerinde).",
  "n.str.countNone": "Tamamlandı — eşleşme bulunamadı.",

  "n.z.first": "Tanım gereği z[0] = n.",
  "n.z.seed": "[l,r) içinde: z[{i}] = min({a}, z[{b}]) = {value} tohumlanıyor.",
  "n.z.extend": "Eşleşme uzatılıyor: s[{a}]='{ca}' == s[{b}].",
  "n.z.value": "z[{i}] = {value}.",
  "n.z.window": "Yeni en sağdaki pencere [{l}, {r}).",
  "n.z.done": "Z dizisi tamamlandı.",

  "n.man.start": "Merkez c ve sağ kenar r 0'dan başlıyor.",
  "n.man.mirror": "Pencere içinde: p[{i}], p[{mirror}] aynasından → {value}.",
  "n.man.expand": "Genişletme: '{a}' == '{b}'.",
  "n.man.value": "p[{i}] = {value}.",
  "n.man.center": "Yeni merkez c={c}, sağ kenar r={r}.",
  "n.man.done": "En uzun palindrom: \"{pal}\" (uzunluk {len}).",
  "n.man.empty": "Palindrom aranacak bir metin girin.",

  "n.bm.lastNew": "last['{ch}'] = {i} — şimdiye kadarki en sağdaki geçiş.",
  "n.bm.lastOver": "last['{ch}'] = {i} — {prev} değerinin üzerine yazıyor.",
  "n.bm.align": "Desen s = {s} konumuna hizalanıyor; sağdan sola karşılaştırılıyor.",
  "n.bm.match": "p[{j}]='{pj}' == t[{ti}]='{tv}'.",
  "n.bm.mismatch": "Uyuşmazlık: p[{j}]='{pj}' != t[{ti}]='{bad}'.",
  "n.bm.full": "{s}. indekste tam eşleşme.",
  "n.bm.jumpPast": "'{bad}' desende yok — üzerinden atlanıyor (kaydırma {shift}).",
  "n.bm.alignUnder":
    "last['{bad}'] = {lo} — uyuşmazlığın altına hizalanıyor (kaydırma {shift}).",
};
