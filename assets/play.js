const isEmbed = new URLSearchParams(window.location.search).get("embed") === "1";
let revealed = false;
let showComplete = false;

if (isEmbed) {
  document.getElementById("gear-btn").style.display = "none";
}

document.getElementById("gear-btn").onclick = () => {
  if (window.confirm("Grown-up bit — go back to the Coach panel?")) {
    window.location.href = "coach.html";
  }
};

function findExampleWord(phaseData, gpc) {
  const hit = phaseData.words.find((w) => w.chunks.includes(gpc));
  return hit ? hit.word : null;
}

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

function goNext() {
  const state = loadState();
  const items = getItemsForActivity(state);
  if (state.index + 1 >= items.length) {
    showComplete = true;
    render();
    return;
  }
  revealed = false;
  saveState({ index: state.index + 1 });
}

function goBack() {
  const state = loadState();
  if (state.index === 0) return;
  revealed = false;
  saveState({ index: state.index - 1 });
}

function replay() {
  showComplete = false;
  saveState({ index: 0 });
}

function renderComplete(state) {
  document.getElementById("stage").innerHTML = `
    <div class="emoji-big">🏆</div>
    <h1>Amazing reading!</h1>
    <p class="sentence-text">You earned ${state.sessionStars} star${state.sessionStars === 1 ? "" : "s"} this session.</p>
  `;
  document.getElementById("controls").innerHTML = "";
  const again = document.createElement("button");
  again.className = "kid-btn next";
  again.textContent = "🔁 Play again";
  again.onclick = replay;
  document.getElementById("controls").appendChild(again);
  burstConfetti();
}

function render() {
  const state = loadState();
  document.getElementById("stars-display").textContent = "⭐".repeat(Math.min(state.sessionStars, 10)) || "☆";
  document.getElementById("mode-badge").textContent = state.mode === "check" ? "Check mode" : "";
  document.getElementById("mode-badge").style.visibility = state.mode === "check" ? "visible" : "hidden";

  if (showComplete) {
    renderComplete(state);
    return;
  }

  const phaseData = PHONICS_DATA.phases[state.phase];
  const items = getItemsForActivity(state);
  if (items.length === 0) {
    document.getElementById("stage").innerHTML = `<p>Ask the grown-up to pick a set in the Coach panel first!</p>`;
    document.getElementById("controls").innerHTML = "";
    return;
  }
  const idx = Math.min(state.index, items.length - 1);
  const item = items[idx];
  const stage = document.getElementById("stage");
  const controls = document.getElementById("controls");
  stage.innerHTML = "";
  controls.innerHTML = "";

  const backBtn = () => {
    const b = document.createElement("button");
    b.className = "kid-btn back";
    b.textContent = "⬅ Back";
    b.disabled = idx === 0;
    b.onclick = goBack;
    return b;
  };
  const nextBtn = (label = "Next ➡") => {
    const b = document.createElement("button");
    b.className = "kid-btn next";
    b.textContent = label;
    b.onclick = () => {
      awardStar();
      goNext();
    };
    return b;
  };

  if (item.type === "sound") {
    const example = item.example || findExampleWord(phaseData, item.gpc);
    stage.innerHTML = `<div class="big-grapheme">${item.gpc}</div>` +
      (revealed && example ? `<div class="reveal-word">${example}</div>` : `<p class="lead">What sound is this?</p>`);
    controls.appendChild(backBtn());
    const revealBtn = document.createElement("button");
    revealBtn.className = "kid-btn reveal";
    revealBtn.textContent = "🔍 Reveal word";
    revealBtn.onclick = () => { revealed = true; render(); };
    controls.appendChild(revealBtn);
    controls.appendChild(nextBtn());
  }

  if (item.type === "word") {
    const showChunks = state.mode === "practice" || revealed;
    if (showChunks) {
      stage.innerHTML = `<div class="sound-buttons">${item.chunks
        .map((c) => `<span class="sound-chunk">${c}</span>`)
        .join("")}</div>` + (revealed ? `<div class="reveal-word">${item.word}</div>` : "");
    } else {
      stage.innerHTML = `<div class="big-grapheme" style="font-size:min(18vw,6rem);">${item.word}</div><p class="lead">Read it — then check your sound buttons!</p>`;
    }
    controls.appendChild(backBtn());
    const revealBtn = document.createElement("button");
    revealBtn.className = "kid-btn reveal";
    revealBtn.textContent = state.mode === "practice" ? "🔊 Say it fast!" : "🔍 Show sound buttons";
    revealBtn.onclick = () => { revealed = true; render(); };
    controls.appendChild(revealBtn);
    controls.appendChild(nextBtn());
  }

  if (item.type === "tricky") {
    stage.innerHTML = `<div class="big-grapheme" style="font-size:min(20vw,7rem);">${item.word}</div>` +
      (state.mode === "practice" ? `<p class="lead">Tricky word — just say it!</p>` : "");
    controls.appendChild(backBtn());
    controls.appendChild(nextBtn("⭐ Got it!"));
  }

  if (item.type === "sentence") {
    const text = state.mode === "practice" ? boldTrickyWords(item.text, item.tricky) : item.text;
    stage.innerHTML = `<div class="sentence-text">${text}</div>`;
    controls.appendChild(backBtn());
    controls.appendChild(nextBtn("⭐ Read it! Next"));
  }

  if (item.type === "alien") {
    stage.innerHTML = `<div class="emoji-big">👽</div><div class="big-grapheme" style="font-size:min(20vw,7rem);">${
      revealed ? item.word.split("").join("·") : item.word
    }</div>` + (state.mode === "practice" ? `<p class="lead">Not a real word — sound it out!</p>` : "");
    controls.appendChild(backBtn());
    const revealBtn = document.createElement("button");
    revealBtn.className = "kid-btn reveal";
    revealBtn.textContent = "🔍 Split it up";
    revealBtn.onclick = () => { revealed = true; render(); };
    controls.appendChild(revealBtn);
    controls.appendChild(nextBtn());
  }
}

window.addEventListener("storage", () => { revealed = false; render(); });
window.addEventListener("rd-state-changed", render);

render();
