#!/bin/sh
# Strata installer - https://stratadb.org
# Usage: curl -fsSL https://stratadb.org/install.sh | sh
#
# Environment overrides:
#   STRATA_VERSION      install a specific version (e.g. 1.0.0) instead of latest
#   STRATA_INSTALL_DIR  install directory (default: ~/.strata/bin)
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
# Color & formatting helpers
# ---------------------------------------------------------------------------

setup_colors() {
    if [ -t 1 ]; then
        BOLD='\033[1m'
        DIM='\033[2m'
        GREEN='\033[0;32m'
        CYAN='\033[0;36m'
        RED='\033[0;31m'
        RESET='\033[0m'
    else
        BOLD='' DIM='' GREEN='' CYAN='' RED='' RESET=''
    fi
}

banner() {
    printf '%b\n' ""
    printf '%b\n' "  ${BOLD}╭─────────────────────────────────╮${RESET}"
    printf '%b\n' "  ${BOLD}│       Installing Strata         │${RESET}"
    printf '%b\n' "  ${BOLD}╰─────────────────────────────────╯${RESET}"
    printf '%b\n' ""
}

step() {
    printf '%b\n' "  ${GREEN}✓${RESET} $1"
}

info() {
    printf '%b\n' "  ${DIM}$1${RESET}"
}

err() {
    printf '%b\n' "  ${RED}✗${RESET} $1" >&2
    exit 1
}

# ---------------------------------------------------------------------------
# Core logic
# ---------------------------------------------------------------------------

main() {
    setup_colors
    banner
    check_dependencies
    detect_platform
    get_latest_version
    download_and_install
    setup_path
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
        Linux)  OS_TARGET="unknown-linux-gnu" ;;
        Darwin) OS_TARGET="apple-darwin" ;;
        MINGW*|MSYS*|CYGWIN*)
            OS_TARGET="pc-windows-msvc"
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
    step "Detected platform: ${BOLD}${TARGET}${RESET}"
}

get_latest_version() {
    # Explicit pin wins over the latest-release lookup.
    if [ -n "${STRATA_VERSION:-}" ]; then
        VERSION="${STRATA_VERSION#v}"
        step "Pinned version: ${BOLD}v${VERSION}${RESET}"
        return
    fi

    RELEASE_URL="https://api.github.com/repos/${REPO}/releases/latest"

    if [ "$DOWNLOAD" = "curl" ]; then
        VERSION=$(curl -fsSL "$RELEASE_URL" | parse_version)
    else
        VERSION=$(wget -qO- "$RELEASE_URL" | parse_version)
    fi

    if [ -z "$VERSION" ]; then
        err "Could not determine latest version. Check https://github.com/${REPO}/releases"
    fi

    step "Latest release: ${BOLD}v${VERSION}${RESET}"
}

parse_version() {
    # Extract tag_name value, strip leading 'v'
    sed -n 's/.*"tag_name": *"v\([^"]*\)".*/\1/p'
}

download_and_install() {
    # Every release asset is a gzipped tar. The release job globs
    # `strata-v*.tar.gz` when it uploads, so no other extension can reach a
    # release; an installer that asked for a .zip would name an archive that
    # cannot exist and report its absence as a missing platform.
    ARCHIVE_NAME="${BINARY_NAME}-v${VERSION}-${TARGET}.tar.gz"
    DOWNLOAD_URL="https://github.com/${REPO}/releases/download/v${VERSION}/${ARCHIVE_NAME}"

    TMPDIR=$(mktemp -d)
    trap 'rm -rf "$TMPDIR"' EXIT

    # Both before the download, so a platform with no build is told so instead
    # of being handed a 404 as a network error.
    fetch_release_manifest
    require_build_for_target

    if [ "$DOWNLOAD" = "curl" ]; then
        curl -fsSL "$DOWNLOAD_URL" -o "${TMPDIR}/${ARCHIVE_NAME}" 2>/dev/null
    else
        wget -q "$DOWNLOAD_URL" -O "${TMPDIR}/${ARCHIVE_NAME}" 2>/dev/null
    fi

    # The manifest has already confirmed this asset exists, so a failure here
    # is the network or the mirror, which is what this message now means.
    if [ ! -f "${TMPDIR}/${ARCHIVE_NAME}" ]; then
        err "Download failed. URL: ${DOWNLOAD_URL}"
    fi

    step "Downloaded ${ARCHIVE_NAME}"

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

    step "Installed to ${BOLD}${INSTALL_DIR}/${BINARY_NAME}${RESET}"
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
        err "Checksum mismatch for ${ARCHIVE_NAME} (expected ${EXPECTED}, got ${ACTUAL}). Aborting."
    fi

    step "Checksum verified"
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

    if [ -n "$UPDATED_CONFIG" ]; then
        step "Added to PATH in ${BOLD}${UPDATED_CONFIG}${RESET}"
    fi
}

verify_install() {
    # Temporarily add to PATH so we can verify
    export PATH="${INSTALL_DIR}:${PATH}"

    if command -v "$BINARY_NAME" >/dev/null 2>&1; then
        INSTALLED_VERSION=$("$BINARY_NAME" --version 2>/dev/null || true)
        if [ -n "$INSTALLED_VERSION" ]; then
            step "Verified: ${BOLD}${INSTALLED_VERSION}${RESET}"
        else
            step "Binary installed (could not read version)"
        fi
    else
        step "Binary installed (restart shell to use)"
    fi
}

print_success() {
    printf '%b\n' ""
    printf '%b\n' "  ${BOLD}Strata is ready.${RESET}"
    printf '%b\n' ""

    # If we modified a shell config, remind the user to restart first
    if [ -n "${UPDATED_CONFIG:-}" ]; then
        printf '%b\n' "  ${DIM}Restart your shell or run:${RESET}  source ${UPDATED_CONFIG}"
        printf '%b\n' ""
        printf '%b\n' "  ${DIM}Then try:${RESET}"
    else
        printf '%b\n' "  ${DIM}Try:${RESET}"
    fi

    printf '%b\n' ""
    printf '%b\n' "    ${CYAN}strata${RESET}                      Interactive REPL ${DIM}(in-memory, nothing written to disk)${RESET}"
    printf '%b\n' "    ${CYAN}strata ./mydb${RESET}               Open or create a database at ./mydb"
    printf '%b\n' "    ${CYAN}strata agents guide${RESET}         Full usage guide ${DIM}(for you or your AI agent)${RESET}"
    printf '%b\n' ""
    printf '%b\n' "  ${DIM}Docs: https://stratadb.org/docs${RESET}"
    printf '%b\n' ""
}

# Installing is what running this script does. Setting STRATA_INSTALL_SH_NO_MAIN
# lets scripts/verify-installer.mjs source the file and call one function
# against a fixture manifest, which is how the platform refusal is tested
# without a network or a release.
if [ -z "${STRATA_INSTALL_SH_NO_MAIN:-}" ]; then
    main
fi
