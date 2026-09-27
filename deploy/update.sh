#!/bin/sh
# Update the Reading Den from a terminal:
#
#   curl -fsSL https://raw.githubusercontent.com/SunithM87/Phonics/claude/gifted-feynman-6q1506/deploy/update.sh | sudo sh
#
# The container updates itself every time it starts, so normally this just
# restarts it and waits for the new version. If the container is still the
# older kind that doesn't update itself, this switches it over first: it
# writes the current docker-compose.yaml (keeping whatever data folder the
# container already uses, so his progress stays put), including over the
# copy the UGREEN Docker app keeps, and redeploys.
#
# From a phone with no terminal: restart the container in the UGREEN Docker
# app instead. Once it's the self-updating kind, that does the same thing.
set -eu
REPO="SunithM87/Phonics"
BRANCH="${BRANCH:-claude/gifted-feynman-6q1506}"
PORT="${PORT:-8000}"
NAME=reading-den
DEFAULT_DATA="/volume2/appdata/Reading Den/deploy/data"

die() { echo "update: $*" >&2; exit 1; }
label() { docker inspect "$NAME" --format "{{index .Config.Labels \"$1\"}}" 2>/dev/null | sed 's/^<no value>$//'; }

[ "$(id -u)" = 0 ] || die "needs root, so put sudo in front"
command -v docker >/dev/null 2>&1 || die "docker isn't installed"

if docker inspect "$NAME" >/dev/null 2>&1 &&
   docker inspect "$NAME" --format '{{.Config.Image}}' | grep -q '^node:'; then
  echo "Restarting; the container fetches the latest version as it starts…"
  docker restart "$NAME" >/dev/null
else
  echo "Switching the container to the self-updating setup…"
  TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
  curl -fsSL -o "$TMP/compose.yaml" \
    "https://raw.githubusercontent.com/$REPO/$BRANCH/deploy/docker-compose.yaml" ||
    die "couldn't download the compose file from GitHub; is the NAS online?"
  grep -q 'container-start.sh' "$TMP/compose.yaml" || die "the downloaded compose file isn't the self-updating one"

  # Keep his progress where it is: reuse the data folder the current
  # container has mounted, whatever path that is.
  DATA=""
  if docker inspect "$NAME" >/dev/null 2>&1; then
    DATA="$(docker inspect "$NAME" --format '{{range .Mounts}}{{if eq .Destination "/app/data"}}{{.Source}}{{end}}{{end}}')"
  fi
  DATA="${DATA:-${DATA_DIR:-$DEFAULT_DATA}}"   # DATA_DIR=... to choose, if there is no container yet
  mkdir -p "$DATA"
  if [ "$DATA" != "$DEFAULT_DATA" ]; then
    ESC="$(printf '%s' "$DATA" | sed 's/[&|\\]/\\&/g')"
    sed "s|source: $DEFAULT_DATA\$|source: $ESC|" "$TMP/compose.yaml" > "$TMP/c2" && mv "$TMP/c2" "$TMP/compose.yaml"
  fi
  [ -f "$DATA/state.json" ] && echo "His progress: $DATA/state.json (kept)"

  # Write it where the existing project keeps its compose file, so the UGREEN
  # app shows the new one too; otherwise next to the data folder.
  PROJECT="$(label com.docker.compose.project)"
  FILE="$(label com.docker.compose.project.config_files | cut -d, -f1)"
  if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then FILE="$(dirname "$DATA")/docker-compose.yaml"; fi
  if [ -f "$FILE" ]; then cp "$FILE" "$FILE.before-self-update"; echo "Old compose file saved as $FILE.before-self-update"; fi
  cp "$TMP/compose.yaml" "$FILE"
  echo "Wrote $FILE"

  if docker inspect "$NAME" >/dev/null 2>&1 && [ -z "$PROJECT" ]; then
    docker rm -f "$NAME" >/dev/null   # not made by compose, so compose can't replace it
  fi
  docker compose -p "${PROJECT:-reading-den}" -f "$FILE" up -d --remove-orphans
fi

i=0
while [ "$i" -lt 180 ]; do
  if out="$(curl -fsS "http://localhost:$PORT/api/health" 2>/dev/null)"; then
    case "$out" in
      *'"version":"'*) echo "Up: $out"; echo "Done. Refresh both screens."; exit 0 ;;
    esac
  fi
  i=$((i + 1)); sleep 1
done
echo "update: the new version didn't answer within 3 minutes. Last log lines:" >&2
docker logs --tail 30 "$NAME" >&2
exit 1
