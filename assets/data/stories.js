/*
 * The story library.
 *
 * These are proper little books, not loose practice sentences: each one has
 * a title, a cover, a cast, and a beginning/middle/end across five pages.
 * They're banded by the UK book-band colours (the same idea as the Story
 * Level in a volunteer reading platform), which run alongside — not in step
 * with — the numeric activity level.
 *
 * The hard rule: every word in a story must be decodable using only the
 * sounds taught at or before that band, plus the tricky words listed for it.
 * `tricky` on each page marks the words the child is NOT expected to sound
 * out — the reader screen shows those in a different colour so the grown-up
 * knows to just say them.
 *
 * All original — written for this app, with the pictures composed from the
 * SVG kit in art.js.
 */

const BANDS = [
  { id: "pink", label: "Pink", colour: "#f2a0b5", phase: "Phase 2", about: "First words. Mostly three-sound words like c-a-t, and a handful of tricky words." },
  { id: "red", label: "Red", colour: "#e05c53", phase: "Phase 3", about: "Long vowel sounds written with two or three letters — rain, night, boat." },
  { id: "yellow", label: "Yellow", colour: "#f0c249", phase: "Phase 4", about: "Longer words with sounds squashed together — jump, splash, stands." },
  { id: "blue", label: "Blue", colour: "#5b9bd5", phase: "Phase 5", about: "New spellings for familiar sounds — snow, night, cake, found." },
];

