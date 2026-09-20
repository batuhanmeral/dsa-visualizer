/** Step notes for the backtracking engines (`lib/simulations/backtracking.ts`). */
export const en = {
  // N-Queens
  "n.queens.start": "Start solving the {n}×{n} board from row 0.",
  "n.queens.trySafe": "Row {row}: try column {col} — safe.",
  "n.queens.tryAttacked": "Row {row}: try column {col} — attacked, skip.",
  "n.queens.place": "Place a queen at (row {row}, col {col}).",
  "n.queens.backtrack":
    "Dead end below — remove the queen from row {row} and try the next column.",
  "n.queens.solved": "All {n} queens placed — solution found!",
  "n.queens.impossible":
    "Every column in row 0 has been tried and failed — no solution exists for a {n}×{n} board.",

  // Sudoku
  "n.sudoku.scan": "Empty cell at ({r}, {c}) — try to fill it.",
  "n.sudoku.tryValid": "Try {d} at ({r}, {c}) — valid.",
  "n.sudoku.tryInvalid": "Try {d} at ({r}, {c}) — breaks a rule, reject.",
  "n.sudoku.place": "Place {d} at ({r}, {c}).",
  "n.sudoku.backtrack": "Backtrack — clear ({r}, {c}) and try a larger digit.",
  "n.sudoku.stuck": "No digit fits ({r}, {c}) — back up.",
  "n.sudoku.solved": "Every cell filled — Sudoku solved!",
  "n.sudoku.impossible":
    "Every digit has been tried and none fits — this grid has no solution.",

  // Rat in a maze
  "n.maze.exit": "Reached the exit ({r}, {c})!",
  "n.maze.wall": "({r}, {c}) is a wall — dead end.",
  "n.maze.onPath": "({r}, {c}) is already on the path — dead end.",
  "n.maze.step": "Step onto ({r}, {c}).",
  "n.maze.try": "From ({r}, {c}) try moving {dir}.",
  "n.maze.backtrack": "All moves failed — backtrack off ({r}, {c}).",
  "n.maze.noRoute":
    "Every reachable cell has been tried — there is no route from the entrance to the exit.",
  "n.maze.blockedExit":
    "The exit ({r}, {c}) is a wall, so the maze cannot be solved at all.",
  "n.maze.dir.down": "down",
  "n.maze.dir.right": "right",
  "n.maze.dir.up": "up",
  "n.maze.dir.left": "left",

  // Subsets / permutations
  "n.subsets.record": "Record subset {{set}}.",
  "n.subsets.include": "Include {value}.",
  "n.subsets.exclude": "Backtrack — exclude {value}.",
  "n.perms.record": "Record permutation [{perm}].",
  "n.perms.fix": "Fix position {k} = {value}.",
  "n.perms.undo": "Undo — restore for the next choice at position {k}.",
} as const;

export const tr: Partial<Record<keyof typeof en, string>> = {
  "n.queens.start": "{n}×{n} tahtada 0. satırdan çözmeye başlanıyor.",
  "n.queens.trySafe": "Satır {row}: {col}. kolon deneniyor — güvenli.",
  "n.queens.tryAttacked": "Satır {row}: {col}. kolon deneniyor — tehdit altında, atlanıyor.",
  "n.queens.place": "(satır {row}, kolon {col}) konumuna vezir yerleştiriliyor.",
  "n.queens.backtrack":
    "Aşağıda çıkmaz sokak — {row}. satırdaki vezir kaldırılıp sonraki kolon deneniyor.",
  "n.queens.solved": "{n} vezirin tamamı yerleşti — çözüm bulundu!",
  "n.queens.impossible":
    "0. satırdaki her kolon denendi ve başarısız oldu — {n}×{n} tahta için çözüm yok.",

  "n.sudoku.scan": "({r}, {c}) konumunda boş göz — doldurulmaya çalışılıyor.",
  "n.sudoku.tryValid": "({r}, {c}) konumuna {d} deneniyor — geçerli.",
  "n.sudoku.tryInvalid": "({r}, {c}) konumuna {d} deneniyor — kural ihlali, reddediliyor.",
  "n.sudoku.place": "({r}, {c}) konumuna {d} yerleştiriliyor.",
  "n.sudoku.backtrack": "Geri izleme — ({r}, {c}) temizlenip daha büyük bir rakam deneniyor.",
  "n.sudoku.stuck": "({r}, {c}) konumuna hiçbir rakam uymuyor — geri dönülüyor.",
  "n.sudoku.solved": "Her göz doldu — Sudoku çözüldü!",
  "n.sudoku.impossible":
    "Her rakam denendi ve hiçbiri uymadı — bu ızgaranın çözümü yok.",

  "n.maze.exit": "({r}, {c}) çıkışına ulaşıldı!",
  "n.maze.wall": "({r}, {c}) bir duvar — çıkmaz sokak.",
  "n.maze.onPath": "({r}, {c}) zaten yolun üzerinde — çıkmaz sokak.",
  "n.maze.step": "({r}, {c}) konumuna adım atılıyor.",
  "n.maze.try": "({r}, {c}) konumundan {dir} yönüne gitmeyi deniyoruz.",
  "n.maze.backtrack": "Tüm hamleler başarısız — ({r}, {c}) konumundan geri dönülüyor.",
  "n.maze.noRoute":
    "Erişilebilir her göz denendi — girişten çıkışa giden bir yol yok.",
  "n.maze.blockedExit":
    "Çıkış ({r}, {c}) bir duvar, dolayısıyla labirent hiç çözülemez.",
  "n.maze.dir.down": "aşağı",
  "n.maze.dir.right": "sağa",
  "n.maze.dir.up": "yukarı",
  "n.maze.dir.left": "sola",

  "n.subsets.record": "{{set}} alt kümesi kaydedildi.",
  "n.subsets.include": "{value} dahil ediliyor.",
  "n.subsets.exclude": "Geri izleme — {value} dışlanıyor.",
  "n.perms.record": "[{perm}] permütasyonu kaydedildi.",
  "n.perms.fix": "{k}. konum sabitleniyor = {value}.",
  "n.perms.undo": "Geri al — {k}. konumdaki sonraki seçim için eski hale döndürülüyor.",
};
