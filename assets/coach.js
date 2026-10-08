/* The reader portal shell: sidebar, level chips, directions, sticker sender,
 * the "practise next" strip, and an honest connection pill. */

function rerender() { render(); }

/* On a phone or small tablet the sidebar folds into a menu button that
 * shows which activity is up; tapping it drops the full list down. The
 * open/closed state is this screen's alone, so it isn't synced. */
function setMenu(open) {
  document.body.classList.toggle("menu-open", open);
  document.getElementById("menutoggle").setAttribute("aria-expanded", open ? "true" : "false");
}

function renderSidebar(s) {
  const nav = document.getElementById("sidebar");
  nav.innerHTML = "";
  ACTIVITY_ORDER.forEach((key) => {
    const a = ACTIVITIES[key];
    nav.appendChild(el("button", { class: "navitem" + (s.activity === key ? " active" : ""),
      onclick: () => { setMenu(false); saveState({ activity: key, tab: (a.tabs && a.tabs[0].id) || null }); } },
      [el("span", { class: "navicon", text: a.icon }), el("span", { text: a.label })]));
  });
  nav.appendChild(el("button", { class: "stickerbtn", onclick: () => { setMenu(false); openStickers(); } },
    [el("span", { class: "sticker-top", text: "SEND A" }), el("span", { class: "sticker-word", text: "Sticker" })]));
  const cur = ACTIVITIES[s.activity] || ACTIVITIES.flashcards;
  const label = document.getElementById("mt-current");
  label.innerHTML = "";
  label.appendChild(el("span", { class: "navicon", text: cur.icon }));
  label.appendChild(document.createTextNode(cur.label));
}

function renderTabs(s, a) {
  const host = document.getElementById("tabs");
  host.innerHTML = "";
  if (!a.tabs) { host.hidden = true; return; }
  host.hidden = false;
  a.tabs.forEach((t) => host.appendChild(el("button", { class: "tab" + (s.tab === t.id ? " active" : ""), text: t.label, onclick: () => saveState({ tab: t.id }) })));
}

function currentDirections(s, a) {
  const d = a.directions;
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
  host.appendChild(el("div", { class: "dir-head" }, [el("strong", { text: a.label + " · how to run it" }),
    el("button", { class: "dir-close", text: "✕", title: "Hide directions", onclick: () => saveState({ showDirections: false }) })]));
  host.appendChild(el("ul", {}, lines.map((l) => el("li", { html: l }))));
}

/* What to practise next: sounds and tricky words up to his level that were
 * marked ✗ (most recent first), then ones never tried at the current unit. */
function renderPractise(s) {
  const host = document.getElementById("practise");
  host.innerHTML = "";
  if (s.activity !== "flashcards") { host.hidden = true; return; }
  const kind = s.tab === "tricky" ? "tricky" : "sounds";
  const items = kind === "tricky" ? trickyUpTo(s.level) : soundsUpTo(s.level);
  const unit = unitData(s.level);
  const current = kind === "tricky" ? unit.tricky : unit.sounds;
  const needs = items.filter((g) => verdictOf(kind, g) === "no").sort((a, b) => verdictWhen(kind, b) - verdictWhen(kind, a));
  const untried = current.filter((g) => !verdictOf(kind, g));
  const got = items.filter((g) => verdictOf(kind, g) === "yes").length;
  if (!needs.length && !untried.length && !items.length) { host.hidden = true; return; }
  host.hidden = false;
  const chip = (g) => el("button", { class: "pr-chip", text: gpcLabel(g),
    onclick: () => saveSub("fc", kind === "tricky" ? { tricky: g } : { sound: g, word: null }) });
  host.appendChild(el("span", { class: "pr-label", text: `${got} of ${items.length} ${kind === "tricky" ? "tricky words" : "sounds"} marked ✓` }));
  if (needs.length) host.appendChild(el("span", { class: "pr-group" }, [el("span", { class: "pr-title", text: "Needs another look:" }), ...needs.map(chip)]));
  if (untried.length) host.appendChild(el("span", { class: "pr-group" }, [el("span", { class: "pr-title", text: "Not tried yet this level:" }), ...untried.map(chip)]));
}

function renderChips(s) {
  const u = unitData(s.level);
  document.getElementById("lc-level").textContent = s.level;
  document.getElementById("lc-level-sub").textContent = `Phase ${u.phase} · ${u.label}`;
  const b = bandData(s.band);
  const tag = document.getElementById("lc-band");
  tag.textContent = b.label;
  tag.style.background = b.colour;
}

