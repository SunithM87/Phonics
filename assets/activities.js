/*
 * The seven activities. Each one renders into a host element in one of two
 * modes: "coach" (the grown-up's portal — controls, answers, assessment) and
 * "student" (the child's screen — just the thing being read).
 *
 * Every activity keeps its state in the shared synced document (core.js), so
 * the two screens can be two tabs, or a laptop and a tablet in the same room.
 */

/* ------------------------------------------------------------------ */
/* shared bits                                                         */
/* ------------------------------------------------------------------ */

function assessRow(kind, id, label) {
  const v = verdictOf(kind, id);
  return el("div", { class: "assess" }, [
    el("button", {
      class: "assess-yes" + (v === "yes" ? " on" : ""),
      onclick: () => { assess(kind, id, v === "yes" ? null : "yes"); rerender(); },
    }, `✓  ${label ? label : "Read it"}`),
    el("button", {
      class: "assess-no" + (v === "no" ? " on" : ""),
      onclick: () => { assess(kind, id, v === "no" ? null : "no"); rerender(); },
    }, "✗  Not yet"),
  ]);
}

function tile(text, opts) {
  const o = opts || {};
  return el("button", {
    class: "tile" + (o.verdict ? " v-" + o.verdict : "") + (o.active ? " active" : "") + (o.cls ? " " + o.cls : ""),
    onclick: o.onclick,
    disabled: o.disabled,
  }, [o.num ? el("span", { class: "tile-num", text: o.num }) : null, el("span", { class: "tile-text", text: text })]);
}

function bigWord(word, cls) {
  return el("div", { class: "bigword " + (cls || ""), text: word });
}

function emptyMsg(msg) {
  return el("p", { class: "empty", text: msg });
}

/* ------------------------------------------------------------------ */
/* 1. Flashcards                                                       */
/* ------------------------------------------------------------------ */

const flashcards = {
  label: "Flashcards", icon: "✦",
  tabs: [{ id: "sounds", label: "Sounds" }, { id: "tricky", label: "Tricky Words" }],
  directions: {
    sounds: [
      "Pick a sound from the tiles at the bottom. Ask him what sound it makes — the <em>sound</em> (“mmm”), not the letter name (“em”).",
      "Words using that sound appear above. Click one to put it on his screen, and ask him to sound it out and blend it.",
      "Tap ✓ if he read it, ✗ if not. The tile changes colour so you can both see how the set is going, and it's still there next time.",
    ],
    tricky: [
      "Tricky words can't be sounded out reliably — the job is to know them on sight.",
      "If he starts sounding one out, just tell him the word. That's the right move here, not a shortcut.",
      "Tap ✓ or ✗ to keep a record of which ones have stuck.",
    ],
  },
  render(host, mode) {
    const s = loadState();
    const tab = s.tab === "tricky" ? "tricky" : "sounds";
    if (tab === "sounds") return this.renderSounds(host, mode, s);
    return this.renderTricky(host, mode, s);
  },
  renderSounds(host, mode, s) {
    const sounds = soundsUpTo(s.level);
    /* Both screens must derive what to show from exactly the same validated
     * values. Validating the sound on one screen but not the other is how
     * the two end up disagreeing — e.g. dropping the level mid-session used
     * to clear the reader's panel while the child's screen kept showing a
     * word from the level you just left. */
    const sel = s.fc.sound && sounds.includes(s.fc.sound) ? s.fc.sound : null;
    const word = sel && (SOUND_WORDS[sel] || []).includes(s.fc.word) ? s.fc.word : null;

    if (mode === "student") {
      if (word) host.appendChild(bigWord(word));
      else if (sel) host.appendChild(bigWord(sel, "grapheme"));
      else host.appendChild(emptyMsg("Ready when you are!"));
      return;
    }

    const panel = el("div", { class: "panel" });
    if (sel) {
      panel.appendChild(el("div", { class: "panel-head" }, [
        el("span", { class: "panel-sound", text: sel }),
        el("span", { class: "panel-hint", text: "Click a word to send it to his screen" }),
      ]));
      const words = (SOUND_WORDS[sel] || []);
      panel.appendChild(el("div", { class: "chips" }, words.map((w) =>
        el("button", {
          class: "chip" + (word === w ? " active" : ""),
          text: w,
          onclick: () => saveSub("fc", { word: word === w ? null : w }),
        })
      )));
      panel.appendChild(assessRow("sounds", sel, "He read these"));
    } else {
      panel.appendChild(emptyMsg("Pick a sound below to get started."));
    }
    host.appendChild(panel);

    host.appendChild(el("div", { class: "tilewrap" },
      sounds.map((g) => tile(g, {
        verdict: verdictOf("sounds", g),
        active: sel === g,
        onclick: () => saveSub("fc", { sound: g, word: null }),
      }))
    ));
  },
  renderTricky(host, mode, s) {
    const words = trickyUpTo(s.level);
    const sel = s.fc.tricky && words.includes(s.fc.tricky) ? s.fc.tricky : null;

    if (mode === "student") {
      host.appendChild(sel ? bigWord(sel) : emptyMsg("Ready when you are!"));
      return;
    }

    const panel = el("div", { class: "panel" });
    if (sel) {
      panel.appendChild(bigWord(sel, "panel-big"));
      panel.appendChild(assessRow("tricky", sel, "He read it"));
    } else {
      panel.appendChild(emptyMsg("Pick a tricky word below."));
    }
    host.appendChild(panel);
    host.appendChild(el("div", { class: "tilewrap" },
      words.map((w) => tile(w, {
        verdict: verdictOf("tricky", w),
        active: sel === w,
        onclick: () => saveSub("fc", { tricky: w }),
      }))
    ));
  },
};