const STORIES = [
  /* ---------------------------- PINK ---------------------------- */
  {
    id: "pip-mud", band: "pink", title: "Pip in the Mud",
    blurb: "Pip the pug finds the muddiest puddle on the hill.",
    focus: ["u", "ll", "ss"],
    cover: { bg: "hill", alt: "A pug sitting on a grassy hill", items: [["pug", { x: 200, y: 205, s: 1.7 }]] },
    pages: [
      { text: "This is Pip. Pip is a pug.", tricky: ["is"],
        scene: { bg: "outdoor", alt: "Pip the pug in a field", items: [["pug", { x: 200, y: 215, s: 1.6 }], ["flowers", { x: 330, y: 235, s: 1.2 }]] } },
      { text: "Pip can run up the hill.", tricky: ["the"],
        scene: { bg: "hill", alt: "Pip running up a hill", items: [["pug", { x: 160, y: 210, s: 1.4 }], ["tree", { x: 340, y: 215, s: .8 }]] } },
      { text: "Pip sits in the mud.", tricky: ["the"],
        scene: { bg: "outdoor", alt: "Pip sitting in a muddy puddle", items: [["mud", { x: 200, y: 250, s: 1.3 }], ["pug", { x: 195, y: 222, s: 1.5, muddy: true }]] } },
      { text: "Pip is a big mess!", tricky: ["is"],
        scene: { bg: "outdoor", alt: "A very muddy pug", items: [["mud", { x: 210, y: 255, s: 1 }], ["pug", { x: 190, y: 205, s: 1.9, muddy: true }]] } },
      { text: "Pip gets in the tub. Pip had fun!", tricky: ["the"],
        scene: { bg: "indoor", alt: "Pip in the bath", items: [["tub", { x: 200, y: 215, s: 1.5 }], ["pug", { x: 200, y: 180, s: 1.1 }], ["splash", { x: 200, y: 150, s: 1.4 }]] } },
    ],
  },
  {
    id: "hen-fox", band: "pink", title: "The Hen and the Fox",
    blurb: "A fox wants to get into the shed. The hen has other plans.",
    focus: ["sh", "ng", "ff"],
    cover: { bg: "garden", alt: "A hen and a fox by a shed", items: [["shed", { x: 300, y: 195, s: 1 }], ["hen", { x: 130, y: 235, s: 1.5 }], ["fox", { x: 230, y: 245, s: 1.2, flip: true }]] },
    pages: [
      { text: "A hen sits in a shed.", tricky: [],
        scene: { bg: "garden", alt: "A hen inside a shed", items: [["shed", { x: 210, y: 190, s: 1.2 }], ["hen", { x: 210, y: 230, s: 1.3 }]] } },
      { text: "A fox is at the shed.", tricky: ["is", "the"],
        scene: { bg: "garden", alt: "A fox creeping up to the shed", items: [["shed", { x: 260, y: 190, s: 1.1 }], ["hen", { x: 265, y: 228, s: 1 }], ["fox", { x: 110, y: 245, s: 1.3 }]] } },
      { text: "The fox can not get in!", tricky: ["the"],
        scene: { bg: "garden", alt: "The fox at the shed door, shut out", items: [["shed", { x: 220, y: 190, s: 1.2 }], ["fox", { x: 120, y: 248, s: 1.4 }]] } },
      { text: "The hen has a pan. Bang! Bang!", tricky: ["the", "has"],
        scene: { bg: "garden", alt: "The hen banging a pan", items: [["hen", { x: 148, y: 232, s: 1.6 }], ["pan", { x: 248, y: 243, s: 1.25 }], ["bang", { x: 312, y: 150, s: 1.5 }]] } },
      { text: "The fox ran off. The hen can nap.", tricky: ["the"],
        scene: { bg: "garden", alt: "The fox running away while the hen rests", items: [["fox", { x: 340, y: 245, s: 1, flip: true }], ["nest", { x: 150, y: 245, s: 1.1 }], ["hen", { x: 150, y: 225, s: 1.2 }]] } },
    ],
  },
  {
    id: "sam-fish", band: "pink", title: "Sam and the Big Fish",
    blurb: "Sam has a net. The fish has a plan.",
    focus: ["ck", "qu", "sh"],
    cover: { bg: "water", alt: "A child on a rock with a net, and a big fish", items: [["rock", { x: 78, y: 168, s: 1.3 }], ["kid", { x: 78, y: 108, s: 1.05, shirt: "#f0913f" }], ["net", { x: 158, y: 138, s: 1.1 }], ["fish", { x: 300, y: 228, s: 1.6 }]] },
    pages: [
      { text: "Sam is on a rock.", tricky: ["is"],
        scene: { bg: "water", alt: "Sam sitting on a rock by the water", items: [["rock", { x: 110, y: 166, s: 1.4 }], ["kid", { x: 110, y: 104, s: 1.05, shirt: "#f0913f" }]] } },
      { text: "Sam has a net.", tricky: ["has"],
        scene: { bg: "water", alt: "Sam holding a net", items: [["rock", { x: 100, y: 168, s: 1.3 }], ["kid", { x: 100, y: 108, s: 1, shirt: "#f0913f" }], ["net", { x: 188, y: 150, s: 1.2 }]] } },
      { text: "A fish! A big fish!", tricky: [],
        scene: { bg: "water", alt: "A big fish in the water", items: [["fish", { x: 220, y: 225, s: 1.9 }], ["splash", { x: 280, y: 190, s: 1.2 }]] } },
      { text: "The fish is quick. It did not get in the net.", tricky: ["the", "is"],
        scene: { bg: "water", alt: "The fish darting past the net", items: [["net", { x: 120, y: 215, s: 1.3 }], ["fish", { x: 290, y: 220, s: 1.4 }]] } },
      { text: "Sam is wet. The fish is not!", tricky: ["is", "the"],
        scene: { bg: "water", alt: "Sam soaked, the fish swimming happily", items: [["rock", { x: 100, y: 168, s: 1.3 }], ["kid", { x: 100, y: 108, s: 1, shirt: "#4fb8a8" }], ["splash", { x: 108, y: 74, s: 1.6 }], ["fish", { x: 300, y: 232, s: 1.2 }]] } },
    ],
  },
  {
    id: "red-sock", band: "pink", title: "The Red Sock",
    blurb: "Tom's sock is missing. Somebody in this house knows where it is.",
    focus: ["ck", "x", "e"],
    cover: { bg: "indoor", alt: "A red sock on a wooden floor", items: [["sock", { x: 200, y: 190, s: 2.2 }]] },
    pages: [
      { text: "Tom has a red sock.", tricky: ["has"],
        scene: { bg: "indoor", alt: "Tom holding one red sock", items: [["kid", { x: 150, y: 160, s: 1.1, shirt: "#5b9bd5" }], ["sock", { x: 265, y: 190, s: 1.3 }]] } },
      { text: "The sock is not on his leg.", tricky: ["the", "is", "his"],
        scene: { bg: "indoor", alt: "Tom looking at his bare foot", items: [["kid", { x: 200, y: 160, s: 1.3, shirt: "#5b9bd5" }]] } },
      { text: "Is it in the box? No!", tricky: ["is", "the", "no"],
        scene: { bg: "indoor", alt: "An open box with no sock in it", items: [["box", { x: 200, y: 195, s: 1.6 }]] } },
      { text: "Is it in the bin? No!", tricky: ["is", "the", "no"],
        scene: { bg: "indoor", alt: "A bin with no sock in it", items: [["bin", { x: 200, y: 190, s: 1.6 }]] } },
      { text: "Sid the dog has it! Bad dog, Sid!", tricky: ["the", "has"],
        scene: { bg: "indoor", alt: "A dog with the red sock", items: [["dog", { x: 190, y: 200, s: 1.5 }], ["sock", { x: 285, y: 195, s: 1.1 }]] } },
    ],
  },

  /* ---------------------------- RED ---------------------------- */
  {
    id: "pip-rain", band: "red", title: "Pip and the Rain",
    blurb: "Pip is out in the sun when the rain comes. Who else is hiding in the shed?",
    focus: ["ai", "ar", "oo"],
    cover: { bg: "outdoor", alt: "Pip the pug in the rain", items: [["pug", { x: 200, y: 220, s: 1.6 }], ["rain", { x: 200, y: 110, s: 1.3 }]] },
    pages: [
      { text: "Pip the pug sits in the sun.", tricky: ["the"],
        scene: { bg: "outdoor", alt: "Pip sunbathing", items: [["pug", { x: 190, y: 218, s: 1.6 }], ["flowers", { x: 320, y: 240, s: 1.1 }]] } },
      { text: "Then it rains on Pip.", tricky: [],
        scene: { bg: "outdoor", alt: "Rain falling on Pip", items: [["rain", { x: 200, y: 120, s: 1.4 }], ["pug", { x: 190, y: 225, s: 1.4 }]] } },
      { text: "Pip runs to the shed. It is dark in the shed.", tricky: ["to", "the", "is"],
        scene: { bg: "outdoor", alt: "Pip running to a shed in the rain", items: [["rain", { x: 130, y: 110, s: 1.1 }], ["shed", { x: 290, y: 195, s: 1.1 }], ["pug", { x: 140, y: 230, s: 1.2 }]] } },
      { text: "A cat is in the shed too!", tricky: ["is", "the"],
        scene: { bg: "outdoor", alt: "A cat already sheltering in the shed", items: [["shed", { x: 210, y: 190, s: 1.3 }], ["cat", { x: 210, y: 232, s: 1.1 }]] } },
      { text: "Pip and the cat wait for the sun.", tricky: ["the"],
        scene: { bg: "outdoor", alt: "Pip and the cat waiting together", items: [["shed", { x: 220, y: 190, s: 1.2 }], ["pug", { x: 160, y: 235, s: 1.1 }], ["cat", { x: 255, y: 238, s: 1 }], ["sun", { x: 350, y: 55, s: .8 }]] } },
    ],
  },
  {
    id: "meg-coin", band: "red", title: "Meg and the Coin",
    blurb: "Meg drops her coin in the pool. A fish decides to help.",
    focus: ["oi", "ee", "ear"],
    cover: { bg: "water", alt: "A gold coin sinking in blue water", items: [["coin", { x: 200, y: 190, s: 2.4 }], ["fish", { x: 300, y: 235, s: 1.1 }]] },
    pages: [
      { text: "Meg had a coin. The coin was hers.", tricky: ["the", "was"],
        scene: { bg: "garden", alt: "Meg holding her coin", items: [["kid", { x: 180, y: 170, s: 1.2, long: true, shirt: "#9b7fd4" }], ["coin", { x: 250, y: 185, s: 1.4 }]] } },
      { text: "The coin fell in the pool.", tricky: ["the"],
        scene: { bg: "water", alt: "The coin falling into the water", items: [["coin", { x: 210, y: 150, s: 1.5 }], ["splash", { x: 210, y: 185, s: 1.3 }]] } },
      { text: "Meg sees a fish. The fish has the coin!", tricky: ["the", "has"],
        scene: { bg: "water", alt: "A fish holding the coin", items: [["fish", { x: 200, y: 225, s: 1.8 }], ["coin", { x: 148, y: 222, s: 1 }]] } },
      { text: "The fish is near Meg.", tricky: ["the", "is"],
        scene: { bg: "water", alt: "The fish swimming up to Meg", items: [["rock", { x: 90, y: 164, s: 1.2 }], ["kid", { x: 90, y: 106, s: 1, long: true, shirt: "#9b7fd4" }], ["fish", { x: 250, y: 224, s: 1.4 }]] } },
      { text: "Meg gets the coin back. Good fish!", tricky: ["the"],
        scene: { bg: "water", alt: "Meg holding the coin again, waving at the fish", items: [["rock", { x: 95, y: 164, s: 1.2 }], ["kid", { x: 95, y: 106, s: 1.05, long: true, shirt: "#9b7fd4" }], ["coin", { x: 158, y: 126, s: 1.2 }], ["fish", { x: 300, y: 232, s: 1.2 }]] } },
    ],
  },
  {
    id: "cat-dark", band: "red", title: "The Cat in the Dark",
    blurb: "It is late, and a cat is a long way from home.",
    focus: ["igh", "oo", "ow"],
    cover: { bg: "night", alt: "A cat under a big moon", items: [["moon", { x: 320, y: 60, s: 1.1 }], ["cat", { x: 180, y: 240, s: 1.6 }]] },
    pages: [
      { text: "It is night. The moon is up.", tricky: ["is", "the"],
        scene: { bg: "night", alt: "A full moon over dark hills", items: [["moon", { x: 250, y: 80, s: 1.4 }]] } },
      { text: "A cat sits in the dark.", tricky: ["the"],
        scene: { bg: "night", alt: "A cat alone in the dark", items: [["cat", { x: 200, y: 245, s: 1.5 }]] } },
      { text: "The cat sees a light.", tricky: ["the"],
        scene: { bg: "night", alt: "A lit window in the distance", items: [["shed", { x: 300, y: 215, s: .9 }], ["star", { x: 300, y: 190, s: 1.2 }], ["cat", { x: 130, y: 248, s: 1.2 }]] } },
      { text: "It is Tom! Tom has food for the cat.", tricky: ["is", "has", "the"],
        scene: { bg: "indoor", alt: "Tom putting down a bowl of food", items: [["kid", { x: 130, y: 165, s: 1.1, shirt: "#e05c53" }], ["bowl", { x: 250, y: 215, s: 1.3 }], ["cat", { x: 310, y: 215, s: 1 }]] } },
      { text: "Now the cat is in bed.", tricky: ["the", "is"],
        scene: { bg: "indoor", alt: "The cat curled up asleep on a bed", items: [["bed", { x: 200, y: 215, s: 1.4 }], ["cat", { x: 195, y: 180, s: 1 }]] } },
    ],
  },

  /* ---------------------------- YELLOW ---------------------------- */
  {
    id: "ben-ducks", band: "yellow", title: "Ben and the Ducks",
    blurb: "Ben brings a bag of crusts to the pond. The ducks are ready.",
    focus: ["-nd", "-mp", "spl"],
    cover: { bg: "water", alt: "Ducks crowding round a child at a pond", items: [["kid", { x: 80, y: 110, s: 1.05, shirt: "#5aa85f" }], ["duck", { x: 230, y: 212, s: 1.25 }], ["duck", { x: 320, y: 240, s: 1.1 }]] },
    pages: [
      { text: "Ben went to the pond with Mum.", tricky: ["to", "the"],
        scene: { bg: "water", alt: "Ben and Mum arriving at the pond", items: [["kid", { x: 110, y: 112, s: .95, shirt: "#5aa85f" }], ["kid", { x: 180, y: 100, s: 1.15, long: true, shirt: "#f2a0b5" }]] } },
      { text: "They had a bag of crusts.", tricky: ["they", "of"],
        scene: { bg: "water", alt: "A paper bag full of bread crusts", items: [["kid", { x: 130, y: 112, s: 1, shirt: "#5aa85f" }], ["bag", { x: 240, y: 150, s: 1.6 }]] } },
      { text: "Ducks! Lots and lots of ducks!", tricky: ["of"],
        scene: { bg: "water", alt: "A crowd of ducks swimming over", items: [["duck", { x: 90, y: 210, s: 1 }], ["duck", { x: 180, y: 235, s: 1.1 }], ["duck", { x: 275, y: 205, s: .95 }], ["duck", { x: 340, y: 240, s: 1.05 }]] } },
      { text: "The ducks jump and splash for the crusts.", tricky: ["the"],
        scene: { bg: "water", alt: "Ducks splashing for bread", items: [["duck", { x: 130, y: 220, s: 1.2 }], ["splash", { x: 200, y: 195, s: 1.5 }], ["duck", { x: 280, y: 230, s: 1.1 }]] } },
      { text: "One duck stands on Ben's foot!", tricky: ["one"],
        scene: { bg: "water", alt: "A duck standing on Ben's foot", items: [["kid", { x: 160, y: 112, s: 1.2, shirt: "#5aa85f" }], ["duck", { x: 258, y: 222, s: 1.15 }]] } },
    ],
  },
  {
    id: "big-wind", band: "yellow", title: "The Big Wind",
    blurb: "Tom's hat goes up, and up, and up.",
    focus: ["-st", "-nk", "tr"],
    cover: { bg: "hill", alt: "A purple hat blowing away over a hill", items: [["hat", { x: 250, y: 110, s: 1.8 }], ["kid", { x: 120, y: 200, s: 1, shirt: "#f0913f" }]] },
    pages: [
      { text: "The wind was fast.", tricky: ["the", "was"],
        scene: { bg: "hill", alt: "Wind sweeping over a hill", items: [["tree", { x: 320, y: 210, s: .9 }], ["kid", { x: 140, y: 205, s: 1.05, shirt: "#f0913f" }], ["hat", { x: 140, y: 152, s: .9 }]] } },
      { text: "The wind took Tom's hat!", tricky: ["the"],
        scene: { bg: "hill", alt: "The hat lifting off Tom's head", items: [["kid", { x: 140, y: 210, s: 1.05, shirt: "#f0913f" }], ["hat", { x: 230, y: 120, s: 1.2 }]] } },
      { text: "The hat went up and up.", tricky: ["the"],
        scene: { bg: "outdoor", alt: "The hat high in the sky", items: [["hat", { x: 210, y: 70, s: 1.3 }], ["kid", { x: 120, y: 210, s: .9, shirt: "#f0913f" }]] } },
      { text: "It got stuck in a tree.", tricky: [],
        scene: { bg: "outdoor", alt: "The hat stuck in the branches of a tree", items: [["tree", { x: 230, y: 205, s: 1.3 }], ["hat", { x: 245, y: 165, s: 1 }], ["kid", { x: 90, y: 215, s: .9, shirt: "#f0913f" }]] } },
      { text: "Dad got it back. “Thanks, Dad!” said Tom.", tricky: ["said"],
        scene: { bg: "outdoor", alt: "Dad handing the hat back to Tom", items: [["tree", { x: 330, y: 205, s: 1 }], ["kid", { x: 130, y: 195, s: 1.25, shirt: "#5b9bd5" }], ["kid", { x: 235, y: 212, s: .95, shirt: "#f0913f" }], ["hat", { x: 185, y: 175, s: .9 }]] } },
    ],
  },

  /* ---------------------------- BLUE ---------------------------- */
  {
    id: "cake-gran", band: "blue", title: "A Cake for Gran",
    blurb: "Nell makes a birthday cake, and gives away the best bit.",
    focus: ["a-e", "i-e", "ir"],
    cover: { bg: "indoor", alt: "A birthday cake with a candle", items: [["cake", { x: 200, y: 195, s: 2.2 }]] },
    pages: [
      { text: "It was Gran’s birthday.", tricky: ["was"],
        scene: { bg: "indoor", alt: "A kitchen ready for baking", items: [["kid", { x: 145, y: 165, s: 1.1, long: true, shirt: "#f2a0b5" }], ["bowl", { x: 250, y: 205, s: 1.4 }]] } },
      { text: "Nell and Mum made a cake.", tricky: [],
        scene: { bg: "indoor", alt: "Nell and Mum mixing a cake", items: [["kid", { x: 120, y: 170, s: 1.05, long: true, shirt: "#f2a0b5" }], ["kid", { x: 205, y: 158, s: 1.2, long: true, shirt: "#4fb8a8" }], ["bowl", { x: 300, y: 205, s: 1.3 }]] } },
      { text: "They put nine candles on top.", tricky: ["they", "put"],
        scene: { bg: "indoor", alt: "A cake with candles on it", items: [["cake", { x: 200, y: 200, s: 1.9 }]] } },
      { text: "Gran came in. “Oh! What a cake!” she said.", tricky: ["oh", "what", "said", "she"],
        scene: { bg: "indoor", alt: "Gran delighted by the cake", items: [["kid", { x: 130, y: 165, s: 1.25, long: true, shirt: "#9b7fd4" }], ["cake", { x: 265, y: 200, s: 1.4 }]] } },
      { text: "Nell gave Gran the first slice.", tricky: ["the"],
        scene: { bg: "indoor", alt: "Nell giving Gran a slice of cake", items: [["kid", { x: 125, y: 170, s: 1.05, long: true, shirt: "#f2a0b5" }], ["cake", { x: 215, y: 200, s: 1.2 }], ["kid", { x: 310, y: 165, s: 1.2, long: true, shirt: "#9b7fd4" }]] } },
    ],
  },
  {
    id: "snow-day", band: "blue", title: "Snow Day",
    blurb: "Deep snow, a huge snowman, and hot toast at the end of it.",
    focus: ["ow", "oe", "ou"],
    cover: { bg: "snow", alt: "A snowman in deep snow", items: [["snowman", { x: 200, y: 215, s: 1.5 }]] },
    pages: [
      { text: "Snow! Deep white snow.", tricky: [],
        scene: { bg: "snow", alt: "A snowy field", items: [["tree", { x: 330, y: 210, s: .9 }]] } },
      { text: "Joe and Kate found their coats and boots.", tricky: ["their"],
        scene: { bg: "indoor", alt: "Two children in coats and boots", items: [["kid", { x: 140, y: 165, s: 1.1, shirt: "#e05c53" }], ["kid", { x: 240, y: 165, s: 1.1, long: true, shirt: "#5b9bd5" }]] } },
      { text: "They made a huge snowman.", tricky: ["they"],
        scene: { bg: "snow", alt: "Children building a big snowman", items: [["snowman", { x: 215, y: 220, s: 1.4 }], ["kid", { x: 90, y: 215, s: .9, shirt: "#e05c53" }]] } },
      { text: "He had a carrot nose and a black hat.", tricky: ["he"],
        scene: { bg: "snow", alt: "Close up of the snowman's face", items: [["snowman", { x: 200, y: 245, s: 2 }]] } },
      { text: "Then they went inside for hot toast.", tricky: ["they"],
        scene: { bg: "indoor", alt: "Two children warm indoors with toast", items: [["kid", { x: 145, y: 168, s: 1.1, shirt: "#e05c53" }], ["kid", { x: 250, y: 168, s: 1.1, long: true, shirt: "#5b9bd5" }]] } },
    ],
  },
];

function storiesForBand(band) {
  return STORIES.filter((s) => s.band === band);
}
function storyById(id) {
  return STORIES.find((s) => s.id === id);
}
function bandData(id) {
  return BANDS.find((b) => b.id === id) || BANDS[0];
}
