/* The child's screen. No controls, no menus — just whatever the grown-up has
 * put up, plus a sticker that pops when one gets sent. */

function rerender() { render(); }

let lastSticker = 0;

/* Only pop a sticker that was actually just sent. Without the freshness
 * check, reloading his screen (or it reconnecting) would replay whatever
 * sticker was last stored, which looks like a glitch rather than a reward. */
const STICKER_FRESH_MS = 20000;

function showSticker(st) {
  if (!st || st.t <= lastSticker) return;
  if (Date.now() - st.t > STICKER_FRESH_MS) { lastSticker = st.t; return; }
  lastSticker = st.t;
  const pop = document.getElementById("stickerpop");
  pop.textContent = st.emoji;
  pop.hidden = false;
  pop.classList.remove("go");
  void pop.offsetWidth;
  pop.classList.add("go");
  setTimeout(() => { pop.hidden = true; }, 3200);
}

function render() {
  const s = loadState();
  const a = ACTIVITIES[s.activity] || ACTIVITIES.flashcards;
  document.getElementById("stu-activity").textContent = a.label;
  const stage = document.getElementById("stage");
  stage.innerHTML = "";
  a.render(stage, "student");
  showSticker(s.sticker);
}

document.getElementById("stu-exit").onclick = () => {
  if (window.confirm("Go back to the grown-up's portal?")) window.location.href = "coach.html";
};

window.addEventListener("rd-change", render);
window.addEventListener("rd-sync", render);
window.addEventListener("storage", render);
render();
