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
 *   server → {type:"version", version}                 on connect (self-updating container only)
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
const APP_VERSION = /^[0-9a-f]{7}$/.test(process.env.APP_VERSION || "") ? process.env.APP_VERSION : null;
const REPO = process.env.REPO || "SunithM87/Phonics";
const BRANCH = process.env.BRANCH || "claude/gifted-feynman-6q1506";
const update = { latest: null, pending: false, error: null };
let lastActivity = Date.now();

const DEFAULT_DOC = {
  liveState: { level: 1, band: "pink", activity: "flashcards", tab: "sounds", showDirections: true, updatedAt: 0 },
  progress: { sounds: {}, tricky: {}, read: {}, sessions: [], updatedAt: 0 },
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
      return res.end(JSON.stringify({ ok: true, version: APP_VERSION, latest: update.latest, updatePending: update.pending, ...(update.error ? { updateNote: update.error } : {}), ...presence() }));
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
  if (APP_VERSION) ws.send(JSON.stringify({ type: "version", version: APP_VERSION }));
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
      if (changed) { lastActivity = Date.now(); persist(); broadcastSync(); }
      else ws.send(JSON.stringify({ type: "sync", ...doc })); // they were stale — hand them the current truth
    } catch (e) {
      // a garbled message from one client is not everyone's problem
    }
  });

  ws.on("close", broadcastPresence);
  ws.on("error", () => {});
});

process.on("uncaughtException", (e) => console.error("Uncaught:", e && e.stack || e));

/* Write the document now, not after the usual short delay: for shutdowns. */
function saveNow() {
  clearTimeout(saveTimer);
  try {
    fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
    const tmp = STATE_FILE + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(doc, null, 2));
    fs.renameSync(tmp, STATE_FILE);
  } catch (e) { console.error("Failed to save state:", e.message); }
}
// docker stop sends SIGTERM: don't lose a change still waiting to be written
process.on("SIGTERM", () => { saveNow(); process.exit(0); });

/* ---------------- Updating itself ----------------
 * In the NAS container (deploy/container-start.sh) the app is downloaded
 * from GitHub every time it starts, so a restart is an update. Every so
 * often this asks GitHub for the branch's latest commit; when it's newer
 * than what's running, the server exits once no session is going on (no
 * screens connected, or nothing has changed for a while). Docker's restart
 * policy brings it straight back on the new version, and any open screens
 * reload themselves when they reconnect and see a different version.
 *
 * Off unless APP_VERSION is set, which only container-start.sh does, so a
 * server run by hand never restarts itself. AUTO_UPDATE=off disables it.
 * A version that was tried and didn't take (the download failed, say) is
 * remembered and not retried in a loop. */
function maybeStartUpdater() {
  if (!APP_VERSION || process.env.AUTO_UPDATE === "off") return;
  const checkMs = Number(process.env.UPDATE_CHECK_MS || 15 * 60 * 1000);
  const idleMs = Number(process.env.UPDATE_IDLE_MS || 30 * 60 * 1000);
  const attemptFile = path.join(path.dirname(STATE_FILE), ".update-attempt");

  async function check() {
    try {
      const r = await fetch(`https://api.github.com/repos/${REPO}/commits/${encodeURIComponent(BRANCH)}`,
        { headers: { Accept: "application/vnd.github.sha", "User-Agent": "reading-den" } });
      if (!r.ok) throw new Error(`GitHub answered ${r.status}`);
      const sha = (await r.text()).trim().slice(0, 7);
      if (!/^[0-9a-f]{7}$/.test(sha)) throw new Error("GitHub gave an odd answer");
      update.latest = sha;
      update.error = null;
      if (sha === APP_VERSION) { update.pending = false; return; }
      let tried = "";
      try { tried = fs.readFileSync(attemptFile, "utf8").trim(); } catch (e) {}
      if (tried === sha) {
        update.pending = false;
        update.error = `${sha} was tried and didn't take; restart the container to try again`;
        return;
      }
      if (!update.pending) console.log(`[update] ${sha} is out (running ${APP_VERSION}); will restart when no session is going on`);
      update.pending = true;
    } catch (e) {
      update.error = `couldn't check for updates: ${e.message}`;
    }
  }
  function maybeRestart() {
    if (!update.pending) return;
    if (wss.clients.size > 0 && Date.now() - lastActivity < idleMs) return;
    console.log(`[update] restarting to update ${APP_VERSION} → ${update.latest}`);
    try { fs.writeFileSync(attemptFile, update.latest + "\n"); } catch (e) {}
    saveNow();
    process.exit(0);
  }
  setTimeout(check, Math.min(60 * 1000, checkMs));
  setInterval(check, checkMs);
  setInterval(maybeRestart, Math.min(60 * 1000, checkMs));
}
maybeStartUpdater();

server.listen(PORT, () => {
  console.log(`The Reading Den server listening on :${PORT}`);
  console.log(`Serving static files from ${PUBLIC_DIR}`);
  console.log(`Persisting state to ${STATE_FILE}`);
});
