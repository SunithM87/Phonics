/*
 * Phonics content, structured the way a volunteer reading platform handles
 * progression: a numeric ACTIVITY LEVEL the adult sets and moves (flashcards
 * and games unlock whole-level), and a separate colour-banded STORY LEVEL
 * for the book library (see stories.js).
 *
 * What's on the scale is Little Wandle Letters and Sounds Revised. Each
 * level is one of Little Wandle's own teaching units — a Reception week
 * (four new sounds) or a Year 1 set — taken from the published programme
 * overview and pacing document. So Level 1 is s a t p, Level 2 adds
 * i n m d, and so on; twenty-one units from Reception Autumn 1 to the end
 * of Phase 5. That granularity is what makes flashcards useful in the
 * first weeks: in week two he sees eight tiles, not twenty.
 *
 * Every word the app shows him has an explicit grapheme breakdown in
 * words.js. tools/check-content.js validates ALL content here — sound
 * examples, sorts, wheels, game pools and every story word — against the
 * sounds taught by the level it appears at, and fails otherwise.
 *
 * Not affiliated with Little Wandle / Wandle Learning Trust or Chapter One.
 * His school's own pacing always wins over this file.
 */

const UNITS = [
  { n: 1,  phase: 2, term: "Reception · Autumn 1", label: "Week 1", sounds: ["s", "a", "t", "p"], tricky: [] },
  { n: 2,  phase: 2, term: "Reception · Autumn 1", label: "Week 2", sounds: ["i", "n", "m", "d"], tricky: [] },
  { n: 3,  phase: 2, term: "Reception · Autumn 1", label: "Week 3", sounds: ["g", "o", "c", "k"], tricky: ["is"] },
  { n: 4,  phase: 2, term: "Reception · Autumn 1", label: "Week 4", sounds: ["ck", "e", "u", "r"], tricky: ["I"] },
  { n: 5,  phase: 2, term: "Reception · Autumn 1", label: "Week 5", sounds: ["h", "b", "f", "l"], tricky: ["the"] },
  { n: 6,  phase: 2, term: "Reception · Autumn 2", label: "Week 1", sounds: ["ff", "ll", "ss", "j"], tricky: ["put", "pull", "full", "as"] },
  { n: 7,  phase: 2, term: "Reception · Autumn 2", label: "Week 2", sounds: ["v", "w", "x", "y"], tricky: ["and", "has", "his", "her"] },
  { n: 8,  phase: 2, term: "Reception · Autumn 2", label: "Week 3", sounds: ["z", "zz", "qu", "ch"], tricky: ["go", "no", "to", "into"] },
  { n: 9,  phase: 2, term: "Reception · Autumn 2", label: "Week 4", sounds: ["sh", "th", "ng", "nk"], tricky: ["she", "push", "he", "of"] },
  { n: 10, phase: 2, term: "Reception · Autumn 2", label: "Week 5", sounds: [], note: "Words ending in -s: hats, sits, bags", tricky: ["we", "me", "be"] },
  { n: 11, phase: 3, term: "Reception · Spring 1", label: "Week 1", sounds: ["ai", "ee", "igh", "oa"], tricky: [] },
  { n: 12, phase: 3, term: "Reception · Spring 1", label: "Week 2", sounds: ["oo", "oo(book)", "ar", "or"], tricky: ["was", "you", "they"] },
  { n: 13, phase: 3, term: "Reception · Spring 1", label: "Week 3", sounds: ["ur", "ow", "oi", "ear"], tricky: ["my", "by", "all"] },
  { n: 14, phase: 3, term: "Reception · Spring 1", label: "Week 4", sounds: ["air", "er", "dd", "mm", "tt", "bb", "rr", "gg", "pp"], note: "Double letters make one sound", tricky: ["are", "sure", "pure"] },
  { n: 15, phase: 4, term: "Reception · Summer", label: "Set 1", sounds: [], note: "Two consonants together, short vowels: stop, jump, hand", tricky: ["said", "so", "have", "like", "some", "come", "love", "do", "were"] },
  { n: 16, phase: 4, term: "Reception · Summer", label: "Set 2", sounds: [], note: "Two consonants together, long vowels: train, sleep, float", tricky: ["here", "little", "says", "there", "when", "what", "one", "out", "today"] },
  { n: 17, phase: 5, term: "Year 1 · Autumn", label: "Set 1", sounds: ["ay", "ou", "ie", "ea"], tricky: ["their", "people", "oh", "your"] },
  { n: 18, phase: 5, term: "Year 1 · Autumn", label: "Set 2", sounds: ["oy", "ir", "ue", "aw"], tricky: ["Mr", "Mrs", "Ms", "ask"] },
  { n: 19, phase: 5, term: "Year 1 · Autumn", label: "Set 3", sounds: ["wh", "ph", "ew", "oe", "au", "ey"], tricky: ["our", "could", "would", "should", "house", "mouse", "water", "want", "any", "many", "again"] },
  { n: 20, phase: 5, term: "Year 1 · Spring", label: "Set 4", sounds: ["a-e", "e-e", "i-e", "o-e", "u-e"], note: "Split digraphs", tricky: ["who", "whole", "where", "two", "school"] },
  { n: 21, phase: 5, term: "Year 1 · Spring", label: "Set 5", sounds: ["c(soft)", "g(soft)", "y(ee)", "y(igh)", "ea(bread)", "ow(snow)"], note: "Letters that make more than one sound", tricky: ["call", "different", "thought", "through", "friend", "work", "once", "laugh", "because", "eye"] },
];

