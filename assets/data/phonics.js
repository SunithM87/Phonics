/*
 * Phonics content, organised the way the Chapter One volunteer platform
 * organises it: a numeric ACTIVITY LEVEL that drives flashcards and games,
 * and a separate colour-banded STORY LEVEL that drives the story library
 * (see stories.js). They move independently — a child often reads books a
 * notch below the sounds they're drilling.
 *
 * The sound progression follows Little Wandle Letters and Sounds Revised
 * (Phases 2-5). Levels are cumulative: level 2 knows everything level 1
 * knows. Every word listed at a level is decodable using only the sounds
 * introduced at or before that level, plus that level's tricky words —
 * hand-checked, and there's a validator in tools/check-decodable.js that
 * re-checks it mechanically.
 *
 * Not affiliated with Little Wandle / Wandle Learning Trust or Chapter One.
 * Your son's school's own progression always wins over this file.
 */

const LEVELS = [
  {
    n: 1,
    name: "Level 1",
    phase: "Phase 2",
    term: "Reception · Autumn 1",
    blurb: "The first twenty sounds, and blending them into words like c-a-t.",
    weeks: [
      { label: "Week 1", sounds: ["s", "a", "t", "p"], tricky: [] },
      { label: "Week 2", sounds: ["i", "n", "m", "d"], tricky: [] },
      { label: "Week 3", sounds: ["g", "o", "c", "k"], tricky: ["is"] },
      { label: "Week 4", sounds: ["ck", "e", "u", "r"], tricky: ["I"] },
      { label: "Week 5", sounds: ["h", "b", "f", "l"], tricky: ["the"] },
    ],
  },
  {
    n: 2,
    name: "Level 2",
    phase: "Phase 2",
    term: "Reception · Autumn 2",
    blurb: "The rest of Phase 2, including the first digraphs — two letters making one sound.",
    weeks: [
      { label: "Week 1", sounds: ["ff", "ll", "ss", "j"], tricky: ["put", "pull", "full", "as"] },
      { label: "Week 2", sounds: ["v", "w", "x", "y"], tricky: ["and", "has", "his", "her"] },
      { label: "Week 3", sounds: ["z", "zz", "qu", "ch"], tricky: ["go", "no", "to", "into"] },
      { label: "Week 4", sounds: ["sh", "th", "ng", "nk"], tricky: ["she", "push", "he", "of"] },
      { label: "Week 5", sounds: [], note: "Words ending in -s (hats, sits, bags)", tricky: ["we", "me", "be"] },
    ],
  },
  {
    n: 3,
    name: "Level 3",
    phase: "Phase 3",
    term: "Reception · Spring 1",
    blurb: "Long vowel sounds written with two or three letters — 'ai' in rain, 'igh' in night.",
    weeks: [
      { label: "Week 1", sounds: ["ai", "ee", "igh", "oa"], tricky: [] },
      { label: "Week 2", sounds: ["oo", "oo(book)", "ar", "or"], tricky: ["was", "you", "they"] },
      { label: "Week 3", sounds: ["ur", "ow", "oi", "ear"], tricky: ["my", "by", "all"] },
      { label: "Week 4", sounds: ["air", "er"], note: "Double letters: dd mm tt bb rr gg pp ff", tricky: ["are", "sure", "pure"] },
    ],
  },
  {
    n: 4,
    name: "Level 4",
    phase: "Phase 4",
    term: "Reception · Summer",
    blurb: "No new sounds — now squashing known sounds together: 'st' in stop, 'mp' in jump.",
    weeks: [
      { label: "Set 1", sounds: [], note: "Adjacent consonants with short vowels — stop, jump, hand", tricky: ["said", "so", "have", "like", "some", "come", "love", "do", "were"] },
      { label: "Set 2", sounds: [], note: "Adjacent consonants with long vowels — train, sleep, float", tricky: ["here", "little", "says", "there", "when", "what", "one", "out", "today"] },
    ],
  },
  {
    n: 5,
    name: "Level 5",
    phase: "Phase 5",
    term: "Year 1 · Autumn",
    blurb: "More ways to spell sounds he already knows — 'ay' as well as 'ai'.",
    weeks: [
      { label: "Set 1", sounds: ["ay", "ou", "ie", "ea"], tricky: ["their", "people", "oh", "your"] },
      { label: "Set 2", sounds: ["oy", "ir", "ue", "aw"], tricky: ["Mr", "Mrs", "Ms", "ask"] },
      { label: "Set 3", sounds: ["wh", "ph", "ew", "oe", "au", "ey"], tricky: ["our", "could", "would", "should", "house", "mouse", "water", "want", "any", "many", "again"] },
    ],
  },
  {
    n: 6,
    name: "Level 6",
    phase: "Phase 5",
    term: "Year 1 · Spring",
    blurb: "Split digraphs (a-e, i-e, o-e) and letters that make more than one sound.",
    weeks: [
      { label: "Set 4", sounds: ["a-e", "e-e", "i-e", "o-e", "u-e"], tricky: ["who", "whole", "where", "two", "school"] },
      { label: "Set 5", sounds: ["c(soft)", "g(soft)", "y(ee)", "y(igh)", "ea(bread)", "ow(snow)"], tricky: ["call", "different", "thought", "through", "friend", "work", "once", "laugh", "because", "eye"] },
    ],
  },
];

