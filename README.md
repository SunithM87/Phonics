# The Reading Den 📖

A two-screen reading session for one grown-up and one child at home: a
**reader portal** with the controls, and a **child's screen** with just the
story or game on it. Built around the Little Wandle Letters and Sounds
Revised progression, because that's the scheme the school uses.

No build step, no accounts, no internet needed once it's on the machine.

---

## What's in it

**Seven activities**, reachable from the sidebar, the same shape of session a
school reading volunteer runs:

| | |
|---|---|
| **Flashcards** | Sound tiles and tricky words. Pick a sound, send an example word to his screen, mark ✓ / ✗. Tiles keep their colour, so the record builds up over sessions. |
| **Stories** | Eleven illustrated decodable books — see below. |
| **Word Sort** | Numbered words to sort into coloured bins by the sound they contain. He says "number four goes in the red box". |
| **3 in a Row** | Noughts and crosses on a 3×3 grid of words. Read the word to claim the square. You against him — click once for ✕, twice for ○. |
| **Mystery Word** | You pick a secret word, he guesses letters. Wrong guesses cost a star. Five stars and it's revealed. |
| **Word Wheel** | A rime in the middle, onsets round the outside — turn it and he reads a whole rhyming family: cat, hat, mat, pat, rat, sat. |
| **Whiteboard** | Type sounds or words, drag them around. Good for pulling a word apart and pushing it back together. |

Plus **Send a Sticker** — pops a big emoji on his screen. Worth saving for
something he found hard.

### The stories

Eleven proper little books, not practice sentences: a title, a cover, a cast,
and a beginning/middle/end over five pages. Pip the pug turns up in two of
them, which for a four-year-old is most of the appeal.

Every book is banded, and **every word is checked to be decodable at that
band** — not by eye, but by `tools/check-decodable.js`, which segments each
word into graphemes and fails if one can't be read with the sounds taught by
that point.

Tricky words are marked in the data and shown in blue on the page, so you
know at a glance which words to just tell him rather than make him sound out.
Click any word on your screen and it highlights on his.

Pictures are composed from an original SVG kit (`assets/data/art.js`) — one
shared cast and prop set, so characters stay recognisable page to page.

---

## Running it

Open `index.html` in a browser. That's genuinely it — everything works from
the local file, with the two screens syncing through the browser's own
storage if you keep them in tabs of the same browser.

For two *devices* (your laptop and his tablet), you need the sync server:

```
cd server && npm install        # once — pulls one dependency, ws
cd .. && PUBLIC_DIR="$PWD" STATE_FILE="$PWD/deploy/data/state.json" node server/server.js
# then open http://<your-machine>:8000 on both devices
```

Or run it properly on a NAS — see below.

Look for the pill at the top right of the portal: **● Synced to his screen**
means both screens are live; **● This device only** means there's no server,
which is still perfectly usable on one screen.

---

## Hosting it on a NAS

UGOS (the UGREEN NAS OS) has no built-in static-site host, so this runs as a
small Docker container: `server/` is a tiny Node server (one dependency) that
serves the site *and* keeps every screen in sync over a WebSocket.
`deploy/docker-compose.yml` builds and runs it.

The compose file is already set up for this machine: the repo at
**`/volume1/Windows/Reading Den`**, served on **port 8000**. If either of
those ever changes, they're the first thing in `deploy/docker-compose.yml`.

1. **Copy the folder to `/volume1/Windows/Reading Den`** — easiest is to map
   the NAS as a network drive and drag it over. Keep the folder structure
   as-is; `deploy/data` is created automatically on first run.
