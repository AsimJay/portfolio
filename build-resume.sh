#!/usr/bin/env bash
# Regenerate resume.pdf from resume.html.
#
#   ./build-resume.sh
#
# resume.html is the source of truth — edit it, never the PDF.
#
# Two things this script handles that a plain --print-to-pdf does not:
#   1. Serves over http://127.0.0.1 instead of file://. Chromium treats file://
#      as an opaque origin and blocks @font-face subresources, so a file:// render
#      silently falls back to system fonts.
#   2. Waits for fonts to load via --virtual-time-budget before printing.
set -euo pipefail

cd "$(dirname "$0")"
PORT=8765
OUT=resume.pdf

# First Chromium-family browser we can find.
for c in \
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" \
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" \
  "$(command -v chromium || true)" \
  "$(command -v google-chrome || true)"
do
  [ -n "$c" ] && [ -x "$c" ] && CHROME="$c" && break
done
: "${CHROME:?No Chromium-based browser found (Chrome, Brave, or Edge).}"

python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null || true' EXIT

for _ in $(seq 1 20); do
  curl -sf "http://127.0.0.1:$PORT/resume.html" -o /dev/null && break
  sleep 0.2
done

"$CHROME" --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="$OUT" --virtual-time-budget=10000 \
  "http://127.0.0.1:$PORT/resume.html"

# The resume must stay one page. pdfinfo ships with poppler (brew install poppler);
# skip the check rather than fail the build if it isn't installed.
if command -v pdfinfo >/dev/null; then
  PAGES=$(pdfinfo "$OUT" | awk '/^Pages:/{print $2}')
  if [ "$PAGES" -ne 1 ]; then
    echo "WARNING: $OUT is $PAGES pages — tighten resume.html until it fits one." >&2
  fi
  echo "$OUT rebuilt — $PAGES page(s)."
else
  echo "$OUT rebuilt."
fi
