/** Step notes for the number-theory engines (`lib/simulations/math.ts`). */
export const en = {
  // Sieve of Eratosthenes
  "n.sieve.assume": "Assume every number from 2 to {n} is prime.",
  "n.sieve.zeroOne": "0 and 1 are not prime — cross them out.",
  "n.sieve.already": "{p} is already crossed out — its multiples are handled.",
  "n.sieve.prime":
    "{p} survived — it is prime. Cross out its multiples starting at {p}² = {sq}.",
  "n.sieve.cross": "Cross out {m} (a multiple of {p}).",
  "n.sieve.survivors": "Every survivor is prime — nothing left could cross it out.",
  "n.sieve.done": "Done. {count} primes up to {n}: {primes}.",
  "n.sieve.none": "Done. There are no primes up to {n}.",

  // Euclidean GCD
  "n.gcd.start": "Find gcd({a}, {b}).",
  "n.gcd.loop": "b = {b} ≠ 0 — keep dividing.",
  "n.gcd.divide": "{a} = {q}·{b} + {r} — the remainder is {r}.",
  "n.gcd.shift": "Shift the pair: gcd({a}, {b}). The gcd never changes.",
  "n.gcd.stop": "b = 0 — the chain stops.",
  "n.gcd.done":
    "Done. gcd = {g}: the last non-zero remainder divides everything above.",

  // Extended Euclidean
  "n.ext.seed":
    "Seed two rows: {a} = 1·a + 0·b and {b} = 0·a + 1·b — every row keeps r = s·a + t·b.",
  "n.ext.quotient": "q = ⌊{oldR} / {r}⌋ = {q}.",
  "n.ext.row":
    "New row: r = {r}, s = {s}, t = {t} — check: {s}·{a} + {t}·{b} = {check}.",
  "n.ext.done":
    "Done. gcd({a}, {b}) = {g} = {x}·{a} + {y}·{b} — the Bézout identity.",

  // Fast modular exponentiation
  "n.pow.start": "Compute {base}^{exp} mod {mod}. Start with result = 1.",
  "n.pow.reduce": "Reduce the base: {base} mod {mod} = {reduced}.",
  "n.pow.bit": "exp = {exp} ({bits}₂) — its low bit is {bit}.",
  "n.pow.multiply":
    "Bit is 1 — multiply it in: result = {prev} × {base} mod {mod} = {result}.",
  "n.pow.square": "Square the base for the next bit: {prev}² mod {mod} = {base}.",
  "n.pow.shift": "Shift the exponent right: exp = {exp}.",
  "n.pow.done": "Done. {base}^{exp} mod {mod} = {result}.",
} as const;

export const tr: Partial<Record<keyof typeof en, string>> = {
  "n.sieve.assume": "2'den {n}'e kadar her sayı asal varsayılıyor.",
  "n.sieve.zeroOne": "0 ve 1 asal değil — üzerleri çiziliyor.",
  "n.sieve.already": "{p} zaten çizilmiş — katları ele alınmış durumda.",
  "n.sieve.prime":
    "{p} ayakta kaldı — asal. Katları {p}² = {sq} değerinden itibaren çiziliyor.",
  "n.sieve.cross": "{m} çiziliyor ({p} sayısının katı).",
  "n.sieve.survivors": "Ayakta kalan her sayı asaldır — onu çizecek hiçbir şey kalmadı.",
  "n.sieve.done": "Tamamlandı. {n}'e kadar {count} asal: {primes}.",
  "n.sieve.none": "Tamamlandı. {n}'e kadar hiç asal yok.",

  "n.gcd.start": "gcd({a}, {b}) bulunuyor.",
  "n.gcd.loop": "b = {b} ≠ 0 — bölmeye devam.",
  "n.gcd.divide": "{a} = {q}·{b} + {r} — kalan {r}.",
  "n.gcd.shift": "Çift kaydırılıyor: gcd({a}, {b}). OBEB hiç değişmez.",
  "n.gcd.stop": "b = 0 — zincir duruyor.",
  "n.gcd.done":
    "Tamamlandı. gcd = {g}: sıfırdan farklı son kalan, üstündeki her şeyi böler.",

  "n.ext.seed":
    "İki satır tohumlanıyor: {a} = 1·a + 0·b ve {b} = 0·a + 1·b — her satır r = s·a + t·b değişmezini korur.",
  "n.ext.quotient": "q = ⌊{oldR} / {r}⌋ = {q}.",
  "n.ext.row":
    "Yeni satır: r = {r}, s = {s}, t = {t} — kontrol: {s}·{a} + {t}·{b} = {check}.",
  "n.ext.done":
    "Tamamlandı. gcd({a}, {b}) = {g} = {x}·{a} + {y}·{b} — Bézout kimliği.",

  "n.pow.start": "{base}^{exp} mod {mod} hesaplanıyor. result = 1 ile başlanıyor.",
  "n.pow.reduce": "Taban indirgeniyor: {base} mod {mod} = {reduced}.",
  "n.pow.bit": "exp = {exp} ({bits}₂) — en düşük biti {bit}.",
  "n.pow.multiply":
    "Bit 1 — çarpıma katılıyor: result = {prev} × {base} mod {mod} = {result}.",
  "n.pow.square": "Sonraki bit için taban kareleniyor: {prev}² mod {mod} = {base}.",
  "n.pow.shift": "Üs sağa kaydırılıyor: exp = {exp}.",
  "n.pow.done": "Tamamlandı. {base}^{exp} mod {mod} = {result}.",
};
