/*
 * Validates ALL phonics content against what has been taught by the level
 * it appears at — sound-tile examples, Word Sort rounds, Word Wheels, game
 * pools, and every word in every story.
 *
 * Run: node tools/check-content.js
 *
 * This replaces the earlier check-decodable.js, which only checked stories
 * and — the real problem — only asked "can this spelling be split into
 * taught letter-strings?", so it accepted "cake" and "phone" at Phase 2 by
 * reading them letter-by-letter. That is not decodability. Here every word
 * must have an explicit, reviewed grapheme breakdown in words.js, and each
 * of THOSE graphemes must be taught by the level in question.
 */

const fs = require("fs");
const path = require("path");
const d = (f) => fs.readFileSync(path.join(__dirname, "..", "assets", "data", f), "utf8");
const S = new Function(
  d("words.js") + "\n" + d("phonics.js") + "\n" + d("stories.js") +
  "\nreturn {WORDS, UNITS, SOUND_WORDS, WORD_SORTS, WORD_WHEELS, STORIES, BANDS, STORY_NAMES, storyPrep, introLevel, introLevel, minLevel, minLevelFor, trickyUpTo, trickyIntroLevel, isTrickyAt, wheelWord, TRICKY_PARTS, MAX_LEVEL};"
)();

const NAMES = S.STORY_NAMES;

let problems = 0;
const fail = (where, msg) => { problems++; console.log(`FAIL  ${where}\n      ${msg}`); };
const ok = (msg) => console.log(`ok    ${msg}`);

/* A word is fine at `level` if it is a tricky word taught by then, a name,
 * or a bank word whose computed minimum level is <= level. Anything else —
 * including a word simply missing from the bank — is a failure. */
function checkWord(raw, level, where) {
  const w = raw.toLowerCase().replace(/[^a-z’'-]/g, "").replace(/[’']s$/, "").replace(/^[’']|[’']$/g, "");
  if (!w) return;
  const tl = S.trickyIntroLevel(w);
  if (tl) { if (tl > level) fail(where, `"${w}" is a tricky word but not taught until Level ${tl}`); return; }
  if (NAMES.has(w)) return;
  const g = S.WORDS[w];
  if (!g) return fail(where, `"${w}" has no breakdown in words.js`);
  const ml = S.minLevelFor(g);
  if (ml === null) return fail(where, `"${w}" (${g.join("-")}) uses a sound that is never taught`);
  if (ml > level) fail(where, `"${w}" (${g.join("-")}) needs Level ${ml}, shown at Level ${level}`);
}

/* 1. Every taught sound has example words, each readable when the sound arrives. */
let soundIssues = problems;
for (const u of S.UNITS) for (const g of u.sounds) {
  const ex = S.SOUND_WORDS[g];
  if (!ex || !ex.length) { fail(`sound ${g}`, "no example words"); continue; }
  ex.forEach((w) => {
    checkWord(w, u.n, `sound ${g} (Level ${u.n}) example`);
    if (S.WORDS[w] && !S.WORDS[w].includes(g)) fail(`sound ${g} example "${w}"`, `does not actually contain ${g} (${S.WORDS[w].join("-")})`);
  });
}
if (problems === soundIssues) ok("sound examples: every taught sound has readable examples containing it");

/* 2. Word Sort rounds. */
let sortIssues = problems;
S.WORD_SORTS.forEach((r, i) => {
  r.words.forEach(([w, bin]) => {
    checkWord(w, r.level, `sort #${i} (Level ${r.level})`);
    if (!r.bins.includes(bin)) fail(`sort #${i}`, `"${w}" is filed under "${bin}" which is not one of its bins`);
    const g = S.WORDS[w] || [];
    const binOk = bin.startsWith("-") ? true : g.includes(bin) || (bin.length > 1 && !S.introLevel(bin) && w.startsWith(bin));
    if (!binOk) fail(`sort #${i}`, `"${w}" (${g.join("-")}) does not contain its bin sound "${bin}"`);
  });
});
if (problems === sortIssues) ok(`word sorts: ${S.WORD_SORTS.length} rounds, every word readable and correctly binned`);

