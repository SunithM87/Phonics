/*
 * Shared state helpers for the Reading Den.
 *
 * State always lives in localStorage first — that's what makes two tabs of
 * the SAME browser stay in sync with zero setup, and it's what lets this
 * whole app still work if you just open index.html with no server at all.
 *
 * When a sync server IS reachable (see server/server.js — the Docker setup
 * on the NAS runs one), this file also opens a WebSocket to it. From then
 * on, every loadState/saveState (and progress/game equivalents) call also
 * pushes to the server, and the server's broadcasts get written straight
 * back into localStorage and re-announced as the same local events — so
 * coach.js and play.js don't need to know or care whether they're synced
 * to just this browser or to every device on the house wifi. See
 * isSyncConnected() if you want to show the difference in the UI.
 */

const STATE_KEY = "rd_state_v1";
const PROGRESS_KEY = "rd_progress_v1";
const GAME_KEY = "rd_game_v1";

const DEFAULT_STATE = {
  phase: 2,
  activity: "sounds", // sounds | blend | tricky | story | alien
  setId: "2-a",
  mode: "practice", // practice | check
  index: 0,
  sessionStars: 0,
  childName: "",
  updatedAt: 0,
};

function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch (e) {
    return { ...DEFAULT_STATE };
  }
}

function saveState(partial, fromServer) {
  const next = { ...loadState(), ...partial, updatedAt: Date.now() };
  localStorage.setItem(STATE_KEY, JSON.stringify(next));
  // Fire a same-tab event too — the native 'storage' event only fires in
  // OTHER tabs/documents, not the one that made the change.
  window.dispatchEvent(new CustomEvent("rd-state-changed", { detail: next }));
  if (!fromServer) sendUpdate({ liveState: next });
  return next;
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { gpcs: {}, tricky: {} };
    const parsed = JSON.parse(raw);
    return { gpcs: parsed.gpcs || {}, tricky: parsed.tricky || {} };
  } catch (e) {
    return { gpcs: {}, tricky: {} };
  }
}

function saveProgress(progress, fromServer) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  if (!fromServer) sendUpdate({ progress });
}

function markSetLearned(setId, learned) {
  const progress = loadProgress();
  progress.gpcs[setId] = learned;
  saveProgress(progress);
}

function markTrickyLearned(phase, word, learned) {
  const progress = loadProgress();
  const key = `${phase}:${word}`;
  progress.tricky[key] = learned;
  saveProgress(progress);
}

// Find the first set in a phase that isn't yet marked learned, so the Coach
// panel can suggest "today's set" instead of the grown-up having to guess.
function firstUnlearnedSet(phase) {
  const sets = PHONICS_DATA.phases[phase].sets;
  const progress = loadProgress();
  const found = sets.find((s) => !progress.gpcs[s.id]);
  return found ? found.id : sets[sets.length - 1].id;
}

// A set's gpcs array mixes plain strings ("s", "ch") with objects for sounds
// that need disambiguating, e.g. the two "oo"s: { gpc, note, example }.
function normGpc(g) {
  return typeof g === "string" ? { gpc: g } : g;
}

function gpcSetLabel(set) {
  return set.gpcs
    .map((g) => {
      const n = normGpc(g);
      return n.note ? `${n.gpc} (${n.note.split(",")[0]})` : n.gpc;
    })
    .join(" ");
}

function getItemsForActivity(state) {
  const phaseData = PHONICS_DATA.phases[state.phase];
  switch (state.activity) {
    case "sounds": {
      if (phaseData.noNewSounds) return [];
      const set = phaseData.sets.find((s) => s.id === state.setId) || phaseData.sets[0];
      return set.gpcs.map((g) => {
        const n = normGpc(g);
        return { type: "sound", gpc: n.gpc, example: n.example || null };
      });
    }
    case "blend": {
      return phaseData.words
        .filter((w) => w.set === state.setId)
        .map((w) => ({ type: "word", ...w }));
    }
    case "tricky": {
      return phaseData.trickyWords.map((w) => ({ type: "tricky", word: w }));
    }
    case "story": {
      return phaseData.sentences.map((s) => ({ type: "sentence", ...s }));
    }
    case "alien": {
      return phaseData.alienWords.map((w) => ({ type: "alien", word: w }));
    }
    default:
      return [];
  }
}

