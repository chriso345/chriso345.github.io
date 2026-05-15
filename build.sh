#!/usr/bin/env bash

CLAY_COMMIT="938967a"
CLAY_URL="https://raw.githubusercontent.com/nicbarker/clay/$CLAY_COMMIT/clay.h"
CLAY_DEST="vendor/clay.h"

# ANSI colors
RESET="\033[0m"
BOLD="\033[1m"
BLUE="\033[34m"
GREEN="\033[32m"
YELLOW="\033[33m"

log_init() {
  echo -e "${BOLD}${BLUE}[init]${RESET} $1"
}

log_build() {
  echo -e "${BOLD}${GREEN}[build]${RESET} $1"
}

init() {
  log_init "Ensuring directories..."
  mkdir -p build/wasm
  mkdir -p vendor

  if [ ! -f "$CLAY_DEST" ]; then
    log_init "Fetching clay.h @ $CLAY_COMMIT..."
    curl -sL "$CLAY_URL" -o "$CLAY_DEST"
  else
    log_init "clay.h already exists, skipping download"
  fi
}

build() {
  log_build "Compiling WASM..."

  SRC_FILES=$(find src -type f -name '*.c')

  clang \
    -Wall -Os -DCLAY_WASM -mbulk-memory \
    --target=wasm32 -nostdlib \
    -Wl,--strip-all -Wl,--export-dynamic -Wl,--no-entry \
    -Wl,--import-undefined \
    -Wl,--export=__heap_base \
    -Wl,--export=USING_DARK_MODE \
    -Wl,--initial-memory=6553600 \
    -o build/wasm/index.wasm \
    $SRC_FILES

  cp index.html build/index.html

  rm -rf build/public
  cp -r public build/public

  log_build "Done"
}

clear_screen() {
  # ANSI clear screen + move cursor home
  printf "\033[2J\033[H"
}

watch() {
  local first=1

  while true; do
    if [ $first -eq 0 ]; then
      clear_screen
      echo -e "${YELLOW}--- rebuild ---${RESET}"
    fi

    build
    first=0

    inotifywait -e close_write -r src/ index.html >/dev/null
  done
}


WATCH_MODE=0

case "$1" in
  -w|--watch)
    WATCH_MODE=1
    ;;
esac

init

if [ $WATCH_MODE -eq 1 ]; then
  watch
else
  build
fi
