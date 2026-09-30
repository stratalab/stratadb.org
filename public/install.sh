#!/bin/sh
# Strata installer - https://stratadb.org
# Usage: curl -fsSL https://stratadb.org/install.sh | sh
#
# Environment overrides:
#   STRATA_VERSION      install a specific version (e.g. 1.0.0) instead of latest
#   STRATA_INSTALL_DIR  install directory (default: ~/.strata/bin)
#   NO_COLOR            any non-empty value prints the plain, uncoloured layout
#
# Uninstall:
#   rm -rf ~/.strata/bin    (or your STRATA_INSTALL_DIR)
#   then remove the "# Strata" PATH block from your shell config
#   (~/.zshrc, ~/.bashrc, ~/.config/fish/config.fish, or ~/.profile).
#   Databases and ~/.config/strata/config.toml are never touched.
set -eu

REPO="stratalab/strata-core"
INSTALL_DIR="${STRATA_INSTALL_DIR:-${HOME}/.strata/bin}"
BINARY_NAME="strata"

# ---------------------------------------------------------------------------
# Output
#
# Two layouts. The card layout (boxed cards, a live progress bar) is drawn only
# on a colour-capable terminal wide enough to hold it. Everything else - a pipe,
# a CI log, NO_COLOR, TERM=dumb, a narrow terminal - gets the plain layout: one
# greppable line per fact, no box drawing, no cursor movement, no animation.
#
# Card rows never pad by string length: `${#var}` counts bytes in dash, and the
# glyphs here are multi-byte. Each row instead ends by moving the cursor to an
# absolute column (CSI <n> G) and drawing the right border there, so every row
# closes on the same column whatever it holds.
# ---------------------------------------------------------------------------

ESC=$(printf '\033')