const MAX_LEVEL = UNITS.length;
const ADJACENT_SHORT_LEVEL = 15; // Phase 4 Set 1
const ADJACENT_LONG_LEVEL = 16;  // Phase 4 Set 2
const SUFFIX_S_LEVEL = 10;       // Phase 2 Autumn 2 Week 5

/* Friendly labels for graphemes whose id carries a disambiguator. */
const GPC_LABEL = {
  "oo(book)": "oo", "c(soft)": "c", "g(soft)": "g", "y(ee)": "y", "y(igh)": "y",
  "ea(bread)": "ea", "ow(snow)": "ow", "a-e": "a_e", "e-e": "e_e", "i-e": "i_e", "o-e": "o_e", "u-e": "u_e",
};
const GPC_NOTE = {
  "oo": "as in moon", "oo(book)": "as in book", "c(soft)": "soft, as in city", "g(soft)": "soft, as in gem",
  "y(ee)": "as in happy", "y(igh)": "as in fly", "ea": "as in eat", "ea(bread)": "as in bread",
  "ow": "as in cow", "ow(snow)": "as in snow",
};
function gpcLabel(g) { return GPC_LABEL[g] || g; }
function gpcNote(g) { return GPC_NOTE[g] || ""; }

/* Vowel graphemes — used to detect adjacent consonants (Phase 4). */
const VOWEL_GPCS = new Set([
  "a", "e", "i", "o", "u", "ai", "ee", "igh", "oa", "oo", "oo(book)", "ar", "or", "ur", "ow", "oi", "ear", "air", "er",
  "ay", "ou", "ie", "ea", "oy", "ir", "ue", "aw", "ew", "oe", "au", "ey",
  "a-e", "e-e", "i-e", "o-e", "u-e", "y(ee)", "y(igh)", "ea(bread)", "ow(snow)",
]);
const LONG_VOWEL_GPCS = new Set([...VOWEL_GPCS].filter((g) => !["a", "e", "i", "o", "u"].includes(g)));

/* ------------------------------------------------------------------ */
/* Tricky words: which part is the tricky bit                          */
/* ------------------------------------------------------------------ */
/* Little Wandle does not teach tricky words as wholes to memorise: most
 * of a tricky word is regular, and children are taught to read the regular
 * sounds and be TOLD the tricky bit. Each entry lists the word's parts with
 * a flag for the tricky one(s), plus a one-line note for the grown-up. */