2. **App Center → Docker → Install** (current DXP / DH4300 Plus models
   support it; the entry-level DH2300 doesn't).
3. **Docker → Project**, point it at
   `/volume1/Windows/Reading Den/deploy/docker-compose.yml`.
   If the Project UI won't handle the `build:` section, enable SSH
   (Control Panel → Terminal) and run `docker compose up -d --build` once
   from the `deploy` folder instead.
4. Open `http://<nas-ip>:8000` on any device in the house.

The folder name has a space in it, which is the usual way compose bind
mounts break — so the volumes use the long `type: bind` form rather than
the one-line `source:target:ro` string, which splits on colons. Verified
end to end against a copy of the app at a path with a space in it.

**Two things worth knowing:**

- **Don't port-forward this.** There's no login and no accounts, by design —
  it's one family's shared state. That's fine on your own LAN and a bad idea
  on the open internet.
- **His progress lives in
  `/volume1/Windows/Reading Den/deploy/data/state.json`.** It's the record of
  which sounds and tricky words he's got, and which books he's read. Worth
  including in whatever you already back up.

---

## Levels

Two separate level systems, which is how reading platforms actually do it,
because they move independently:

**Activity Level 1–6** drives flashcards and games. It follows the published
Little Wandle Reception and Year 1 programme — four new sounds a week — so
Level 1 is Reception Autumn 1 (`s a t p` / `i n m d` / `g o c k` / `ck e u r`
/ `h b f l`, tricky words *is, I, the*) and it builds from there. The order,
the weekly grouping and the tricky-word lists were taken from the published
Little Wandle programme overview and pacing document, and the tricky-word
counts match the official lists exactly (22 / 9 / 18 / 34 for Phases 2–5).

**Story Level** is a book-band colour — Pink, Red, Yellow, Blue.

> **An honest caveat on the band colours.** Book bands are near-universal in
> UK schools, but they are **not** a Little Wandle thing. Little Wandle
> labels books by *Phase and Set*, and Collins — who publish the official
> Little Wandle readers — print "Phase 4 Set 2" on the back, not a colour.
> Every phase→colour mapping out there is a school-made chart, and the ones
> I checked disagree with each other by about a term. Pink≈Phase 2 and
> Red≈Phase 3 are solid; above that it gets fuzzy (Yellow is only Phase 4
> Set 1; Blue covers Phase 4 Set 2 *and* early Phase 5). Treat the colour as
> a rough guide and go by what comes home in his book bag.

---

## Why it looks the way it does

Two typefaces, deliberately:

- **Andika** for everything *he* reads — words, letters, story text, game
  tiles. It's SIL's typeface for early literacy: single-storey `a` and `g`,
  unambiguous `l`/`I`/`1`. Those are the letterforms he's being taught to
  write, which matters more at four than typographic elegance does. It's
  self-hosted in `assets/fonts` (SIL Open Font Licence, included), so it
  works offline and doesn't call out to Google.
- **The system UI font** for everything *you* read, so the portal looks like
  software rather than a nursery wall.

No Comic Sans anywhere.

---

## Project layout

```
index.html, coach.html, play.html   landing / reader portal / child's screen
assets/core.js                      state + WebSocket sync
assets/activities.js                all seven activities (coach + student modes)
assets/coach.js, play.js            the two page shells
assets/data/phonics.js              levels, sounds, tricky words, game word pools
assets/data/stories.js              the eleven books
assets/data/art.js                  SVG scene kit for the illustrations
assets/style.css                    everything visual
assets/fonts/                       Andika (SIL OFL)
server/server.js                    static server + sync
tools/check-decodable.js            validates every story word against its band
tools/check-determinism.js          guards that both screens compute the same thing
deploy/docker-compose.yml           NAS deployment
```

---

## Checks

```
node tools/check-decodable.js      every story word readable at its band
node tools/check-determinism.js    game boards identical on both screens
```

The second one exists because of a real bug: the word boards were shuffled
with `Math.random()`, so the reader portal and the child's screen dealt
different words from the same state — and the board reshuffled mid-game on
any unrelated re-render. Anything both screens work out for themselves has
to be a pure function of the shared state, and that check enforces it.

---

## Honest caveats

- **No audio.** A text-to-speech voice saying phonemes gets them wrong often
  enough to actively teach the wrong thing. Your voice does the modelling —
  which is the point of doing this together.
- **Word Whirled and Storyboard** exist on the platform this borrows its
  *shape* from, but weren't in the screenshots I worked from. Word Wheel here
  is my own take on what a "word whirl" ought to be (onset-and-rime, which is
  the standard version of that activity); there's no Storyboard at all.
- **It's not a copy.** Not of Chapter One — I had screenshots of the layout,
  never the code, and all the stories, art, words and code here are original.
  Not affiliated with or endorsed by Little Wandle / Wandle Learning Trust
  either; it just follows their published progression.
- **School wins.** If anything here contradicts what's coming home in his
  book bag, the school is right and this is wrong.
