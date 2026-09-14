const ACTIVITIES = [
  { id: "sounds", label: "Sound Cards", desc: "Flash one letter-sound at a time." },
  { id: "blend", label: "Build & Blend", desc: "Sound-button words to blend aloud." },
  { id: "tricky", label: "Tricky Words", desc: "Words to just know, not sound out." },
  { id: "story", label: "Story Time", desc: "Short decodable sentences to read." },
  { id: "alien", label: "Alien Word Check", desc: "Made-up words — pure decoding practice." },
];

const COACH_TIPS = {
  sounds:
    "Say the SOUND, not the letter name (\"mmm\", not \"em\"). Show the card, let him have a go, then tap Reveal for the example word and a picture.",
  blend:
    "Point under each sound button left to right, saying each sound, then run your finger under the whole word and say it fast — that's blending. Little Wandle calls this decoding.",
  tricky:
    "These can't be sounded out reliably, so the goal is instant recognition, not decoding. If he tries to sound one out, just tell him the word — that's the right move here.",
  story:
    "This is like a Little Wandle \"reading practice\" session: read it once together for accuracy, then read it again for expression, then talk about what happened. Bold words are the tricky ones — just tell him those.",
  alien:
    "These aren't real words — that's the point. It checks pure decoding (same idea as the Year 1 phonics screening check's \"alien words\"), so there's no guessing from meaning.",
  "game-tic":
    "He reads the word out loud before you let him claim a square — the game shouldn't outrun the reading. He plays as 🟢 against a robot that just picks randomly, so it's genuinely winnable (and losable — that's fine, it's low-stakes).",
  "game-pairs":
    "A memory game with a phonics twist: each pair is the same word shown two ways — sound-buttons and whole-word — so matching them means reading both, not just remembering positions.",
  "game-bingo":
    "Call a word out (tap Call next word so he can't just watch your face for clues), and let him scan his own board to find it — that's real word recognition practice, not just listening.",
};

function renderPhasePicker() {
  const state = loadState();
  const el = document.getElementById("phase-picker");
  el.innerHTML = "";
  Object.keys(PHONICS_DATA.phases).forEach((p) => {
    const phase = PHONICS_DATA.phases[p];
    const btn = document.createElement("button");
    btn.className = "choice-btn" + (String(state.phase) === p ? " active" : "");
    btn.innerHTML = `<strong>${phase.name}</strong><small>${phase.subtitle}</small>`;
    btn.onclick = () => {
      const setId = firstUnlearnedSet(p);
      saveState({ phase: Number(p), setId, index: 0 });
      renderAll();
    };
    el.appendChild(btn);
  });
  document.getElementById("phase-blurb").textContent = PHONICS_DATA.phases[state.phase].blurb;
}

function renderChecklists() {
  const state = loadState();
  const phaseData = PHONICS_DATA.phases[state.phase];
  const progress = loadProgress();

  const setEl = document.getElementById("set-checklist");
  setEl.innerHTML = "";
  phaseData.sets.forEach((s) => {
    const chip = document.createElement("button");
    const done = !!progress.gpcs[s.id];
    chip.className = "check-chip" + (done ? " done" : "");
    chip.textContent = `${done ? "✅" : "⬜"} ${s.label} (${gpcSetLabel(s)})`;
    chip.onclick = () => {
      markSetLearned(s.id, !done);
      renderChecklists();
    };
    setEl.appendChild(chip);
  });

  const trickyEl = document.getElementById("tricky-checklist");
  trickyEl.innerHTML = "";
  phaseData.trickyWords.forEach((w) => {
    const key = `${state.phase}:${w}`;
    const done = !!progress.tricky[key];
    const chip = document.createElement("button");
    chip.className = "check-chip" + (done ? " done" : "");
    chip.textContent = `${done ? "✅" : "⬜"} ${w}`;
    chip.onclick = () => {
      markTrickyLearned(state.phase, w, !done);
      renderChecklists();
    };
    trickyEl.appendChild(chip);
  });
}