const TRICKY_PARTS = {
  is: { parts: [["i", 0], ["s", 1]], note: "the s says /z/" },
  I: { parts: [["I", 1]], note: "says its letter name" },
  the: { parts: [["th", 0], ["e", 1]], note: "the e says /uh/" },
  put: { parts: [["p", 0], ["u", 1], ["t", 0]], note: "the u says /oo/" },
  pull: { parts: [["p", 0], ["u", 1], ["ll", 0]], note: "the u says /oo/" },
  full: { parts: [["f", 0], ["u", 1], ["ll", 0]], note: "the u says /oo/" },
  as: { parts: [["a", 0], ["s", 1]], note: "the s says /z/" },
  and: { parts: [["a", 0], ["nd", 1]], note: "every letter is regular — the tricky bit is n and d running together, which isn't taught yet. Say the end for him." },
  has: { parts: [["h", 0], ["a", 0], ["s", 1]], note: "the s says /z/" },
  his: { parts: [["h", 0], ["i", 0], ["s", 1]], note: "the s says /z/" },
  her: { parts: [["h", 0], ["er", 1]], note: "er isn't taught yet — it says /ur/" },
  go: { parts: [["g", 0], ["o", 1]], note: "the o says /oa/" },
  no: { parts: [["n", 0], ["o", 1]], note: "the o says /oa/" },
  to: { parts: [["t", 0], ["o", 1]], note: "the o says /oo/" },
  into: { parts: [["i", 0], ["n", 0], ["t", 0], ["o", 1]], note: "the o says /oo/" },
  she: { parts: [["sh", 0], ["e", 1]], note: "the e says /ee/" },
  push: { parts: [["p", 0], ["u", 1], ["sh", 0]], note: "the u says /oo/" },
  he: { parts: [["h", 0], ["e", 1]], note: "the e says /ee/" },
  of: { parts: [["o", 0], ["f", 1]], note: "the f says /v/" },
  we: { parts: [["w", 0], ["e", 1]], note: "the e says /ee/" },
  me: { parts: [["m", 0], ["e", 1]], note: "the e says /ee/" },
  be: { parts: [["b", 0], ["e", 1]], note: "the e says /ee/" },
  was: { parts: [["w", 0], ["a", 1], ["s", 1]], note: "the a says /o/ and the s says /z/" },
  you: { parts: [["y", 0], ["ou", 1]], note: "ou says /oo/" },
  they: { parts: [["th", 0], ["ey", 1]], note: "ey says /ai/" },
  my: { parts: [["m", 0], ["y", 1]], note: "the y says /igh/" },
  by: { parts: [["b", 0], ["y", 1]], note: "the y says /igh/" },
  all: { parts: [["a", 1], ["ll", 0]], note: "the a says /or/" },
  are: { parts: [["are", 1]], note: "the whole word says /ar/" },
  sure: { parts: [["s", 1], ["ure", 1]], note: "the s says /sh/" },
  pure: { parts: [["p", 0], ["ure", 1]], note: "ure says /yoor/" },
  said: { parts: [["s", 0], ["ai", 1], ["d", 0]], note: "ai says /e/" },
  so: { parts: [["s", 0], ["o", 1]], note: "the o says /oa/" },
  have: { parts: [["h", 0], ["a", 0], ["v", 0], ["e", 1]], note: "the e is silent" },
  like: { parts: [["l", 0], ["i", 1], ["k", 0], ["e", 1]], note: "the i and e work together to say /igh/" },
  some: { parts: [["s", 0], ["o", 1], ["m", 0], ["e", 1]], note: "the o says /u/, the e is silent" },
  come: { parts: [["c", 0], ["o", 1], ["m", 0], ["e", 1]], note: "the o says /u/, the e is silent" },
  love: { parts: [["l", 0], ["o", 1], ["v", 0], ["e", 1]], note: "the o says /u/, the e is silent" },
  do: { parts: [["d", 0], ["o", 1]], note: "the o says /oo/" },
  were: { parts: [["w", 0], ["ere", 1]], note: "ere says /ur/" },
  here: { parts: [["h", 0], ["ere", 1]], note: "ere says /ear/" },
  little: { parts: [["l", 0], ["i", 0], ["tt", 0], ["le", 1]], note: "le says /l/" },
  says: { parts: [["s", 0], ["ay", 1], ["s", 1]], note: "ay says /e/, the s says /z/" },
  there: { parts: [["th", 0], ["ere", 1]], note: "ere says /air/" },
  when: { parts: [["wh", 1], ["e", 0], ["n", 0]], note: "wh says /w/" },
  what: { parts: [["wh", 1], ["a", 1], ["t", 0]], note: "wh says /w/, the a says /o/" },
  one: { parts: [["one", 1]], note: "the whole word says /wun/" },
  out: { parts: [["ou", 1], ["t", 0]], note: "ou says /ow/" },
  today: { parts: [["t", 0], ["o", 1], ["d", 0], ["ay", 1]], note: "the o says /u/, ay says /ai/" },
  their: { parts: [["th", 0], ["eir", 1]], note: "eir says /air/" },
  people: { parts: [["p", 0], ["eo", 1], ["p", 0], ["le", 1]], note: "eo says /ee/, le says /l/" },
  oh: { parts: [["o", 1], ["h", 1]], note: "says /oa/" },
  your: { parts: [["y", 0], ["our", 1]], note: "our says /or/" },
  Mr: { parts: [["Mr", 1]], note: "short for Mister" },
  Mrs: { parts: [["Mrs", 1]], note: "short for Missus" },
  Ms: { parts: [["Ms", 1]], note: "says /miz/" },
  ask: { parts: [["a", 1], ["s", 0], ["k", 0]], note: "the a says /ar/ in most accents" },
  our: { parts: [["our", 1]], note: "the whole word says /ow-er/" },
  could: { parts: [["c", 0], ["oul", 1], ["d", 0]], note: "oul says /oo/" },
  would: { parts: [["w", 0], ["oul", 1], ["d", 0]], note: "oul says /oo/" },
  should: { parts: [["sh", 0], ["oul", 1], ["d", 0]], note: "oul says /oo/" },
  house: { parts: [["h", 0], ["ou", 0], ["se", 1]], note: "se says /s/" },
  mouse: { parts: [["m", 0], ["ou", 0], ["se", 1]], note: "se says /s/" },
  water: { parts: [["w", 0], ["a", 1], ["t", 0], ["er", 0]], note: "the a says /or/" },
  want: { parts: [["w", 0], ["a", 1], ["n", 0], ["t", 0]], note: "the a says /o/" },
  any: { parts: [["a", 1], ["n", 0], ["y", 1]], note: "the a says /e/, the y says /ee/" },
  many: { parts: [["m", 0], ["a", 1], ["n", 0], ["y", 1]], note: "the a says /e/, the y says /ee/" },
  again: { parts: [["a", 0], ["g", 0], ["ai", 1], ["n", 0]], note: "ai says /e/" },
  who: { parts: [["wh", 1], ["o", 1]], note: "wh says /h/, the o says /oo/" },
  whole: { parts: [["wh", 1], ["o", 0], ["l", 0], ["e", 0]], note: "wh says /h/; o and e say /oa/" },
  where: { parts: [["wh", 0], ["ere", 1]], note: "ere says /air/" },
  two: { parts: [["t", 0], ["wo", 1]], note: "wo says /oo/" },
  school: { parts: [["s", 0], ["ch", 1], ["oo", 0], ["l", 0]], note: "ch says /k/" },
  call: { parts: [["c", 0], ["a", 1], ["ll", 0]], note: "the a says /or/" },
  different: { parts: [["d", 0], ["i", 0], ["ff", 0], ["er", 0], ["e", 1], ["n", 0], ["t", 0]], note: "the middle e is barely said" },
  thought: { parts: [["th", 0], ["ough", 1], ["t", 0]], note: "ough says /or/" },
  through: { parts: [["th", 0], ["r", 0], ["ough", 1]], note: "ough says /oo/" },
  friend: { parts: [["f", 0], ["r", 0], ["ie", 1], ["n", 0], ["d", 0]], note: "ie says /e/" },
  work: { parts: [["w", 0], ["or", 1], ["k", 0]], note: "or says /ur/" },
  once: { parts: [["o", 1], ["n", 0], ["ce", 0]], note: "the o says /wu/" },
  laugh: { parts: [["l", 0], ["au", 1], ["gh", 1]], note: "au says /ar/, gh says /f/" },
  because: { parts: [["b", 0], ["e", 0], ["c", 0], ["au", 1], ["se", 1]], note: "au says /o/, se says /z/" },
  eye: { parts: [["eye", 1]], note: "the whole word says /igh/" },
};

