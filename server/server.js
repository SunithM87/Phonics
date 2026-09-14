/*
 * The Reading Den — sync server.
 *
 * Deliberately tiny and dependency-light (just `ws`): serves the static
 * site, and keeps exactly one shared document in sync across every
 * connected browser via WebSocket. That's the whole job — there's no
 * auth, no accounts, no per-user anything, because this is one family's
 * shared state, meant to live on a home LAN. See README.md ("Cross-device
 * sync") before exposing this beyond your own network — as shipped, ANYONE
 * who can reach this port can read and write the shared state.
 *
 * The document has three parts:
 *   liveState — what's on screen right now (phase, activity, set, mode…)
 *   progress  — the "what's he already learned" checklist
 *   game      — in-progress state for whichever game is running
 *
 * Protocol: a client sends {type:"update", liveState?|progress?|game?} for
 * whichever slice changed (each slice is replaced wholesale, not merged —
 * keeps this file simple and avoids partial-merge bugs). The server then
 * broadcasts {type:"sync", liveState, progress, game} — the full document —
 * to every connected client, including the one that sent the update, so
 * everyone converges on exactly the same state.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { WebSocketServer } = require("ws");

const PORT = Number(process.env.PORT || 8080);
const PUBLIC_DIR = path.resolve(process.env.PUBLIC_DIR || "/app/public");
const STATE_FILE = path.resolve(process.env.STATE_FILE || "/app/data/state.json");

const DEFAULT_DOC = {
  liveState: {
    phase: 2,
    activity: "sounds",
    setId: "2-a",
    mode: "practice",
    index: 0,
    sessionStars: 0,
    childName: "",
    updatedAt: 0,
  },
  progress: { gpcs: {}, tricky: {} },
  game: { kind: null },
};

function loadDoc() {
  try {
    const raw = fs.readFileSync(STATE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return {
      liveState: { ...DEFAULT_DOC.liveState, ...parsed.liveState },
      progress: { ...DEFAULT_DOC.progress, ...parsed.progress },
      game: { ...DEFAULT_DOC.game, ...parsed.game },
    };
  } catch (e) {
    return JSON.parse(JSON.stringify(DEFAULT_DOC));
  }
}

let doc = loadDoc();

let saveTimer = null;
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    fs.mkdir(path.dirname(STATE_FILE), { recursive: true }, () => {
      fs.writeFile(STATE_FILE, JSON.stringify(doc, null, 2), (err) => {
        if (err) console.error("Failed to persist state:", err.message);
      });
    });
  }, 150);
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
};

function serveStatic(req, res) {
  let reqPath = decodeURIComponent(req.url.split("?")[0]);
  if (reqPath === "/") reqPath = "/index.html";
  const filePath = path.normalize(path.join(PUBLIC_DIR, reqPath));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Not found");
    }
    const ext = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.url === "/api/state" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(doc));
  }
  if (req.url === "/api/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ok: true, clients: wss.clients.size }));
  }
  serveStatic(req, res);
});

const wss = new WebSocketServer({ server, path: "/ws" });

function broadcastSync() {
  const payload = JSON.stringify({ type: "sync", ...doc });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(payload);
  });
}

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "sync", ...doc }));

  ws.on("message", (raw) => {
    if (raw.length > 200000) return; // sanity cap, not a real limit anyone should hit
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch (e) {
      return;
    }
    if (!msg || msg.type !== "update") return;
    let changed = false;
    if (msg.liveState && typeof msg.liveState === "object") {
      doc.liveState = msg.liveState;
      changed = true;
    }
    if (msg.progress && typeof msg.progress === "object") {
      doc.progress = msg.progress;
      changed = true;
    }
    if (msg.game && typeof msg.game === "object") {
      doc.game = msg.game;
      changed = true;
    }
    if (changed) {
      persist();
      broadcastSync();
    }
  });

  ws.on("error", () => {});
});

server.listen(PORT, () => {
  console.log(`The Reading Den server listening on :${PORT}`);
  console.log(`Serving static files from ${PUBLIC_DIR}`);
  console.log(`Persisting state to ${STATE_FILE}`);
});
