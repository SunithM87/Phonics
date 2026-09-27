#!/bin/sh
# For when you're at a terminal. The container updates itself every time it
# starts (see container-start.sh), so updating is a restart; this does the
# restart and waits until the new version answers.
#
#   curl -fsSL https://raw.githubusercontent.com/SunithM87/Phonics/claude/gifted-feynman-6q1506/deploy/update.sh | sudo sh
#
# From a phone with no terminal, restart the container in the UGREEN Docker
# app instead. It does the same thing.
set -eu
PORT="${PORT:-8000}"
[ "$(id -u)" = 0 ] || { echo "update: needs root, so put sudo in front" >&2; exit 1; }
docker inspect reading-den >/dev/null 2>&1 || { echo "update: no reading-den container; set it up from deploy/docker-compose.yaml first" >&2; exit 1; }

echo "Restarting; the container fetches the latest version as it starts…"
docker restart reading-den >/dev/null
i=0
while [ "$i" -lt 120 ]; do
  if out="$(curl -fsS "http://localhost:$PORT/api/health" 2>/dev/null)"; then
    case "$out" in
      *'"version":"'*) echo "Up: $out"; echo "Done. Refresh both screens." ;;
      *) echo "Up: $out"
         echo "…but this container isn't the self-updating kind, so it restarted without updating."
         echo "Replace its compose file with deploy/docker-compose.yaml (README → Updating)." ;;
    esac
    exit 0
  fi
  i=$((i + 1)); sleep 1
done
echo "update: no answer after 2 minutes. Last log lines:" >&2
docker logs --tail 30 reading-den >&2
exit 1