/* ------------------------------------------------------------------ */
/* Sound examples (grey box when a tile is clicked)                    */
/* ------------------------------------------------------------------ */
/* Each list must be readable at the level that sound is introduced —
 * the checker enforces it. That is why Level 1 lists are short: with
 * only s a t p there aren't many words. */
const SOUND_WORDS = {
  s: ["sat", "sap"], a: ["at", "sat", "tap"], t: ["tap", "at", "sat"], p: ["pat", "tap", "sap"],
  i: ["it", "sit", "pin"], n: ["nap", "tin", "man"], m: ["mat", "map", "dim"], d: ["dad", "dip", "mad"],
  g: ["gap", "dig", "got"], o: ["on", "dog", "pot"], c: ["cat", "cap", "cot"], k: ["kit", "kid", "kip"],
  ck: ["sock", "duck", "kick"], e: ["net", "pen", "ten"], u: ["up", "sun", "cup"], r: ["rat", "run", "red"],
  h: ["hat", "hen", "hop"], b: ["bat", "bin", "bus"], f: ["fan", "fit", "fun"], l: ["leg", "lip", "log"],
  ff: ["off", "huff", "puff"], ll: ["bell", "hill", "doll"], ss: ["hiss", "mess", "kiss"], j: ["jam", "jet", "jog"],
  v: ["van", "vet", "vat"], w: ["wag", "web", "win"], x: ["box", "fox", "six"], y: ["yes", "yet", "yap"],
  z: ["zip", "zap"], zz: ["buzz", "fizz", "jazz"], qu: ["quiz", "quit", "quick"], ch: ["chin", "chop", "much"],
  sh: ["ship", "shop", "fish"], th: ["this", "that", "with"], ng: ["ring", "sing", "long"], nk: ["pink", "sink", "bank"],
  ai: ["rain", "tail", "wait"], ee: ["see", "feet", "week"], igh: ["high", "night", "light"], oa: ["boat", "coat", "road"],
  oo: ["moon", "food", "zoo"], "oo(book)": ["book", "look", "foot"], ar: ["car", "farm", "park"], or: ["for", "fork", "corn"],
  ur: ["fur", "hurt", "burn"], ow: ["cow", "down", "town"], oi: ["coin", "boil", "join"], ear: ["ear", "hear", "near"],
  air: ["air", "hair", "fair"], er: ["her", "letter", "hammer"],
  dd: ["add", "odd", "ladder"], mm: ["hammer", "summer", "comma"], tt: ["letter", "better", "butter"],
  bb: ["rabbit", "ribbon"], rr: ["carrot", "parrot"], gg: ["egg", "bigger", "jogger"], pp: ["puppet", "happen", "hopping"],
  ay: ["day", "play", "way"], ou: ["out", "loud", "cloud"], ie: ["pie", "tie", "lie"], ea: ["eat", "sea", "team"],
  oy: ["boy", "toy", "joy"], ir: ["bird", "girl", "first"], ue: ["blue", "glue", "true"], aw: ["saw", "paw", "yawn"],
  wh: ["when", "wheel", "whisk"], ph: ["dolphin", "graph", "alphabet"], ew: ["chew", "new", "few"],
  oe: ["toe", "goes", "hoe"], au: ["author", "haunt", "August"], ey: ["key", "donkey", "turkey"],
  "a-e": ["cake", "game", "made"], "e-e": ["these", "theme", "eve"], "i-e": ["bike", "time", "smile"],
  "o-e": ["home", "bone", "nose"], "u-e": ["cube", "tune", "flute"],
  "c(soft)": ["city", "ice", "race"], "g(soft)": ["gem", "cage", "huge"], "y(ee)": ["happy", "silly", "very"],
  "y(igh)": ["fly", "cry", "sky"], "ea(bread)": ["bread", "head", "ready"], "ow(snow)": ["snow", "blow", "yellow"],
};

/* ------------------------------------------------------------------ */
/* Word Sort rounds                                                    */
/* ------------------------------------------------------------------ */
/* `level` is the minimum level a round may appear at; the checker verifies
 * every word in it is readable there. Rounds are offered from the highest
 * level at or below the current one, so a sort always matches recent
 * teaching rather than being a random level. */