function boldTrickyWords(text, trickyList) {
  let out = text;
  (trickyList || []).forEach((w) => {
    const re = new RegExp(`\\b${w}\\b`, "g");
    out = out.replace(re, `<strong>${w}</strong>`);
  });
  return out;
}

// The word bank the three games draw challenges from: every decodable word
// tagged to the currently-selected set. Shared here rather than duplicated
// in games.js since getItemsForActivity() already knows this shape.
function getWordBank(state) {
  const phaseData = PHONICS_DATA.phases[state.phase];
  return phaseData.words.filter((w) => w.set === state.setId);
}

// Shared kid-screen reward feedback — used by play.js's activities and by
// all three games in games.js, so it lives here rather than in either.
function burstConfetti() {
  const wrap = document.createElement("div");
  wrap.className = "confetti-burst";
  const pieces = ["⭐", "🎉", "✨", "🌟"];
  for (let i = 0; i < 14; i++) {
    const span = document.createElement("span");
    span.className = "confetti-piece";
    span.textContent = pieces[i % pieces.length];
    span.style.left = `${Math.random() * 100}%`;
    span.style.animationDelay = `${Math.random() * 0.3}s`;
    wrap.appendChild(span);
  }
  document.body.appendChild(wrap);
  setTimeout(() => wrap.remove(), 2000);
}

function awardStar() {
  const state = loadState();
  saveState({ sessionStars: state.sessionStars + 1 });
  burstConfetti();
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- Game state (Three in a Row / Match Pairs / Word Bingo) ----------

const DEFAULT_GAME = { kind: null };

function loadGame() {
  try {
    const raw = localStorage.getItem(GAME_KEY);
    if (!raw) return { ...DEFAULT_GAME };
    return JSON.parse(raw);
  } catch (e) {
    return { ...DEFAULT_GAME };
  }
}

function saveGame(game, fromServer) {
  localStorage.setItem(GAME_KEY, JSON.stringify(game));
  window.dispatchEvent(new CustomEvent("rd-state-changed", { detail: game }));
  if (!fromServer) sendUpdate({ game });
  return game;
}

// ---------------------------- Sync layer ------------------------------
//
// Opens a WebSocket to this same origin's server (server/server.js) if
// one is reachable. Deliberately best-effort: if you're just opening
// index.html directly (file://) or serving it with a plain static server
// that has no backend, this quietly never connects and the app runs
// exactly as it did before — localStorage-only, single-browser.

let ws = null;
let syncConnected = false;
let reconnectDelay = 1000;

function isSyncConnected() {
  return syncConnected;
}

function setSyncStatus(connected) {
  syncConnected = connected;
  window.dispatchEvent(new CustomEvent("rd-sync-status", { detail: { connected } }));
}

function sendUpdate(payload) {
  if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify({ type: "update", ...payload }));
  }
}

function applySyncDoc(msg) {
  if (msg.liveState) saveState(msg.liveState, true);
  if (msg.progress) saveProgress(msg.progress, true);
  if (msg.game) saveGame(msg.game, true);
}

function connectSync() {
  if (window.location.protocol === "file:") return; // no server possible
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  const url = `${proto}//${window.location.host}/ws`;
  try {
    ws = new WebSocket(url);
  } catch (e) {
    return;
  }
  ws.onopen = () => {
    reconnectDelay = 1000;
    setSyncStatus(true);
  };
  ws.onmessage = (event) => {
    let msg;
    try {
      msg = JSON.parse(event.data);
    } catch (e) {
      return;
    }
    if (msg.type === "sync") applySyncDoc(msg);
  };
  ws.onclose = () => {
    setSyncStatus(false);
    setTimeout(connectSync, reconnectDelay);
    reconnectDelay = Math.min(reconnectDelay * 1.6, 15000);
  };
  ws.onerror = () => {
    try {
      ws.close();
    } catch (e) {
      /* onclose will still fire and schedule a retry */
    }
  };
}

connectSync();
