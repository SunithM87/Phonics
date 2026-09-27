/*
 * The Reading Den — sync server.
 *
 * Deliberately tiny and dependency-light (just `ws`): serves the static
 * site, and keeps exactly one shared document in sync across every
 * connected browser via WebSocket. There's no auth, no accounts, no
 * per-user anything, because this is one family's shared state, meant to
 * live on a home LAN. See README.md before exposing this beyond your own
 * network — as shipped, ANYONE who can reach this port can read and write
 * the shared state.
 *
 * The document has two parts, matching assets/core.js:
 *   liveState — what's on screen right now (level, band, activity, and
 *               each activity's own state: story page, game board, …)
 *   progress  — the lasting record: sounds and tricky words assessed,
 *               books read (three reads each)
 *
 * Protocol:
 *   client → {type:"hello", role:"coach"|"student"}   on connect
 *   client → {type:"update", liveState?, progress?}   whichever slice changed
 *   server → {type:"sync", liveState, progress}        on connect and on every change
 *   server → {type:"presence", coaches, students}      whenever who's connected changes
 *
 * Each slice carries its own updatedAt; the server keeps whichever is
 * newer, so a stale snapshot from one screen cannot overwrite fresher work
 * from another. The client does the same on receipt.
 *
 * The defaults below must stay in step with DEFAULT_STATE in core.js: on a
 * brand-new deployment with no state.json yet, these are what the first
 * browser to connect gets handed.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { WebSocketServer } = require("ws");

const PORT = Number(process.env.PORT || 8000);
const PUBLIC_DIR = path.resolve(process.env.PUBLIC_DIR || "/app/public");
const STATE_FILE = path.resolve(process.env.STATE_FILE || "/app/data/state.json");

const DEFAULT_DOC = {
  liveState: { level: 1, band: "pink", activity: "flashcards", tab: "sounds", showDirections: true, updatedAt: 0 },
  progress: { sounds: {}, tricky: {}, read: {}, updatedAt: 0 },
};

function loadDoc() {
  try {
    const parsed = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    return {
      liveState: { ...DEFAULT_DOC.liveState, ...parsed.liveState },
      progress: { ...DEFAULT_DOC.progress, ...parsed.progress },
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
      // write to a temp file and rename, so a crash mid-write can't leave a
      // half-written state.json behind
      const tmp = STATE_FILE + ".tmp";
      fs.writeFile(tmp, JSON.stringify(doc, null, 2), (err) => {
        if (err) return console.error("Failed to persist state:", err.message);
        fs.rename(tmp, STATE_FILE, (err2) => { if (err2) console.error("Failed to persist state:", err2.message); });
      });
    });
  }, 150);
}

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".png": "image/png",
  ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8",
};

const NOT_SERVED = new Set(["deploy", "server", "tools", "node_modules"]);

function serveStatic(req, res) {
  let reqPath;
  try {
    reqPath = decodeURIComponent(req.url.split("?")[0]);
  } catch (e) {
    // malformed percent-encoding — a bad request, not a reason to fall over
    res.writeHead(400, { "Content-Type": "text/plain" });
    return res.end("Bad request");
  }
  if (reqPath === "/") reqPath = "/index.html";
  const filePath = path.normalize(path.join(PUBLIC_DIR, reqPath));
  if (filePath !== PUBLIC_DIR && !filePath.startsWith(PUBLIC_DIR + path.sep)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  // The whole folder is mounted as the site, but only the app is meant to be
  // served: never dotfiles (a token, .git) or the deploy/server/tools folders
  // (his progress file, the server's own source). Same 404 as a missing file.
  const segs = path.relative(PUBLIC_DIR, filePath).split(path.sep);
  if (segs.some((seg) => seg.startsWith(".")) || NOT_SERVED.has(segs[0])) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    return res.end("Not found");
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Not found");
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream", "Cache-Control": "no-cache" });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  // Nothing a request can contain should be able to take the server down
  // for the whole house. Anything unexpected becomes a 500 for that request.
  try {
    if (req.url === "/api/state" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(doc));
    }
    if (req.url === "/api/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ ok: true, version: process.env.APP_VERSION || null, ...presence() }));
    }
    serveStatic(req, res);
  } catch (e) {
    console.error("Request failed:", e.message);
    if (!res.headersSent) res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Server error");
  }
});

const wss = new WebSocketServer({ server, path: "/ws" });

function presence() {
  let coaches = 0, students = 0;
  wss.clients.forEach((c) => { if (c.readyState !== 1) return; if (c.role === "coach") coaches++; else if (c.role === "student") students++; });
  return { coaches, students };
}

function broadcast(payload) {
  const msg = JSON.stringify(payload);
  wss.clients.forEach((client) => { if (client.readyState === 1) client.send(msg); });
}
const broadcastSync = () => broadcast({ type: "sync", ...doc });
const broadcastPresence = () => broadcast({ type: "presence", ...presence() });

/* Keep a slice only if it is at least as new as what we hold. */
function accept(slice, incoming) {
  if (!incoming || typeof incoming !== "object") return false;
  const have = Number(doc[slice].updatedAt || 0);
  const theirs = Number(incoming.updatedAt || 0);
  if (theirs < have) return false;
  doc[slice] = incoming;
  return true;
}

wss.on("connection", (ws) => {
  ws.role = null;
  ws.send(JSON.stringify({ type: "sync", ...doc }));
  ws.send(JSON.stringify({ type: "presence", ...presence() }));

  ws.on("message", (raw) => {
    try {
      if (raw.length > 200000) return;
      const msg = JSON.parse(raw);
      if (!msg) return;
      if (msg.type === "hello") {
        ws.role = msg.role === "coach" || msg.role === "student" ? msg.role : null;
        return broadcastPresence();
      }
      if (msg.type !== "update") return;
      let changed = false;
      if (accept("liveState", msg.liveState)) changed = true;
      if (accept("progress", msg.progress)) changed = true;
      if (changed) { persist(); broadcastSync(); }
      else ws.send(JSON.stringify({ type: "sync", ...doc })); // they were stale — hand them the current truth
    } catch (e) {
      // a garbled message from one client is not everyone's problem
    }
  });

  ws.on("close", broadcastPresence);
  ws.on("error", () => {});
});

process.on("uncaughtException", (e) => console.error("Uncaught:", e && e.stack || e));

server.listen(PORT, () => {
  console.log(`The Reading Den server listening on :${PORT}`);
  console.log(`Serving static files from ${PUBLIC_DIR}`);
  console.log(`Persisting state to ${STATE_FILE}`);
});
