#!/usr/bin/env node
/*
 * Suggests a grapheme (GPC) segmentation for words, so they can be added to
 * assets/data/words.js. Usage:
 *
 *   node tools/segment.js ship cake phone        prints suggestions
 *   node tools/segment.js --json < list.json     bulk mode, prints a JSON map
 *
 * This is a HELPER, not an authority: the output is reviewed by a person and
 * pasted into words.js, which is the source of truth. It uses the FULL
 * grapheme inventory (every phase) with longest-match-first, so "train"
 * becomes t-r-ai-n rather than t-r-a-i-n. English being English, several
 * spellings have more than one sound; those are resolved by the explicit
 * lists below and flagged in the output so a reviewer looks at them.
 */

const MULTI = [
  "igh", "ear", "air", "ure",
  "ai", "ee", "oa", "oo", "ar", "or", "ur", "ow", "oi", "er",
  "ay", "ou", "ie", "ea", "oy", "ir", "ue", "aw", "wh", "ph", "ew", "oe", "au", "ey",
  "ck", "ff", "ll", "ss", "zz", "qu", "ch", "sh", "th", "ng", "nk",
  "dd", "mm", "tt", "bb", "rr", "gg", "pp", "nn",
];
const VOWELS = "aeiou";

/* Spellings with two common sounds — which words take the less common one. */
const OW_SNOW = new Set(["snow", "blow", "yellow", "snowman", "show", "grow", "low", "slow", "window", "glow", "throw", "know", "own", "bowl", "flow", "row", "tow"]);
const EA_BREAD = new Set(["bread", "head", "ready", "dead", "deaf", "read", "thread", "spread", "meant", "sweat", "heavy"]);
const OO_BOOK = new Set(["book", "look", "took", "good", "foot", "hook", "wood", "wool", "cook", "hood", "shook", "brook", "stood"]);
const G_SOFT = new Set(["gem", "gel", "gentle", "giant", "ginger", "magic", "cage", "huge", "page", "stage", "large", "age", "rage", "wage", "hinge", "fringe"]);

function segmentOne(word, known) {
  const w = word.toLowerCase();
  const flags = [];
  let letters = w;
  let suffixS = false;

  // -s suffix: only when the stem is itself a known word (gets → get + s)
  if (letters.length > 3 && letters.endsWith("s") && !letters.endsWith("ss") && known.has(letters.slice(0, -1))) {
    suffixS = true;
    letters = letters.slice(0, -1);
  }

  // split digraph: vowel + consonant(s) + final e  →  V-e, e.g. cake, shine, these
  let split = null;
  const m = letters.match(/^(.*?)([aeiou])([^aeiou]{1,2})e$/);
  if (m && letters.length >= 3 && !["the", "she", "he", "me", "we", "be"].includes(letters)) {
    split = { vowel: m[2], stem: m[1] + m[2] + m[3] };
    letters = split.stem;
  }

  const out = [];
  let i = 0;
  while (i < letters.length) {
    let g = null;
    for (const cand of MULTI) if (letters.startsWith(cand, i)) { g = cand; break; }
    if (!g) g = letters[i];
    // "carrot" is c-a-rr-o-t, not c-ar-r-o-t: an r-controlled vowel must not
    // swallow the first letter of a double consonant.
    if (["ar", "or", "ur", "er", "ir"].includes(g) && letters[i + 2] === "r") g = letters[i];
    // disambiguate
    if (g === "ow" && OW_SNOW.has(w)) { g = "ow(snow)"; flags.push("ow"); }
    else if (g === "ow") flags.push("ow");
    if (g === "ea" && EA_BREAD.has(w)) { g = "ea(bread)"; flags.push("ea"); }
    else if (g === "ea") flags.push("ea");
    if (g === "oo" && OO_BOOK.has(w)) { g = "oo(book)"; flags.push("oo"); }
    else if (g === "oo") flags.push("oo");
    // soft c before e/i/y — including the final e that a split digraph removed (ice, race)
    const nextCh = letters[i + 1] || (split && i + 1 === letters.length ? "e" : "");
    if (g === "c" && /[eiy]/.test(nextCh)) { g = "c(soft)"; flags.push("c"); }
    if (g === "g" && G_SOFT.has(w)) { g = "g(soft)"; flags.push("g"); }
    if (g === "y" && i > 0) {
      g = letters.length <= 3 ? "y(igh)" : "y(ee)";
      flags.push("y");
    }
    if (split && g === split.vowel && i === split.stem.lastIndexOf(split.vowel)) {
      g = split.vowel + "-e";
    }
    out.push(g);
    i += g.replace(/\(.*\)$/, "").replace("-e", "").length;
  }
  if (suffixS) out.push("-s");
  return { gpcs: out, flags: [...new Set(flags)] };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args[0] === "--json") {
    const list = JSON.parse(require("fs").readFileSync(0, "utf8"));
    const known = new Set(list.map((w) => w.toLowerCase()));
    const map = {};
    const flagged = [];
    for (const w of list) {
      const r = segmentOne(w, known);
      map[w] = r.gpcs;
      if (r.flags.length) flagged.push(`${w.padEnd(10)} ${r.gpcs.join("-").padEnd(22)} [${r.flags.join(",")}]`);
    }
    process.stdout.write(JSON.stringify({ map, flagged }));
  } else {
    const known = new Set(args.map((w) => w.toLowerCase()));
    for (const w of args) {
      const r = segmentOne(w, known);
      console.log(`  ${w}: ${JSON.stringify(r.gpcs)},${r.flags.length ? "   // check: " + r.flags.join(", ") : ""}`);
    }
  }
}

module.exports = { segmentOne };
