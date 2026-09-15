/*
 * Shared state, sync, and small helpers.
 *
 * State lives in localStorage first, so two tabs of one browser sync with no
 * setup and the whole app still works with no server at all. When the sync
 * server (server/server.js) is reachable, the same state is mirrored to
 * every device on the network over a WebSocket.
 *
 * Two things this has to get right, both learned the hard way:
 *
 * 1. Work done while disconnected must survive reconnecting. Each slice
 *    (liveState, progress) carries updatedAt; a slice edited offline is
 *    marked dirty and pushed on reconnect, and an incoming snapshot never
 *    overwrites a slice that is dirty or newer locally.
 * 2. "Connected to the server" is not the same as "his screen is
 *    connected". Each client announces its role, and the server reports who
 *    is actually there, so the status pill can tell the truth.
 */

const STATE_KEY = "rd_state_v3";
const PROGRESS_KEY = "rd_progress_v3";
const ROLE = document.body.classList.contains("student") ? "student" : "coach";

const DEFAULT_STATE = {
  level: 1,
  band: "pink",
  activity: "flashcards",
  tab: "sounds",
  showDirections: true,
  fc: { sound: null, word: null, tricky: null, buttons: false },
  story: { id: null, page: 0, hl: null },
  sort: { round: 0, placed: {} },
  tir: { round: 0, marks: [null, null, null, null, null, null, null, null, null] },
  myst: { word: null, guessed: [], seed: 0 },
  wheel: { round: 0, onset: 0 },
  wb: { tiles: [], seq: 1 },
  sticker: null,
  updatedAt: 0,
};

/* progress.sounds[g] / progress.tricky[w] = { v: "yes"|"no", t: when }
 * progress.read[storyId] = { decode: when|0, prosody: when|0, comprehend: when|0 } */
const DEFAULT_PROGRESS = { sounds: {}, tricky: {}, read: {}, updatedAt: 0 };

function clone(o) { return JSON.parse(JSON.stringify(o)); }

function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return clone(DEFAULT_STATE);
    return Object.assign(clone(DEFAULT_STATE), JSON.parse(raw));
  } catch (e) { return clone(DEFAULT_STATE); }
}

function saveState(patch, fromServer) {
  const next = fromServer ? Object.assign(clone(DEFAULT_STATE), patch)
                          : Object.assign(loadState(), patch, { updatedAt: Date.now() });
  localStorage.setItem(STATE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("rd-change", { detail: next }));
  if (!fromServer) push("liveState", next);
  return next;
}

/* Patch one activity's sub-object without clobbering its siblings. */
function saveSub(key, patch) {
  const cur = loadState();
  return saveState({ [key]: Object.assign({}, cur[key], patch) });
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return clone(DEFAULT_PROGRESS);
    return Object.assign(clone(DEFAULT_PROGRESS), JSON.parse(raw));
  } catch (e) { return clone(DEFAULT_PROGRESS); }
}

function saveProgress(p, fromServer) {
  const next = fromServer ? Object.assign(clone(DEFAULT_PROGRESS), p)
                          : Object.assign({}, p, { updatedAt: Date.now() });
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("rd-change", { detail: next }));
  if (!fromServer) push("progress", next);
  return next;
}

/* assess(kind, id, verdict) — verdict "yes" | "no" | null (clears). Records
 * when, so the coach can see what was last practised and what needs a look. */
function assess(kind, id, verdict) {
  const p = loadProgress();
  if (!p[kind]) p[kind] = {};
  if (verdict === null) delete p[kind][id];
  else p[kind][id] = { v: verdict, t: Date.now() };
  return saveProgress(p);
}
function verdictOf(kind, id) {
  const e = loadProgress()[kind][id];
  if (!e) return null;
  return typeof e === "string" ? e : e.v || null; // string = pre-v3 record
}
function verdictWhen(kind, id) {
  const e = loadProgress()[kind][id];
  return e && typeof e === "object" ? e.t || 0 : 0;
}