/* Levels derive their sound and tricky-word lists from the weeks above, so
 * there is exactly one place to correct if a school teaches a different
 * order. Ordering follows the published Little Wandle Reception/Year 1
 * programme overview and pacing document (four GPCs a week in Reception). */
LEVELS.forEach((l) => {
  l.newSounds = l.weeks.flatMap((w) => w.sounds || []);
  l.newTricky = l.weeks.flatMap((w) => w.tricky || []);
});

/* Example words shown when a sound tile is clicked (the grey box in the
 * Chapter One flashcard screen). Keyed by grapheme. Each list is ordered
 * easiest-first. */
const SOUND_WORDS = {
  s: ["sat", "sit", "sun"], a: ["at", "am", "and"], t: ["tap", "tin", "top"],
  p: ["pat", "pin", "pot"], i: ["in", "it", "sit"], n: ["nap", "net", "nut"],
  m: ["mat", "map", "mum"], d: ["dad", "dig", "dot"], g: ["gap", "got", "gum"],
  o: ["on", "ox", "dog"], c: ["cat", "cap", "cot"], k: ["kit", "kid", "kin"],
  ck: ["sock", "duck", "back"], e: ["egg", "hen", "net"], u: ["up", "sun", "cup"],
  r: ["rat", "run", "rug"], h: ["hat", "hop", "hug"], b: ["bat", "bin", "bus"],
  f: ["fan", "fin", "fun"], l: ["leg", "lip", "log"],
  ff: ["off", "huff", "puff"], ll: ["bell", "hill", "doll"], ss: ["hiss", "mess", "kiss"],
  j: ["jam", "jet", "jog"], v: ["van", "vet", "vim"], w: ["wag", "web", "win"],
  x: ["box", "fox", "six"], y: ["yes", "yet", "yum"], z: ["zip", "zag", "zen"],
  zz: ["buzz", "fizz", "jazz"], qu: ["quiz", "quit", "quick"],
  ch: ["chin", "chop", "much"], sh: ["ship", "shop", "fish"],
  th: ["this", "that", "with"], ng: ["ring", "sing", "long"], nk: ["pink", "sink", "bank"],
  ai: ["rain", "tail", "wait"], ee: ["see", "feet", "week"], igh: ["high", "night", "light"],
  oa: ["boat", "coat", "road"], oo: ["moon", "food", "zoo"], "oo(book)": ["book", "look", "foot"],
  ar: ["car", "star", "farm"], or: ["for", "fork", "corn"], ur: ["fur", "hurt", "burn"],
  ow: ["cow", "down", "town"], oi: ["coin", "boil", "join"], ear: ["ear", "hear", "near"],
  air: ["air", "hair", "fair"], er: ["her", "under", "sister"],
  ay: ["day", "play", "away"], ou: ["out", "loud", "cloud"], ie: ["pie", "tie", "lie"],
  ea: ["eat", "sea", "team"], oy: ["boy", "toy", "joy"], ir: ["bird", "girl", "first"],
  ue: ["blue", "glue", "true"], aw: ["saw", "paw", "yawn"], wh: ["when", "wheel", "whisk"],
  ph: ["phone", "dolphin", "graph"], ew: ["new", "chew", "few"], oe: ["toe", "goes", "hoe"],
  au: ["author", "August", "haunt"], ey: ["key", "money", "donkey"],
  "a-e": ["cake", "game", "made"], "e-e": ["these", "even", "theme"],
  "i-e": ["bike", "time", "smile"], "o-e": ["home", "bone", "nose"],
  "u-e": ["cube", "tune", "huge"], "c(soft)": ["city", "ice", "race"],
  "g(soft)": ["gem", "giant", "cage"], "y(ee)": ["happy", "funny", "very"],
  "y(igh)": ["fly", "cry", "sky"], "ea(bread)": ["bread", "head", "ready"],
  "ow(snow)": ["snow", "blow", "yellow"],
};

/* Word pools for the games, per level (cumulative — getWords() merges all
 * levels up to the chosen one). Kept to what's decodable at that level:
 * levels 1-3 stay CVC-ish because adjacent consonants aren't taught until
 * level 4, which is exactly what level 4 then introduces. */