const WORD_SORTS = [
  { level: 2, bins: ["a", "i"], words: [["mat", "a"], ["pin", "i"], ["sat", "a"], ["sit", "i"], ["map", "a"], ["dip", "i"]] },
  { level: 3, bins: ["c", "k", "g"], words: [["cat", "c"], ["kit", "k"], ["gap", "g"], ["cot", "c"], ["kid", "k"], ["got", "g"]] },
  { level: 4, bins: ["ck", "e", "u"], words: [["sock", "ck"], ["net", "e"], ["sun", "u"], ["duck", "ck"], ["pen", "e"], ["cup", "u"]] },
  { level: 5, bins: ["h", "b", "f"], words: [["hat", "h"], ["bin", "b"], ["fan", "f"], ["hen", "h"], ["bat", "b"], ["fun", "f"]] },
  { level: 6, bins: ["ff", "ll", "ss"], words: [["huff", "ff"], ["bell", "ll"], ["mess", "ss"], ["off", "ff"], ["hill", "ll"], ["kiss", "ss"]] },
  { level: 7, bins: ["v", "w", "x"], words: [["van", "v"], ["web", "w"], ["box", "x"], ["vet", "v"], ["wig", "w"], ["fox", "x"]] },
  { level: 8, bins: ["z", "qu", "ch"], words: [["zip", "z"], ["quiz", "qu"], ["chin", "ch"], ["zap", "z"], ["quit", "qu"], ["chop", "ch"]] },
  { level: 9, bins: ["sh", "th", "ng"], words: [["ship", "sh"], ["this", "th"], ["ring", "ng"], ["fish", "sh"], ["bath", "th"], ["long", "ng"]] },
  { level: 9, bins: ["ng", "nk"], words: [["ring", "ng"], ["pink", "nk"], ["sing", "ng"], ["sink", "nk"], ["long", "ng"], ["bank", "nk"]] },
  { level: 11, bins: ["ai", "ee", "igh"], words: [["rain", "ai"], ["feet", "ee"], ["night", "igh"], ["tail", "ai"], ["see", "ee"], ["high", "igh"]] },
  { level: 12, bins: ["oo", "ar", "or"], words: [["moon", "oo"], ["car", "ar"], ["for", "or"], ["zoo", "oo"], ["farm", "ar"], ["corn", "or"]] },
  { level: 13, bins: ["ow", "oi", "ur"], words: [["cow", "ow"], ["coin", "oi"], ["fur", "ur"], ["down", "ow"], ["boil", "oi"], ["hurt", "ur"]] },
  { level: 14, bins: ["ear", "air", "er"], words: [["ear", "ear"], ["hair", "air"], ["her", "er"], ["near", "ear"], ["fair", "air"], ["letter", "er"]] },
  { level: 15, bins: ["st", "fl", "cr"], words: [["stop", "st"], ["flag", "fl"], ["crab", "cr"], ["stamp", "st"], ["flap", "fl"], ["crib", "cr"]] },
  { level: 15, bins: ["-mp", "-nd", "-st"], words: [["jump", "-mp"], ["hand", "-nd"], ["nest", "-st"], ["lamp", "-mp"], ["sand", "-nd"], ["best", "-st"]] },
  { level: 16, bins: ["ai", "ee", "oa"], words: [["train", "ai"], ["sleep", "ee"], ["float", "oa"], ["brain", "ai"], ["green", "ee"], ["toast", "oa"]] },
  { level: 17, bins: ["ay", "ou", "ie"], words: [["day", "ay"], ["out", "ou"], ["pie", "ie"], ["play", "ay"], ["loud", "ou"], ["tie", "ie"]] },
  { level: 18, bins: ["oy", "ir", "aw"], words: [["boy", "oy"], ["bird", "ir"], ["saw", "aw"], ["toy", "oy"], ["girl", "ir"], ["paw", "aw"]] },
  { level: 19, bins: ["wh", "ph", "ew"], words: [["when", "wh"], ["graph", "ph"], ["new", "ew"], ["wheel", "wh"], ["dolphin", "ph"], ["chew", "ew"]] },
  { level: 20, bins: ["a-e", "i-e", "o-e"], words: [["cake", "a-e"], ["bike", "i-e"], ["home", "o-e"], ["game", "a-e"], ["time", "i-e"], ["bone", "o-e"]] },
  { level: 21, bins: ["c(soft)", "g(soft)"], words: [["city", "c(soft)"], ["gem", "g(soft)"], ["ice", "c(soft)"], ["cage", "g(soft)"], ["race", "c(soft)"], ["huge", "g(soft)"]] },
];

/* ------------------------------------------------------------------ */
/* Word Wheels                                                         */
/* ------------------------------------------------------------------ */
/* An ending in the middle, beginnings round the outside. Each part carries
 * its own GPCs so the composed word's breakdown is explicit (and so a rime
 * like "ow" in snow can't be mistaken for the ow in cow). */
