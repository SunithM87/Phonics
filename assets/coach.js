/* The reader portal shell: sidebar, level chips, directions, sticker sender. */

function rerender() { render(); }

function renderSidebar(s) {
  const nav = document.getElementById("sidebar");
  nav.innerHTML = "";
  ACTIVITY_ORDER.forEach((key) => {
    const a = ACTIVITIES[key];
    nav.appendChild(el("button", {
      class: "navitem" + (s.activity === key ? " active" : ""),
      onclick: () => saveState({ activity: key, tab: (a.tabs && a.tabs[0].id) || null }),
    }, [el("span", { class: "navicon", text: a.icon }), el("span", { text: a.label })]));
  });
  nav.appendChild(el("button", {
    class: "stickerbtn", onclick: openStickers,
  }, [el("span", { class: "sticker-top", text: "SEND A" }), el("span", { class: "sticker-word", text: "Sticker" })]));

  // On narrow screens the sidebar is a horizontal strip, so keep whatever
  // is selected actually visible rather than scrolled off to the left.
  const active = nav.querySelector(".navitem.active");
  if (active && window.matchMedia("(max-width: 860px)").matches) {
    active.scrollIntoView({ block: "nearest", inline: "center" });
  }
}

function renderTabs(s, a) {
  const host = document.getElementById("tabs");
  host.innerHTML = "";
  if (!a.tabs) { host.hidden = true; return; }
  host.hidden = false;
  a.tabs.forEach((t) => {
    host.appendChild(el("button", {
      class: "tab" + (s.tab === t.id ? " active" : ""),
      text: t.label,
      onclick: () => saveState({ tab: t.id }),
    }));
  });
}

function currentDirections(s, a) {
  let d = a.directions;
  if (!d) return null;
  if (Array.isArray(d)) return d;
  if (s.activity === "stories") return s.story.id ? d.read : d.list;
  return d[s.tab] || d[Object.keys(d)[0]];
}

function renderDirections(s, a) {
  const host = document.getElementById("directions");
  const lines = currentDirections(s, a);
  if (!lines || !s.showDirections) { host.hidden = true; return; }
  host.hidden = false;
  host.innerHTML = "";
  host.appendChild(el("div", { class: "dir-head" }, [
    el("strong", { text: a.label + " · how to run it" }),
    el("button", { class: "dir-close", text: "✕", title: "Hide directions",
      onclick: () => saveState({ showDirections: false }) }),
  ]));
  host.appendChild(el("ul", {}, lines.map((l) => el("li", { html: l }))));
}

function renderChips(s) {
  document.getElementById("lc-level").textContent = s.level;
  const b = bandData(s.band);
  const tag = document.getElementById("lc-band");
  tag.textContent = b.label;
  tag.style.background = b.colour;
}

function openModal(title, body, note) {
  const card = document.getElementById("modal-card");
  card.innerHTML = "";
  card.appendChild(el("div", { class: "modal-head" }, [
    el("h3", { text: title }),
    el("button", { class: "dir-close", text: "✕", onclick: closeModal }),
  ]));
  card.appendChild(body);
  if (note) card.appendChild(el("p", { class: "modal-note", html: note }));
  document.getElementById("modal").hidden = false;
}
function closeModal() { document.getElementById("modal").hidden = true; }

function openLevelPicker() {
  const s = loadState();
  const body = el("div", { class: "levelopts" }, LEVELS.map((l) =>
    el("button", {
      class: "levelopt" + (s.level === l.n ? " active" : ""),
      onclick: () => { saveState({ level: l.n, fc: { sound: null, word: null, tricky: null }, sort: { round: 0, placed: {} }, myst: { word: null, guessed: [], seed: 0 }, wheel: { round: 0, onset: 0 } }); closeModal(); },
    }, [
      el("span", { class: "lo-n", text: l.n }),
      el("span", {}, [
        el("strong", { text: `${l.phase} · ${l.term}` }),
        el("span", { class: "lo-blurb", text: l.blurb }),
        el("span", { class: "lo-sounds", text: l.newSounds.length ? l.newSounds.join("  ") : "No new sounds — adjacent consonants" }),
      ]),
    ])
  ));
  openModal("Activity Level", body,
    "Drives flashcards and games. Follows the published Little Wandle Reception/Year&nbsp;1 order — four new sounds a week. Move it whenever school does.");
}

function openBandPicker() {
  const s = loadState();
  const body = el("div", { class: "levelopts" }, BANDS.map((b) =>
    el("button", {
      class: "levelopt" + (s.band === b.id ? " active" : ""),
      onclick: () => { saveState({ band: b.id, story: { id: null, page: 0, hl: null } }); closeModal(); },
    }, [
      el("span", { class: "lo-band", style: `background:${b.colour}` }),
      el("span", {}, [
        el("strong", { text: `${b.label} band · ${b.phase}` }),
        el("span", { class: "lo-blurb", text: b.about }),
        el("span", { class: "lo-sounds", text: `${storiesForBand(b.id).length} books` }),
      ]),
    ])
  ));
  openModal("Story Level", body,
    "Book-band colours are what most schools use, but they are <strong>not</strong> an official Little&nbsp;Wandle thing — Little Wandle itself labels books by Phase and Set, and Collins prints “Phase 4 Set 2” on the back rather than a colour. Treat the colour as a rough guide and go by what comes home in his book bag.");
}

function openStickers() {
  const body = el("div", { class: "stickergrid" }, STICKERS.map((emoji) =>
    el("button", { class: "stickeropt", text: emoji, onclick: () => { sendSticker(emoji); closeModal(); } })
  ));
  openModal("Send a sticker", body, "It pops up big on his screen for a few seconds. Worth saving for something he found hard.");
}

function render() {
  const s = loadState();
  const a = ACTIVITIES[s.activity] || ACTIVITIES.flashcards;
  renderSidebar(s);
  renderTabs(s, a);
  renderChips(s);
  renderDirections(s, a);

  const dirBtn = document.getElementById("directions-toggle");
  dirBtn.textContent = s.showDirections ? "Hide directions" : "Directions";

  const stage = document.getElementById("stage");
  stage.innerHTML = "";
  a.render(stage, "coach");

  const pill = document.getElementById("syncpill");
  pill.textContent = isSynced() ? "● Synced to his screen" : "● This device only";
  pill.className = "syncpill" + (isSynced() ? " on" : "");
}

document.getElementById("directions-toggle").onclick = () => saveState({ showDirections: !loadState().showDirections });
document.getElementById("chip-level").onclick = openLevelPicker;
document.getElementById("chip-band").onclick = openBandPicker;
document.getElementById("modal").onclick = (e) => { if (e.target.id === "modal") closeModal(); };
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

window.addEventListener("rd-change", render);
window.addEventListener("rd-sync", render);
window.addEventListener("storage", render);
render();
