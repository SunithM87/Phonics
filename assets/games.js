/*
 * Three original phonics games for the Kid screen: Three in a Row (a
 * tic-tac-toe / noughts-and-crosses game against a simple computer
 * player), Match Pairs (a memory game matching a word's sound-buttons to
 * its whole-word spelling), and Word Bingo. These are built from scratch —
 * not lifted from any other reading platform's code or art — using game
 * formats that are about as generic as games get; see README for the
 * fuller note on why nothing here is a copy of chapterone.org.
 *
 * All three draw their content from the same word bank: whatever set is
 * selected in the Coach panel (getWordBank() in app.js). Game state lives
 * in the same shared/synced document as everything else (loadGame/
 * saveGame in app.js), so two devices watching the same game — say, a
 * tablet propped up for him and your phone — see every move live.
 */

const GAME_META = {
  tic: { label: "Three in a Row", desc: "Noughts and crosses — read a word to claim a square." },
  pairs: { label: "Match Pairs", desc: "Flip cards to match sound-buttons to the whole word." },
  bingo: { label: "Word Bingo", desc: "Call words and mark them off for a full house." },
};

function gameKindFromActivity(activity) {
  return activity.startsWith("game-") ? activity.slice(5) : null;
}

function startGame(kind, state) {
  const bank = getWordBank(state);
  if (bank.length < 3) {
    window.alert(
      "This set doesn't have enough words for a game yet — pick a set with more words in the Coach panel first."
    );
    return false;
  }
  let game = { kind, phase: state.phase, setId: state.setId };

  if (kind === "tic") {
    game.board = Array(9).fill(null);
    game.turn = "kid";
    game.pendingWord = null;
    game.pendingCell = null;
    game.winner = null;
    game.winLine = null;
  }

  if (kind === "pairs") {
    const words = shuffle(bank).slice(0, Math.min(bank.length, 6));
    let cards = [];
    words.forEach((w, i) => {
      cards.push({ id: `${i}a`, pairId: i, kind: "chunks", word: w.word, chunks: w.chunks, matched: false });
      cards.push({ id: `${i}b`, pairId: i, kind: "text", word: w.word, matched: false });
    });
    game.cards = shuffle(cards);
    game.flipped = [];
    game.matchedPairs = 0;
    game.totalPairs = words.length;
  }

  if (kind === "bingo") {
    const boardWords = shuffle(bank).slice(0, Math.min(bank.length, 6)).map((w) => w.word);
    game.board2 = boardWords;
    game.marked = boardWords.map(() => false);
    game.callQueue = shuffle(bank.map((w) => w.word));
    game.calledIndex = -1;
    game.currentCall = null;
    game.bingo = false;
  }

  saveGame(game);
  return true;
}

// ---------------------------- Three in a Row ----------------------------

