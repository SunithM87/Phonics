/*
 * Guards the invariant that once broke 3 in a Row: the reader portal and
 * the child's screen each build their own view from the shared state, so
 * ANY content derived from that state must be a pure function of it.
 *
 * Run: node tools/check-determinism.js
 */
const fs = require("fs");
const path = require("path");
const d = (f) => fs.readFileSync(path.join(__dirname, "..", "assets", "data", f), "utf8");
const S = new Function(d("words.js") + d("phonics.js") + d("stories.js") + "\nreturn {UNITS, MAX_LEVEL, gameWords, seededShuffle, sortsUpTo, wheelsUpTo, wordsUpTo, storiesForBand, BANDS};")();

let fails = 0;
const check = (name, ok, detail) => { if (!ok) { fails++; console.log(`FAIL  ${name}${detail ? "\n      " + detail : ""}`); } else console.log(`ok    ${name}`); };

/* 1. Same arguments, same board — hammered so a stray Math.random can't pass by luck. */
let unstable = [];
for (let level = 1; level <= S.MAX_LEVEL; level++) for (const seed of [0, 1, 7, 42]) {
  const first = S.gameWords(level, 9, seed).join(",");
  for (let i = 0; i < 40; i++) if (S.gameWords(level, 9, seed).join(",") !== first) { unstable.push(`L${level} s${seed}`); break; }
}
check("gameWords is a pure function of (level, count, seed)", unstable.length === 0, unstable.join(", "));

/* 2. Different seeds give different boards, or "New board" would seem dead. */
const boards = new Set([0, 1, 2, 3, 4].map((s) => S.gameWords(5, 9, s).join(",")));
check("different seeds give different boards", boards.size >= 4, `${boards.size}/5 distinct`);

/* 3. No repeated word within a board. */
let dupes = [];
for (let level = 2; level <= S.MAX_LEVEL; level++) for (let seed = 0; seed < 15; seed++) {
  const w = S.gameWords(level, 9, seed);
  if (new Set(w).size !== w.length) dupes.push(`L${level} s${seed}`);
}
check("no repeated word within a board", dupes.length === 0, dupes[0]);

/* 4. Games are gated honestly: Level 1 can't fill a board (and says so in the
 *    UI); every level from 2 can fill both 3 in a Row and Mystery Word. */
const l1 = S.gameWords(1, 9, 0).length;
check(`Level 1 has too few words for a board (${l1}) — UI shows a message instead`, l1 < 9);
let short = [];
for (let level = 2; level <= S.MAX_LEVEL; level++) {
  if (S.gameWords(level, 9, 0).length < 9) short.push(`L${level} board`);
  if (S.gameWords(level, 8, 5000, 3).length < 4) short.push(`L${level} mystery`);
  if (!S.sortsUpTo(level).length) short.push(`L${level} sort`);
  if (!S.wheelsUpTo(level).length) short.push(`L${level} wheel`);
}
check("every level from 2 can run every game", short.length === 0, short.join(", "));

/* 5. seededShuffle is a permutation. */
const sample = ["a", "b", "c", "d", "e", "f", "g"];
let perm = true;
for (let s = 0; s < 30; s++) { const o = S.seededShuffle(sample, s); if (o.length !== 7 || new Set(o).size !== 7) { perm = false; break; } }
check("seededShuffle is a true permutation", perm);

/* 6. Every band has books. */
const empty = S.BANDS.filter((b) => !S.storiesForBand(b.id).length).map((b) => b.id);
check("every band has at least one book", empty.length === 0, empty.join(", "));

console.log(fails ? `\n${fails} problem(s).` : "\nAll deterministic.");
process.exit(fails ? 1 : 0);
