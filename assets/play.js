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

function render() {
  const s = loadState();
  const a = ACTIVITIES[s.activity] || ACTIVITIES.flashcards;
  document.getElementById("stu-activity").textContent = a.label;
  const stage = document.getElementById("stage");
  stage.innerHTML = "";
  a.render(stage, "student");
  showSticker(s.sticker);
  renderPill();
}

document.getElementById("stu-exit").onclick = () => { if (window.confirm("Go back to the grown-up's portal?")) window.location.href = "coach.html"; };
window.addEventListener("rd-change", render);
window.addEventListener("rd-sync", renderPill);
window.addEventListener("storage", render);
render();
