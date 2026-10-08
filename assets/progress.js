/*
 * Sessions and the progress picture, shared by the home page (index.html),
 * the reader portal (End session) and his screen (the "all done" screen).
 *
 * A session runs from Start to End. Ending one saves a summary of what
 * happened in it to progress.sessions, worked out from the timestamps the
 * app already keeps (every ✓/✗ and every read is dated), so nothing has to
 * be tracked twice. A session left open with nothing happening for three
 * hours counts as finished, so the app never resumes yesterday's session.
 */

const SESSION_STALE_MS = 3 * 60 * 60 * 1000;
const READ_LABEL = { decode: "sounding out", prosody: "with expression", comprehend: "talked about it" };
const ACT_LABEL = () => Object.fromEntries(Object.entries(typeof ACTIVITIES !== "undefined" ? ACTIVITIES : {}).map(([k, a]) => [k, a.label]));

function sessionLive(s) { return !!(s || loadState()).session; }
function lastActivityAt() { return Math.max(Number(loadState().updatedAt || 0), Number(loadProgress().updatedAt || 0)); }

/* Start fresh: back to flashcards with every game cleared, but keep his
 * Activity Level and Story Level — those follow school, not the session. */
function startSession() {
  return saveState({
    session: { start: Date.now(), acts: ["flashcards"] },
    ended: null,
    activity: "flashcards", tab: "sounds", showDirections: true,
    fc: { sound: null, word: null, tricky: null, buttons: false },
    story: { id: null, page: 0, hl: null },
    sort: { round: 0, placed: {} },
    tir: { round: 0, marks: [null, null, null, null, null, null, null, null, null] },
    myst: { word: null, guessed: [], seed: 0 },
    wheel: { round: 0, onset: 0 },
    wb: { tiles: [], seq: 1 },
    sticker: null,
  });
}

/* Everything that happened between two moments, from the dated record. */
function summarise(start, end) {
  const p = loadProgress(), s = loadState();
  const within = (t) => t >= start && t <= end;
  const marks = (kind) => {
    const out = { yes: [], no: [] };
    for (const [id, e] of Object.entries(p[kind] || {})) {
      if (e && typeof e === "object" && within(e.t || 0) && out[e.v]) out[e.v].push(id);
    }
    return out;
  };
  const reads = [];
  for (const [id] of Object.entries(p.read || {})) {
    const r = readsOf(id);
    const which = Object.keys(READ_LABEL).filter((k) => r[k] && within(r[k]));
    const st = typeof storyById === "function" ? storyById(id) : null;
    if (which.length) reads.push({ id, title: st ? st.title : id, which });
  }
  return {
    start, end, minutes: Math.max(1, Math.round((end - start) / 60000)),
    sounds: marks("sounds"), tricky: marks("tricky"), reads,
    acts: (s.session && s.session.acts) || [], level: s.level, band: s.band,
  };
}

function endSession(opts) {
  const o = opts || {};
  const s = loadState();
  if (!s.session) return null;
  const end = o.end || Date.now();
  const summary = Object.assign(summarise(s.session.start, end), o.auto ? { auto: true } : {});
  const p = loadProgress();
  p.sessions = (p.sessions || []).concat([summary]).slice(-500);
  saveProgress(p);
  saveState({ session: null, ended: { at: end, summary, auto: !!o.auto }, story: { id: null, page: 0, hl: null } });
  return summary;
}

/* Called on load: close a session that was simply left open. */
function closeStaleSession(now) {
  const s = loadState();
  if (!s.session) return false;
  const last = Math.max(lastActivityAt(), s.session.start);
  if ((now || Date.now()) - last < SESSION_STALE_MS) return false;
  endSession({ end: last, auto: true });
  return true;
}

/* One line about a session, for lists. */
function sessionLine(x) {
  const bits = [];
  const sy = x.sounds.yes.length + x.tricky.yes.length, sn = x.sounds.no.length + x.tricky.no.length;
  if (sy || sn) bits.push(`${sy} ✓${sn ? ` · ${sn} to practise` : ""}`);
  if (x.reads.length) bits.push(x.reads.map((r) => r.title).join(", "));
  const names = ACT_LABEL();
  const games = (x.acts || []).filter((a) => a !== "flashcards" && a !== "stories").map((a) => names[a] || a);
  if (games.length) bits.push(games.join(", "));
  return bits.join(" · ") || "Nothing marked";
}

/* ---------------- the progress picture ---------------- */

function dayKey(t) { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }

/* Every day something was practised: sessions, plus any dated ✓/✗ or read
 * (so history from before sessions existed still counts). */
function practiceDays() {
  const p = loadProgress(), days = new Set();
  (p.sessions || []).forEach((x) => days.add(dayKey(x.start)));
  ["sounds", "tricky"].forEach((k) => Object.values(p[k] || {}).forEach((e) => { if (e && e.t) days.add(dayKey(e.t)); }));
  Object.keys(p.read || {}).forEach((id) => Object.values(readsOf(id)).forEach((t) => { if (t > 1) days.add(dayKey(t)); }));
  return days;
}

function lastNDays(n) {
  const days = practiceDays(), out = [];
  const today = new Date(); today.setHours(12, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    out.push({ date: d, practised: days.has(dayKey(d.getTime())) });
  }
  return out;
}

function streak() {
  const days = practiceDays();
  let n = 0;
  const d = new Date(); d.setHours(12, 0, 0, 0);
  if (!days.has(dayKey(d.getTime()))) d.setTime(d.getTime() - 86400000); // today not done yet doesn't break it
  while (days.has(dayKey(d.getTime()))) { n++; d.setTime(d.getTime() - 86400000); }
  return n;
}

function weekSessions() {
  const since = Date.now() - 7 * 86400000;
  const xs = (loadProgress().sessions || []).filter((x) => x.start >= since);
  return { count: xs.length, minutes: xs.reduce((a, x) => a + (x.minutes || 0), 0) };
}

function itemStats(kind, items) {
  const out = { yes: [], no: [], untried: [] };
  items.forEach((id) => { const v = verdictOf(kind, id); (v === "yes" ? out.yes : v === "no" ? out.no : out.untried).push(id); });
  return out;
}

function bookStats(level) {
  const done = [], going = [];
  STORIES.forEach((st) => {
    const r = readsOf(st.id);
    const n = ["decode", "prosody", "comprehend"].filter((k) => r[k]).length;
    if (n === 3) done.push(st); else if (n > 0) going.push({ st, n });
  });
  const atLevel = STORIES.filter((st) => st.level <= level);
  return { done, going, atLevel };
}

/* What to read next: carry on a book that's part-way through its three
 * reads, else the easiest unread book at or below his level in his band,
 * else the easiest unread one at or below his level anywhere. */
function nextBook(s) {
  const going = STORIES.filter((st) => { const r = readsOf(st.id); const n = ["decode", "prosody", "comprehend"].filter((k) => r[k]).length; return n > 0 && n < 3; })
    .sort((a, b) => a.level - b.level);
  if (going.length) return { st: going[0], why: "carry on: the next of its three reads" };
  const unread = (list) => list.filter((st) => st.level <= s.level && !Object.values(readsOf(st.id)).some(Boolean));
  const inBand = unread(storiesForBand(s.band));
  if (inBand.length) return { st: inBand[0], why: "not read yet, and at his level" };
  const any = unread(STORIES.slice().sort((a, b) => a.level - b.level));
  if (any.length) return { st: any[0], why: "not read yet, and at his level (another band)" };
  return null;
}