function renderActivityPicker() {
  let state = loadState();
  const phaseDataForGuard = PHONICS_DATA.phases[state.phase];
  if (phaseDataForGuard.noNewSounds && state.activity === "sounds") {
    state = saveState({ activity: "blend", index: 0 });
  }
  const el = document.getElementById("activity-picker");
  el.innerHTML = "";
  const activities = ACTIVITIES.filter(
    (a) => !(a.id === "sounds" && phaseDataForGuard.noNewSounds)
  );
  activities.forEach((a) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn" + (state.activity === a.id ? " active" : "");
    btn.innerHTML = `<strong>${a.label}</strong><small>${a.desc}</small>`;
    btn.onclick = () => {
      saveState({ activity: a.id, index: 0 });
      renderAll();
    };
    el.appendChild(btn);
  });

  const gameEl = document.getElementById("game-picker");
  gameEl.innerHTML = "";
  Object.keys(GAME_META).forEach((kind) => {
    const id = `game-${kind}`;
    const meta = GAME_META[kind];
    const btn = document.createElement("button");
    btn.className = "choice-btn" + (state.activity === id ? " active" : "");
    btn.innerHTML = `<strong>🎲 ${meta.label}</strong><small>${meta.desc}</small>`;
    btn.onclick = () => {
      saveState({ activity: id, index: 0 });
      renderAll();
    };
    gameEl.appendChild(btn);
  });

  document.getElementById("coach-tip").textContent = COACH_TIPS[state.activity] || "";

  const subEl = document.getElementById("set-sub-picker");
  subEl.innerHTML = "";
  const needsSetPicker =
    state.activity === "sounds" || state.activity === "blend" || gameKindFromActivity(state.activity);
  if (needsSetPicker) {
    const phaseData = PHONICS_DATA.phases[state.phase];
    const label = document.createElement("p");
    label.style.fontWeight = "700";
    label.textContent = "Which set?";
    subEl.appendChild(label);
    const grid = document.createElement("div");
    grid.className = "choice-grid";
    phaseData.sets.forEach((s) => {
      const btn = document.createElement("button");
      btn.className = "choice-btn" + (state.setId === s.id ? " active" : "");
      btn.innerHTML = `<strong>${s.label}</strong><small>${gpcSetLabel(s)}</small>`;
      btn.onclick = () => {
        saveState({ setId: s.id, index: 0 });
        renderAll();
      };
      grid.appendChild(btn);
    });
    subEl.appendChild(grid);
  }
  if (phaseDataForGuard.noNewSounds) {
    const note = document.createElement("p");
    note.className = "note-box";
    note.style.marginTop = "10px";
    note.textContent = "No Sound Cards for Phase 4 — there are no new letter-sounds this phase, just squashing known sounds together.";
    subEl.appendChild(note);
  }

  const newGameRow = document.getElementById("new-game-row");
  newGameRow.innerHTML = "";
  const kind = gameKindFromActivity(state.activity);
  if (kind) {
    const bank = getWordBank(state);
    const btn = document.createElement("button");
    btn.className = "btn accent";
    btn.textContent = "🎲 Start new game";
    btn.disabled = bank.length < 3;
    btn.onclick = () => startGame(kind, state);
    newGameRow.appendChild(btn);
    if (bank.length < 3) {
      const warn = document.createElement("p");
      warn.className = "note-box";
      warn.style.marginTop = "8px";
      warn.textContent = "This set only has " + bank.length + " word" + (bank.length === 1 ? "" : "s") + " — pick one with at least 3 for a game.";
      newGameRow.appendChild(warn);
    }
  }
}

function renderModePicker() {
  const state = loadState();
  const el = document.getElementById("mode-picker");
  el.innerHTML = "";
  [
    { id: "practice", label: "Practice", desc: "Hints stay on screen." },
    { id: "check", label: "Check", desc: "No hints — like an assessment." },
  ].forEach((m) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn" + (state.mode === m.id ? " active" : "");
    btn.innerHTML = `<strong>${m.label}</strong><small>${m.desc}</small>`;
    btn.onclick = () => {
      saveState({ mode: m.id });
      renderAll();
    };
    el.appendChild(btn);
  });
}

function renderStars() {
  const state = loadState();
  document.getElementById("star-count").textContent = state.sessionStars;
}

function renderSyncStatus() {
  const el = document.getElementById("sync-status");
  el.textContent = isSyncConnected() ? "🟢 Synced across devices" : "🟡 This device only";
  el.className = "sync-pill" + (isSyncConnected() ? " on" : "");
}

function renderAll() {
  renderPhasePicker();
  renderChecklists();
  renderActivityPicker();
  renderModePicker();
  renderStars();
  renderSyncStatus();
}

document.getElementById("start-here").onclick = () => {
  window.location.href = "play.html";
};
document.getElementById("start-new-tab").onclick = () => {
  window.open("play.html", "_blank");
};
document.getElementById("reset-session").onclick = () => {
  saveState({ sessionStars: 0, index: 0 });
  renderAll();
};

window.addEventListener("storage", renderAll);
window.addEventListener("rd-state-changed", renderAll);
window.addEventListener("rd-sync-status", renderSyncStatus);

renderAll();