# Decides the layout and the palette. Named setup_colors because
# scripts/verify-installer.mjs sources this file and calls it by that name.
setup_colors() {
    FANCY=0
    BOLD='' RESET='' C_ACCENT='' C_BAR='' C_BORDER='' C_DIM='' C_TRACK='' C_OK='' C_ERR='' C_CMD=''
    E_ERR='' E_RESET=''

    if ! color_terminal 1; then
        return 0
    fi

    BOLD="${ESC}[1m"
    RESET="${ESC}[0m"
    case "${COLORTERM:-}" in
        truecolor|24bit)
            C_ACCENT="${ESC}[1;38;2;255;122;82m"   # terracotta-500
            C_BAR="${ESC}[38;2;255;122;82m"
            C_BORDER="${ESC}[38;2;107;102;95m"     # sediment-600
            C_DIM="${ESC}[38;2;138;132;124m"       # sediment-500
            C_TRACK="${ESC}[38;2;79;75;69m"        # sediment-700
            C_OK="${ESC}[38;2;156;196;107m"        # warm sage
            C_ERR="${ESC}[1;38;2;232;95;58m"       # terracotta-600
            ;;
        *)
            case "${TERM:-}" in
                *256color*)
                    C_ACCENT="${ESC}[1;38;5;209m"
                    C_BAR="${ESC}[38;5;209m"
                    C_BORDER="${ESC}[38;5;242m"
                    C_DIM="${ESC}[38;5;245m"
                    C_TRACK="${ESC}[38;5;239m"
                    C_OK="${ESC}[38;5;107m"
                    C_ERR="${ESC}[1;38;5;202m"
                    ;;
                *)
                    C_ACCENT="${ESC}[1;31m"
                    C_BAR="${ESC}[31m"
                    C_BORDER="${ESC}[2m"
                    C_DIM="${ESC}[2m"
                    C_TRACK="${ESC}[2m"
                    C_OK="${ESC}[32m"
                    C_ERR="${ESC}[1;31m"
                    ;;
            esac
            ;;
    esac
    C_CMD="$BOLD"

    # Errors go to stderr, so they are coloured only when stderr is a terminal.
    if color_terminal 2; then
        E_ERR="$C_ERR" E_RESET="$RESET"
    fi

    # Card geometry: two columns of indent, a border, INNER columns of content
    # area, a border. INNER is wide enough for the progress row and for the
    # install path (its byte length, which is never less than its width).
    INSTALL_SHOWN=$(tildify "${INSTALL_DIR}/${BINARY_NAME}")
    INNER=48
    if [ $(( ${#INSTALL_SHOWN} + 10 )) -gt "$INNER" ]; then
        INNER=$(( ${#INSTALL_SHOWN} + 10 ))
    fi
    RCOL=$(( INNER + 4 ))
    if [ "$(term_cols)" -gt "$RCOL" ]; then
        FANCY=1
    fi
}

# color_terminal FD: is this descriptor a terminal that wants colour?
color_terminal() {
    [ -t "$1" ] && [ -z "${NO_COLOR:-}" ] && [ -n "${TERM:-}" ] && [ "${TERM}" != "dumb" ]
}

term_cols() {
    TC="${COLUMNS:-}"
    case "$TC" in ''|0|*[!0-9]*) TC=$( (stty size </dev/tty) 2>/dev/null | awk '{print $2}') ;; esac
    case "$TC" in ''|0|*[!0-9]*) TC=$(tput cols 2>/dev/null || true) ;; esac
    case "$TC" in ''|0|*[!0-9]*) TC=80 ;; esac
    printf '%s\n' "$TC"
}

# $HOME/x -> ~/x, for display only.
tildify() {
    case "$1" in
        "${HOME}"/*) printf '~%s\n' "${1#"${HOME}"}" ;;
        *) printf '%s\n' "$1" ;;
    esac
}

# Sets NOW to milliseconds since the epoch, or whole seconds * 1000 where
# `date` has no %N (macOS) and perl is missing; ELAPSED_HIRES=0 records that.
now_ms() {
    NOW=$(date +%s%N 2>/dev/null || true)
    case "$NOW" in
        ''|*[!0-9]*)
            NOW=$(perl -MTime::HiRes=time -e 'printf("%d\n", time() * 1000)' 2>/dev/null || true)
            case "$NOW" in
                ''|*[!0-9]*) ELAPSED_HIRES=0; NOW=$(( $(date +%s) * 1000 )) ;;
            esac
            ;;
        *) NOW=$(( NOW / 1000000 )) ;;
    esac
}

# 13207632 -> "13.2 MB"
fmt_mb() {
    FMT_T=$(( ($1 + 50000) / 100000 ))
    printf '%d.%d MB\n' $(( FMT_T / 10 )) $(( FMT_T % 10 ))
}

# repeat STRING N
repeat() {
    REP_OUT=''
    REP_I=0
    while [ "$REP_I" -lt "$2" ]; do
        REP_OUT="${REP_OUT}$1"
        REP_I=$(( REP_I + 1 ))
    done
    printf '%s' "$REP_OUT"
}

# card_top TITLE_COLOURED TITLE_WIDTH
card_top() {
    printf '\n  %s╭─%s %s %s%s╮%s\n' "$C_BORDER" "$RESET" "$1" "$C_BORDER" \
        "$(repeat '─' $(( INNER - $2 - 3 )))" "$RESET"
    CARD_OPEN=1
}

card_bottom() {
    printf '  %s╰%s╯%s\n' "$C_BORDER" "$(repeat '─' "$INNER")" "$RESET"
    CARD_OPEN=0
}

# card_row CONTENT - redraws the current line as a card row, no newline, so a
# row can be drawn again in place. The erase-to-end clears what a longer
# earlier frame left behind; the right border lands on column RCOL.
card_row() {
    printf '\r  %s│%s  %s%s%s[K%s[%sG%s│%s' "$C_BORDER" "$RESET" "$1" "$RESET" \
        "$ESC" "$ESC" "$RCOL" "$C_BORDER" "$RESET"
    ROW_OPEN=1
}

row_done() {
    printf '\n'
    ROW_OPEN=0
}

# A row that is complete when drawn.
card_line() {
    card_row "$1"
    row_done
}

hide_cursor() {
    printf '%s[?25l' "$ESC"
    CURSOR_HIDDEN=1
}

show_cursor() {
    if [ "${CURSOR_HIDDEN:-0}" = 1 ]; then
        printf '%s[?25h' "$ESC"
        CURSOR_HIDDEN=0
    fi
}

# Finish whatever part of a card is on screen, so an error or an interrupt
# never leaves a half-drawn box or a hidden cursor.
close_card() {
    show_cursor
    if [ "${ROW_OPEN:-0}" = 1 ]; then
        row_done
    fi
    if [ "${CARD_OPEN:-0}" = 1 ]; then
        card_bottom
    fi
}

# err MESSAGE [STATUS] - MESSAGE may hold \n, expanded with the indent kept.
err() {
    if [ "${FANCY:-0}" = 1 ]; then
        close_card
        printf '\n  %s✗%s %b%s\n\n' "$E_ERR" "$E_RESET" "$1" "$E_RESET" >&2
    else
        printf 'error: %b\n' "$1" >&2
    fi
    exit "${2:-1}"
}

# The progress row: bar, size, checksum state.
#   progress_row DONE_BYTES TOTAL_BYTES(or empty) FRAME STATUS
progress_row() {
    PR_W=22
    if [ -n "$2" ] && [ "$2" -gt 0 ]; then
        PR_FILL=$(( $1 * PR_W / $2 ))
        [ "$PR_FILL" -le "$PR_W" ] || PR_FILL=$PR_W
        PR_BAR="${C_BAR}$(repeat '█' "$PR_FILL")${C_TRACK}$(repeat '░' $(( PR_W - PR_FILL )))${RESET}"
        if [ "$1" -ge "$2" ] || [ -n "$4" ]; then
            PR_SIZE=$(fmt_mb "$1")
        else
            PR_SIZE="$(fmt_mb "$1" | sed 's/ MB$//')${C_DIM} / $(fmt_mb "$2")${RESET}"
        fi
    else
        # Size unknown: a block sweeping back and forth.
        PR_SPAN=$(( PR_W - 4 ))
        PR_POS=$(( $3 % (2 * PR_SPAN) ))
        [ "$PR_POS" -le "$PR_SPAN" ] || PR_POS=$(( 2 * PR_SPAN - PR_POS ))
        PR_BAR="${C_TRACK}$(repeat '░' "$PR_POS")${C_BAR}████${C_TRACK}$(repeat '░' $(( PR_SPAN - PR_POS )))${RESET}"
        PR_SIZE=$(fmt_mb "$1")
    fi
    card_row "${PR_BAR}  ${PR_SIZE}   $4"
}

on_exit() {
    show_cursor
    if [ -n "${WORK_OWNED:-}" ]; then
        rm -rf "$TMPDIR"
    fi
}

on_signal() {
    for PID in ${DL_PID:-} ${PROBE_PID:-}; do
        kill "$PID" 2>/dev/null || true
    done
    if [ "${FANCY:-0}" = 1 ]; then
        close_card
    fi
    exit 130
}

# ---------------------------------------------------------------------------
# Core logic
# ---------------------------------------------------------------------------

main() {
    ELAPSED_HIRES=1
    now_ms
    START_MS=$NOW
    setup_colors
    check_dependencies
    detect_platform
    if [ "$FANCY" = 1 ]; then
        card_top "${C_ACCENT}strata${RESET}" 6
    fi
    get_latest_version
    if [ "$FANCY" = 1 ]; then
        card_line "v${VERSION} ${C_DIM}·${RESET} ${PLATFORM}"
    else
        printf 'strata v%s · %s\n' "$VERSION" "$PLATFORM"
    fi
    download_and_install
    setup_path
    show_path_change
    verify_install
    print_success
}

check_dependencies() {
    if command -v curl >/dev/null 2>&1; then
        DOWNLOAD="curl"
    elif command -v wget >/dev/null 2>&1; then
        DOWNLOAD="wget"
    else
        err "Either 'curl' or 'wget' is required to download Strata."
    fi
}

# Name this machine's target triple. Naming a triple is not a claim that a
# build exists for it: the release's own checksums-sha256.txt decides that, in
# require_build_for_target below. Keeping the two apart is the point. This
# script used to carry its own list of six targets while the release shipped
# three, and a user on one of the other three was told "Download failed"
# (strata-core issue 3060). Now there is one list, it belongs to the release,
# and a target starts installing the day its asset ships.
detect_platform() {
    OS="$(uname -s)"
    ARCH="$(uname -m)"

    case "$OS" in
        Linux)  OS_TARGET="unknown-linux-gnu"; OS_LABEL="linux" ;;
        Darwin) OS_TARGET="apple-darwin"; OS_LABEL="macos" ;;
        MINGW*|MSYS*|CYGWIN*)
            OS_TARGET="pc-windows-msvc"; OS_LABEL="windows"
            ;;
        *)
            err "Unsupported operating system: $OS"
            ;;
    esac

    case "$ARCH" in
        x86_64|amd64)   ARCH_TARGET="x86_64" ;;
        aarch64|arm64)   ARCH_TARGET="aarch64" ;;
        *)
            err "Unsupported architecture: $ARCH"
            ;;
    esac

    TARGET="${ARCH_TARGET}-${OS_TARGET}"
    PLATFORM="${OS_LABEL}-${ARCH_TARGET}"
}

get_latest_version() {
    RELEASE_JSON=""
    # Explicit pin wins over the latest-release lookup.
    if [ -n "${STRATA_VERSION:-}" ]; then
        VERSION="${STRATA_VERSION#v}"
        return
    fi

    RELEASE_URL="https://api.github.com/repos/${REPO}/releases/latest"

    # The JSON is kept: it also carries each asset's size for the progress bar.
    if [ "$DOWNLOAD" = "curl" ]; then
        RELEASE_JSON=$(curl -fsSL "$RELEASE_URL") || RELEASE_JSON=""
    else
        RELEASE_JSON=$(wget -qO- "$RELEASE_URL") || RELEASE_JSON=""
    fi
    VERSION=$(printf '%s\n' "$RELEASE_JSON" | parse_version)

    if [ -z "$VERSION" ]; then
        err "Could not determine latest version. Check https://github.com/${REPO}/releases"
    fi
}

parse_version() {
    # Extract tag_name value, strip leading 'v'
    sed -n 's/.*"tag_name": *"v\([^"]*\)".*/\1/p'
}

# The size of ARCHIVE_NAME from the latest-release JSON, if it was fetched.
# The API pretty-prints one field per line; "size" follows the asset's "name".
size_from_release_json() {
    printf '%s\n' "$RELEASE_JSON" | awk -v want="\"name\": \"${ARCHIVE_NAME}\"" '
        index($0, want) { found = 1 }
        found && /"size":/ { gsub(/[^0-9]/, ""); print; exit }'
}

# Content-Length of the download, for a pinned version (no release JSON).
probe_size() {
    if [ "$DOWNLOAD" = "curl" ]; then
        curl -fsSIL --max-time 10 "$DOWNLOAD_URL" 2>/dev/null
    else
        wget -q -S --spider --timeout=10 "$DOWNLOAD_URL" 2>&1
    fi | tr -d '\r' | awk 'tolower($1) == "content-length:" && $2 > 0 { n = $2 } END { if (n) print n }'
}

download_and_install() {
    # Every release asset is a gzipped tar. The release job globs
    # `strata-v*.tar.gz` when it uploads, so no other extension can reach a
    # release; an installer that asked for a .zip would name an archive that
    # cannot exist and report its absence as a missing platform.
    ARCHIVE_NAME="${BINARY_NAME}-v${VERSION}-${TARGET}.tar.gz"
    DOWNLOAD_URL="https://github.com/${REPO}/releases/download/v${VERSION}/${ARCHIVE_NAME}"

    TMPDIR=$(mktemp -d)
    WORK_OWNED=1
    trap on_exit EXIT
    trap on_signal INT TERM HUP

    # Both before the download, so a platform with no build is told so instead
    # of being handed a 404 as a network error.
    fetch_release_manifest
    require_build_for_target

    ARCHIVE="${TMPDIR}/${ARCHIVE_NAME}"
    DL_STATUS=0
    if [ "$FANCY" = 1 ]; then
        download_with_progress
    elif [ "$DOWNLOAD" = "curl" ]; then
        curl -fsSL "$DOWNLOAD_URL" -o "$ARCHIVE" 2>/dev/null || DL_STATUS=$?
    else
        wget -q "$DOWNLOAD_URL" -O "$ARCHIVE" 2>/dev/null || DL_STATUS=$?
    fi

    # The manifest has already confirmed this asset exists, so a failure here
    # is the network or the mirror, which is what this message now means. The
    # downloader's own exit status is the installer's.
    if [ "$DL_STATUS" -ne 0 ]; then
        err "Download failed. URL: ${DOWNLOAD_URL}" "$DL_STATUS"
    fi
    if [ ! -f "$ARCHIVE" ]; then
        err "Download failed. URL: ${DOWNLOAD_URL}"
    fi
    DL_BYTES=$(wc -c < "$ARCHIVE" | tr -d ' ')

    verify_checksum

    mkdir -p "$INSTALL_DIR"

    tar xzf "${TMPDIR}/${ARCHIVE_NAME}" -C "$TMPDIR"

    # Release tarballs package the binary under bin/
    if [ -f "${TMPDIR}/bin/${BINARY_NAME}" ]; then
        mv "${TMPDIR}/bin/${BINARY_NAME}" "${INSTALL_DIR}/${BINARY_NAME}"
    elif [ -f "${TMPDIR}/${BINARY_NAME}" ]; then
        mv "${TMPDIR}/${BINARY_NAME}" "${INSTALL_DIR}/${BINARY_NAME}"
    else
        err "Could not find ${BINARY_NAME} binary in archive."
    fi

    chmod +x "${INSTALL_DIR}/${BINARY_NAME}"

    if [ "$FANCY" = 1 ]; then
        card_line "${C_DIM}into${RESET}  $(tildify "${INSTALL_DIR}/${BINARY_NAME}")"
    else
        printf 'installed %s\n' "$(tildify "${INSTALL_DIR}/${BINARY_NAME}")"
    fi
}

# The same download as the plain path, run in the background while the
# foreground redraws the bar from the file's size about ten times a second.
download_with_progress() {
    TOTAL=$(size_from_release_json)
    PROBE_PID=""
    if [ -z "$TOTAL" ]; then
        probe_size > "${TMPDIR}/size" </dev/null &
        PROBE_PID=$!
    fi

    if [ "$DOWNLOAD" = "curl" ]; then
        curl -fsSL "$DOWNLOAD_URL" -o "$ARCHIVE" </dev/null 2>/dev/null &
    else
        wget -q "$DOWNLOAD_URL" -O "$ARCHIVE" </dev/null 2>/dev/null &
    fi
    DL_PID=$!

    TICK=0.1
    sleep "$TICK" 2>/dev/null || TICK=1
    hide_cursor
    FRAME=0
    while kill -0 "$DL_PID" 2>/dev/null; do
        if [ -z "$TOTAL" ] && [ -s "${TMPDIR}/size" ]; then
            TOTAL=$(cat "${TMPDIR}/size")
        fi
        GOT=0
        if [ -f "$ARCHIVE" ]; then
            GOT=$(wc -c < "$ARCHIVE" | tr -d ' ')
        fi
        progress_row "$GOT" "$TOTAL" "$FRAME" ""
        FRAME=$(( FRAME + 1 ))
        sleep "$TICK"
    done
    wait "$DL_PID" || DL_STATUS=$?
    DL_PID=""
    if [ -n "$PROBE_PID" ]; then
        kill "$PROBE_PID" 2>/dev/null || true
        PROBE_PID=""
    fi
    show_cursor
}

# checksums-sha256.txt lists every asset the release published, so it is both
# the integrity manifest and the authoritative answer to "is there a build for
# me". Fetched once, used for both.
fetch_release_manifest() {
    MANIFEST="${TMPDIR}/checksums-sha256.txt"
    CHECKSUMS_URL="https://github.com/${REPO}/releases/download/v${VERSION}/checksums-sha256.txt"

    if [ "$DOWNLOAD" = "curl" ]; then
        curl -fsSL "$CHECKSUMS_URL" -o "$MANIFEST" 2>/dev/null || true
    else
        wget -q "$CHECKSUMS_URL" -O "$MANIFEST" 2>/dev/null || true
    fi

    if [ ! -s "$MANIFEST" ]; then
        err "Could not download checksums for v${VERSION}; refusing to install unverified binaries."
    fi
}

# The default binary for each target the release published, one per line. The
# `-local` variants bundle a local inference runtime and are not what this
# script installs, so they are not offered as alternatives.
available_targets() {
    sed -n "s/^[0-9a-f]*  *${BINARY_NAME}-v${VERSION}-\\(.*\\)\\.tar\\.gz\$/\\1/p" "$MANIFEST" \
        | grep -v -- '-local$' \
        | sort
}

require_build_for_target() {
    if grep -q "  ${ARCHIVE_NAME}\$" "$MANIFEST"; then
        return
    fi

    AVAILABLE=$(available_targets | tr '\n' ' ')
    if [ -z "$AVAILABLE" ]; then
        err "Release v${VERSION} published no installable binaries."
    fi
    err "No build for ${BOLD}${TARGET}${RESET} in v${VERSION}.\n    Available: ${AVAILABLE% }\n    Ask for one at https://github.com/${REPO}/issues"
}

verify_checksum() {
    if [ "$FANCY" = 1 ]; then
        progress_row "$DL_BYTES" "$DL_BYTES" 0 "${C_DIM}· sha256${RESET}"
    fi

    if command -v sha256sum >/dev/null 2>&1; then
        ACTUAL=$(sha256sum "${TMPDIR}/${ARCHIVE_NAME}" | awk '{print $1}')
    elif command -v shasum >/dev/null 2>&1; then
        ACTUAL=$(shasum -a 256 "${TMPDIR}/${ARCHIVE_NAME}" | awk '{print $1}')
    else
        err "Neither sha256sum nor shasum is available; cannot verify the download."
    fi

    EXPECTED=$(grep "  ${ARCHIVE_NAME}\$" "$MANIFEST" | awk '{print $1}')
    if [ -z "$EXPECTED" ]; then
        err "No checksum entry for ${ARCHIVE_NAME} in the release manifest."
    fi
    if [ "$ACTUAL" != "$EXPECTED" ]; then
        if [ "$FANCY" = 1 ]; then
            progress_row "$DL_BYTES" "$DL_BYTES" 0 "${C_ERR}✗ sha256${RESET}"
        fi
        err "Checksum mismatch for ${ARCHIVE_NAME}. Aborting.\n    expected ${EXPECTED}\n    got      ${ACTUAL}"
    fi

    if [ "$FANCY" = 1 ]; then
        progress_row "$DL_BYTES" "$DL_BYTES" 0 "${C_OK}✓ sha256${RESET}"
        row_done
    else
        printf 'downloaded %s · sha256 verified\n' "$(fmt_mb "$DL_BYTES")"
    fi
}

setup_path() {
    # Already on PATH - nothing to do
    case ":${PATH}:" in
        *":${INSTALL_DIR}:"*)
            return
            ;;
    esac

    EXPORT_LINE="export PATH=\"${INSTALL_DIR}:\$PATH\""
    FISH_LINE="fish_add_path ${INSTALL_DIR}"
    SHELL_NAME="$(basename "${SHELL:-/bin/sh}")"
    UPDATED_CONFIG=""

    case "$SHELL_NAME" in
        zsh)
            SHELL_CONFIG="${HOME}/.zshrc"
            if [ -f "$SHELL_CONFIG" ] && grep -qF "$INSTALL_DIR" "$SHELL_CONFIG" 2>/dev/null; then
                return
            fi
            printf '\n# Strata\n%s\n' "$EXPORT_LINE" >> "$SHELL_CONFIG"
            UPDATED_CONFIG="$SHELL_CONFIG"
            ;;
        bash)
            # Prefer .bashrc, fall back to .bash_profile (macOS default)
            if [ -f "${HOME}/.bashrc" ]; then
                SHELL_CONFIG="${HOME}/.bashrc"
            else
                SHELL_CONFIG="${HOME}/.bash_profile"
            fi
            if [ -f "$SHELL_CONFIG" ] && grep -qF "$INSTALL_DIR" "$SHELL_CONFIG" 2>/dev/null; then
                return
            fi
            printf '\n# Strata\n%s\n' "$EXPORT_LINE" >> "$SHELL_CONFIG"
            UPDATED_CONFIG="$SHELL_CONFIG"
            ;;
        fish)
            SHELL_CONFIG="${HOME}/.config/fish/config.fish"
            if [ -f "$SHELL_CONFIG" ] && grep -qF "$INSTALL_DIR" "$SHELL_CONFIG" 2>/dev/null; then
                return
            fi
            mkdir -p "$(dirname "$SHELL_CONFIG")"
            printf '\n# Strata\n%s\n' "$FISH_LINE" >> "$SHELL_CONFIG"
            UPDATED_CONFIG="$SHELL_CONFIG"
            ;;
        *)
            # Unknown shell - try .profile as a generic fallback
            SHELL_CONFIG="${HOME}/.profile"
            if [ -f "$SHELL_CONFIG" ] && grep -qF "$INSTALL_DIR" "$SHELL_CONFIG" 2>/dev/null; then
                return
            fi
            printf '\n# Strata\n%s\n' "$EXPORT_LINE" >> "$SHELL_CONFIG"
            UPDATED_CONFIG="$SHELL_CONFIG"
            ;;
    esac
}

