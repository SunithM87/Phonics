/*
 * Shared state, sync, and small helpers.
 *
 * State lives in localStorage first, so two tabs of one browser sync with no
 * setup and the whole app still works with no server at all. When the sync
 * server (server/server.js) is reachable, the same state is mirrored to
 * every device on the network over a WebSocket — that's what makes "click a
 * word on the reader screen and it highlights on his screen" work across a
 * laptop and a tablet.
 */

const STATE_KEY = "rd_state_v2";
const PROGRESS_KEY = "rd_progress_v2";

const DEFAULT_STATE = {
  level: 1,
  band: "pink",
  activity: "flashcards",
  tab: "sounds",
  showDirections: true,
  fc: { sound: null, word: null, tricky: null },
  story: { id: null, page: 0, hl: null },
  sort: { round: 0, placed: {} },
  tir: { round: 0, marks: [null, null, null, null, null, null, null, null, null] },
  myst: { len: 3, slots: [], guessed: [], wrong: 0 },
  wheel: { round: 0, onset: 0 },
  wb: { tiles: [], seq: 1 },
  sticker: null,
  updatedAt: 0,
};

const DEFAULT_PROGRESS = { sounds: {}, tricky: {}, read: {} };

function clone(o) { return JSON.parse(JSON.stringify(o)); }

function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return clone(DEFAULT_STATE);
    return Object.assign(clone(DEFAULT_STATE), JSON.parse(raw));
  } catch (e) {
    return clone(DEFAULT_STATE);
  }
}

function saveState(patch, fromServer) {
  const next = Object.assign(loadState(), patch, { updatedAt: Date.now() });
  localStorage.setItem(STATE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("rd-change", { detail: next }));
  if (!fromServer) push({ liveState: next });
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
  } catch (e) {
    return clone(DEFAULT_PROGRESS);
  }
}

function saveProgress(p, fromServer) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  window.dispatchEvent(new CustomEvent("rd-change", { detail: p }));
  if (!fromServer) push({ progress: p });
  return p;
}

/* assess(kind, id, verdict) — verdict is "yes" | "no" | null (clears it).
 * This is the green-plus / red-minus record that drives the tile colours. */
function assess(kind, id, verdict) {
  const p = loadProgress();
  if (!p[kind]) p[kind] = {};
  if (verdict === null) delete p[kind][id];
  else p[kind][id] = verdict;
  return saveProgress(p);
}

function verdictOf(kind, id) {
  return loadProgress()[kind][id] || null;
}

/* ------------------------------ sync ------------------------------ */

let ws = null;
let connected = false;
let backoff = 1000;

function isSynced() { return connected; }

function push(payload) {
  if (ws && ws.readyState === 1) ws.send(JSON.stringify(Object.assign({ type: "update" }, payload)));
}

function setConn(v) {
  connected = v;
  window.dispatchEvent(new CustomEvent("rd-sync", { detail: { connected: v } }));
}

function connect() {
  if (window.location.protocol === "file:") return;
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  try {
    ws = new WebSocket(`${proto}//${window.location.host}/ws`);
  } catch (e) {
    return;
  }
  ws.onopen = () => { backoff = 1000; setConn(true); };
  ws.onmessage = (ev) => {
    let m;
    try { m = JSON.parse(ev.data); } catch (e) { return; }
    if (m.type !== "sync") return;
    if (m.liveState) saveState(m.liveState, true);
    if (m.progress) saveProgress(m.progress, true);
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

const STICKERS = ["⭐", "🏆", "🎉", "🌟", "🚀", "🦖", "🐙", "🍩", "⚽", "🌈"];

function sendSticker(emoji) {
  saveState({ sticker: { emoji, t: Date.now() } });
}