const LEVEL_WORDS = {
  1: ["sat", "pat", "tap", "pin", "map", "dad", "dig", "got", "cat", "cot", "kid",
      "sock", "duck", "back", "hen", "net", "sun", "cup", "rug", "rat", "hat", "hop",
      "bat", "bin", "fan", "fun", "leg", "log", "mud", "big", "bed", "pot", "tin", "gap"],
  2: ["off", "huff", "bell", "hill", "doll", "mess", "kiss", "jam", "jet", "van", "vet",
      "web", "wig", "box", "fox", "six", "yes", "zip", "buzz", "fizz", "quiz", "chin",
      "chop", "much", "ship", "shop", "fish", "this", "that", "with", "ring", "sing",
      "long", "pink", "sink", "bank", "bath", "moth", "rush", "wish"],
  3: ["rain", "tail", "see", "feet", "high", "night", "boat", "coat", "moon", "book",
      "look", "car", "star", "for", "fork", "fur", "cow", "down", "coin", "boil",
      "hear", "hair", "her", "corn", "burn", "road", "week", "zoo", "foot", "farm"],
  4: ["stop", "spot", "frog", "flag", "clap", "swim", "trip", "grin", "crab", "drum",
      "jump", "lamp", "hand", "sand", "milk", "desk", "nest", "lost", "best", "must",
      "fast", "wind", "help", "belt", "gift", "went", "champ", "crunch", "stamp", "drink"],
  5: ["day", "play", "away", "out", "loud", "pie", "tie", "eat", "sea", "boy", "toy",
      "bird", "girl", "blue", "saw", "paw", "when", "new", "chew", "toe", "key",
      "cloud", "team", "first", "yawn", "wheel", "money"],
  6: ["cake", "game", "bike", "time", "home", "bone", "cube", "tune", "city", "ice",
      "gem", "cage", "happy", "funny", "fly", "cry", "sky", "bread", "head", "snow",
      "blow", "smile", "nose", "huge", "race", "giant"],
};

/* Word Sort rounds: sort numbered words into bins by which sound they contain.
 * Mirrors the Chapter One screen — a numbered word list above, coloured bins
 * below, and the child says "number four goes in the red box". */
const WORD_SORTS = {
  1: [
    { bins: ["a", "i"], words: [["cat","a"],["pin","i"],["map","a"],["sit","i"],["bag","a"],["dig","i"]] },
    { bins: ["t", "p", "n"], words: [["tap","t"],["pin","p"],["net","n"],["top","t"],["pot","p"],["nap","n"]] },
    { bins: ["ck", "d", "g"], words: [["sock","ck"],["dad","d"],["dig","g"],["duck","ck"],["dot","d"],["gap","g"]] },
  ],
  2: [
    { bins: ["ff", "ll", "ss"], words: [["huff","ff"],["bell","ll"],["mess","ss"],["off","ff"],["hill","ll"],["kiss","ss"]] },
    { bins: ["ch", "sh", "th"], words: [["chin","ch"],["ship","sh"],["this","th"],["chop","ch"],["fish","sh"],["bath","th"]] },
    { bins: ["ng", "nk"], words: [["ring","ng"],["pink","nk"],["sing","ng"],["sink","nk"],["long","ng"],["bank","nk"]] },
  ],
  3: [
    { bins: ["ai", "ee", "igh"], words: [["rain","ai"],["feet","ee"],["night","igh"],["tail","ai"],["see","ee"],["high","igh"]] },
    { bins: ["oa", "oo", "ar"], words: [["boat","oa"],["moon","oo"],["car","ar"],["coat","oa"],["zoo","oo"],["star","ar"]] },
    { bins: ["ow", "oi", "or"], words: [["cow","ow"],["coin","oi"],["fork","or"],["down","ow"],["boil","oi"],["corn","or"]] },
  ],
  4: [
    { bins: ["st", "fl", "cr"], words: [["stop","st"],["flag","fl"],["crab","cr"],["stamp","st"],["flap","fl"],["crib","cr"]] },
    { bins: ["-mp", "-nd", "-st"], words: [["jump","-mp"],["hand","-nd"],["nest","-st"],["lamp","-mp"],["sand","-nd"],["best","-st"]] },
  ],
  5: [
    { bins: ["ay", "ou", "oy"], words: [["day","ay"],["out","ou"],["boy","oy"],["play","ay"],["loud","ou"],["toy","oy"]] },
    { bins: ["ir", "aw", "ew"], words: [["bird","ir"],["saw","aw"],["new","ew"],["girl","ir"],["paw","aw"],["chew","ew"]] },
  ],
  6: [
    { bins: ["a-e", "i-e", "o-e"], words: [["cake","a-e"],["bike","i-e"],["home","o-e"],["game","a-e"],["time","i-e"],["bone","o-e"]] },
    { bins: ["y(ee)", "y(igh)"], words: [["happy","y(ee)"],["fly","y(igh)"],["funny","y(ee)"],["cry","y(igh)"],["very","y(ee)"],["sky","y(igh)"]] },
  ],
};

