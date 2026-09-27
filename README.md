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
| **Flashcards** | Sound tiles and tricky words. Pick a sound, send an example word to his screen, optionally with *sound buttons* under it (the word split into its graphemes), mark ✓ / ✗. Tiles keep their colour and the date, so the record builds up over sessions, and a strip above the tiles tells you what to practise next. Tricky words show their **tricky bit** in orange with a one-line note ("the e says /uh/"). |
| **Stories** | Thirteen illustrated decodable books — see below. |
| **Word Sort** | Numbered words to sort into coloured bins by the sound they contain. He says "number four goes in the red box". |
| **3 in a Row** | Noughts and crosses on a 3×3 grid of words. Read the word to claim the square. You against him — click once for ✕, twice for ○. |
| **Mystery Word** | You pick a secret word, he guesses letters. Wrong guesses cost a star. Five stars and it's revealed. Solved or not, it ends with the whole word and its sound buttons — the reading is the point, not the guessing. |
| **Word Wheel** | A rime in the middle, onsets round the outside — turn it and he reads a whole rhyming family: cat, hat, mat, pat, rat, sat. Every word shows its sound buttons. |
| **Whiteboard** | Type sounds or words, drag them around. Good for pulling a word apart and pushing it back together. |

Plus **Send a Sticker** — pops a big emoji on his screen. Worth saving for
something he found hard.

### The stories

Thirteen proper little books, not practice sentences: a title, a cover, a
cast, and a beginning/middle/end over five pages. Pip the pug turns up in
two of them, which for a four-year-old is most of the appeal.

Every book carries an exact **Activity Level** — the highest teaching unit
any of its words needs — and its card says so. That's checked, not eyeballed:
every word in every book is in a hand-reviewed grapheme bank
(`assets/data/words.js`), and `tools/check-content.js` fails if a book uses a
grapheme, a suffix or an adjacent-consonant pattern taught later than its
declared level.

