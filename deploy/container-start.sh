#!/bin/sh
# Runs inside the container every time it starts (see docker-compose.yaml).
# It downloads the latest version of the app from GitHub and then serves
# it, so restarting the container is the update: from the UGREEN Docker
# app, from anywhere. If GitHub can't be reached, it serves the last
# version it downloaded.
#
# Everything lives in the data folder (the one bind mount):
#   state.json      his progress, never touched here
#   app/            the version being served
#   app.previous/   the one before, kept in case of a bad update
set -u

REPO="${REPO:-SunithM87/Phonics}"
BRANCH="${BRANCH:-claude/gifted-feynman-6q1506}"
DATA="${DATA:-/app/data}"
APP="$DATA/app"
WORK="$DATA/.incoming"

log() { echo "[start] $*"; }

update() {
  rm -rf "$WORK"; mkdir -p "$WORK/x"
  log "fetching $REPO ($BRANCH)…"
  node -e '
    const [url, out] = process.argv.slice(1);
    fetch(url).then(async (r) => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      require("fs").writeFileSync(out, Buffer.from(await r.arrayBuffer()));
    }).catch((e) => { console.error("[start] download failed:", e.message); process.exit(1); });
  ' "https://codeload.github.com/$REPO/tar.gz/refs/heads/$BRANCH" "$WORK/app.tgz" || return 1
  tar -xzf "$WORK/app.tgz" -C "$WORK/x" || return 1
  top="$(find "$WORK/x" -mindepth 1 -maxdepth 1 -type d | head -n 1)"
  if [ -z "$top" ] || [ ! -f "$top/coach.html" ] || [ ! -f "$top/server/server.js" ]; then
    log "the download doesn't look like the app"; return 1
  fi
  # GitHub stamps the commit into the archive's header ("comment=<sha>").
  version="$(gzip -dc "$WORK/app.tgz" | head -c 1024 | tr -c '0-9a-z=' '\n' | sed -n 's/^comment=\([0-9a-f]\{7\}\).*/\1/p' | head -n 1)"
  echo "${version:-unknown}" > "$top/.version"

  # The server's one dependency: reuse the installed copy unless it changed.
  if [ -d "$APP/server/node_modules" ] && cmp -s "$APP/server/package-lock.json" "$top/server/package-lock.json"; then
    cp -R "$APP/server/node_modules" "$top/server/" || return 1
  else
    log "installing server dependencies…"
    (cd "$top/server" && npm ci --omit=dev --no-audit --no-fund --loglevel=error) || return 1
  fi

  rm -rf "$DATA/app.previous"
  if [ -d "$APP" ]; then mv "$APP" "$DATA/app.previous"; fi
  mv "$top" "$APP"
  log "updated to $(cat "$APP/.version")"
}

if ! update; then
  if [ -f "$APP/server/server.js" ]; then
    log "couldn't update, so serving the last version ($(cat "$APP/.version" 2>/dev/null || echo unknown))"
  else
    log "no copy of the app yet and the download failed; retrying in 30s"
    sleep 30; exit 1   # the restart policy brings us back
  fi
fi
rm -rf "$WORK"

export PUBLIC_DIR="$APP"
export STATE_FILE="${STATE_FILE:-$DATA/state.json}"
export APP_VERSION="$(cat "$APP/.version" 2>/dev/null || echo unknown)"
cd "$APP/server" && exec node server.js
