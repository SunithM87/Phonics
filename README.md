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
| **Stories** | Forty-eight illustrated decodable books, half stories and half non-fiction, from Level 1 up. See below. |
| **Word Sort** | Numbered words to sort into coloured bins by the sound they contain. He says "number four goes in the red box". |
| **3 in a Row** | Noughts and crosses on a 3×3 grid of words. Read the word to claim the square. You against him — click once for ✕, twice for ○. |
| **Mystery Word** | You pick a secret word, he guesses letters. Wrong guesses cost a star. Five stars and it's revealed. Solved or not, it ends with the whole word and its sound buttons — the reading is the point, not the guessing. |
| **Word Wheel** | A rime in the middle, onsets round the outside — turn it and he reads a whole rhyming family: cat, hat, mat, pat, rat, sat. Every word shows its sound buttons. |
| **Whiteboard** | Type sounds or words, drag them around. Good for pulling a word apart and pushing it back together. |

Plus **Send a Sticker** — pops a big emoji on his screen. Worth saving for
something he found hard.

### The progress page and sessions

Opening the app always lands on the **progress page**, not wherever you
left off last time. It shows:

- **where he is:** Activity Level, the sounds it adds, his Story Level;
- **four numbers:** sounds read ✓ out of those taught so far, tricky
  words likewise, books read all three times, and sessions this week
  (with minutes and any run of days in a row);
- **the last two weeks** as a row of days, ticked where he practised;
- **every sound and tricky word so far**, each marked ✓, ✗ or not
  tried, with what's coming at the next level;
- **next time:** what needs another look, what hasn't been tried at this
  level, and which book to read next (one part-way through its three
  reads first, otherwise the easiest unread one at his level);
- **the last session** and a list of recent ones.

When everything up to his level is marked ✓, it says so. It doesn't
move him on by itself; that's school's call.

**Start a session** opens the reader portal at Flashcards with every game
cleared, keeping his levels. **End session** (top right in the portal)
shows what he did — sounds read ✓, ones that need another look, books and
which read — offers a sticker, then saves it to his record and returns to
the progress page. His screen says *All done!* with a star for each thing
he got, then *Ready when you are* until the next session.

A session left open with nothing happening for three hours counts as
finished, so the app never resumes yesterday. Its summary is still saved,
just without the *All done!* screen. Opening the portal directly with no
session going on sends you to the progress page.

### The stories

Forty-eight little books, built the way the school's Little Wandle reading
books (Collins Big Cat) are built:

- **They start in week one.** Level 1 has a book using only `s a t p`
  (*Tap, Tap!*), and every Activity Level from 1 to 21 has at least one
  book written for it. The earliest are marked *Blending practice*, like
  the school's own: a handful of words, lots of repetition, one small
  twist. Before Level 5 there's no "the", and before Level 10 no plurals,
  so those books are short on purpose.
- **Half are non-fiction:** facts (*A Duck*, *Rabbits*, *Pets*,
  *Dolphins*), recounts (*We Went Camping*, *A Day at the Sea*) and
  instructions (*A Quick Jam Bun*, *Ice Pops*, *Ride a Bike*). It's 24
  stories and 24 non-fiction, as in the school's sets, and no
  Story Level band is more than one book off an even split.
- **Retold traditional tales** at the top levels: *The Three Little Pigs*,
  *The Little Red Hen* and *The Magic Pot*. They're old stories that anyone
  can retell, written in decodable words, so the wolf becomes a fox and
  porridge becomes oats.
- **Every book opens with a Get ready page:** the book's focus sounds, up to
  six words that use them (shown with sound buttons), and its tricky words
  with the tricky bit in orange. It's worked out from the book's own
  text, so it can't drift out of step with it.
- **Every book ends with a page for remembering it:** all its pictures as a
  numbered story map to retell from, or "What did we find out?" for
  non-fiction, plus talk questions on your screen for the third read.

These are **not copies** of the Collins books. Their stories and pictures
are copyrighted, so everything here is original. What's copied is the
format. If you want the real books at home, the school can give you a
login to Collins' ebook library, where the teacher assigns the week's
book.