# Report what setup_path did: added the install dir to a shell config, or
# found it already on PATH / already in the config.
show_path_change() {
    if [ -n "${UPDATED_CONFIG:-}" ]; then
        if [ "$FANCY" = 1 ]; then
            card_line "${C_DIM}PATH${RESET}  added in $(tildify "$UPDATED_CONFIG")"
        else
            printf 'added to PATH in %s\n' "$(tildify "$UPDATED_CONFIG")"
        fi
    elif [ "$FANCY" = 1 ]; then
        card_line "${C_DIM}PATH${RESET}  already set"
    else
        printf 'PATH already set\n'
    fi
    if [ "$FANCY" = 1 ]; then
        card_bottom
    fi
}

verify_install() {
    # Temporarily add to PATH so we can verify
    export PATH="${INSTALL_DIR}:${PATH}"

    INSTALLED_VERSION=""
    VERIFY_NOTE=""
    if command -v "$BINARY_NAME" >/dev/null 2>&1; then
        INSTALLED_VERSION=$("$BINARY_NAME" --version 2>/dev/null </dev/null || true)
        if [ -z "$INSTALLED_VERSION" ]; then
            VERIFY_NOTE="installed, but could not read its version"
        fi
    else
        VERIFY_NOTE="installed; restart your shell to use it"
    fi

    if [ "$FANCY" = 0 ]; then
        if [ -n "$INSTALLED_VERSION" ]; then
            printf 'ready: %s\n' "$INSTALLED_VERSION"
        else
            printf '%s\n' "$VERIFY_NOTE"
        fi
    fi
}

