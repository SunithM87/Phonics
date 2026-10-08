/* The child's screen. No controls, no menus — just whatever the grown-up has
 * put up, plus a sticker that pops when one gets sent. */

function rerender() { render(); }

let lastSticker = 0;
const STICKER_FRESH_MS = 20000;

function showSticker(st) {
  if (!st || st.t <= lastSticker) return;
  if (Date.now() - st.t > STICKER_FRESH_MS) { lastSticker = st.t; return; }
  lastSticker = st.t;
  const pop = document.getElementById("stickerpop");
  pop.textContent = st.emoji; pop.hidden = false;
  pop.classList.remove("go"); void pop.offsetWidth; pop.classList.add("go");
  setTimeout(() => { pop.hidden = true; }, 3200);
}

function renderPill() {
  const pill = document.getElementById("stu-sync");
  const p = getPresence();
  if (!isSynced()) { pill.textContent = "not connected"; pill.className = "stu-pill"; }
  else if (serverOutOfDate()) { pill.textContent = "● connected"; pill.className = "stu-pill on"; }
  else if (p.coaches > 0) { pill.textContent = "● connected"; pill.className = "stu-pill on"; }
  else { pill.textContent = "● waiting for the grown-up's screen"; pill.className = "stu-pill warn"; }
}

/* Between sessions his screen rests: "all done" just after one ends, then
 * "ready when you are" until the next one starts. */
function renderRest(stage, s) {
  const justEnded = s.ended && Date.now() - s.ended.at < 30 * 60 * 1000 && !s.ended.auto;
  if (justEnded) {
    const x = s.ended.summary || { sounds: { yes: [] }, tricky: { yes: [] }, reads: [] };
    const stars = Math.min(10, Math.max(1, x.sounds.yes.length + x.tricky.yes.length + x.reads.length));
    stage.appendChild(el("div", { class: "rest done" }, [
      el("div", { class: "rest-stars", text: "⭐".repeat(stars) }),
      el("h1", { class: "rest-title", text: "All done!" }),
      el("p", { class: "rest-sub", text: "Great reading today." }),
    ]));
  } else {
    stage.appendChild(el("div", { class: "rest" }, [
      el("div", { class: "rest-icon", text: "📖" }),
      el("h1", { class: "rest-title", text: "Ready when you are!" }),
    ]));
  }
}

function render() {
  const s = loadState();
  const stage = document.getElementById("stage");
  stage.innerHTML = "";
  if (!s.session) {
    document.getElementById("stu-activity").textContent = "";
    renderRest(stage, s);
    showSticker(s.sticker);
    renderPill();
    return;
  }
  const a = ACTIVITIES[s.activity] || ACTIVITIES.flashcards;
  document.getElementById("stu-activity").textContent = a.label;
  a.render(stage, "student");
  showSticker(s.sticker);
  renderPill();
}

document.getElementById("stu-exit").onclick = () => { if (window.confirm("Go back to the grown-up's portal?")) window.location.href = "coach.html"; };
window.addEventListener("rd-change", render);
window.addEventListener("rd-sync", renderPill);
window.addEventListener("storage", render);
render();
