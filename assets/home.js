/* The home page: where he is, how it's going, what to do next, and the
 * button that starts a session. Opening the app always lands here unless a
 * session is already going on. Everything is computed from the shared
 * record, so it's the same picture on any device. */

function rerender() { render(); }

const fmtTime = (t) => new Date(t).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
const fmtDay = (t) => new Date(t).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

function card(title, kids, cls) {
  return el("section", { class: "hcard " + (cls || "") }, [el("h2", { text: title }), ...kids]);
}

function statTile(value, label, sub) {
  return el("div", { class: "stat" }, [
    el("span", { class: "stat-value", text: value }),
    el("span", { class: "stat-label", text: label }),
    sub ? el("span", { class: "stat-sub", text: sub }) : null,
  ]);
}

/* A grid of sounds or tricky words, each marked ✓ / ✗ / not tried — with
 * the mark printed on the tile, so it never relies on colour alone. */
function markGrid(kind, items, label) {
  return el("div", { class: "mgrid" }, items.map((id) => {
    const v = verdictOf(kind, id);
    const when = verdictWhen(kind, id);
    return el("span", { class: "mtile" + (v ? " m-" + v : ""), title: v ? `${label(id)}: ${v === "yes" ? "✓ read" : "✗ needs another look"}, ${timeAgo(when)}` : `${label(id)}: not tried yet` }, [
      el("span", { class: "mtile-t", text: label(id) }),
      el("span", { class: "mtile-m", text: v === "yes" ? "✓" : v === "no" ? "✗" : "" }),
    ]);
  }));
}
function legend() {
  return el("p", { class: "mlegend" }, [
    el("span", { class: "mtile m-yes mini" }, [el("span", { class: "mtile-m", text: "✓" })]), el("span", { text: "read it" }),
    el("span", { class: "mtile m-no mini" }, [el("span", { class: "mtile-m", text: "✗" })]), el("span", { text: "needs another look" }),
    el("span", { class: "mtile mini" }), el("span", { text: "not tried yet" }),
  ]);
}

function sessionBanner(s) {
  if (s.session) {
    return el("div", { class: "banner live" }, [
      el("div", {}, [el("strong", { text: "A session is going on" }), el("span", { text: ` · started ${fmtTime(s.session.start)}` })]),
      el("div", { class: "banner-btns" }, [
        el("a", { class: "btn", href: "coach.html", text: "Resume" }),
        el("button", { class: "btn ghost", text: "End it", onclick: () => { endSession(); render(); } }),
      ]),
    ]);
  }
  return null;
}

function lastSessionCard(s) {
  const e = s.ended;
  if (!e || Date.now() - e.at > 12 * 3600 * 1000) return null;
  const x = e.summary;
  const rows = [];
  const yes = x.sounds.yes.concat(x.tricky.yes), no = x.sounds.no.concat(x.tricky.no);
  rows.push(el("p", { class: "ls-head", text: `${fmtTime(x.start)}–${fmtTime(x.end)} · ${x.minutes} min${e.auto ? " (left open, so ended automatically)" : ""}` }));
  if (yes.length) rows.push(el("p", {}, [el("strong", { text: "Read it ✓ " }), el("span", { class: "rd", text: yes.map(gpcLabel).join("  ") })]));
  if (no.length) rows.push(el("p", {}, [el("strong", { text: "Needs another look ✗ " }), el("span", { class: "rd", text: no.map(gpcLabel).join("  ") })]));
  x.reads.forEach((r) => rows.push(el("p", {}, [el("strong", { text: r.title + ": " }), el("span", { text: r.which.map((w) => READ_LABEL[w]).join(", ") })])));
  if (rows.length === 1) rows.push(el("p", { class: "hint", text: "Nothing was marked ✓ or ✗ in that one." }));
  return card("Last session", rows, "last");
}

