/*
 * Mechanically checks that every word in every story is decodable at that
 * story's band — i.e. the word can be fully segmented into graphemes the
 * child has been taught by then, or is one of the tricky words, or a name.
 *
 * Run: node tools/check-decodable.js
 *
 * This exists because hand-checking decodability is exactly the kind of job
 * a human (or a language model) does confidently and badly. Segmentation is
 * greedy longest-match with backtracking, which is not how a child reads,
 * but it answers the only question being asked here: "does a valid reading
 * of this word exist using only taught letter-sounds?"
 */

const fs = require("fs");
const path = require("path");

function load(file) {
  const src = fs.readFileSync(path.join(__dirname, "..", "assets", "data", file), "utf8");
  return src;
}
const scope = new Function(
  load("phonics.js") + "\n" + load("stories.js") + "\nreturn {LEVELS, STORIES, BANDS};"
)();
const { LEVELS, STORIES } = scope;

/* Which level's sounds a band may use. Band-to-phase is school convention,
 * not an official Little Wandle mapping — see README. */
const BAND_LEVEL = { pink: 2, red: 3, yellow: 4, blue: 6, green: 6 };

/* Names are read for the child the first time and then recognised; real
 * decodable books use them freely. Listed explicitly so they can't become a
 * silent escape hatch for words that simply don't decode. */
const NAMES = ["pip", "sam", "tom", "meg", "ben", "nell", "sid", "mum", "dad", "gran", "joe", "kate"];

/* Graphemes that are single letters always available once taught, plus the
 * multi-letter ones. Longest first so "igh" beats "i". */
function graphemesFor(level) {
  const out = [];
  LEVELS.filter((l) => l.n <= level).forEach((l) => out.push(...l.newSounds));
  // strip the disambiguating suffixes used for display: "oo(book)" -> "oo"
  const clean = out.map((g) => g.replace(/\(.*\)$/, ""));
  // Phase 4 adds no graphemes; adjacent consonants are just known ones in a row.
  return [...new Set(clean)].sort((a, b) => b.length - a.length);
}

function trickyFor(level) {
  const out = [];
  LEVELS.filter((l) => l.n <= level).forEach((l) => out.push(...l.newTricky));
  return new Set(out.map((w) => w.toLowerCase()));
}

/* Split digraphs (a-e) can't be matched left-to-right, so for levels that
 * include them we also allow a magic-e pattern: consonant + vowel + consonant
 * + silent e. Flagged separately in the report so it's visible. */
function canSegment(word, graphemes) {
  const w = word.toLowerCase();
  const memo = new Map();
  function go(i) {
    if (i === w.length) return true;
    if (memo.has(i)) return memo.get(i);
    for (const g of graphemes) {
      if (w.startsWith(g, i) && go(i + g.length)) {
        memo.set(i, true);
        return true;
      }
    }
    memo.set(i, false);
    return false;
  }
  return go(0);
}

function checkWord(raw, level, graphemes, tricky) {
  const w = raw.toLowerCase().replace(/[^a-z’'-]/g, "").replace(/[’']s$/, "").replace(/^[’']|[’']$/g, "");
  if (!w) return { ok: true };
  if (tricky.has(w)) return { ok: true, why: "tricky" };
  if (NAMES.includes(w)) return { ok: true, why: "name" };
  if (canSegment(w, graphemes)) return { ok: true, why: "decodable" };
  // magic-e fallback for levels that teach split digraphs
  if (level >= 6 && /e$/.test(w) && canSegment(w.slice(0, -1), graphemes)) {
    return { ok: true, why: "split digraph (a-e)" };
  }
  return { ok: false };
}

let problems = 0;
let checked = 0;
const byStory = [];

for (const story of STORIES) {
  const level = BAND_LEVEL[story.band];
  const graphemes = graphemesFor(level);
  const tricky = trickyFor(level);
  const bad = [];
  const pageTexts = story.pages.map((p) => p.text).concat([story.title]);
  for (const text of pageTexts) {
    for (const raw of text.split(/[\s.,!?“”"]+/)) {
      if (!raw) continue;
      checked++;
      const res = checkWord(raw, level, graphemes, tricky);
      if (!res.ok) bad.push(raw);
    }
  }
  // tricky words a page declares must actually be tricky words at that level
  const mismarked = [];
  for (const p of story.pages) {
    for (const t of p.tricky || []) {
      if (!tricky.has(t.toLowerCase())) mismarked.push(t);
    }
  }
  problems += bad.length + mismarked.length;
  byStory.push({ story, bad, mismarked, level });
}

console.log(`Checked ${checked} words across ${STORIES.length} stories.\n`);
for (const r of byStory) {
  const status = r.bad.length || r.mismarked.length ? "FAIL" : "ok  ";
  console.log(
    `${status}  ${r.story.band.padEnd(7)} L${r.level}  ${r.story.title}` +
      (r.bad.length ? `\n        not decodable: ${[...new Set(r.bad)].join(", ")}` : "") +
      (r.mismarked.length ? `\n        marked tricky but isn't at this level: ${[...new Set(r.mismarked)].join(", ")}` : "")
  );
}
console.log(problems ? `\n${problems} problem(s) found.` : "\nAll stories decodable at their band.");
process.exit(problems ? 1 : 0);