/* 3. Word Wheels — composed words must be real bank words with matching GPCs. */
let wheelIssues = problems;
S.WORD_WHEELS.forEach((wh, i) => {
  wh.onsets.forEach((_, k) => {
    const { word, gpcs } = S.wheelWord(wh, k);
    const bank = S.WORDS[word];
    if (!bank) return fail(`wheel #${i} -${wh.rime}`, `"${word}" not in words.js`);
    if (bank.join("|") !== gpcs.join("|")) fail(`wheel #${i} -${wh.rime}`, `"${word}" wheel says ${gpcs.join("-")} but bank says ${bank.join("-")}`);
    checkWord(word, wh.level, `wheel #${i} -${wh.rime} (Level ${wh.level})`);
  });
});
if (problems === wheelIssues) ok(`word wheels: ${S.WORD_WHEELS.length} wheels, every composed word readable`);

/* 4. Stories — each band maps to a level; every word must be readable there.
 *    Also report each story's true minimum level so the picker can show it. */
let storyIssues = problems;
const bandLevel = Object.fromEntries(S.BANDS.map((b) => [b.id, b.level]));
for (const st of S.STORIES) {
  const level = bandLevel[st.band];
  if (!level) { fail(`story "${st.title}"`, `band "${st.band}" has no level`); continue; }
  const texts = st.pages.map((p) => p.text).concat([st.title]);
  let need = 1;
  for (const t of texts) for (const raw of t.split(/[\s.,!?“”"]+/)) {
    if (!raw) continue;
    checkWord(raw, level, `story "${st.title}" (${st.band}, Level ${level})`);
    const w = raw.toLowerCase().replace(/[^a-z’'-]/g, "").replace(/[’']s$/, "").replace(/^[’']|[’']$/g, "");
    const ml = S.trickyIntroLevel(w) || (S.WORDS[w] ? S.minLevelFor(S.WORDS[w]) : null);
    if (ml) need = Math.max(need, ml);
  }
  for (const p of st.pages) for (const t of p.tricky || []) {
    if (!S.trickyIntroLevel(t)) fail(`story "${st.title}"`, `"${t}" marked tricky but is not a tricky word`);
    else if (S.trickyIntroLevel(t) > level) fail(`story "${st.title}"`, `tricky word "${t}" not taught until Level ${S.trickyIntroLevel(t)}`);
  }
  // every tricky word on a page should be marked, so it shows blue
  for (const p of st.pages) {
    const marked = new Set((p.tricky || []).map((x) => x.toLowerCase()));
    for (const raw of p.text.split(/[\s.,!?“”"]+/)) {
      const w = raw.toLowerCase().replace(/[^a-z’'-]/g, "").replace(/[’']s$/, "").replace(/^[’']|[’']$/g, "");
      // judged at the book's own level: that's the reader it's written for
      if (w && S.isTrickyAt(w, st.level) && !marked.has(w)) fail(`story "${st.title}"`, `page "${p.text}" uses tricky word "${w}" without marking it`);
      if (w && marked.has(w) && S.trickyIntroLevel(w) && !S.isTrickyAt(w, st.level)) fail(`story "${st.title}"`, `page "${p.text}" marks "${w}" tricky, but it is decodable by Level ${st.level} — unmark it`);
    }
  }
  if (need !== st.level) fail(`story "${st.title}"`, `declares level ${st.level} but its words need Level ${need} — set level: ${need}`);
}
if (problems === storyIssues) ok(`stories: ${S.STORIES.length} books, every word readable at its band, declared levels correct`);

/* 4b. The shape of each book, matching the school's reading books: a known
 *     type, focus sounds that are really in it and taught by its level, talk
 *     questions for the third read, and a real Get ready page. Then the
 *     library as a whole: a book written for every Activity Level, and
 *     fiction and non-fiction in every band. */
let shapeIssues = problems;
const KINDS = new Set(["story", "nonfiction", "tale"]);
const ids = new Set();
for (const st of S.STORIES) {
  const where = `story "${st.title}"`;
  if (ids.has(st.id)) fail(where, `duplicate id "${st.id}"`); ids.add(st.id);
  if (!KINDS.has(st.kind)) fail(where, `kind must be story, nonfiction or tale (got ${st.kind})`);
  if (!Array.isArray(st.talk) || st.talk.length < 2) fail(where, "needs at least two talk questions for Read 3");
  if (st.pages.length < 5) fail(where, `only ${st.pages.length} pages`);
  if (!st.cover || !st.blurb) fail(where, "needs a cover and a blurb");
  const used = new Set();
  for (const pg of st.pages) {
    if (!pg.scene) fail(where, `page "${pg.text}" has no picture`);
    for (const raw of pg.text.split(/[\s.,!?“”"…]+/)) { const g = S.WORDS[raw.toLowerCase().replace(/[^a-z’'-]/g, "").replace(/[’']s$/, "")]; if (g) g.forEach((x) => used.add(x)); }
  }
  // Only Phase 4 (adjacent consonants, no new sounds) may leave focus empty.
  if (!(st.focus || []).length && !(st.level >= 15 && st.level <= 16)) fail(where, "no focus sounds for the Get ready page");
  for (const f of st.focus || []) {
    if (!used.has(f)) fail(where, `focus sound "${f}" isn't used by any word in the book`);
    else if ((f === "-s" ? 10 : S.introLevel(f) || 99) > st.level) fail(where, `focus sound "${f}" isn't taught until Level ${S.introLevel(f)}`);
  }
  const prep = S.storyPrep(st);
  if (!prep.practise.length) fail(where, "Get ready page has no words to practise (no word uses a focus sound)");
}
for (let n = 1; n <= S.MAX_LEVEL; n++) {
  if (!S.STORIES.some((st) => st.level === n)) fail(`Level ${n}`, "no book is written for this level");
}
for (const b of S.BANDS) {
  const inBand = S.STORIES.filter((st) => st.band === b.id);
  if (!inBand.some((st) => st.kind === "nonfiction")) fail(`band ${b.label}`, "has no non-fiction");
  if (!inBand.some((st) => st.kind !== "nonfiction")) fail(`band ${b.label}`, "has no stories");
}
const nf = S.STORIES.filter((st) => st.kind === "nonfiction").length;
if (problems === shapeIssues) ok(`book shape: ${S.STORIES.length} books (${S.STORIES.length - nf} fiction, ${nf} non-fiction), every level 1–${S.MAX_LEVEL} has a book, every band has both kinds`);

/* 5. Tricky-part annotations cover every tricky word and spell it. */
let tpIssues = problems;
for (const u of S.UNITS) for (const t of u.tricky) {
  const tp = S.TRICKY_PARTS[t];
  if (!tp) { fail(`tricky "${t}"`, "no tricky-part annotation"); continue; }
  const spelled = tp.parts.map((p) => p[0]).join("");
  if (spelled.toLowerCase() !== t.toLowerCase()) fail(`tricky "${t}"`, `parts spell "${spelled}"`);
  if (!tp.parts.some((p) => p[1])) fail(`tricky "${t}"`, "no part is marked as the tricky bit");
}
if (problems === tpIssues) ok("tricky words: every one annotated with its tricky part");

/* 6. Every bank word is readable at some level (no dead entries). */
let dead = Object.entries(S.WORDS).filter(([, g]) => S.minLevelFor(g) === null);
if (dead.length) dead.forEach(([w, g]) => fail(`bank "${w}"`, `${g.join("-")} contains an untaught sound`));
else ok(`word bank: ${Object.keys(S.WORDS).length} words, all readable by Level ${S.MAX_LEVEL}`);

console.log(problems ? `\n${problems} problem(s).` : "\nAll content valid.");
process.exit(problems ? 1 : 0);