function openModal(title, body, note) {
  const card = document.getElementById("modal-card");
  card.innerHTML = "";
  card.appendChild(el("div", { class: "modal-head" }, [el("h3", { text: title }), el("button", { class: "dir-close", text: "✕", onclick: closeModal })]));
  card.appendChild(body);
  if (note) card.appendChild(el("p", { class: "modal-note", html: note }));
  document.getElementById("modal").hidden = false;
}
function closeModal() { document.getElementById("modal").hidden = true; }

/* Everything that depends on the level is reset when it changes — including
 * the 3 in a Row marks, which used to survive and sit over a new board. */
function setLevel(n) {
  saveState({
    level: n,
    fc: { sound: null, word: null, tricky: null, buttons: false },
    sort: { round: 0, placed: {} },
    tir: { round: 0, marks: [null, null, null, null, null, null, null, null, null] },
    myst: { word: null, guessed: [], seed: 0 },
    wheel: { round: 0, onset: 0 },
  });
}

function openLevelPicker() {
  const s = loadState();
  const body = el("div", { class: "levelopts" });
  let lastPhase = null;
  UNITS.forEach((u) => {
    if (u.phase !== lastPhase) {
      lastPhase = u.phase;
      body.appendChild(el("div", { class: "levelgroup", text: `Phase ${u.phase}` }));
    }
    body.appendChild(el("button", { class: "levelopt" + (s.level === u.n ? " active" : ""), onclick: () => { setLevel(u.n); closeModal(); } }, [
      el("span", { class: "lo-n", text: u.n }),
      el("span", {}, [
        el("strong", { text: `${u.term} · ${u.label}` }),
        el("span", { class: "lo-sounds", text: u.sounds.length ? u.sounds.map(gpcLabel).join("  ") : u.note || "" }),
        u.sounds.length && u.note ? el("span", { class: "lo-blurb", text: u.note }) : null,
        u.tricky.length ? el("span", { class: "lo-tricky", text: "Tricky: " + u.tricky.join(", ") }) : null,
      ]),
    ]));
  });
  openModal("Activity Level", body,
    "Drives flashcards and games. Each level is one of Little Wandle's own teaching units — a Reception week or a Year&nbsp;1 set — in the published order. Move it up whenever school does; move it down if he's finding a set hard.");
}

function openBandPicker() {
  const s = loadState();
  const body = el("div", { class: "levelopts" }, BANDS.map((b) => {
    const books = storiesForBand(b.id);
    return el("button", { class: "levelopt" + (s.band === b.id ? " active" : ""), onclick: () => { saveState({ band: b.id, story: { id: null, page: 0, hl: null } }); closeModal(); } }, [
      el("span", { class: "lo-band", style: `background:${b.colour}` }),
      el("span", {}, [
        el("strong", { text: `${b.label} · sounds up to Level ${b.level} · ${b.phase}` }),
        el("span", { class: "lo-blurb", text: b.about }),
        el("span", { class: "lo-sounds", text: books.map((st) => `${st.title} (L${st.level})`).join(" · ") || "no books yet" }),
      ]),
    ]);
  }));
  openModal("Story Level", body,
    "Each band's books use only sounds taught by the level shown, and every book card shows its own exact level. The colour names are the ones schools use, but they are <strong>not</strong> an official Little&nbsp;Wandle thing — Little Wandle and Collins label books by Phase and Set. Treat the colour as a rough guide and the level as the fact.");
}

function openStickers() {
  const body = el("div", { class: "stickergrid" }, STICKERS.map((emoji) => el("button", { class: "stickeropt", text: emoji, onclick: () => { sendSticker(emoji); closeModal(); } })));
  openModal("Send a sticker", body, "It pops up big on his screen for a few seconds. Worth saving for something he found hard.");
}

function renderPill() {
  const pill = document.getElementById("syncpill");
  const p = getPresence();
  if (!isSynced()) { pill.textContent = "● No server — this screen only"; pill.className = "syncpill"; }
  else if (serverOutOfDate()) { pill.textContent = "● Synced · server out of date, restart the container"; pill.className = "syncpill warn"; pill.title = "The server is an older version than the page. It still syncs, but it can't report whether his screen is open. Restart the container in the UGREEN Docker app (see README → Updating)."; }
  else if (p.students > 0) { pill.textContent = `● His screen is connected`; pill.className = "syncpill on"; }
  else { pill.textContent = "● Server on · his screen isn't open"; pill.className = "syncpill warn"; }
}