print_success() {
    now_ms
    ELAPSED_MS=$(( NOW - START_MS ))
    if [ "$ELAPSED_HIRES" = 1 ]; then
        ELAPSED="$(( ELAPSED_MS / 1000 )).$(( ELAPSED_MS % 1000 / 100 ))s"
    else
        ELAPSED="$(( ELAPSED_MS / 1000 ))s"
    fi

    if [ "$FANCY" = 1 ]; then
        if [ -n "$INSTALLED_VERSION" ]; then
            TITLE_WORD="ready"
        else
            TITLE_WORD="installed"
        fi
        card_top "${C_ACCENT}${TITLE_WORD}${RESET} ${C_DIM}·${RESET} ${C_DIM}${ELAPSED}${RESET}" \
            $(( ${#TITLE_WORD} + 3 + ${#ELAPSED} ))
        card_line "${C_CMD}strata${RESET}                 ${C_DIM}REPL, in memory${RESET}"
        card_line "${C_CMD}strata ./mydb${RESET}          ${C_DIM}a database on disk${RESET}"
        card_line "${C_CMD}strata agents guide${RESET}    ${C_DIM}for your AI agent${RESET}"
        card_bottom
        if [ -n "$VERIFY_NOTE" ]; then
            printf '  %s%s%s\n' "$C_DIM" "$VERIFY_NOTE" "$RESET"
        fi
        if [ -n "${UPDATED_CONFIG:-}" ]; then
            printf '  %sopen a new shell, or:%s source %s\n' "$C_DIM" "$RESET" "$(tildify "$UPDATED_CONFIG")"
        fi
        printf '  %sdocs%s  stratadb.org/docs\n\n' "$C_DIM" "$RESET"
    else
        printf '\n'
        printf '  strata                 REPL, in memory\n'
        printf '  strata ./mydb          a database on disk\n'
        printf '  strata agents guide    for your AI agent\n'
        printf '\n'
        if [ -n "${UPDATED_CONFIG:-}" ]; then
            printf 'open a new shell, or: source %s\n' "$(tildify "$UPDATED_CONFIG")"
        fi
        printf 'docs  stratadb.org/docs\n'
    fi
}

# Installing is what running this script does. Setting STRATA_INSTALL_SH_NO_MAIN
# lets scripts/verify-installer.mjs source the file and call one function
# against a fixture manifest, which is how the platform refusal is tested
# without a network or a release.
if [ -z "${STRATA_INSTALL_SH_NO_MAIN:-}" ]; then
    main
fi
