# The Reading Den 🦉

A small, offline, two-screen reading practice app for one grown-up and one
child — built for home use, and matched to the **Little Wandle Letters and
Sounds Revised** phonics scheme (Phases 2–5).

## Why this exists, and what it isn't

This was built after a request to "copy" chapterone.org for home use. Worth
being upfront about what actually happened instead, and why:

- **This is not a copy of chapterone.org.** There's no access to its source
  code from here, and even with a login, reproducing a charity/commercial
  platform's branding, stories, and content wouldn't be appropriate — that's
  their intellectual property, not something to clone. What *is* borrowed is
  the underlying **idea**: a "coach" screen with controls, and a plain
  "student" screen that only shows the activity. Everything else — the
  content, the code, the design — is original.
- **It's aligned to Little Wandle, not affiliated with it.** The phase
  structure and word/sound groupings in `assets/data.js` were cross-checked
  against publicly published Little Wandle Letters and Sounds Revised
  overviews (September 2026), but this app is not produced, reviewed, or
  endorsed by Wandle Learning Trust. Schools vary in exact weekly pacing —
  **always defer to what actually comes home in the book bag.** Use the
  checklist in the Coach panel to mark off what's really been taught, rather
  than trusting the default phase groupings blindly.
- **The three games are originals, not a chapterone.org clone either.**
  Three in a Row, Match Pairs, and Word Bingo are about as generic a set of
  game *formats* as exist — noughts-and-crosses, a memory/pairs game, and a
  bingo card are standard across essentially every reading/phonics platform
  and plenty that have nothing to do with reading. They're built fresh here,
  with original code, art (just emoji) and content, tuned to this app's own
  phonics data. There was no access to chapterone.org to compare against —
  if its actual games look different from these, that's why.

## Running it

No build step, no install. Just open `index.html` in a browser — either by
double-clicking the file, or (recommended, so localStorage behaves
consistently) serving the folder locally:

```
python3 -m http.server 8000
# then open http://localhost:8000
```

## How the two screens work

- **`coach.html`** — pick the phase, tick off what's already been taught,
  choose today's activity (Sound Cards, Build & Blend, Tricky Words, Story
  Time, Alien Word Check, or one of the three games), and Practice vs Check
  mode. Has a live preview of exactly what the kid screen is showing.
- **`play.html`** — the plain screen for reading time. Big text, no menus, a
  small ⚙️ in the corner (asks for confirmation) to get back to the coach
  screen.

## Cross-device sync

State always lives in the browser's `localStorage` first — that's what
makes two tabs of the *same* browser sync instantly with zero setup, and
it's what lets the whole app still work with no server at all (just open
`index.html`). Look for the 🟢/🟡 pill on either screen: 🟡 *This device
only* means you're in that plain local mode.

When you're running it through `server/server.js` (which the Docker/NAS
setup below does automatically), the app also opens a WebSocket to that
server, and everything — the live activity, the progress checklist, and
any in-progress game — becomes one shared document kept in sync across
*every* device watching it. The pill goes 🟢 *Synced*. This was built,
and tested end to end (two independent browser profiles, standing in for
two separate devices, watching the same tic-tac-toe game and seeing each
other's and the robot's moves land live) before being written up here.

There's deliberately no login and no accounts — it's one shared document
for one family. That's exactly why it must stay off the open internet; see
"Don't port-forward this" below.

## Hosting it on a NAS

UGOS (the UGREEN NAS OS) has no built-in "Web Station" the way Synology or
QNAP do, so the way to serve this as a real always-on site — and the way to
get the cross-device sync above — is a small Docker container. It's in this
repo: `server/` is the sync server (Node + the `ws` package, nothing else),
and `deploy/docker-compose.yml` builds and runs it.

