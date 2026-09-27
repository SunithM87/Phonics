#!/bin/sh
# Update the Reading Den on the NAS from GitHub, then restart the container.
# Paste this over SSH — the same line every time, including the first:
#
#   curl -fsSL https://raw.githubusercontent.com/SunithM87/Phonics/claude/gifted-feynman-6q1506/deploy/update.sh | sudo sh
#
# It downloads the latest version, copies it over the top of the install
# (deploy/data — his progress — is never touched), then runs
# `docker compose up -d --build`, which only rebuilds or restarts what
# actually changed. A failed download changes nothing. Safe to run any time.
#
# If the repo is ever made private again, run it once with a read-only
# GitHub token on the end (`... | sudo sh -s -- github_pat_...`); it's kept
# next to the app folder and reused.
set -eu

REPO="SunithM87/Phonics"
BRANCH="${BRANCH:-claude/gifted-feynman-6q1506}"
PORT="${PORT:-8000}"

die() { echo "update: $*" >&2; exit 1; }

[ "$(id -u)" = 0 ] || die "needs root — put sudo in front of the command"

# The app folder is this script's parent — or, when the script is piped in
# rather than run from a file, the usual install location.
if [ -z "${APP_DIR:-}" ]; then
  case "$0" in
    */update.sh) APP_DIR="$(cd "$(dirname "$0")/.." && pwd)" ;;
    *)           APP_DIR="/volume2/appdata/Reading Den" ;;
  esac
fi
[ -f "$APP_DIR/coach.html" ] || die "no Reading Den install at '$APP_DIR' (set APP_DIR=... to point elsewhere)"

# Outside the app folder on purpose: everything inside it is the website.
TOKEN_FILE="${TOKEN_FILE:-$(dirname "$APP_DIR")/.reading-den-github-token}"
if [ $# -gt 0 ] && [ -n "$1" ]; then
  ( umask 077; printf '%s\n' "$1" > "$TOKEN_FILE" )
  echo "Saved the GitHub token to $TOKEN_FILE"
fi
TOKEN=""
if [ -f "$TOKEN_FILE" ]; then TOKEN="$(tr -d ' \r\n' < "$TOKEN_FILE")"; fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "Downloading $REPO ($BRANCH)…"
fetch() {
  if [ -n "$1" ]; then set -- -H "Authorization: Bearer $1"; else set --; fi
  curl -sSL -o "$TMP/app.tgz" -w '%{http_code}' "$@" \
    "https://codeload.github.com/$REPO/tar.gz/refs/heads/$BRANCH" || true
}
code="$(fetch "$TOKEN")"
# A saved token that's since been deleted or expired shouldn't block a
# public repo: try again without it.
if [ -n "$TOKEN" ] && [ "$code" != 200 ]; then
  code="$(fetch "")"
  if [ "$code" = 200 ]; then echo "(saved token no longer works; the repo is public, so it isn't needed — removing it)"; rm -f "$TOKEN_FILE"; fi
fi
case "$code" in
  200) ;;
  000|"") die "couldn't reach GitHub — is the NAS online?" ;;
  401|403|404) die "GitHub said $code: the repo may be private again (run once with a token on the end), or branch '$BRANCH' doesn't exist." ;;
  *) die "GitHub answered HTTP $code" ;;
esac

mkdir "$TMP/src"
tar -xzf "$TMP/app.tgz" -C "$TMP/src"
SRC="$(find "$TMP/src" -mindepth 1 -maxdepth 1 -type d | head -n 1)"
[ -n "$SRC" ] && [ -f "$SRC/coach.html" ] || die "the download doesn't look like the app"
# GitHub stamps the commit into the archive's header ("comment=<sha>").
VERSION="$(gzip -dc "$TMP/app.tgz" | head -c 1024 | tr -c '0-9a-z=' '\n' | sed -n 's/^comment=\([0-9a-f]\{7\}\).*/\1/p' | head -n 1)"
VERSION="${VERSION:-the latest version}"
rm -rf "$SRC/deploy/data"   # belt and braces: the repo never ships it

# Copy over the top, then hand new files to whoever owns the folder, so
# they can still be edited over the network share.
OWNER="$(stat -c '%u:%g' "$APP_DIR")"
cp -R "$SRC/." "$APP_DIR/"
( cd "$SRC" && find . -mindepth 1 ) | while IFS= read -r f; do
  chown -h "$OWNER" "$APP_DIR/$f" 2>/dev/null || true
done

# Files earlier versions shipped that are gone now.
for f in deploy/docker-compose.yml tools/check-decodable.js; do
  if [ -e "$APP_DIR/$f" ]; then rm -f "$APP_DIR/$f"; echo "Removed old $f"; fi
done
echo "Files updated to $VERSION."

command -v docker >/dev/null 2>&1 || die "docker isn't installed — files are updated, but the server wasn't restarted"
COMPOSE="$APP_DIR/deploy/docker-compose.yaml"

# Reuse the compose project that owns the running container (the UGOS app
# names its own), so compose replaces it rather than clashing over the name.
PROJECT=""
if docker inspect reading-den >/dev/null 2>&1; then
  PROJECT="$(docker inspect reading-den --format '{{index .Config.Labels "com.docker.compose.project"}}' 2>/dev/null || true)"
  case "$PROJECT" in "<no value>") PROJECT="" ;; esac
  if [ -z "$PROJECT" ]; then
    echo "Replacing a reading-den container that compose didn't create…"
    docker rm -f reading-den >/dev/null
  fi
fi
PROJECT="${PROJECT:-reading-den}"

docker compose -p "$PROJECT" -f "$COMPOSE" up -d --build

i=0
while [ "$i" -lt 30 ]; do
  if out="$(curl -fsS "http://localhost:$PORT/api/health" 2>/dev/null)"; then
    echo "Server is up: $out"
    echo "Done — now on $VERSION. Refresh both screens."
    exit 0
  fi
  i=$((i + 1)); sleep 1
done
echo "The server didn't answer on port $PORT. Last log lines:" >&2
docker compose -p "$PROJECT" -f "$COMPOSE" logs --tail 20 >&2
exit 1