const WORD_WHEELS = [
  { level: 2, rime: "at", rimeGpcs: ["a", "t"], onsets: [["s", ["s"]], ["p", ["p"]], ["m", ["m"]]] },
  { level: 2, rime: "ip", rimeGpcs: ["i", "p"], onsets: [["s", ["s"]], ["t", ["t"]], ["d", ["d"]], ["n", ["n"]]] },
  { level: 2, rime: "ap", rimeGpcs: ["a", "p"], onsets: [["t", ["t"]], ["m", ["m"]], ["n", ["n"]], ["s", ["s"]]] },
  { level: 3, rime: "ot", rimeGpcs: ["o", "t"], onsets: [["c", ["c"]], ["d", ["d"]], ["g", ["g"]], ["p", ["p"]]] },
  { level: 3, rime: "an", rimeGpcs: ["a", "n"], onsets: [["c", ["c"]], ["m", ["m"]], ["p", ["p"]], ["t", ["t"]]] },
  { level: 4, rime: "et", rimeGpcs: ["e", "t"], onsets: [["n", ["n"]], ["p", ["p"]], ["g", ["g"]], ["m", ["m"]], ["s", ["s"]]] },
  { level: 4, rime: "ug", rimeGpcs: ["u", "g"], onsets: [["r", ["r"]], ["m", ["m"]], ["d", ["d"]], ["t", ["t"]], ["p", ["p"]]] },
  { level: 5, rime: "op", rimeGpcs: ["o", "p"], onsets: [["h", ["h"]], ["m", ["m"]], ["p", ["p"]], ["t", ["t"]], ["c", ["c"]]] },
  { level: 5, rime: "ig", rimeGpcs: ["i", "g"], onsets: [["b", ["b"]], ["d", ["d"]], ["f", ["f"]], ["p", ["p"]]] },
  { level: 5, rime: "ut", rimeGpcs: ["u", "t"], onsets: [["b", ["b"]], ["c", ["c"]], ["h", ["h"]], ["n", ["n"]]] },
  { level: 6, rime: "ell", rimeGpcs: ["e", "ll"], onsets: [["b", ["b"]], ["f", ["f"]], ["s", ["s"]], ["t", ["t"]]] },
  { level: 6, rime: "iss", rimeGpcs: ["i", "ss"], onsets: [["h", ["h"]], ["k", ["k"]], ["m", ["m"]]] },
  { level: 6, rime: "uff", rimeGpcs: ["u", "ff"], onsets: [["h", ["h"]], ["p", ["p"]], ["c", ["c"]], ["m", ["m"]]] },
  { level: 7, rime: "et", rimeGpcs: ["e", "t"], onsets: [["v", ["v"]], ["w", ["w"]], ["y", ["y"]], ["j", ["j"]]] },
  { level: 7, rime: "ig", rimeGpcs: ["i", "g"], onsets: [["w", ["w"]], ["b", ["b"]], ["d", ["d"]], ["f", ["f"]], ["p", ["p"]]] },
  { level: 8, rime: "ip", rimeGpcs: ["i", "p"], onsets: [["z", ["z"]], ["ch", ["ch"]], ["d", ["d"]], ["h", ["h"]], ["l", ["l"]], ["n", ["n"]]] },
  { level: 8, rime: "op", rimeGpcs: ["o", "p"], onsets: [["ch", ["ch"]], ["h", ["h"]], ["m", ["m"]], ["p", ["p"]], ["t", ["t"]]] },
  { level: 9, rime: "ash", rimeGpcs: ["a", "sh"], onsets: [["c", ["c"]], ["m", ["m"]], ["d", ["d"]], ["r", ["r"]], ["b", ["b"]]] },
  { level: 9, rime: "ing", rimeGpcs: ["i", "ng"], onsets: [["k", ["k"]], ["r", ["r"]], ["s", ["s"]], ["w", ["w"]], ["th", ["th"]]] },
  { level: 9, rime: "ink", rimeGpcs: ["i", "nk"], onsets: [["p", ["p"]], ["s", ["s"]], ["w", ["w"]], ["th", ["th"]], ["l", ["l"]]] },
  { level: 11, rime: "ain", rimeGpcs: ["ai", "n"], onsets: [["m", ["m"]], ["p", ["p"]], ["r", ["r"]], ["g", ["g"]], ["ch", ["ch"]]] },
  { level: 11, rime: "eep", rimeGpcs: ["ee", "p"], onsets: [["b", ["b"]], ["d", ["d"]], ["k", ["k"]], ["p", ["p"]], ["j", ["j"]], ["sh", ["sh"]]] },
  { level: 11, rime: "ight", rimeGpcs: ["igh", "t"], onsets: [["f", ["f"]], ["l", ["l"]], ["m", ["m"]], ["n", ["n"]], ["r", ["r"]], ["s", ["s"]], ["t", ["t"]]] },
  { level: 11, rime: "oat", rimeGpcs: ["oa", "t"], onsets: [["b", ["b"]], ["c", ["c"]], ["g", ["g"]]] },
  { level: 12, rime: "oon", rimeGpcs: ["oo", "n"], onsets: [["m", ["m"]], ["n", ["n"]], ["s", ["s"]]] },
  { level: 12, rime: "ook", rimeGpcs: ["oo(book)", "k"], onsets: [["b", ["b"]], ["c", ["c"]], ["h", ["h"]], ["l", ["l"]], ["t", ["t"]]] },
  { level: 12, rime: "ar", rimeGpcs: ["ar"], onsets: [["c", ["c"]], ["f", ["f"]], ["j", ["j"]], ["t", ["t"]]] },
  { level: 12, rime: "ork", rimeGpcs: ["or", "k"], onsets: [["c", ["c"]], ["f", ["f"]], ["p", ["p"]]] },
  { level: 13, rime: "ow", rimeGpcs: ["ow"], onsets: [["c", ["c"]], ["h", ["h"]], ["n", ["n"]], ["w", ["w"]]] },
  { level: 13, rime: "oil", rimeGpcs: ["oi", "l"], onsets: [["b", ["b"]], ["f", ["f"]], ["s", ["s"]]] },
  { level: 13, rime: "ear", rimeGpcs: ["ear"], onsets: [["h", ["h"]], ["n", ["n"]], ["d", ["d"]], ["f", ["f"]], ["y", ["y"]]] },
  { level: 14, rime: "air", rimeGpcs: ["air"], onsets: [["h", ["h"]], ["f", ["f"]], ["p", ["p"]], ["ch", ["ch"]]] },
  { level: 15, rime: "amp", rimeGpcs: ["a", "m", "p"], onsets: [["c", ["c"]], ["d", ["d"]], ["l", ["l"]], ["r", ["r"]], ["st", ["s", "t"]], ["ch", ["ch"]]] },
  { level: 15, rime: "and", rimeGpcs: ["a", "n", "d"], onsets: [["b", ["b"]], ["h", ["h"]], ["l", ["l"]], ["s", ["s"]], ["st", ["s", "t"]], ["gr", ["g", "r"]]] },
  { level: 15, rime: "est", rimeGpcs: ["e", "s", "t"], onsets: [["b", ["b"]], ["n", ["n"]], ["r", ["r"]], ["t", ["t"]], ["ch", ["ch"]], ["v", ["v"]]] },
  { level: 16, rime: "ain", rimeGpcs: ["ai", "n"], onsets: [["tr", ["t", "r"]], ["br", ["b", "r"]], ["gr", ["g", "r"]], ["dr", ["d", "r"]], ["ch", ["ch"]], ["st", ["s", "t"]]] },
  { level: 16, rime: "eep", rimeGpcs: ["ee", "p"], onsets: [["sl", ["s", "l"]], ["st", ["s", "t"]], ["sw", ["s", "w"]], ["cr", ["c", "r"]], ["sh", ["sh"]]] },
  { level: 16, rime: "eet", rimeGpcs: ["ee", "t"], onsets: [["f", ["f"]], ["m", ["m"]], ["sw", ["s", "w"]], ["sh", ["sh"]], ["str", ["s", "t", "r"]]] },
  { level: 17, rime: "ay", rimeGpcs: ["ay"], onsets: [["d", ["d"]], ["m", ["m"]], ["p", ["p"]], ["s", ["s"]], ["w", ["w"]], ["pl", ["p", "l"]], ["st", ["s", "t"]], ["tr", ["t", "r"]]] },
  { level: 17, rime: "ound", rimeGpcs: ["ou", "n", "d"], onsets: [["f", ["f"]], ["s", ["s"]], ["r", ["r"]], ["p", ["p"]], ["gr", ["g", "r"]], ["h", ["h"]]] },
  { level: 17, rime: "ie", rimeGpcs: ["ie"], onsets: [["p", ["p"]], ["t", ["t"]], ["l", ["l"]], ["d", ["d"]]] },
  { level: 18, rime: "oy", rimeGpcs: ["oy"], onsets: [["b", ["b"]], ["t", ["t"]], ["j", ["j"]]] },
  { level: 18, rime: "aw", rimeGpcs: ["aw"], onsets: [["s", ["s"]], ["p", ["p"]], ["j", ["j"]], ["r", ["r"]], ["cl", ["c", "l"]], ["dr", ["d", "r"]], ["str", ["s", "t", "r"]]] },
  { level: 19, rime: "ew", rimeGpcs: ["ew"], onsets: [["ch", ["ch"]], ["n", ["n"]], ["f", ["f"]], ["d", ["d"]], ["st", ["s", "t"]], ["bl", ["b", "l"]], ["gr", ["g", "r"]]] },
  { level: 19, rime: "eel", rimeGpcs: ["ee", "l"], onsets: [["wh", ["wh"]], ["f", ["f"]], ["h", ["h"]], ["p", ["p"]], ["st", ["s", "t"]]] },
  { level: 20, rime: "ake", rimeGpcs: ["a-e", "k"], onsets: [["b", ["b"]], ["c", ["c"]], ["l", ["l"]], ["m", ["m"]], ["r", ["r"]], ["t", ["t"]], ["w", ["w"]], ["sn", ["s", "n"]], ["sh", ["sh"]]] },
  { level: 20, rime: "ine", rimeGpcs: ["i-e", "n"], onsets: [["d", ["d"]], ["f", ["f"]], ["l", ["l"]], ["m", ["m"]], ["n", ["n"]], ["p", ["p"]], ["v", ["v"]], ["sh", ["sh"]], ["sp", ["s", "p"]]] },
  { level: 20, rime: "ope", rimeGpcs: ["o-e", "p"], onsets: [["h", ["h"]], ["r", ["r"]], ["sl", ["s", "l"]], ["sc", ["s", "c"]]] },
  { level: 21, rime: "ice", rimeGpcs: ["i-e", "c(soft)"], onsets: [["d", ["d"]], ["m", ["m"]], ["n", ["n"]], ["r", ["r"]], ["sl", ["s", "l"]], ["pr", ["p", "r"]], ["tw", ["t", "w"]], ["sp", ["s", "p"]]] },
  { level: 21, rime: "ow", rimeGpcs: ["ow(snow)"], onsets: [["sn", ["s", "n"]], ["bl", ["b", "l"]], ["gl", ["g", "l"]], ["sl", ["s", "l"]], ["gr", ["g", "r"]], ["sh", ["sh"]], ["thr", ["th", "r"]]] },
];