Worth being precise about what was actually verified here, not just
written: `server.js` itself was run directly and tested hard — two
independent browser profiles standing in for two separate devices, live
sync of activities, progress, and an in-progress tic-tac-toe game
(including the robot's moves) between them, state surviving a server
restart, and the app degrading gracefully with no server at all. The
Docker *image build* specifically is standard, unremarkable Dockerfile
(the same pattern the earlier nginx-based version used, which did build
and run cleanly) — but the sandbox this was built in hit Docker Hub's
anonymous pull rate limit partway through this session and the image
build itself couldn't be completed here. It should build cleanly on your
NAS's normal internet connection; if it doesn't, that's worth telling me.

1. **Get the files onto the NAS.** Easiest: map the NAS as a network drive
   (Finder → Connect to Server, or Windows → Map Network Drive) using its
   SMB address, create a shared folder (e.g. `reading-den`), and copy this
   whole repo folder into it. (A ZIP download from GitHub, uploaded and
   extracted via the Files app, works too.)
2. **Install Docker**, if it isn't already: UGOS Pro → App Center → search
   "Docker" → Install. (Current DXP/DH4300 Plus models support it; older
   entry-level models like the DH2300 don't.)
3. Open the **Docker app → Project**, and point it at
   `reading-den/deploy/docker-compose.yml` — or paste its contents in. Before
   running it, edit the two paths under `volumes:` (replace `../` and
   `./data`) with the actual absolute paths on your NAS, copied from the
   **Files** app — don't guess them, the exact scheme varies by model. The
   compose file itself has a worked example in its comments.
   - If the Project UI doesn't support the `build:` section, enable SSH
     (Control Panel → Terminal) and run `docker compose up -d --build` from
     the `deploy` folder once — the Project view can manage it from there.
4. Deploy. Visit `http://<your-nas-ip>:8080` from any device on your home
   network — that URL now serves the site *and* keeps every device watching
   it in sync live.

A couple of things worth knowing before you do this:

- **Don't port-forward this to the internet.** There is genuinely nothing
  guarding the shared state now — no login, no per-user anything, by
  design, since it's one family's data. That's a fine trade-off on your own
  LAN and a bad one on the open internet. Keep it there. If your NAS has a
  fixed/reserved local IP (worth setting in your router if it doesn't
  already), the address won't change.
- **His progress checklist and game state now live on the NAS**, in
  `deploy/data/state.json` (created automatically). Worth including in
  whatever you already back up, the same as any other file on the NAS —
  it's the record of what he's learned.

## The games

Three, chosen because they're near-universal phonics-practice formats
rather than anything specific to one platform:

- **Three in a Row** — noughts and crosses against a (deliberately not
  very smart) computer opponent. Tap a square, read the word you're shown,
  confirm you got it, and it's yours.
- **Match Pairs** — a memory game where each pair is the *same* word shown
  two ways: as sound-buttons and as the whole word. Matching them means
  reading both, not just remembering grid positions.
- **Word Bingo** — call a word, find it on your board. Full house to win.

All three pull their words from whichever set is selected in the Coach
panel (same content as Build & Blend), so they stay matched to wherever he
actually is in the phonics scheme rather than being a separate pool of
content to maintain. A set needs at least 3 words for a game to start —
every set in `data.js` already qualifies.

## Content structure

`assets/data.js` holds everything: which letter-sounds (GPCs) belong to each
phase and set, example/decodable words (broken into "sound buttons" — the
segments a child blends), tricky words, short decodable sentences, and a
bank of made-up "alien words" for pure-decoding practice (the same idea
schools use in the Year 1 phonics screening check).

To extend it — add more words, sentences, or phases — everything follows
the same shape; the comments at the top of the file explain the phase/set
model.

## Project layout

```
index.html, coach.html, play.html   the three pages
assets/data.js                      phonics content (see above)
assets/app.js                       state + the sync client (WebSocket)
assets/games.js                     Three in a Row / Match Pairs / Bingo
assets/coach.js, play.js            per-page UI logic
assets/style.css                    shared styling
server/server.js                    static file + WebSocket sync server
deploy/docker-compose.yml           NAS deployment (see "Hosting it on a NAS")
```

## A couple of honest caveats

- No audio. Text-to-speech was deliberately left out: getting a computer
  voice to say individual phonemes correctly and consistently is genuinely
  hard to get right, and a wrong sound is worse than no sound for a child
  learning to read. The grown-up's voice does the modelling — which is the
  point of doing this together anyway.
- The word lists are original examples chosen to be decodable with only the
  sounds taught by that point in the scheme, hand-checked but not
  exhaustively — if a word ever looks like it uses a sound he hasn't met
  yet, trust your judgement over the app.
