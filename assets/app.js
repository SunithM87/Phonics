/*
 * Shared state helpers for the Reading Den.
 *
 * State lives in localStorage so the Coach page and the Kid page can be two
 * tabs (or two windows) of the SAME browser and stay in sync — that's the
 * same trick chapterone.org's "reader portal" / "student view" split relies
 * on, just done with no server. Two separate DEVICES will only match if you
 * set them up the same way on each; localStorage doesn't travel between
 * devices. See README for details.
 */

const STATE_KEY = "rd_state_v1";
const PROGRESS_KEY = "rd_progress_v1";

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

function saveState(partial) {
  const next = { ...loadState(), ...partial, updatedAt: Date.now() };
  localStorage.setItem(STATE_KEY, JSON.stringify(next));
  // Fire a same-tab event too — the native 'storage' event only fires in
  // OTHER tabs/documents, not the one that made the change.
  window.dispatchEvent(new CustomEvent("rd-state-changed", { detail: next }));
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

function saveProgress(progress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
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