/* ------------------------------------------------------------------ */
/* Lookups                                                             */
/* ------------------------------------------------------------------ */

function unitData(n) { return UNITS.find((u) => u.n === Number(n)) || UNITS[0]; }
function unitsUpTo(n) { return UNITS.filter((u) => u.n <= Number(n)); }
function soundsUpTo(n) { return unitsUpTo(n).flatMap((u) => u.sounds); }
function trickyUpTo(n) { return unitsUpTo(n).flatMap((u) => u.tricky); }

const _intro = {};
UNITS.forEach((u) => { u.sounds.forEach((s) => { if (!(s in _intro)) _intro[s] = u.n; }); u.tricky.forEach((t) => { _intro["tricky:" + t.toLowerCase()] = u.n; }); });
function introLevel(gpc) { return _intro[gpc] || null; }
function trickyIntroLevel(word) { return _intro["tricky:" + String(word).toLowerCase()] || null; }

/* The level a word first becomes readable, from its explicit GPC breakdown.
 * Rules beyond "every sound taught": a -s ending needs Level 10; two
 * consonant sounds in a row need Phase 4 — Set 1 with short vowels (15),
 * Set 2 if the word also has a long vowel sound (16). Returns null for a
 * word with no breakdown or with a sound that's never taught. */
function minLevelFor(gpcs) {
  if (!gpcs || !gpcs.length) return null;
  let lvl = 1;
  let hasLong = false;
  let prevConsonant = false;
  for (const g of gpcs) {
    if (g === "-s") { lvl = Math.max(lvl, SUFFIX_S_LEVEL); prevConsonant = false; continue; }
    const intro = introLevel(g);
    if (!intro) return null;
    lvl = Math.max(lvl, intro);
    const isVowel = VOWEL_GPCS.has(g);
    if (isVowel && LONG_VOWEL_GPCS.has(g)) hasLong = true;
    if (!isVowel && prevConsonant) lvl = Math.max(lvl, ADJACENT_SHORT_LEVEL);
    prevConsonant = !isVowel;
  }
  // a second pass: if adjacency was hit and the word has a long vowel, Set 2
  if (lvl >= ADJACENT_SHORT_LEVEL && lvl < ADJACENT_LONG_LEVEL && hasLong && hasAdjacent(gpcs)) lvl = ADJACENT_LONG_LEVEL;
  return lvl;
}
function hasAdjacent(gpcs) {
  let prev = false;
  for (const g of gpcs) {
    if (g === "-s") { prev = false; continue; }
    const c = !VOWEL_GPCS.has(g);
    if (c && prev) return true;
    prev = c;
  }
  return false;
}
function minLevel(word) {
  const g = typeof WORDS !== "undefined" ? WORDS[String(word).toLowerCase()] : null;
  return minLevelFor(g);
}
/* Some tricky words stop being tricky: "and" is fully regular once adjacent
 * consonants are taught (Level 15), "her" once er is (Level 14). Little
 * Wandle footnotes these on its own lists. A word is tricky AT a level if it
 * is on the tricky list and is not yet decodable from its GPCs. Stories use
 * this to decide whether to show a word in blue. */
