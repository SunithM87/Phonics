/*
 * Guards the invariant that broke 3 in a Row: the reader portal and the
 * child's screen each build their own view from the shared state, so ANY
 * content derived from that state must be a pure function of it.
 *
 * The original bug: gameWords() shuffled with Math.random(), so the two
 * screens dealt different boards from the same state — and the board even
 * reshuffled mid-game whenever anything unrelated triggered a re-render.
 *
 * Run: node tools/check-determinism.js
 */

const fs = require("fs");
const path = require("path");

const src = ["phonics.js", "stories.js"]
  .map((f) => fs.readFileSync(path.join(__dirname, "..", "assets", "data", f), "utf8"))
  .join("\n");
const scope = new Function(src + "\nreturn {LEVELS, gameWords, seededShuffle, storiesForBand, BANDS, WORD_SORTS, WORD_WHEELS, soundsUpTo, trickyUpTo};")();

let fails = 0;
const check = (name, ok, detail) => {
  if (!ok) { fails++; console.log(`FAIL  ${name}${detail ? "\n      " + detail : ""}`); }
  else console.log(`ok    ${name}`);
};

/* 1. Repeated calls with the same arguments must agree. Run it enough times
 *    that a stray Math.random() cannot pass by luck. */
for (const level of [1, 2, 3, 4, 5, 6]) {
  for (const seed of [0, 1, 7, 42]) {
    const first = scope.gameWords(level, 9, seed).join(",");
    let stable = true;
    for (let i = 0; i < 50; i++) {
      if (scope.gameWords(level, 9, seed).join(",") !== first) { stable = false; break; }
    }
    check(`gameWords stable — level ${level}, seed ${seed}`, stable, stable ? "" : `drifted from: ${first}`);
  }
}

/* 2. Different seeds should actually give different boards, or "New board"
 *    would appear to do nothing. */
const boards = new Set([0, 1, 2, 3, 4].map((s) => scope.gameWords(2, 9, s).join(",")));
check("different seeds give different boards", boards.size >= 4, `${boards.size}/5 distinct`);

/* 3. A board must not repeat a word — two identical squares is a bad game. */
let dupes = [];
for (const level of [1, 2, 3, 4, 5, 6]) {
  for (let seed = 0; seed < 20; seed++) {
    const w = scope.gameWords(level, 9, seed);
    if (new Set(w).size !== w.length) dupes.push(`L${level} seed ${seed}: ${w.join(",")}`);
  }
}
check("no repeated word within a board", dupes.length === 0, dupes[0]);

/* 4. Every level must be able to fill a 9-square board and an 8-word
 *    Mystery Word list. */
let short = [];
for (const level of [1, 2, 3, 4, 5, 6]) {
  if (scope.gameWords(level, 9, 0).length < 9) short.push(`L${level} board`);
  if (scope.gameWords(level, 8, 5000, 3).length < 8) short.push(`L${level} mystery`);
}
check("every level fills its boards", short.length === 0, short.join(", "));

/* 5. seededShuffle must be a permutation, not a lossy sort. */
const sample = ["a", "b", "c", "d", "e", "f", "g"];
let perm = true;
for (let s = 0; s < 30; s++) {
  const out = scope.seededShuffle(sample, s);
  if (out.length !== sample.length || new Set(out).size !== sample.length) { perm = false; break; }
}
check("seededShuffle is a true permutation", perm);

/* 6. The data the other activities read is static, so just assert it is
 *    present for every level rather than re-deriving it. */
let missing = [];
for (const level of [1, 2, 3, 4, 5, 6]) {
  if (!(scope.WORD_SORTS[level] || []).length) missing.push(`WORD_SORTS[${level}]`);
  if (!(scope.WORD_WHEELS[level] || []).length) missing.push(`WORD_WHEELS[${level}]`);
  if (!scope.soundsUpTo(level).length) missing.push(`sounds up to ${level}`);
  if (!scope.trickyUpTo(level).length) missing.push(`tricky up to ${level}`);
}
for (const b of scope.BANDS) {
  if (!scope.storiesForBand(b.id).length) missing.push(`stories for ${b.id}`);
}
check("every level and band has content", missing.length === 0, missing.join(", "));

console.log(fails ? `\n${fails} problem(s).` : "\nAll deterministic.");
process.exit(fails ? 1 : 0);