function render() {
  const host = document.getElementById("home");
  const s = loadState();
  const u = unitData(s.level), b = bandData(s.band);
  const sounds = itemStats("sounds", soundsUpTo(s.level));
  const tricky = itemStats("tricky", trickyUpTo(s.level));
  const books = bookStats(s.level);
  const week = weekSessions();
  const days = lastNDays(14);
  const st = streak();
  host.innerHTML = "";

  /* Where he is, and the way in */
  host.appendChild(el("section", { class: "hero" }, [
    el("div", { class: "hero-where" }, [
      el("span", { class: "hero-kicker", text: "Working on" }),
      el("h1", {}, [el("span", { text: `Level ${s.level}` }), el("small", { text: ` · Phase ${u.phase}, ${u.term.replace("Reception · ", "Reception ").replace("Year 1 · ", "Year 1 ")} ${u.label}` })]),
      el("p", {}, [
        el("span", { text: u.sounds.length ? `New sounds: ` : "" }), u.sounds.length ? el("span", { class: "rd", text: u.sounds.map(gpcLabel).join("  ") }) : el("span", { text: u.note || "" }),
        el("span", { text: " · Story Level " }), el("span", { class: "bandtag", style: `background:${b.colour}`, text: b.label }),
      ]),
    ]),
    el("div", { class: "hero-go" }, [
      s.session ? null : el("button", { class: "btn big", id: "start", text: "Start a session", disabled: true,
        onclick: () => { startSession(); window.location.href = "coach.html"; } }),
      el("span", { class: "hint", text: s.session ? "" : "Starts at Flashcards with a clean slate. His levels stay as they are." }),
    ]),
  ]));
  const banner = sessionBanner(s);
  if (banner) host.appendChild(banner);

  /* The headline numbers */
  host.appendChild(el("section", { class: "stats" }, [
    statTile(`${sounds.yes.length}/${soundsUpTo(s.level).length}`, "sounds read", sounds.no.length ? `${sounds.no.length} to practise` : sounds.untried.length ? `${sounds.untried.length} not tried yet` : "all of them ✓"),
    statTile(`${tricky.yes.length}/${trickyUpTo(s.level).length}`, "tricky words", trickyUpTo(s.level).length ? (tricky.no.length ? `${tricky.no.length} to practise` : tricky.untried.length ? `${tricky.untried.length} not tried yet` : "all of them ✓") : "none yet at this level"),
    statTile(String(books.done.length), "books read 3 times", books.going.length ? `${books.going.length} part-way through` : `${books.atLevel.length} at his level`),
    statTile(String(week.count), week.count === 1 ? "session this week" : "sessions this week", week.minutes ? `${week.minutes} min${st > 1 ? ` · ${st} days in a row` : ""}` : st > 1 ? `${st} days in a row` : "little and often is the aim"),
  ]));

  const last = lastSessionCard(s);
  const cols = el("div", { class: "hcols" });
  const left = el("div", { class: "hcol" }), right = el("div", { class: "hcol" });

  /* Practice: last two weeks */
  left.appendChild(card("Practice, last two weeks", [
    el("div", { class: "days" }, days.map((d) => el("span", { class: "day" + (d.practised ? " on" : ""), title: `${fmtDay(d.date)}: ${d.practised ? "practised" : "no practice"}` }, [
      el("span", { class: "day-dot", text: d.practised ? "✓" : "" }),
      el("span", { class: "day-l", text: d.date.toLocaleDateString("en-GB", { weekday: "narrow" }) }),
    ]))),
    el("p", { class: "hint", text: "Little Wandle suggests short, regular practice: ten minutes most days beats an hour at the weekend." }),
  ]));

  /* What to do next time */
  const needs = sounds.no.map((g) => ({ kind: "sound", id: g })).concat(tricky.no.map((w) => ({ kind: "tricky", id: w })));
  const untriedNow = itemStats("sounds", u.sounds).untried.concat(itemStats("tricky", u.tricky).untried);
  const nb = nextBook(s);
  const nextKids = [];
  if (needs.length) nextKids.push(el("p", {}, [el("strong", { text: "Needs another look: " }), el("span", { class: "rd", text: needs.map((n) => gpcLabel(n.id)).join("  ") })]));
  if (untriedNow.length) nextKids.push(el("p", {}, [el("strong", { text: `Not tried yet at Level ${s.level}: ` }), el("span", { class: "rd", text: untriedNow.map(gpcLabel).join("  ") })]));
  if (nb) nextKids.push(el("div", { class: "nextbook" }, [
    el("div", { class: "nb-cover", html: drawScene(nb.st.cover) }),
    el("div", {}, [el("strong", { text: nb.st.title }), el("span", { class: "hint", text: `Level ${nb.st.level} · ${KIND_LABEL[nb.st.kind]} · ${nb.why}` })]),
  ]));
  const allSecure = soundsUpTo(s.level).length && sounds.yes.length === soundsUpTo(s.level).length && tricky.no.length === 0 && tricky.untried.length === 0;
  if (allSecure) nextKids.push(el("p", { class: "secure", text: `Every sound and tricky word up to Level ${s.level} is marked ✓. If school has moved on, move his Activity Level up in the reader portal. If not, keep reading books at this level for fluency.` }));
  if (!nextKids.length) nextKids.push(el("p", { class: "hint", text: "Start a session and mark a few sounds ✓ or ✗; suggestions appear here." }));
  right.appendChild(card("Next time", nextKids));
  if (last) right.appendChild(last);

  /* Sounds and tricky words */
  const nextUnit = UNITS.find((x) => x.n === s.level + 1);
  left.appendChild(card(`Sounds up to Level ${s.level}`, [
    markGrid("sounds", soundsUpTo(s.level), gpcLabel), legend(),
    nextUnit && nextUnit.sounds.length ? el("p", { class: "hint", text: `Coming next (Level ${nextUnit.n}): ${nextUnit.sounds.map(gpcLabel).join("  ")}` }) : null,
  ]));
  if (trickyUpTo(s.level).length) left.appendChild(card("Tricky words", [markGrid("tricky", trickyUpTo(s.level), (w) => w)]));
  else left.appendChild(card("Tricky words", [el("p", { class: "hint", text: "None yet. The first, is, arrives at Level 3." })]));

  /* Books */
  right.appendChild(card("Books", [
    books.going.length ? el("div", { class: "blist" }, books.going.map(({ st, n }) => el("div", { class: "brow" }, [
      el("span", { text: st.title }), el("span", { class: "dots", title: `${n} of 3 reads`, text: "●".repeat(n) + "○".repeat(3 - n) }),
    ]))) : null,
    books.done.length ? el("p", {}, [el("strong", { text: "Read three times: " }), el("span", { text: books.done.map((x) => x.title).join(", ") })]) : null,
    el("p", { class: "hint", text: `${books.atLevel.length} books use only sounds up to Level ${s.level}.` }),
  ]));

  /* Recent sessions */
  const recent = (loadProgress().sessions || []).slice(-6).reverse();
  right.appendChild(card("Recent sessions", recent.length
    ? [el("div", { class: "slist" }, recent.map((x) => el("div", { class: "srow" }, [
        el("span", { class: "s-when", text: `${fmtDay(x.start)} · ${x.minutes} min` }),
        el("span", { class: "s-what", text: sessionLine(x) }),
      ])))]
    : [el("p", { class: "hint", text: "None yet. They're listed here once you end a session." })]));

  cols.appendChild(left); cols.appendChild(right);
  host.appendChild(cols);

  afterFirstSync(() => { const b2 = document.getElementById("start"); if (b2) b2.disabled = false; });
  renderPill();
}

function renderPill() {
  const pill = document.getElementById("syncpill");
  const p = getPresence();
  if (!isSynced()) { pill.textContent = "● No server — this screen only"; pill.className = "syncpill"; }
  else if (p.students > 0) { pill.textContent = "● His screen is connected"; pill.className = "syncpill on"; }
  else { pill.textContent = "● Server on · his screen isn't open"; pill.className = "syncpill warn"; }
}

afterFirstSync(() => { if (closeStaleSession()) render(); });
window.addEventListener("rd-change", render);
window.addEventListener("rd-sync", renderPill);
window.addEventListener("storage", render);
render();