/* Word Whirled: a word wheel. A rime sits in the middle, onsets go round the
 * outside, and turning the wheel builds a new word each time — the classic
 * onset-and-rime blending drill. */
const WORD_WHEELS = {
  1: [
    { rime: "at", onsets: ["c", "h", "m", "p", "r", "s"] },
    { rime: "ig", onsets: ["b", "d", "f", "p", "r", "w"] },
    { rime: "un", onsets: ["b", "f", "r", "s", "g", "p"] },
    { rime: "op", onsets: ["h", "m", "p", "t", "c", "l"] },
  ],
  2: [
    { rime: "ell", onsets: ["b", "f", "s", "t", "w", "y"] },
    { rime: "uck", onsets: ["d", "l", "m", "p", "s", "t"] },
    { rime: "ish", onsets: ["d", "f", "w", "sw"] },
    { rime: "ing", onsets: ["k", "r", "s", "w", "th"] },
  ],
  3: [
    { rime: "ain", onsets: ["m", "p", "r", "tr", "ch"] },
    { rime: "eep", onsets: ["b", "d", "k", "sh", "sl"] },
    { rime: "ight", onsets: ["f", "l", "m", "n", "r", "s"] },
    { rime: "oat", onsets: ["b", "c", "g", "m", "fl"] },
  ],
  4: [
    { rime: "amp", onsets: ["c", "d", "l", "r", "st", "ch"] },
    { rime: "and", onsets: ["b", "h", "l", "s", "st", "gr"] },
    { rime: "est", onsets: ["b", "n", "p", "r", "t", "ch"] },
  ],
  5: [
    { rime: "ay", onsets: ["d", "m", "p", "s", "w", "pl"] },
    { rime: "out", onsets: ["sh", "sp", "tr", "scr"] },
    { rime: "oil", onsets: ["b", "c", "s", "sp", "t"] },
  ],
  6: [
    { rime: "ake", onsets: ["b", "c", "l", "m", "r", "sn"] },
    { rime: "ine", onsets: ["d", "f", "l", "m", "n", "sh"] },
    { rime: "ope", onsets: ["h", "r", "m", "sl", "sc"] },
  ],
};

/* ---------- cumulative lookups ---------- */

function levelData(n) {
  return LEVELS.find((l) => l.n === Number(n)) || LEVELS[0];
}

function soundsUpTo(n) {
  const out = [];
  LEVELS.filter((l) => l.n <= Number(n)).forEach((l) => out.push(...l.newSounds));
  return out;
}

function trickyUpTo(n) {
  const out = [];
  LEVELS.filter((l) => l.n <= Number(n)).forEach((l) => out.push(...l.newTricky));
  return out;
}

function wordsUpTo(n) {
  let out = [];
  for (let i = 1; i <= Number(n); i++) out = out.concat(LEVEL_WORDS[i] || []);
  return out;
}

/* Games want a decent spread but not the whole history — mostly the current
 * level, topped up from earlier levels so a level-4 board isn't 100% blends.
 *
 * This MUST be deterministic in (n, count, seed, minLen) and nothing else.
 * Both the reader portal and the child's screen build their own board from
 * the shared state independently, so any randomness that isn't derived from
 * the seed puts different words on the two screens — and reshuffles the
 * board out from under an in-progress game on every unrelated re-render.
 * That is exactly what an earlier Math.random() shuffle in here did.
 * tools/check-determinism.js guards this.
 */
function gameWords(n, count, seed, minLen) {
  const sd = Number(seed) || 0;
  const current = LEVEL_WORDS[Number(n)] || [];
  const earlier = wordsUpTo(Number(n) - 1);
  const pool = seededShuffle(current, sd).concat(seededShuffle(earlier, sd + 977));
  const seen = new Set();
  const out = [];
  for (const w of pool) {
    if (seen.has(w)) continue;
    if (minLen && w.length < minLen) continue;
    seen.add(w);
    out.push(w);
    if (out.length >= (count || 12)) break;
  }
  return out;
}

/* Fisher-Yates driven by a small deterministic LCG rather than Math.random,
 * so the same seed always gives the same order in every browser. */
function seededShuffle(list, seed) {
  const arr = list.slice();
  let x = ((Number(seed) || 0) + 1) * 9301 + 49297;
  for (let i = arr.length - 1; i > 0; i--) {
    x = (x * 9301 + 49297) % 233280;
    const j = x % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