/* End session: show what he did, then save it and go back to the progress
 * page. His screen switches to its "all done" screen at the same moment. */
function openEndSession() {
  const s = loadState();
  if (!s.session) { window.location.href = "index.html"; return; }
  const x = summarise(s.session.start, Date.now());
  const yes = x.sounds.yes.concat(x.tricky.yes), no = x.sounds.no.concat(x.tricky.no);
  const body = el("div", { class: "endsum" }, [
    el("p", { class: "es-time", text: `${x.minutes} minute${x.minutes === 1 ? "" : "s"} so far` }),
    yes.length ? el("p", {}, [el("strong", { text: "Read it ✓ " }), el("span", { class: "rd", text: yes.map(gpcLabel).join("  ") })]) : null,
    no.length ? el("p", {}, [el("strong", { text: "Needs another look ✗ " }), el("span", { class: "rd", text: no.map(gpcLabel).join("  ") })]) : null,
    ...x.reads.map((r) => el("p", {}, [el("strong", { text: r.title + ": " }), el("span", { text: r.which.map((w) => READ_LABEL[w]).join(", ") })])),
    !yes.length && !no.length && !x.reads.length ? el("p", { class: "hint", text: "Nothing marked ✓ or ✗ this time. That's fine: the session still counts as practice." }) : null,
    el("p", { class: "hint", text: "Worth a sticker before you go?" }),
    el("div", { class: "stickergrid small" }, STICKERS.slice(0, 5).map((emoji) => el("button", { class: "stickeropt", text: emoji, onclick: () => sendSticker(emoji) }))),
    el("div", { class: "rowbtns" }, [
      el("button", { class: "btn ghost", text: "Keep going", onclick: closeModal }),
      el("button", { class: "btn", text: "End session", onclick: () => { endSession(); window.location.href = "index.html"; } }),
    ]),
  ]);
  openModal("End this session?", body, "It's saved to his record and shown on the progress page. His screen says well done.");
}

/* Keep a list of which activities this session used, for the summary. */
function noteActivity(s) {
  if (s.session && !(s.session.acts || []).includes(s.activity)) {
    saveState({ session: Object.assign({}, s.session, { acts: (s.session.acts || []).concat([s.activity]) }) });
    return true;
  }
  return false;
}

function render() {
  const s = loadState();
  // No session going on (ended here, on another device, or never started)?
  // Then this isn't the place to be: the progress page is.
  // (Wait for the server's copy first: this device's own copy may simply not
  // know yet that a session was started on another one.)
  if (!s.session) { if (firstSyncDone) window.location.replace("index.html"); return; }
  if (noteActivity(s)) return;
  const a = ACTIVITIES[s.activity] || ACTIVITIES.flashcards;
  renderSidebar(s); renderTabs(s, a); renderChips(s); renderDirections(s, a); renderPractise(s);
  document.getElementById("directions-toggle").textContent = s.showDirections ? "Hide directions" : "Directions";
  const stage = document.getElementById("stage");
  stage.innerHTML = "";
  a.render(stage, "coach");
  renderPill();
}

document.getElementById("end-session").onclick = openEndSession;
document.getElementById("directions-toggle").onclick = () => saveState({ showDirections: !loadState().showDirections });
document.getElementById("chip-level").onclick = openLevelPicker;
document.getElementById("chip-band").onclick = openBandPicker;
document.getElementById("modal").onclick = (e) => { if (e.target.id === "modal") closeModal(); };
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeModal(); setMenu(false); } });
document.getElementById("menutoggle").onclick = (e) => { e.stopPropagation(); setMenu(!document.body.classList.contains("menu-open")); };
document.addEventListener("click", (e) => {
  if (document.body.classList.contains("menu-open") && !e.target.closest("#sidebar, #menutoggle")) setMenu(false);
});
const MENU_QUERY = "(max-width: 860px), (max-width: 1180px) and (pointer: coarse)"; // matches style.css
window.matchMedia(MENU_QUERY).addEventListener("change", () => setMenu(false));

window.addEventListener("rd-change", render);
window.addEventListener("rd-sync", renderPill);
window.addEventListener("storage", render);
// A session left open for hours counts as over; check once we have the
// server's copy, so a stale local copy can't end someone else's session.
afterFirstSync(() => { if (closeStaleSession()) window.location.replace("index.html"); else render(); });
render();
