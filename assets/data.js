/*
 * PHONICS_DATA
 * ------------
 * Content for the Reading Den, aligned to the published phase structure of
 * "Little Wandle Letters and Sounds Revised" (Phases 2-5).
 *
 * IMPORTANT — read this before you trust the exact grouping:
 * The phase order (which GPCs come before which) is well-established and
 * consistent across Little Wandle's own materials and the schools that
 * publish their overviews. The exact WEEK a school reaches any given sound
 * varies (holidays, catch-up, individual pace), so this file groups sounds
 * into "sets" within each phase rather than claiming e.g. "this is week 4".
 * Use the checklist in the Coach panel to mark off what your son's school
 * has actually sent home, and the app will follow that instead of guessing.
 *
 * This is an independent, original resource. It is not produced, endorsed,
 * or reviewed by Wandle Learning Trust / Little Wandle, and it is not a
 * copy of any commercial or charity reading platform. Sources cross-checked
 * September 2026: littlewandlelettersandsounds.org.uk, littlewandle.org.uk,
 * and several schools' published phonics overviews. If anything here ever
 * conflicts with what comes home in your son's book bag, his school's
 * version wins — always.
 */

const PHONICS_DATA = {
  phases: {
    2: {
      name: "Phase 2",
      subtitle: "First sounds & simple words (typically Reception, Autumn term)",
      blurb:
        "The first set of letter-sounds (GPCs) and the first tricky words. " +
        "By the end of Phase 2 most children can blend sounds to read simple " +
        "CVC words like 'cat' and 'shop'.",
      sets: [
        { id: "2-a", label: "Set 1", gpcs: ["s", "a", "t", "p"] },
        { id: "2-b", label: "Set 2", gpcs: ["i", "n", "m", "d"] },
        { id: "2-c", label: "Set 3", gpcs: ["g", "o", "c", "k"] },
        { id: "2-d", label: "Set 4", gpcs: ["ck", "e", "u", "r"] },
        { id: "2-e", label: "Set 5", gpcs: ["h", "b", "f", "ff", "l", "ll", "ss"] },
        { id: "2-f", label: "Set 6", gpcs: ["j", "v", "w", "x"] },
        { id: "2-g", label: "Set 7", gpcs: ["y", "z", "zz", "qu"] },
        { id: "2-h", label: "Set 8 (digraphs)", gpcs: ["ch", "sh", "th", "ng", "nk"] },
      ],
      trickyWords: ["I", "the", "to", "no", "go", "into"],
      words: [
        { set: "2-a", word: "sat", chunks: ["s", "a", "t"] },
        { set: "2-a", word: "tap", chunks: ["t", "a", "p"] },
        { set: "2-a", word: "pat", chunks: ["p", "a", "t"] },
        { set: "2-a", word: "as", chunks: ["a", "s"] },
        { set: "2-b", word: "sit", chunks: ["s", "i", "t"] },
        { set: "2-b", word: "pin", chunks: ["p", "i", "n"] },
        { set: "2-b", word: "man", chunks: ["m", "a", "n"] },
        { set: "2-b", word: "sad", chunks: ["s", "a", "d"] },
        { set: "2-c", word: "dog", chunks: ["d", "o", "g"] },
        { set: "2-c", word: "cat", chunks: ["c", "a", "t"] },
        { set: "2-c", word: "cot", chunks: ["c", "o", "t"] },
        { set: "2-c", word: "cap", chunks: ["c", "a", "p"] },
        { set: "2-d", word: "sock", chunks: ["s", "o", "ck"] },
        { set: "2-d", word: "red", chunks: ["r", "e", "d"] },
        { set: "2-d", word: "run", chunks: ["r", "u", "n"] },
        { set: "2-d", word: "cup", chunks: ["c", "u", "p"] },
        { set: "2-e", word: "hat", chunks: ["h", "a", "t"] },
        { set: "2-e", word: "big", chunks: ["b", "i", "g"] },
        { set: "2-e", word: "fun", chunks: ["f", "u", "n"] },
        { set: "2-e", word: "hill", chunks: ["h", "i", "ll"] },
        { set: "2-e", word: "miss", chunks: ["m", "i", "ss"] },
        { set: "2-e", word: "off", chunks: ["o", "ff"] },
        { set: "2-f", word: "jam", chunks: ["j", "a", "m"] },
        { set: "2-f", word: "van", chunks: ["v", "a", "n"] },
        { set: "2-f", word: "wig", chunks: ["w", "i", "g"] },
        { set: "2-f", word: "fox", chunks: ["f", "o", "x"] },
        { set: "2-g", word: "yes", chunks: ["y", "e", "s"] },
        { set: "2-g", word: "zip", chunks: ["z", "i", "p"] },
        { set: "2-g", word: "buzz", chunks: ["b", "u", "zz"] },
        { set: "2-g", word: "quiz", chunks: ["qu", "i", "z"] },
        { set: "2-h", word: "chip", chunks: ["ch", "i", "p"] },
        { set: "2-h", word: "shop", chunks: ["sh", "o", "p"] },
        { set: "2-h", word: "thin", chunks: ["th", "i", "n"] },
        { set: "2-h", word: "king", chunks: ["k", "i", "ng"] },
        { set: "2-h", word: "sink", chunks: ["s", "i", "nk"] },
      ],
      sentences: [
        { text: "I sit on the mat.", tricky: ["I", "the"] },
        { text: "The cat can run and jump.", tricky: ["The"] },
        { text: "Go to the shop and get a bun.", tricky: ["Go", "the"] },
        { text: "No dog can quack!", tricky: ["No"] },
        { text: "I can get the bug in a cup.", tricky: ["I", "the"] },
        { text: "The fox ran into the den.", tricky: ["The", "into"] },
      ],
      alienWords: ["baf", "shom", "nug", "quep", "tharg", "fesk"],
    },

    3: {
      name: "Phase 3",
      subtitle: "Long vowel sounds (typically Reception, Spring term)",
      blurb:
        "New graphemes made of two or more letters for one sound (e.g. 'ai' " +
        "in rain), so children can read a much wider range of words.",
      sets: [
        { id: "3-a", label: "Set 1", gpcs: ["ai", "ee", "igh", "oa"] },
        {
          id: "3-b",
          label: "Set 2",
          gpcs: [
            { gpc: "oo", note: "long, as in moon", example: "moon" },
            { gpc: "oo", note: "short, as in book", example: "book" },
            "ar",
            "or",
          ],
        },
        { id: "3-c", label: "Set 3", gpcs: ["ur", "ow", "oi"] },
        { id: "3-d", label: "Set 4", gpcs: ["ear", "air", "er"] },
      ],
      trickyWords: ["he", "she", "we", "me", "be", "was", "my", "you", "they", "her", "all", "are"],
      words: [
        { set: "3-a", word: "rain", chunks: ["r", "ai", "n"] },
        { set: "3-a", word: "feet", chunks: ["f", "ee", "t"] },
        { set: "3-a", word: "night", chunks: ["n", "igh", "t"] },
        { set: "3-a", word: "boat", chunks: ["b", "oa", "t"] },
        { set: "3-a", word: "tail", chunks: ["t", "ai", "l"] },
        { set: "3-a", word: "seed", chunks: ["s", "ee", "d"] },
        { set: "3-b", word: "moon", chunks: ["m", "oo", "n"] },
        { set: "3-b", word: "food", chunks: ["f", "oo", "d"] },
        { set: "3-b", word: "book", chunks: ["b", "oo", "k"] },
        { set: "3-b", word: "look", chunks: ["l", "oo", "k"] },
        { set: "3-b", word: "car", chunks: ["c", "ar"] },
        { set: "3-b", word: "star", chunks: ["s", "t", "ar"] },
        { set: "3-b", word: "for", chunks: ["f", "or"] },
        { set: "3-b", word: "fork", chunks: ["f", "or", "k"] },
        { set: "3-c", word: "fur", chunks: ["f", "ur"] },
        { set: "3-c", word: "hurt", chunks: ["h", "ur", "t"] },
        { set: "3-c", word: "cow", chunks: ["c", "ow"] },
        { set: "3-c", word: "brown", chunks: ["b", "r", "ow", "n"] },
        { set: "3-c", word: "coin", chunks: ["c", "oi", "n"] },
        { set: "3-c", word: "boil", chunks: ["b", "oi", "l"] },
        { set: "3-d", word: "hear", chunks: ["h", "ear"] },
        { set: "3-d", word: "ear", chunks: ["ear"] },
        { set: "3-d", word: "fair", chunks: ["f", "air"] },
        { set: "3-d", word: "hair", chunks: ["h", "air"] },
        { set: "3-d", word: "her", chunks: ["h", "er"] },
        { set: "3-d", word: "under", chunks: ["u", "n", "d", "er"] },
      ],
      sentences: [
        { text: "She can see a star in the night sky.", tricky: ["She"] },
        { text: "We go to play in the rain.", tricky: ["We"] },
        { text: "He got a red boat.", tricky: ["He"] },
        { text: "They look for the moon.", tricky: ["They"] },
        { text: "My dog can run and jump.", tricky: ["My"] },
        { text: "Was that a big brown cow?", tricky: ["Was"] },
      ],
      alienWords: ["blaice", "hoit", "spoon", "flair", "throo", "dernt"],
    },

    4: {
      name: "Phase 4",
      subtitle: "Tricky consonant blends (typically Reception, Summer term)",
      blurb:
        "No brand-new sounds — the challenge now is reading and spelling " +
        "words with sounds squashed together, like the 'fr' in frog or the " +
        "'mp' in stamp.",
      // No new GPCs are taught in Phase 4, so there's no "Sound Cards"
      // activity for it — see noNewSounds below.
      noNewSounds: true,
      sets: [
        { id: "4-a", label: "Set 1", gpcs: ["Adjacent consonants — start of word"] },
        { id: "4-b", label: "Set 2", gpcs: ["Adjacent consonants — end of word"] },
      ],
      trickyWords: ["said", "have", "like", "so", "do", "some", "come", "were", "there", "little", "one", "out", "when", "what"],
      words: [
        { set: "4-a", word: "frog", chunks: ["f", "r", "o", "g"] },
        { set: "4-a", word: "black", chunks: ["b", "l", "a", "ck"] },
        { set: "4-a", word: "green", chunks: ["g", "r", "ee", "n"] },
        { set: "4-a", word: "flag", chunks: ["f", "l", "a", "g"] },
        { set: "4-a", word: "swim", chunks: ["s", "w", "i", "m"] },
        { set: "4-a", word: "stop", chunks: ["s", "t", "o", "p"] },
        { set: "4-b", word: "stamp", chunks: ["s", "t", "a", "m", "p"] },
        { set: "4-b", word: "crisp", chunks: ["c", "r", "i", "s", "p"] },
        { set: "4-b", word: "drink", chunks: ["d", "r", "i", "nk"] },
        { set: "4-b", word: "plant", chunks: ["p", "l", "a", "n", "t"] },
        { set: "4-b", word: "milk", chunks: ["m", "i", "l", "k"] },
        { set: "4-b", word: "desk", chunks: ["d", "e", "s", "k"] },
      ],
      sentences: [
        { text: "Mum said we can go out and play.", tricky: ["said", "we", "out"] },
        { text: "We have some crisps in a black bag.", tricky: ["We", "have", "some"] },
        { text: "There were frogs near the pond.", tricky: ["There", "were", "the"] },
        { text: "I like my little green frog.", tricky: ["I", "like", "my", "little"] },
      ],
      alienWords: ["stend", "glim", "thrusp", "blonk", "snunk"],
    },

    5: {
      name: "Phase 5",
      subtitle: "More ways to spell the same sound (typically Year 1)",
      blurb:
        "Children already know a sound for every letter and digraph — now " +
        "they meet extra spellings for sounds they know (like 'ay' as well " +
        "as 'ai'), and extra sounds for spellings they know (like 'ea' in " +
        "bread as well as in eat).",
      sets: [
        { id: "5-a", label: "Set 1", gpcs: ["ay", "ou", "ie", "ea"] },
        { id: "5-b", label: "Set 2", gpcs: ["oy", "ir", "ue", "aw"] },
        { id: "5-c", label: "Set 3", gpcs: ["wh", "ph", "ew", "oe", "au"] },
        { id: "5-d", label: "Set 4 (split digraphs)", gpcs: ["a-e", "e-e", "i-e", "o-e", "u-e"] },
      ],
      trickyWords: [
        "oh", "their", "people", "Mr", "Mrs", "looked", "called", "asked",
        "could", "water", "who", "again", "thought", "through", "work",
        "many", "because", "different", "any", "once", "laughed", "friends",
      ],
      words: [
        { set: "5-a", word: "day", chunks: ["d", "ay"] },
        { set: "5-a", word: "play", chunks: ["p", "l", "ay"] },
        { set: "5-a", word: "loud", chunks: ["l", "ou", "d"] },
        { set: "5-a", word: "tie", chunks: ["t", "ie"] },
        { set: "5-a", word: "eat", chunks: ["ea", "t"] },
        { set: "5-a", word: "bread", chunks: ["b", "r", "ea", "d"] },
        { set: "5-b", word: "boy", chunks: ["b", "oy"] },
        { set: "5-b", word: "bird", chunks: ["b", "ir", "d"] },
        { set: "5-b", word: "blue", chunks: ["b", "l", "ue"] },
        { set: "5-b", word: "paw", chunks: ["p", "aw"] },
        { set: "5-c", word: "when", chunks: ["wh", "e", "n"] },
        { set: "5-c", word: "phone", chunks: ["ph", "o-e"] },
        { set: "5-c", word: "chew", chunks: ["ch", "ew"] },
        { set: "5-c", word: "toe", chunks: ["t", "oe"] },
        { set: "5-c", word: "sauce", chunks: ["s", "au", "ce"] },
        { set: "5-d", word: "cake", chunks: ["c", "a-e", "k"] },
        { set: "5-d", word: "bike", chunks: ["b", "i-e", "k"] },
        { set: "5-d", word: "home", chunks: ["h", "o-e", "m"] },
        { set: "5-d", word: "cute", chunks: ["c", "u-e", "t"] },
        { set: "5-d", word: "these", chunks: ["th", "e-e", "s"] },
      ],
      sentences: [
        { text: "The girl looked out of the window and saw a bird.", tricky: ["looked", "the"] },
        { text: "We could hear the waves near the sea.", tricky: ["We", "could", "the"] },
        { text: "There was once a cute little mouse who liked cake.", tricky: ["There", "was", "once", "who"] },
        { text: "My friends and I laughed because the joke was funny.", tricky: ["My", "friends", "I", "laughed", "because", "the", "was"] },
      ],
      alienWords: ["fleight", "throy", "spirn", "glaw", "thane", "crode"],
    },
  },
};

// Handy flat lookup: every GPC introduced up to and including a given phase,
// used to decide what counts as "known" for building word/sentence banks
// later if you extend this file.
PHONICS_DATA.allSetsInOrder = Object.keys(PHONICS_DATA.phases)
  .sort()
  .flatMap((p) => PHONICS_DATA.phases[p].sets.map((s) => ({ phase: p, ...s })));
