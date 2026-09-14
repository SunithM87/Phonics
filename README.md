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
  Time, Alien Word Check), and Practice vs Check mode. Has a live preview of
  exactly what the kid screen is showing.
- **`play.html`** — the plain screen for reading time. Big text, no menus, a
  small ⚙️ in the corner (asks for confirmation) to get back to the coach
  screen.

They talk to each other via `localStorage`, so **two tabs or windows of the
same browser stay in sync live** — that's the "remote control" trick, done
without a server. Two separate physical devices will only match if you set
each one up the same way in its own Coach panel; there's no server, so
nothing syncs across devices or persists anywhere but the one browser it's
opened in. Realistically, for one parent and one child this usually means
either sitting at one screen together, or handing over a tablet already
opened to `play.html` once you've set things up on your own device.

## Content structure

`assets/data.js` holds everything: which letter-sounds (GPCs) belong to each
phase and set, example/decodable words (broken into "sound buttons" — the
segments a child blends), tricky words, short decodable sentences, and a
bank of made-up "alien words" for pure-decoding practice (the same idea
schools use in the Year 1 phonics screening check).

To extend it — add more words, sentences, or phases — everything follows
the same shape; the comments at the top of the file explain the phase/set
model.

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