/* ------------------------------------------------------------------ */
/* 2. Stories                                                          */
/* ------------------------------------------------------------------ */

const stories = {
  label: "Stories", icon: "❖",
  directions: {
    list: ["Ask him to choose a book by its number — it gives him the first decision of the session.", "The band colour sets the difficulty. Change it in the Story Level box, top right."],
    read: [
      "Let him read to you. If he's shy, take turns a sentence at a time, or read a page and have him read the same page back.",
      "Words in <strong>bold blue</strong> are tricky words — don't make him sound those out, just tell him.",
      "Click any word to highlight it on his screen if he loses his place.",
      "Read it more than once: first for accuracy, then again for expression. Then talk about what happened — that's the bit that turns decoding into reading.",
    ],
  },
  render(host, mode) {
    const s = loadState();
    const story = s.story.id ? storyById(s.story.id) : null;
    if (!story) return this.renderList(host, mode, s);
    return this.renderReader(host, mode, s, story);
  },
  renderList(host, mode, s) {
    const list = storiesForBand(s.band);
    if (mode === "student") {
      host.appendChild(el("div", { class: "stu-list" }, [
        el("p", { class: "stu-prompt", text: "Which book shall we read?" }),
        el("div", { class: "story-grid student" }, list.map((st, i) => this.card(st, i, false))),
      ]));
      return;
    }
    const p = loadProgress();
    host.appendChild(el("div", { class: "story-grid" }, list.map((st, i) => {
      const c = this.card(st, i, !!p.read[st.id]);
      c.addEventListener("click", () => saveState({ story: { id: st.id, page: 0, hl: null } }));
      c.classList.add("clickable");
      return c;
    })));
  },
  card(st, i, read) {
    return el("figure", { class: "story-card" }, [
      el("div", { class: "story-cover", html: drawScene(st.cover) }),
      el("figcaption", {}, [
        el("strong", { text: `${i + 1}. ${st.title}` }),
        el("span", { class: "story-blurb", text: st.blurb }),
        read ? el("span", { class: "read-flag", text: "✓ read" }) : null,
      ]),
    ]);
  },
  renderReader(host, mode, s, story) {
    const page = Math.min(s.story.page, story.pages.length);
    const isCover = page === 0;
    const pg = isCover ? null : story.pages[page - 1];
    const scene = isCover ? story.cover : pg.scene;
    const total = story.pages.length + 1;

    const spread = el("div", { class: "spread" }, [
      el("div", { class: "spread-pic", html: drawScene(scene) }),
      el("div", { class: "spread-text" }, isCover
        ? [el("h2", { class: "story-title", text: story.title }),
           el("p", { class: "story-band", text: `${bandData(story.band).label} band · ${bandData(story.band).phase}` })]
        : this.words(pg, s, mode)),
    ]);

    if (mode === "student") {
      host.appendChild(spread);
      host.appendChild(el("p", { class: "pagecount", text: `Page ${page + 1} of ${total}` }));
      return;
    }

    host.appendChild(spread);
    const nav = el("div", { class: "pager" }, [
      el("button", { class: "btn ghost", text: "‹ Back", disabled: page === 0,
        onclick: () => saveState({ story: { id: story.id, page: page - 1, hl: null } }) }),
      el("span", { class: "pagecount", text: `Page ${page + 1} of ${total}` }),
      el("button", { class: "btn ghost", text: "Next ›", disabled: page >= total - 1,
        onclick: () => saveState({ story: { id: story.id, page: page + 1, hl: null } }) }),
    ]);
    host.appendChild(nav);

    const p = loadProgress();
    const done = !!p.read[story.id];
    host.appendChild(el("div", { class: "rowbtns" }, [
      el("button", { class: "btn ghost", text: "← All books",
        onclick: () => saveState({ story: { id: null, page: 0, hl: null } }) }),
      el("button", { class: "btn" + (done ? " done" : ""), text: done ? "✓ Read" : "Mark as read",
        onclick: () => { const pr = loadProgress(); if (done) delete pr.read[story.id]; else pr.read[story.id] = true; saveProgress(pr); rerender(); } }),
    ]));
  },
  words(pg, s, mode) {
    const tricky = new Set((pg.tricky || []).map((t) => t.toLowerCase()));
    const parts = pg.text.split(/(\s+)/);
    let wi = -1;
    return [el("p", { class: "story-text" }, parts.map((tok) => {
      if (/^\s+$/.test(tok)) return document.createTextNode(tok);
      wi++;
      const my = wi;
      const bare = tok.toLowerCase().replace(/[^a-z’']/g, "");
      const isTricky = tricky.has(bare);
      const isHl = s.story.hl === my;
      const cls = "w" + (isTricky ? " tricky" : "") + (isHl ? " hl" : "");
      if (mode === "student") return el("span", { class: cls, text: tok });
      return el("span", {
        class: cls + " clickable",
        text: tok,
        onclick: () => saveState({ story: Object.assign({}, s.story, { hl: isHl ? null : my }) }),
      });
    }))];
  },
};

/* ------------------------------------------------------------------ */
/* 3. Word Sort                                                        */
/* ------------------------------------------------------------------ */

const BIN_COLOURS = ["#d9534f", "#e8842a", "#2b7cd3", "#48915b", "#8a5cc4"];

const wordsort = {
  label: "Word Sort", icon: "⇄",
  directions: [
    "Each word belongs in the box whose sound it contains.",
    "Ask him to read a word by its number, say which sound he can hear, and tell you which colour box it goes in — then click it in.",
    "Getting it wrong is useful here: say the word slowly together and listen for the sound before moving it.",
  ],
  render(host, mode) {
    const s = loadState();
    const rounds = WORD_SORTS[s.level] || WORD_SORTS[1];
    const round = rounds[s.sort.round % rounds.length];
    const placed = s.sort.placed || {};

    host.appendChild(el("div", { class: "sortwords" },
      round.words.map(([w], i) => {
        const at = placed[i];
        return el("div", { class: "sortword" + (at != null ? " placed" : ""),
          style: at != null ? `color:${BIN_COLOURS[at % BIN_COLOURS.length]}` : "" }, [
          el("span", { class: "sw-num", text: `${i + 1}.` }),
          el("span", { class: "sw-text", text: w }),
        ]);
      })
    ));

    host.appendChild(el("div", { class: "bins" }, round.bins.map((b, bi) => {
      const colour = BIN_COLOURS[bi % BIN_COLOURS.length];
      const mine = round.words.map((w, i) => [w, i]).filter(([, i]) => placed[i] === bi);
      return el("div", { class: "bin", style: `--bin:${colour}` }, [
        el("div", { class: "bin-head", text: b }),
        el("div", { class: "bin-body" }, mine.map(([w, i]) =>
          el("button", { class: "bin-chip", text: w[0], disabled: mode === "student",
            onclick: () => { const pl = Object.assign({}, placed); delete pl[i]; saveSub("sort", { placed: pl }); } })
        )),
      ]);
    })));

    if (mode === "student") return;

    const unplaced = round.words.map((w, i) => [w, i]).filter(([, i]) => placed[i] == null);
    if (unplaced.length) {
      host.appendChild(el("div", { class: "sortpick" }, [
        el("p", { class: "hint", text: "Click a word, then the box it belongs in:" }),
        el("div", { class: "chips" }, unplaced.map(([w, i]) =>
          el("div", { class: "sortpick-row" }, [
            el("span", { class: "sp-word", text: `${i + 1}. ${w[0]}` }),
            ...round.bins.map((b, bi) => el("button", {
              class: "sp-bin" + (w[1] === b ? " correct" : ""),
              style: `--bin:${BIN_COLOURS[bi % BIN_COLOURS.length]}`,
              text: b,
              onclick: () => saveSub("sort", { placed: Object.assign({}, placed, { [i]: bi }) }),
            })),
          ])
        )),
      ]));
      host.appendChild(el("p", { class: "answerkey", text: "The green outline is the right answer — only you can see it." }));
    } else {
      const right = round.words.filter((w, i) => round.bins[placed[i]] === w[1]).length;
      host.appendChild(el("div", { class: "done-banner", text: `All sorted — ${right} of ${round.words.length} in the right box.` }));
    }
    host.appendChild(el("div", { class: "rowbtns" }, [
      el("button", { class: "btn ghost", text: "Clear", onclick: () => saveSub("sort", { placed: {} }) }),
      el("button", { class: "btn", text: "New set", onclick: () => saveSub("sort", { round: s.sort.round + 1, placed: {} }) }),
    ]));
  },
};

/* ------------------------------------------------------------------ */
/* 4. Three in a Row                                                   */
/* ------------------------------------------------------------------ */

const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

const threeinarow = {
  label: "3 in a Row", icon: "⊞",
  directions: [
    "You and he take turns — this one is properly competitive, which is the point.",
    "Ask him to pick a square by its number and read the word. If he reads it, click the square once for an ✕ (his) or twice for a ○ (yours).",
    "Click a third time to clear a square if you mis-tap.",
    "First to three in a row wins. “New board” deals a fresh set of words.",
  ],
  render(host, mode) {
    const s = loadState();
    const words = gameWords(s.level, 9, s.tir.round);
    const marks = s.tir.marks || [];
    let win = null;
    for (const [a, b, c] of LINES) if (marks[a] && marks[a] === marks[b] && marks[a] === marks[c]) win = { who: marks[a], line: [a, b, c] };

    host.appendChild(el("div", { class: "tirgrid" }, words.map((w, i) => {
      const m = marks[i];
      return el("button", {
        class: "tircell" + (m ? " m-" + m : "") + (win && win.line.includes(i) ? " win" : ""),
        disabled: mode === "student",
        onclick: () => {
          const next = marks.slice();
          next[i] = m === null || m === undefined ? "x" : m === "x" ? "o" : null;
          saveSub("tir", { marks: next });
        },
      }, [
        el("span", { class: "tir-num", text: i + 1 }),
        el("span", { class: "tir-word", text: w }),
        m ? el("span", { class: "tir-mark", text: m === "x" ? "✕" : "○" }) : null,
      ]);
    })));

    if (win) host.appendChild(el("div", { class: "done-banner win", text: win.who === "x" ? "✕ wins — three in a row!" : "○ wins — three in a row!" }));

    if (mode === "student") return;
    host.appendChild(el("p", { class: "hint", text: "Click once for ✕ · twice for ○ · three times to clear" }));
    host.appendChild(el("div", { class: "rowbtns" }, [
      el("button", { class: "btn", text: "New board",
        onclick: () => saveSub("tir", { round: s.tir.round + 1, marks: [null,null,null,null,null,null,null,null,null] }) }),
    ]));
  },
};

/* ------------------------------------------------------------------ */
/* 5. Mystery Word                                                     */
/* ------------------------------------------------------------------ */

const ALPHA = "abcdefghijklmnopqrstuvwxyz".split("");

const mysteryword = {
  label: "Mystery Word", icon: "?",
  directions: [
    "Pick a secret word — he can't see it, only the blanks.",
    "He guesses letters out loud; you click them. Letters in the word fill themselves in, wrong ones cost a star.",
    "Five stars, then the word is revealed. Ask him to read the whole word at the end, not just name the last letter — that's the actual skill being practised.",
  ],
  render(host, mode) {
    const s = loadState();
    const secret = (s.myst.word || "").toLowerCase();
    const guessed = s.myst.guessed || [];
    const wrong = guessed.filter((g) => secret && !secret.includes(g)).length;
    const solved = secret && secret.split("").every((c) => guessed.includes(c));
    const dead = wrong >= 5;

    host.appendChild(el("div", { class: "mystery-slots" },
      (secret || "   ").split("").map((c) =>
        el("span", { class: "slot" + (guessed.includes(c) || dead ? " shown" : "") },
          guessed.includes(c) || dead ? c : "")
      )
    ));

    host.appendChild(el("div", { class: "stars" },
      [0, 1, 2, 3, 4].map((i) => el("span", { class: "star" + (i < 5 - wrong ? "" : " gone"), text: "★" }))
    ));

    const wrongOnes = guessed.filter((g) => secret && !secret.includes(g));
    if (wrongOnes.length) host.appendChild(el("p", { class: "wrongletters", text: "Not in the word: " + wrongOnes.join(" ") }));
    if (solved) host.appendChild(el("div", { class: "done-banner win", text: `Solved it — “${secret}”! Ask him to read the whole word.` }));
    else if (dead) host.appendChild(el("div", { class: "done-banner", text: `Out of stars — the word was “${secret}”.` }));

    if (mode === "student") return;

    if (secret && !solved && !dead) {
      host.appendChild(el("p", { class: "secretpeek" }, [
        el("span", { text: "Your secret word: " }),
        el("strong", { text: secret }),
        el("span", { class: "secretpeek-note", text: " — only on this screen" }),
      ]));
    }

    if (!secret) {
      const choices = gameWords(s.level, 8, 5000 + (s.myst.seed || 0), 3);
      host.appendChild(el("div", { class: "panel" }, [
        el("p", { class: "hint", text: "Pick a secret word (he can't see this list on his screen):" }),
        el("div", { class: "chips" }, choices.map((w) =>
          el("button", { class: "chip", text: w, onclick: () => saveSub("myst", { word: w, guessed: [] }) })
        )),
        el("button", { class: "btn ghost", text: "Different words", onclick: () => saveSub("myst", { seed: (s.myst.seed || 0) + 1 }) }),
      ]));
      return;
    }

    host.appendChild(el("div", { class: "alphabet" }, ALPHA.map((c) => {
      const used = guessed.includes(c);
      const hit = used && secret.includes(c);
      return el("button", {
        class: "letter" + (used ? (hit ? " hit" : " miss") : ""),
        text: c, disabled: used || solved || dead,
        onclick: () => saveSub("myst", { guessed: guessed.concat([c]) }),
      });
    })));
    host.appendChild(el("div", { class: "rowbtns" }, [
      el("button", { class: "btn ghost", text: "Clear guesses", onclick: () => saveSub("myst", { guessed: [] }) }),
      el("button", { class: "btn", text: "New word", onclick: () => saveSub("myst", { word: null, guessed: [], seed: (s.myst.seed || 0) + 1 }) }),
    ]));
  },
};

/* ------------------------------------------------------------------ */
/* 6. Word Wheel                                                       */
/* ------------------------------------------------------------------ */

const wordwheel = {
  label: "Word Wheel", icon: "◉",
  directions: [
    "The ending stays put and the beginning changes — so he reads a whole family of words that rhyme.",
    "Turn the wheel, then ask him to blend the beginning onto the ending: “c … at … cat”.",
    "Good one for building speed once he's secure, because only one sound changes each time.",
  ],
  render(host, mode) {
    const s = loadState();
    const wheels = WORD_WHEELS[s.level] || WORD_WHEELS[1];
    const wheel = wheels[s.wheel.round % wheels.length];
    const n = wheel.onsets.length;
    const idx = ((s.wheel.onset % n) + n) % n;
    const word = wheel.onsets[idx] + wheel.rime;

    const R = 108, cx = 150, cy = 150;
    const spokes = wheel.onsets.map((o, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
      return `<g>
        <circle cx="${x}" cy="${y}" r="26" fill="${i === idx ? "#3f2d6b" : "#ffffff"}" stroke="#3f2d6b" stroke-width="3"/>
        <text x="${x}" y="${y + 8}" text-anchor="middle" font-size="22" font-weight="700"
              fill="${i === idx ? "#ffffff" : "#3f2d6b"}">${esc(o)}</text></g>`;
    }).join("");

    host.appendChild(el("div", { class: "wheelwrap" }, [
      el("div", { class: "wheel", html:
        `<svg viewBox="0 0 300 300" role="img" aria-label="Word wheel">
           <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#e2ddf0" stroke-width="10"/>
           ${spokes}
           <circle cx="${cx}" cy="${cy}" r="58" fill="#ffd24a"/>
           <text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="34" font-weight="700" fill="#3f2d6b">${esc(wheel.rime)}</text>
         </svg>` }),
      el("div", { class: "wheelword" }, [
        el("span", { class: "onsetpart", text: wheel.onsets[idx] }),
        el("span", { class: "rimepart", text: wheel.rime }),
      ]),
    ]));

    if (mode === "student") return;
    host.appendChild(el("div", { class: "rowbtns" }, [
      el("button", { class: "btn ghost", text: "‹ Turn back", onclick: () => saveSub("wheel", { onset: idx - 1 }) }),
      el("button", { class: "btn", text: "Turn ›", onclick: () => saveSub("wheel", { onset: idx + 1 }) }),
      el("button", { class: "btn ghost", text: "New ending", onclick: () => saveSub("wheel", { round: s.wheel.round + 1, onset: 0 }) }),
    ]));
    host.appendChild(el("p", { class: "hint", text: `This wheel makes: ${wheel.onsets.map((o) => o + wheel.rime).join(" · ")}` }));
  },
};

/* ------------------------------------------------------------------ */
/* 7. Whiteboard                                                       */
/* ------------------------------------------------------------------ */

const whiteboard = {
  label: "Whiteboard", icon: "▭",
  directions: [
    "Type anything — a sound, a word part, a whole word — and it lands on the board for both of you.",
    "Drag the pieces around to build words out of parts, or push words into a sentence.",
    "Good for the moment he's stuck: pull the word apart, sound each bit, push it back together.",
  ],
  render(host, mode) {
    const s = loadState();
    const tiles = s.wb.tiles || [];
    const board = el("div", { class: "wbboard" }, tiles.map((t) => {
      const node = el("div", { class: "wbtile", style: `left:${t.x}%; top:${t.y}%`, text: t.text });
      if (mode === "coach") {
        node.classList.add("draggable");
        node.addEventListener("pointerdown", (ev) => {
          ev.preventDefault();
          const rect = board.getBoundingClientRect();
          const move = (e) => {
            node.style.left = Math.max(0, Math.min(92, ((e.clientX - rect.left) / rect.width) * 100)) + "%";
            node.style.top = Math.max(0, Math.min(88, ((e.clientY - rect.top) / rect.height) * 100)) + "%";
          };
          const up = (e) => {
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", up);
            const x = Math.max(0, Math.min(92, ((e.clientX - rect.left) / rect.width) * 100));
            const y = Math.max(0, Math.min(88, ((e.clientY - rect.top) / rect.height) * 100));
            saveSub("wb", { tiles: tiles.map((o) => (o.id === t.id ? Object.assign({}, o, { x, y }) : o)) });
          };
          window.addEventListener("pointermove", move);
          window.addEventListener("pointerup", up);
        });
        node.addEventListener("dblclick", () => saveSub("wb", { tiles: tiles.filter((o) => o.id !== t.id) }));
      }
      return node;
    }));
    host.appendChild(board);
    if (mode === "student") return;

    const input = el("input", { class: "wbinput", placeholder: "Type a sound or a word…", maxlength: "24" });
    const add = () => {
      const v = input.value.trim();
      if (!v) return;
      const id = s.wb.seq || 1;
      saveSub("wb", {
        tiles: tiles.concat([{ id, text: v, x: 8 + ((id * 13) % 60), y: 12 + ((id * 27) % 60) }]),
        seq: id + 1,
      });
      input.value = "";
      setTimeout(() => { const i = document.querySelector(".wbinput"); if (i) i.focus(); }, 0);
    };
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") add(); });
    host.appendChild(el("div", { class: "wbctrl" }, [
      input,
      el("button", { class: "btn", text: "Add", onclick: add }),
      el("button", { class: "btn ghost", text: "Clear board", onclick: () => saveSub("wb", { tiles: [] }) }),
    ]));
    host.appendChild(el("p", { class: "hint", text: "Drag pieces to move them · double-click a piece to remove it" }));
  },
};

const ACTIVITIES = {
  flashcards, stories, wordsort, threeinarow, mysteryword, wordwheel, whiteboard,
};
const ACTIVITY_ORDER = ["flashcards", "stories", "wordsort", "threeinarow", "mysteryword", "wordwheel", "whiteboard"];