/* Three reads per book — Little Wandle's decoding / prosody / comprehension. */
function readsOf(storyId) {
  const r = loadProgress().read[storyId];
  if (!r) return { decode: 0, prosody: 0, comprehend: 0 };
  if (r === true) return { decode: 1, prosody: 0, comprehend: 0 }; // pre-v3 "read" flag
  return Object.assign({ decode: 0, prosody: 0, comprehend: 0 }, r);
}
function toggleRead(storyId, which) {
  const p = loadProgress();
  const cur = readsOf(storyId);
  cur[which] = cur[which] ? 0 : Date.now();
  p.read[storyId] = cur;
  return saveProgress(p);
}

/* ------------------------------ sync ------------------------------ */

let ws = null;
let connected = false;
let backoff = 1000;
let presence = { coaches: 0, students: 0 };
const dirty = { liveState: false, progress: false };

function isSynced() { return connected; }
function getPresence() { return presence; }

function push(slice, value) {
  if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify({ type: "update", [slice]: value }));
  } else {
    dirty[slice] = true; // remember to send it when we're back
  }
}

function setConn(v) {
  connected = v;
  if (!v) presence = { coaches: 0, students: 0 };
  window.dispatchEvent(new CustomEvent("rd-sync", { detail: { connected: v, presence } }));
}

function applySlice(slice, incoming) {
  if (!incoming || typeof incoming !== "object") return;
  if (dirty[slice]) return; // ours is unsent and newer in intent; keep it
  const local = slice === "liveState" ? loadState() : loadProgress();
  if (Number(incoming.updatedAt || 0) < Number(local.updatedAt || 0)) {
    push(slice, local); // the server is behind us — send ours instead
    return;
  }
  if (slice === "liveState") saveState(incoming, true); else saveProgress(incoming, true);
}

function connect() {
  if (window.location.protocol === "file:") return;
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  try { ws = new WebSocket(`${proto}//${window.location.host}/ws`); } catch (e) { return; }
  ws.onopen = () => {
    backoff = 1000;
    ws.send(JSON.stringify({ type: "hello", role: ROLE }));
    // anything changed while we were away goes first, before the server's
    // snapshot can arrive and be mistaken for the truth
    if (dirty.liveState) { ws.send(JSON.stringify({ type: "update", liveState: loadState() })); dirty.liveState = false; }
    if (dirty.progress) { ws.send(JSON.stringify({ type: "update", progress: loadProgress() })); dirty.progress = false; }
    setConn(true);
  };
  ws.onmessage = (ev) => {
    let m;
    try { m = JSON.parse(ev.data); } catch (e) { return; }
    if (m.type === "presence") {
      presence = { coaches: m.coaches || 0, students: m.students || 0 };
      window.dispatchEvent(new CustomEvent("rd-sync", { detail: { connected, presence } }));
      return;
    }
    if (m.type !== "sync") return;
    applySlice("liveState", m.liveState);
    applySlice("progress", m.progress);
  };
  ws.onclose = () => {
    setConn(false);
    setTimeout(connect, backoff);
    backoff = Math.min(backoff * 1.6, 15000);
  };
  ws.onerror = () => { try { ws.close(); } catch (e) {} };
}
connect();

/* ----------------------------- helpers ----------------------------- */

function el(tag, attrs, kids) {
  const n = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([k, v]) => {
    if (v == null || v === false) return;
    if (k === "class") n.className = v;
    else if (k === "html") n.innerHTML = v;
    else if (k === "text") n.textContent = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  });
  (Array.isArray(kids) ? kids : kids ? [kids] : []).forEach((c) => {
    if (c == null) return;
    n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  });
  return n;
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function timeAgo(t) {
  if (!t) return "";
  const d = Date.now() - t;
  const day = 86400000;
  if (d < day) return "today";
  if (d < 2 * day) return "yesterday";
  if (d < 7 * day) return `${Math.floor(d / day)} days ago`;
  if (d < 30 * day) return `${Math.floor(d / (7 * day))} wk ago`;
  return new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

const STICKERS = ["⭐", "🏆", "🎉", "🌟", "🚀", "🦖", "🐙", "🍩", "⚽", "🌈"];
function sendSticker(emoji) { saveState({ sticker: { emoji, t: Date.now() } }); }