const TIC_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function checkTicWinner(board) {
  for (const line of TIC_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  if (board.every((c) => c)) return { winner: "draw", line: null };
  return null;
}

let robotThinking = false;

function renderTic(state, game, stage, controls) {
  if (game.turn === "robot" && !game.winner && !robotThinking) {
    robotThinking = true;
    setTimeout(() => {
      const g = loadGame();
      if (g.kind !== "tic" || g.turn !== "robot" || g.winner) {
        robotThinking = false;
        return;
      }
      const empties = g.board.map((c, i) => (c ? null : i)).filter((i) => i !== null);
      const pick = empties[Math.floor(Math.random() * empties.length)];
      const board = g.board.slice();
      board[pick] = "robot";
      const result = checkTicWinner(board);
      saveGame({
        ...g,
        board,
        turn: "kid",
        winner: result ? result.winner : null,
        winLine: result ? result.line : null,
      });
      robotThinking = false;
    }, 900);
  }

  if (game.winner) {
    const messages = {
      kid: "🏆 You got three in a row!",
      robot: "🤖 The robot got you this time!",
      draw: "🤝 A draw — good game!",
    };
    stage.innerHTML = `<div class="emoji-big">${game.winner === "kid" ? "🎉" : game.winner === "draw" ? "🤝" : "🤖"}</div>
      <h1>${messages[game.winner]}</h1>`;
    if (game.winner === "kid") burstConfetti();
    const again = document.createElement("button");
    again.className = "kid-btn next";
    again.textContent = "🔁 Play again";
    again.onclick = () => startGame("tic", state);
    controls.appendChild(again);
    return;
  }

  if (game.turn === "kid" && game.pendingWord) {
    stage.innerHTML = `<p class="lead">Read this, then tap Got it!</p>
      <div class="sound-buttons">${game.pendingWord.chunks.map((c) => `<span class="sound-chunk">${c}</span>`).join("")}</div>`;
    const gotIt = document.createElement("button");
    gotIt.className = "kid-btn reveal";
    gotIt.textContent = `✅ Got it! (${game.pendingWord.word})`;
    gotIt.onclick = () => {
      const board = game.board.slice();
      board[game.pendingCell] = "kid";
      const result = checkTicWinner(board);
      awardStar();
      saveGame({
        ...game,
        board,
        turn: "robot",
        pendingWord: null,
        pendingCell: null,
        winner: result ? result.winner : null,
        winLine: result ? result.line : null,
      });
    };
    controls.appendChild(gotIt);
    return;
  }

  stage.innerHTML = `<p class="lead">${game.turn === "kid" ? "Your turn — pick a square" : "🤖 Robot is thinking…"}</p>`;
  const grid = document.createElement("div");
  grid.className = "tic-grid";
  game.board.forEach((cell, i) => {
    const btn = document.createElement("button");
    btn.className = "tic-cell" + (game.winLine && game.winLine.includes(i) ? " win" : "");
    btn.textContent = cell === "kid" ? "🟢" : cell === "robot" ? "🤖" : "";
    btn.disabled = !!cell || game.turn !== "kid";
    btn.onclick = () => {
      const bank = getWordBank(state);
      const word = bank[Math.floor(Math.random() * bank.length)];
      saveGame({ ...game, pendingWord: word, pendingCell: i });
    };
    grid.appendChild(btn);
  });
  stage.appendChild(grid);
}

// ------------------------------ Match Pairs ------------------------------

let pairsResolving = false;

function renderPairs(state, game, stage, controls) {
  if (game.matchedPairs >= game.totalPairs) {
    stage.innerHTML = `<div class="emoji-big">🏆</div><h1>All matched!</h1>`;
    burstConfetti();
    const again = document.createElement("button");
    again.className = "kid-btn next";
    again.textContent = "🔁 Play again";
    again.onclick = () => startGame("pairs", state);
    controls.appendChild(again);
    return;
  }

  stage.innerHTML = `<p class="lead">Matched ${game.matchedPairs} of ${game.totalPairs}</p>`;
  const grid = document.createElement("div");
  grid.className = "pairs-grid";
  game.cards.forEach((card) => {
    const btn = document.createElement("button");
    const isUp = card.matched || game.flipped.includes(card.id);
    btn.className = "pairs-card" + (isUp ? " up" : "") + (card.matched ? " matched" : "");
    btn.innerHTML = isUp
      ? card.kind === "chunks"
        ? card.chunks.map((c) => `<span class="sound-chunk small">${c}</span>`).join("")
        : `<span class="reveal-word" style="font-size:1.6rem;">${card.word}</span>`
      : "❓";
    btn.disabled = isUp || pairsResolving;
    btn.onclick = () => {
      if (pairsResolving || isUp) return;
      const flipped = [...game.flipped, card.id];
      saveGame({ ...game, flipped });
      if (flipped.length === 2) {
        pairsResolving = true;
        setTimeout(() => {
          const g = loadGame();
          if (g.kind !== "pairs") {
            pairsResolving = false;
            return;
          }
          const [idA, idB] = g.flipped;
          const a = g.cards.find((c) => c.id === idA);
          const b = g.cards.find((c) => c.id === idB);
          if (a && b && a.pairId === b.pairId) {
            const cards = g.cards.map((c) =>
              c.pairId === a.pairId ? { ...c, matched: true } : c
            );
            awardStar();
            saveGame({ ...g, cards, flipped: [], matchedPairs: g.matchedPairs + 1 });
          } else {
            saveGame({ ...g, flipped: [] });
          }
          pairsResolving = false;
        }, 900);
      }
    };
    grid.appendChild(btn);
  });
  stage.appendChild(grid);
}

// ------------------------------ Word Bingo ------------------------------

function renderBingo(state, game, stage, controls) {
  if (game.bingo) {
    stage.innerHTML = `<div class="emoji-big">🎉</div><h1>BINGO! Full house!</h1>`;
    burstConfetti();
    const again = document.createElement("button");
    again.className = "kid-btn next";
    again.textContent = "🔁 Play again";
    again.onclick = () => startGame("bingo", state);
    controls.appendChild(again);
    return;
  }

  stage.innerHTML = game.currentCall
    ? `<p class="lead">Find it on your board:</p><div class="reveal-word">${game.currentCall}</div>`
    : `<p class="lead">Tap "Call next word" to begin!</p>`;

  const grid = document.createElement("div");
  grid.className = "bingo-grid";
  game.board2.forEach((word, i) => {
    const btn = document.createElement("button");
    btn.className = "bingo-cell" + (game.marked[i] ? " marked" : "");
    btn.textContent = word;
    btn.onclick = () => {
      if (game.marked[i]) return;
      if (game.currentCall && game.currentCall.toLowerCase() === word.toLowerCase()) {
        const marked = game.marked.slice();
        marked[i] = true;
        awardStar();
        const bingo = marked.every(Boolean);
        saveGame({ ...game, marked, bingo });
      }
    };
    grid.appendChild(btn);
  });
  stage.appendChild(grid);

  const callBtn = document.createElement("button");
  callBtn.className = "kid-btn reveal";
  callBtn.textContent = "📣 Call next word";
  callBtn.onclick = () => {
    let nextIndex = game.calledIndex + 1;
    let queue = game.callQueue;
    if (nextIndex >= queue.length) {
      queue = shuffle(queue);
      nextIndex = 0;
    }
    saveGame({ ...game, callQueue: queue, calledIndex: nextIndex, currentCall: queue[nextIndex] });
  };
  controls.appendChild(callBtn);
}

// ------------------------------- Dispatcher -------------------------------

function renderGame(state, stage, controls) {
  const kind = gameKindFromActivity(state.activity);
  const game = loadGame();
  if (game.kind !== kind || game.phase !== state.phase || game.setId !== state.setId) {
    // Coach picked a new game or a different content set — start fresh.
    if (!startGame(kind, state)) {
      stage.innerHTML = `<p>Ask the grown-up to pick a different set in the Coach panel.</p>`;
      return;
    }
    return; // saveGame() above will trigger a re-render with the new game
  }
  if (kind === "tic") renderTic(state, game, stage, controls);
  if (kind === "pairs") renderPairs(state, game, stage, controls);
  if (kind === "bingo") renderBingo(state, game, stage, controls);
}
