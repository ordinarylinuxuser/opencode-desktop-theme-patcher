#!/usr/bin/env bash
# Patches the OpenCode desktop app: bordered chat blocks, tool/permission cards, and an in-app accent switcher.
# Usage: patch-desktop.sh [--install | --uninstall]
# The default accent is orange; users change colors with the Colors panel bottom-right.
# Without --install the patched bundle is only built to /tmp/opencode/app.asar.new.
# --uninstall restores the pristine app.asar and removes the saved state.
# Re-run after every opencode-desktop update: a new app.asar is detected and saved as the pristine copy.
set -euo pipefail

INSTALL=""
UNINSTALL=""
for arg in "$@"; do
  [ "$arg" = "--install" ] && INSTALL="--install"
  [ "$arg" = "--uninstall" ] && UNINSTALL="--uninstall"
done
DEFAULT_ACCENT="#d97757"
SRC_ASAR=/usr/lib/opencode-desktop/app.asar
DIR="$(cd "$(dirname "$0")" && pwd)"
STATE_DIR="$HOME/.local/share/opencode-desktop-theme"
ORIG="$STATE_DIR/app.asar.orig"
STATE="$STATE_DIR/installed.sha256"
WORK=/tmp/opencode/build
OUT=/tmp/opencode/app.asar.new

if [ "$UNINSTALL" = "--uninstall" ]; then
  if [ ! -f "$ORIG" ]; then
    echo "No pristine copy at $ORIG. Reinstall the OpenCode Desktop package to restore app.asar." >&2
    exit 1
  fi
  sudo cp "$ORIG" "$SRC_ASAR"
  rm -rf "$STATE_DIR"
  echo "Restored original app.asar to $SRC_ASAR and removed $STATE_DIR. Restart OpenCode desktop to see the change."
  exit 0
fi

mkdir -p "$STATE_DIR" /tmp/opencode
current_sha="$(sha256sum "$SRC_ASAR" | cut -d' ' -f1)"
if [ ! -f "$ORIG" ] || [ ! -f "$STATE" ] || [ "$(cat "$STATE")" != "$current_sha" ]; then
  cp "$SRC_ASAR" "$ORIG"
  rm -rf "$ORIG.unpacked" && cp -r "$SRC_ASAR.unpacked" "$ORIG.unpacked"
  echo "Saved pristine app.asar (sha $current_sha)"
fi

rm -rf "$WORK" && mkdir -p "$WORK"
npx -y @electron/asar extract "$ORIG" "$WORK/app"

CSS_FILE="$(ls "$WORK"/app/out/renderer/assets/main-*.css | head -n1)"
{
  echo ":root{--oc-accent:$DEFAULT_ACCENT}"
  cat "$DIR/chat-blocks.css"
} >> "$CSS_FILE"

HTML_FILE="$WORK/app/out/renderer/index.html"
SWITCHER="$(cat "$DIR/accent-switcher.js")"
node -e '
const fs = require("fs")
const [file, js] = process.argv.slice(1)
const html = fs.readFileSync(file, "utf8")
if (!html.includes("</head>")) throw new Error("index.html has no </head>")
fs.writeFileSync(file, html.replace("</head>", "<script id=\"oc-chat-accent\">" + js + "</script></head>"))
' "$HTML_FILE" "$SWITCHER"

npx -y @electron/asar pack "$WORK/app" "$OUT" --unpack-dir "node_modules/@lydell"
echo "Built patched bundle with default accent $DEFAULT_ACCENT: $OUT"

if [ "$INSTALL" = "--install" ]; then
  sudo cp "$OUT" "$SRC_ASAR"
  sha256sum "$SRC_ASAR" | cut -d' ' -f1 > "$STATE"
  echo "Installed to $SRC_ASAR. Restart OpenCode desktop to see the change."
else
  echo "Not installed. Re-run with --install to copy it to $SRC_ASAR (needs sudo)."
fi