Every book carries an exact **Activity Level**: the highest teaching unit
any of its words needs, shown on its card. That's checked, not eyeballed.
Every word in every book is in a hand-reviewed grapheme bank
(`assets/data/words.js`), and `tools/check-content.js` fails if a book uses
a grapheme, a suffix or an adjacent-consonant pattern taught later than its
declared level, if its focus sounds aren't really in it, or if it's
missing talk questions.

Tricky words are marked in the data and shown in blue on the page. The
marking is level-aware, judged at the book's own level: *and* is tricky in
a Phase 2 book (he hasn't met adjacent consonants yet) but plain in a
Phase 4 one, and the checker enforces both directions. Click any word on
your screen and it highlights on his.

Each book also has three tick-boxes — **sounding out**, **with expression**,
**talked about it** — because the scheme's model is the same book read
three times over a week.

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
- **● Synced · server out of date** — the server is an older version than
  the page. Everything still syncs, but it can't say who's connected until
  you restart the container (see *Updating* below).

His screen has the same three states in miniature at the top.

If either device drops off Wi-Fi mid-session, anything you mark while
offline is kept and pushed when it reconnects — the server and the browser
both keep the newer of the two records rather than the server's copy
blindly winning.

---

## Hosting it on a NAS

It runs as one small Docker container: a tiny Node server that serves the
app *and* keeps every screen in sync over a WebSocket. The container keeps
itself up to date. **Every time it starts, it downloads the latest version
of the app from GitHub** and serves that, so updating means restarting it
(see *Updating*). If GitHub can't be reached, it serves the last version
it downloaded.

Nothing needs copying to the NAS. The only folder it uses is
**`/volume2/appdata/Reading Den/deploy/data`**, which holds his progress
(`state.json`) plus the downloaded copy of the app.

1. **App Center → Docker → Install** (current DXP / DH4300 Plus models
   support it; the entry-level DH2300 doesn't).
2. **Docker → Project → Create.** Paste in the whole of
   [`deploy/docker-compose.yaml`](deploy/docker-compose.yaml) and deploy it.
   It uses the standard `node:20-alpine` image, so there's nothing to build.
3. Open `http://<nas-ip>:8000` on any device in the house.

To keep the data somewhere else, change the one `source:` path in the
compose file. It has to be an absolute path, because the UGREEN app keeps
its own copy of the file. The port is the other thing you might change.

**Two things worth knowing:**

- **Don't port-forward this.** There's no login and no accounts, by design —
  it's one family's shared state. That's fine on your own LAN and a bad idea
  on the open internet. For access away from home use Tailscale (below),
  which keeps it private to your own devices.
- **His progress lives in
  `/volume2/appdata/Reading Den/deploy/data/state.json`.** It's the record of
  which sounds and tricky words he's got, and which books he's read. Worth
  including in whatever you already back up.
- **The container runs whatever is on the GitHub branch.** That's what
  makes it update itself, and it means anyone who can push to the repo
  controls what your NAS serves. Right now that's only you. The container
  can only see its own data folder, not the rest of the NAS.

---

## Updating

**It updates itself.** Every 15 minutes the server asks GitHub whether
there's a newer version. When there is, it waits until no session is going
on (no screens connected, or nothing changed for 30 minutes), then
restarts. The container downloads the new version as it starts, and any
screens left open reload themselves onto it. They come back on the same
page, since everything is saved. His progress is never touched.

So after a change is pushed, it's live within about 15 minutes of the next
quiet moment. To get it **straight away**, restart the container yourself
in the UGREEN Docker app: *Containers → reading-den → Restart*. Use
**Restart**, not re-deploy. Re-deploying an unchanged project doesn't
restart the container, so nothing gets downloaded.

If an update fails to download (GitHub unreachable, say), it keeps serving
the version it has and doesn't keep retrying that same version. The health
page says so, and a manual restart tries again. Set `AUTO_UPDATE=off` in
the compose file's `environment:` to switch self-updating off.

To check which version is running, open `http://<nas-ip>:8000/api/health`.
`version` is the commit it's serving, `latest` is the newest one on GitHub
when it last checked, and `updatePending` means it's waiting for a quiet
moment to switch over.

From a terminal, this does the same restart and waits until the new
version answers:

```
curl -fsSL https://raw.githubusercontent.com/SunithM87/Phonics/claude/gifted-feynman-6q1506/deploy/update.sh | sudo sh
```

**If you set it up before the container updated itself**, your project
still has the old compose file, and restarting it won't update anything.
Switch it over once. The terminal command above does this for you: it
spots the old container, writes the new compose file (over the UGREEN
app's own copy too, keeping a `.before-self-update` backup), keeps the
same data folder and redeploys. Or, in the UGREEN app:

1. In the UGREEN Docker app, open the **reading-den** project and edit
   its compose file.
2. Replace all of it with the current
   [`deploy/docker-compose.yaml`](deploy/docker-compose.yaml) and save and
   redeploy. It points at the same data folder, so his progress carries
   over.
3. If the app won't let you edit the project, delete the old project and
   create a new one from the same file. If it offers to delete volumes or
   data, say **no**.

After that, restarting is all an update ever needs. The old app files in
`/volume2/appdata/Reading Den` aren't used any more, and only
`deploy/data/` matters. The branch it follows is set in two places in the
compose file (`BRANCH=` and the URL). Change both if you ever switch, for
example to `main`.

If a page still looks stale after a refresh, hard-refresh it
(Ctrl/Cmd+Shift+R). Occasionally a tablet browser holds on to old
JavaScript regardless of the no-cache header.

### Using it away from home (Tailscale)

The app needs nothing special for this. Every URL it uses is relative to
the page (the sync socket is built from `window.location`), and the server
doesn't check the hostname, so it works the same whether you reach it as
`192.168.1.170:8000`, a Tailscale `100.x.y.z:8000` address, or a MagicDNS
name. If it works at home and not away, the problem is the route to the
NAS, not the app. Check these in order:

1. **Use the Tailscale address, not the home one.** `192.168.1.170` only
   exists on your home Wi-Fi. Away from home, use the NAS's Tailscale IP
   (the `100.…` address in the Tailscale app or admin console, or
   `tailscale ip -4` on the NAS) or its MagicDNS name:
   `http://100.x.y.z:8000`. The one exception: if the NAS advertises your
   home subnet as a Tailscale route *and* you've approved it in the admin
   console, the home IP works too.
2. **Tailscale has to be on at both ends.** The phone or laptop needs the
   Tailscale VPN switched on (not just the app installed). The NAS needs to
   show as *Connected* in the admin console.
3. **The NAS firewall.** If UGOS's firewall is on, it may only allow your
   home subnet. Allow port 8000, or the Tailscale range `100.64.0.0/10`.
4. **Test from the NAS itself** over SSH:
   `curl -s http://$(tailscale ip -4):8000/api/health`. If that answers,
   the container and firewall are fine and the problem is on the device
   you're connecting from. If the `tailscale` command isn't found, Tailscale
   is running as a UGOS app or container rather than on the NAS itself. In
   that case skip this test and rely on 1–3.

If you front it with `tailscale serve` for an `https://` address, that
works too: the page switches the sync socket to `wss://` automatically.

### Moving it to a different folder

Only the data folder matters. Stop the container, move `deploy/data/` (or
the whole `Reading Den` folder) to its new home, change the `source:` path
in the project's compose file to match, and deploy it again. His progress
comes along inside `state.json`.

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
index.html, coach.html, play.html   progress page / reader portal / child's screen
assets/home.js                      the progress page
assets/progress.js                  sessions, their summaries, and the progress figures
assets/core.js                      state + WebSocket sync
assets/activities.js                all seven activities (coach + student modes)
assets/coach.js, play.js            the two page shells
assets/data/phonics.js              the 21 units, tricky-word parts, sound examples, sorts, wheels
assets/data/words.js                the grapheme bank: every word the app can show, with its sounds
assets/data/stories.js              the forty-eight books, plus the Get ready helper
assets/data/art.js                  SVG scene kit for the illustrations (15 backgrounds, ~90 items)
assets/style.css                    everything visual
assets/fonts/                       Andika (SIL OFL)
server/server.js                    static server + sync (http + ws, nothing else)
tools/check-content.js              validates every word, sort, wheel, story and tricky mark against its level
tools/check-determinism.js          guards that both screens compute the same thing
tools/segment.js                    helper for adding words to the bank (draft segmentation, then review by hand)
deploy/docker-compose.yaml           NAS deployment (self-updating; paste into the UGREEN Docker app)
deploy/container-start.sh            runs in the container on every start: fetch latest, then serve
deploy/update.sh                     terminal shortcut: restart the container and wait
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