function isTrickyAt(word, level) {
  const w = String(word).toLowerCase();
  const tl = trickyIntroLevel(w);
  if (!tl) return false;
  const g = typeof WORDS !== "undefined" ? WORDS[w] : null;
  const ml = g ? minLevelFor(g) : null;
  return !(ml && ml <= Number(level));
}

function gpcsOf(word) {
  return typeof WORDS !== "undefined" ? WORDS[String(word).toLowerCase()] || null : null;
}

/* All words readable at or below a level, and the ones that first become
 * readable exactly at it. Computed from the word bank, so there's no
 * hand-kept per-level list to drift out of step. */
let _byLevel = null;
function _index() {
  if (_byLevel) return _byLevel;
  _byLevel = {};
  Object.keys(WORDS).forEach((w) => {
    const l = minLevelFor(WORDS[w]);
    if (!l) return;
    (_byLevel[l] = _byLevel[l] || []).push(w);
  });
  Object.values(_byLevel).forEach((a) => a.sort());
  return _byLevel;
}
function wordsAtLevel(n) { return (_index()[Number(n)] || []).slice(); }
function wordsUpTo(n) {
  const idx = _index();
  let out = [];
  for (let i = 1; i <= Number(n); i++) out = out.concat(idx[i] || []);
  return out;
}

/* Game boards: mostly the current level's words, topped up from earlier
 * ones. MUST be a pure function of its arguments — both screens build their
 * own board from the shared state (see tools/check-determinism.js). */
function gameWords(n, count, seed, minLen) {
  const sd = Number(seed) || 0;
  const recent = wordsAtLevel(n).concat(wordsAtLevel(Number(n) - 1));
  const earlier = wordsUpTo(Number(n) - 2);
  const pool = seededShuffle(recent, sd).concat(seededShuffle(earlier, sd + 977));
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

/* Sorts and wheels available at a level: those with level <= n. The
 * activity offers them most-recent first so practice tracks teaching. */
function sortsUpTo(n) { return WORD_SORTS.filter((r) => r.level <= Number(n)).sort((a, b) => b.level - a.level); }
function wheelsUpTo(n) { return WORD_WHEELS.filter((r) => r.level <= Number(n)).sort((a, b) => b.level - a.level); }
function wheelWord(wheel, i) {
  const [onset, onsetGpcs] = wheel.onsets[i];
  return { word: onset + wheel.rime, gpcs: onsetGpcs.concat(wheel.rimeGpcs) };
}

/* Display chunks for sound buttons — letter order, with a split digraph's
 * two letters both tagged so they can be drawn as a pair. */
function displayChunks(word, gpcs) {
  if (!gpcs) return [{ text: word, gpc: null }];
  const out = [];
  let i = 0;
  let pendingSplit = null;
  const w = String(word);
  for (const g of gpcs) {
    if (g === "-s") { out.push({ text: w.slice(i), gpc: "s" }); i = w.length; break; }
    if (/-e$/.test(g)) {
      out.push({ text: w[i], gpc: g, split: true });
      pendingSplit = g;
      i += 1;
      continue;
    }
    const len = g.replace(/\(.*\)$/, "").length;
    out.push({ text: w.slice(i, i + len), gpc: g });
    i += len;
  }
  if (pendingSplit && i < w.length) out.push({ text: w.slice(i), gpc: pendingSplit, split: true });
  else if (i < w.length) out.push({ text: w.slice(i), gpc: null });
  return out;
}
