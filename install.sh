#!/usr/bin/env bash
set -euo pipefail

# ── Turath CLI Installer ──────────────────────────────────────────
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/herbras/openclaw-plugin-turath/main/install.sh | bash
#
# Or review first:
#   curl -fsSL https://raw.githubusercontent.com/herbras/openclaw-plugin-turath/main/install.sh -o install.sh
#   less install.sh
#   bash install.sh

REPO="herbras/openclaw-plugin-turath"
INSTALL_DIR="$HOME/.local/bin"
SKILL_DIR="$HOME/.claude/skills/turath-research"

# ── Colors ────────────────────────────────────────────────────────
if [ -t 1 ]; then
  BOLD='\033[1m'
  DIM='\033[2m'
  CYAN='\033[36m'
  GREEN='\033[32m'
  RED='\033[31m'
  YELLOW='\033[33m'
  RESET='\033[0m'
else
  BOLD='' DIM='' CYAN='' GREEN='' RED='' YELLOW='' RESET=''
fi

info()  { echo -e "${CYAN}[info]${RESET} $1"; }
ok()    { echo -e "${GREEN}[ok]${RESET} $1"; }
warn()  { echo -e "${YELLOW}[warn]${RESET} $1"; }
err()   { echo -e "${RED}[error]${RESET} $1" >&2; }

# ── Detect OS & Arch ─────────────────────────────────────────────
detect_platform() {
  local os arch

  case "$(uname -s)" in
    Linux*)  os="linux" ;;
    Darwin*) os="macos" ;;
    *)       err "Unsupported OS: $(uname -s). Use Windows installer (PowerShell) instead."; exit 1 ;;
  esac

  case "$(uname -m)" in
    x86_64|amd64)  arch="x64" ;;
    aarch64|arm64) arch="arm64" ;;
    *)             err "Unsupported architecture: $(uname -m)"; exit 1 ;;
  esac

  # arm64 binary only available for macOS currently
  if [ "$os" = "linux" ] && [ "$arch" = "arm64" ]; then
    warn "Linux ARM64 binary may not be available. Falling back to x64."
    arch="x64"
  fi

  echo "${os}-${arch}"
}

# ── Get latest release tag ───────────────────────────────────────
get_latest_version() {
  local url="https://api.github.com/repos/${REPO}/releases/latest"

  if command -v curl &>/dev/null; then
    curl -fsSL "$url" | grep '"tag_name"' | head -1 | cut -d'"' -f4
  elif command -v wget &>/dev/null; then
    wget -qO- "$url" | grep '"tag_name"' | head -1 | cut -d'"' -f4
  else
    err "Neither curl nor wget found. Please install one."
    exit 1
  fi
}

# ── Download binary ──────────────────────────────────────────────
download_binary() {
  local platform="$1" version="$2"
  local filename="turath-${platform}"
  local url="https://github.com/${REPO}/releases/download/${version}/${filename}"

  info "Downloading turath ${version} for ${platform}..."

  mkdir -p "$INSTALL_DIR"

  if command -v curl &>/dev/null; then
    curl -fsSL "$url" -o "${INSTALL_DIR}/turath"
  elif command -v wget &>/dev/null; then
    wget -q "$url" -O "${INSTALL_DIR}/turath"
  fi

  chmod +x "${INSTALL_DIR}/turath"
  ok "Binary installed to ${INSTALL_DIR}/turath"
}

# ── Download skills ──────────────────────────────────────────────
download_skills() {
  local version="$1"
  local base_url="https://raw.githubusercontent.com/${REPO}/${version}/skills/turath-research"

  info "Installing skills to ${SKILL_DIR}..."

  mkdir -p "${SKILL_DIR}/examples"
  mkdir -p "${SKILL_DIR}/templates"
  mkdir -p "${SKILL_DIR}/workflows"

  local files=(
    "SKILL.md"
    "examples/01-terjemahan-kitab.md"
    "examples/02-riset-hukum-fiqih.md"
    "examples/03-cari-hadits.md"
    "examples/04-eksplorasi-ulama.md"
    "examples/05-konten-kajian.md"
    "examples/06-perbandingan-kitab.md"
    "templates/terjemahan.md"
    "templates/riset.md"
    "templates/konten.md"
    "workflows/terjemahan.md"
    "workflows/riset.md"
    "workflows/konten.md"
  )

  local dl_cmd
  if command -v curl &>/dev/null; then
    dl_cmd="curl -fsSL"
  else
    dl_cmd="wget -qO-"
  fi

  for file in "${files[@]}"; do
    $dl_cmd "${base_url}/${file}" > "${SKILL_DIR}/${file}" 2>/dev/null || {
      warn "Failed to download ${file}, skipping..."
    }
  done

  ok "Skills installed to ${SKILL_DIR}"
}

# ── Ensure PATH ──────────────────────────────────────────────────
ensure_path() {
  if echo "$PATH" | tr ':' '\n' | grep -qx "$INSTALL_DIR"; then
    return 0
  fi

  local shell_name
  shell_name="$(basename "${SHELL:-/bin/bash}")"

  local rc_file
  case "$shell_name" in
    zsh)  rc_file="$HOME/.zshrc" ;;
    fish) rc_file="$HOME/.config/fish/config.fish" ;;
    *)    rc_file="$HOME/.bashrc" ;;
  esac

  local path_line="export PATH=\"${INSTALL_DIR}:\$PATH\""
  if [ "$shell_name" = "fish" ]; then
    path_line="set -gx PATH ${INSTALL_DIR} \$PATH"
  fi

  # Check if already in rc file
  if [ -f "$rc_file" ] && grep -qF "$INSTALL_DIR" "$rc_file" 2>/dev/null; then
    return 0
  fi

  echo "" >> "$rc_file"
  echo "# Turath CLI" >> "$rc_file"
  echo "$path_line" >> "$rc_file"

  warn "Added ${INSTALL_DIR} to PATH in ${rc_file}"
  warn "Run ${BOLD}source ${rc_file}${RESET}${YELLOW} or open a new terminal to use 'turath'${RESET}"
}

# ── Main ─────────────────────────────────────────────────────────
main() {
  echo ""
  echo -e "${BOLD}  Turath CLI Installer${RESET}"
  echo -e "  ${DIM}Search 100,000+ Islamic classical texts${RESET}"
  echo ""

  local platform version

  platform="$(detect_platform)"
  info "Detected platform: ${platform}"

  version="$(get_latest_version)"
  if [ -z "$version" ]; then
    err "Could not determine latest version from GitHub."
    err "Check https://github.com/${REPO}/releases"
    exit 1
  fi
  info "Latest version: ${version}"

  download_binary "$platform" "$version"
  download_skills "$version"
  ensure_path

  echo ""
  echo -e "${GREEN}${BOLD}  Installation complete!${RESET}"
  echo ""
  echo -e "  Try it:  ${CYAN}turath --help${RESET}"
  echo -e "  Search:  ${CYAN}turath search \"فقه الصلاة\"${RESET}"
  echo ""
}

main "$@"