Tricky words are marked in the data and shown in blue on the page, so you
know at a glance which words to give him the tricky bit of rather than make
him sound out. The marking is level-aware: *and* is tricky in a Phase 2 book
(he hasn't met adjacent consonants) but plain in a Phase 4 one, and the
checker enforces both directions. Click any word on your screen and it
highlights on his.

Each book has three tick-boxes — **sounding out**, **with expression**,
**talked about it** — because the scheme's model is the same book read
three times over a week, and one "mark as read" flag doesn't record that.

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

Look for the pill at the top right of the portal. It reports what's
actually true, not just whether *your* screen reached the server:

- **● His screen is connected** — both screens are live.
- **● Server on · his screen isn't open** — you're synced but nothing will
  appear anywhere until his screen is open.
- **● No server — this screen only** — still perfectly usable on one screen.
- **● Synced · server needs rebuilding** — the site files are newer than the
  server container. Everything still syncs, but the server can't say who's
  connected until you rebuild it (see *Updating* below).

His screen has the same three states in miniature at the top.

If either device drops off Wi-Fi mid-session, anything you mark while
offline is kept and pushed when it reconnects — the server and the browser
both keep the newer of the two records rather than the server's copy
blindly winning.

---

## Hosting it on a NAS

UGOS (the UGREEN NAS OS) has no built-in static-site host, so this runs as a
small Docker container: `server/` is a tiny Node server (one dependency) that
serves the site *and* keeps every screen in sync over a WebSocket.
`deploy/docker-compose.yaml` builds and runs it.

The compose file is `deploy/docker-compose.yaml` — the `.yaml` spelling
because that's the name the UGOS Docker app's Project view creates and reads;
keep only that one file in `deploy/`, since compose warns and picks
arbitrarily when both spellings exist. It mounts the folder it lives in, so the app can sit
anywhere on the NAS — currently **`/volume2/appdata/Reading Den`** — and be
moved without editing anything. It serves on **port 8000**, which is the
one thing in `deploy/docker-compose.yaml` you might want to change.

1. **Copy the folder to `/volume2/appdata/Reading Den`** — easiest is to map
   the NAS as a network drive and drag it over. Keep the folder structure
   as-is; `deploy/data` is created automatically on first run.
2. **App Center → Docker → Install** (current DXP / DH4300 Plus models
   support it; the entry-level DH2300 doesn't).
3. **Docker → Project**, point it at
   `/volume2/appdata/Reading Den/deploy/docker-compose.yaml`.
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
  on the open internet. For access away from home use Tailscale (below),
  which keeps it private to your own devices.
- **His progress lives in
  `/volume2/appdata/Reading Den/deploy/data/state.json`.** It's the record of
  which sounds and tricky words he's got, and which books he's read. Worth
  including in whatever you already back up.

---

## Updating an existing install

One command over SSH (a phone SSH app is fine):

```
sudo sh "/volume2/appdata/Reading Den/deploy/update.sh"
```

It downloads the latest version from GitHub, copies it over the top of the
install, rebuilds and restarts the container only if something server-side
changed, and waits until the server answers. It finishes with
`Done — now on <version>`. His progress in `deploy/data/` is never touched,
and a failed download changes nothing. It's safe to run any time.

**First time only: a GitHub token.** The repo is private, so the NAS needs
a read-only key to download it:

1. On github.com: **Settings → Developer settings → Personal access tokens →
   Fine-grained tokens → Generate new token.** Set *Repository access* to
   *Only select repositories → Phonics* and *Permissions → Contents* to
   *Read-only*. Nothing else. Pick an expiry you're happy with; when it
   runs out, the update tells you so and you repeat this step.
2. On the NAS, the first run has to fetch the script itself, since an older
   install doesn't have it yet. It's one line, so it pastes cleanly into a
   phone SSH app. Put your token in place of `github_pat_…` (keep the
   quotes):

   ```
   T='github_pat_…'; curl -fsSL -H "Authorization: Bearer $T" -H "Accept: application/vnd.github.raw" "https://api.github.com/repos/SunithM87/Phonics/contents/deploy/update.sh?ref=claude/gifted-feynman-6q1506" | sudo sh -s -- "$T"
   ```

   That saves the token (readable by root only) at
   `/volume2/appdata/.reading-den-github-token`, which is next to the app
   folder rather than inside it, because everything inside is the website.
   From then on the one-line command above is all you need.

The script tracks the `claude/gifted-feynman-6q1506` branch. If that ever
gets merged into `main`, run it once as
`sudo BRANCH=main sh ".../update.sh"`, or change the `BRANCH=` line at the
top of the script.

**Doing it by hand instead** still works. Copy the files over the top of
the folder (never delete it first, because `deploy/data/` is his progress).
Then:

| What changed | What to do |
|---|---|
| Anything in `assets/`, any `.html`, stories, artwork | Nothing. Refresh the browser. |
| `deploy/docker-compose.yaml` (port, paths) | `sudo docker compose up -d` from `deploy/` |
| `server/server.js`, `server/package.json`, `server/Dockerfile` | `sudo docker compose up -d --build` from `deploy/` |

The site files are bind-mounted, so they go live on copy. The server is
baked into the image, so a changed `server.js` needs the rebuild. The
portal tells you when this has happened: the top-right pill reads
**● Synced · server needs rebuilding** until the container is rebuilt.

If a page still looks stale after a refresh, hard-refresh it
(Ctrl/Cmd+Shift+R). Occasionally a tablet browser holds on to old
JavaScript regardless of the no-cache header.

---

## Levels

Two separate level systems, which is how reading platforms actually do it,
because they move independently:

**Activity Level 1–21** drives flashcards and games. Each level is one of
Little Wandle's own teaching units, in the published order: the Reception
weeks (four new sounds each — Level 1 is `s a t p`, Level 2 `i n m d`, and
so on through Phases 2 and 3), then the Phase 4 adjacent-consonant sets,
then the Year 1 Phase 5 sets. The picker groups them by Phase and shows the
sounds and tricky words each one adds. Move it up whenever school does; the
tricky-word lists match the official ones exactly (22 / 9 / 18 / 34 for
Phases 2–5).

Everything the level gates is gated mechanically. Every word the app can
show is in the grapheme bank with its sounds spelled out
(`ship: ["sh","i","p"]`, `cake: ["c","a-e","k"]`), and a word is only
offered at a level if every one of its graphemes has been taught, any `-s`
ending has been taught (Level 10), and any two consonants side by side
(`st`, `mp`, `tr`) have been taught (Phase 4, Levels 15–16). So Level 1 is
genuinely just `s a t p` words — seven of them — and the games that need
more than that say so and wait for Level 2.

Some tricky words stop being tricky: *and*, *her*, *when*, *out*, *my* are
all decodable once their sounds arrive. They stay on the tricky-word tiles
(school keeps teaching them), but the stories stop marking them once he can
read them.

**Story Level** is a book-band colour — Pink, Red, Yellow, Blue, Orange —
and each band is pinned to a maximum Activity Level (10 / 14 / 16 / 18 / 21).
The chip picker lists every book in the band with its exact level, and a
book card turns amber when its level is above his current Activity Level.

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
assets/data/phonics.js              the 21 units, tricky-word parts, sound examples, sorts, wheels
assets/data/words.js                the grapheme bank: every word the app can show, with its sounds
assets/data/stories.js              the thirteen books
assets/data/art.js                  SVG scene kit for the illustrations
assets/style.css                    everything visual
assets/fonts/                       Andika (SIL OFL)
server/server.js                    static server + sync (http + ws, nothing else)
tools/check-content.js              validates every word, sort, wheel, story and tricky mark against its level
tools/check-determinism.js          guards that both screens compute the same thing
tools/segment.js                    helper for adding words to the bank (draft segmentation, then review by hand)
deploy/docker-compose.yaml           NAS deployment
deploy/update.sh                     one-command update from GitHub (see Updating)
```

---

## Checks

```
node tools/check-content.js        every word, sort, wheel and story readable at its declared level; tricky marks right
node tools/check-determinism.js    game boards identical on both screens
```

The first one replaced an earlier checker that segmented words by scanning
for letter strings — which happily passed *cake*, *train* and *egg* at Phase
2 because it could find `c`, `a`, `k`, `e` in them. Segmenting is now done
once, by hand, into `assets/data/words.js`, and the checker only asks
whether each recorded sound has been taught yet. Adding a word means adding
its sounds; `node tools/segment.js <word>` drafts that for you, but the
answer gets reviewed, not trusted.

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
- **The grapheme bank is hand-reviewed, not infallible.** 500-odd words,
  each with its sounds spelled out. If you spot one that's wrong, fixing the
  entry in `assets/data/words.js` fixes it everywhere and the checker will
  tell you if the change puts a story out of level.
- **School wins.** If anything here contradicts what's coming home in his
  book bag, the school is right and this is wrong.
