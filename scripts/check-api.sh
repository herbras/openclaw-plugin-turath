#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# Turath API Change Detector
# Dibuat oleh Ibrahim Nurul Huda — sarbeh.com
#
# Mengecek apakah API Turath.io sudah berubah dari yang kita expect.
# Jalankan secara berkala atau sebelum release.
#
# Usage:
#   ./scripts/check-api.sh              # Full check
#   ./scripts/check-api.sh --quick      # Quick check (endpoints only)
#   ./scripts/check-api.sh --browser    # Full check + browser intercept
# ─────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Config ───────────────────────────────────────────────────────

API_BASE="https://api.turath.io"
FILES_BASE="https://files.turath.io/books-v3"
TEST_BOOK_ID=21796      # أصول في التفسير (small, stable book)
TEST_PAGE=1
TEST_SEARCH="التوحيد"
API_VER=3

# ── Colors ───────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

pass=0
fail=0
warn=0

ok()   { echo -e "  ${GREEN}✓${NC} $1"; pass=$((pass + 1)); }
fail() { echo -e "  ${RED}✗${NC} $1"; fail=$((fail + 1)); }
warn() { echo -e "  ${YELLOW}⚠${NC} $1"; warn=$((warn + 1)); }
info() { echo -e "  ${DIM}$1${NC}"; }

# ── Helper: curl with timeout ────────────────────────────────────

api_get() {
  curl -s --max-time 15 -H "Accept: application/json" "$1" 2>/dev/null
}

api_status() {
  curl -s -o /dev/null -w "%{http_code}" --max-time 15 -H "Accept: application/json" "$1" 2>/dev/null
}

# ── Check 1: Endpoint Availability ──────────────────────────────

check_endpoints() {
  echo -e "\n${BOLD}[1/5] Endpoint Availability${NC}"

  # URL-encode search term
  local encoded_search
  encoded_search=$(python3 -c "import urllib.parse; print(urllib.parse.quote('${TEST_SEARCH}'))")

  local endpoints=(
    "${API_BASE}/book?id=${TEST_BOOK_ID}&include=indexes&ver=${API_VER}"
    "${API_BASE}/page?book_id=${TEST_BOOK_ID}&pg=${TEST_PAGE}&ver=${API_VER}"
    "${API_BASE}/search?q=${encoded_search}&ver=${API_VER}"
    "${FILES_BASE}/${TEST_BOOK_ID}.json"
  )
  local labels=(
    "GET /book"
    "GET /page"
    "GET /search"
    "GET /books-v3/{id}.json (CDN)"
  )

  for i in "${!endpoints[@]}"; do
    local status
    status=$(api_status "${endpoints[$i]}")
    if [[ "$status" == "200" ]]; then
      ok "${labels[$i]} → ${status}"
    elif [[ "$status" == "000" ]]; then
      fail "${labels[$i]} → TIMEOUT/UNREACHABLE"
    else
      fail "${labels[$i]} → ${status}"
    fi
  done

  # Check old CDN path is still dead
  local old_status
  old_status=$(api_status "https://files.turath.io/books/${TEST_BOOK_ID}.json")
  if [[ "$old_status" == "404" ]]; then
    ok "Old CDN (books/) still 404 — no regression"
  elif [[ "$old_status" == "200" ]]; then
    warn "Old CDN (books/) returned 200 — might have reverted!"
  fi
}

# ── Check 2: API Response Structure ────────────────────────────

check_book_api() {
  echo -e "\n${BOLD}[2/5] Book API Response Structure${NC}"

  local resp
  resp=$(api_get "${API_BASE}/book?id=${TEST_BOOK_ID}&include=indexes&ver=${API_VER}")

  if [[ -z "$resp" ]]; then
    fail "Empty response from /book"
    return
  fi

  # Check expected fields
  for field in meta indexes; do
    if echo "$resp" | python3 -c "import json,sys; d=json.load(sys.stdin); assert '$field' in d" 2>/dev/null; then
      ok "/book has '${field}' field"
    else
      fail "/book missing '${field}' field"
    fi
  done

  # Check meta sub-fields
  local meta_fields
  meta_fields=$(echo "$resp" | python3 -c "
import json, sys
d = json.load(sys.stdin)
m = d.get('meta', {})
print(','.join(sorted(m.keys())))
" 2>/dev/null)

  local expected_meta="author_id,author_page_start,cat_id,date_built,id,info,info_long,name,printed,type,version"
  if [[ "$meta_fields" == *"id"* && "$meta_fields" == *"name"* && "$meta_fields" == *"author_id"* ]]; then
    ok "/book.meta has core fields (id, name, author_id)"
    info "Current meta keys: ${meta_fields}"
  else
    fail "/book.meta structure changed!"
    info "Got: ${meta_fields}"
    info "Expected to contain: id, name, author_id"
  fi

  # Check indexes
  local idx_fields
  idx_fields=$(echo "$resp" | python3 -c "
import json, sys
d = json.load(sys.stdin)
ix = d.get('indexes', {})
print(','.join(sorted(ix.keys())))
" 2>/dev/null)

  if [[ "$idx_fields" == *"headings"* ]]; then
    ok "/book.indexes has 'headings'"
    info "Current index keys: ${idx_fields}"
  else
    fail "/book.indexes missing 'headings'"
  fi
}

# ── Check 3: Page API Response Structure ────────────────────────

check_page_api() {
  echo -e "\n${BOLD}[3/5] Page API Response Structure${NC}"

  local resp
  resp=$(api_get "${API_BASE}/page?book_id=${TEST_BOOK_ID}&pg=${TEST_PAGE}&ver=${API_VER}")

  if [[ -z "$resp" ]]; then
    fail "Empty response from /page"
    return
  fi

  for field in meta text; do
    if echo "$resp" | python3 -c "import json,sys; d=json.load(sys.stdin); assert '$field' in d" 2>/dev/null; then
      ok "/page has '${field}' field"
    else
      fail "/page missing '${field}' field"
    fi
  done

  # Check meta is still a JSON string (not object)
  local meta_type
  meta_type=$(echo "$resp" | python3 -c "
import json, sys
d = json.load(sys.stdin)
print(type(d.get('meta')).__name__)
" 2>/dev/null)

  if [[ "$meta_type" == "str" ]]; then
    ok "/page.meta is string (JSON-encoded) — as expected"
  elif [[ "$meta_type" == "dict" ]]; then
    warn "/page.meta changed to object! Was string before"
  else
    fail "/page.meta unexpected type: ${meta_type}"
  fi
}

# ── Check 4: v3 Book File Structure ─────────────────────────────

check_bookfile_v3() {
  echo -e "\n${BOLD}[4/5] Book File v3 Structure (CDN)${NC}"

  local resp
  resp=$(api_get "${FILES_BASE}/${TEST_BOOK_ID}.json")

  if [[ -z "$resp" ]]; then
    fail "Empty response from books-v3"
    return
  fi

  # Check v3 minified keys (Arabic diacritics)
  local has_v3_keys
  has_v3_keys=$(echo "$resp" | python3 -c "
import json, sys
d = json.load(sys.stdin)
# ً (U+064B) = meta object in v3
has_meta = '\u064b' in d
has_pages = 'pages' in d
has_indexes = '\u0658' in d
print(f'{has_meta},{has_pages},{has_indexes}')
" 2>/dev/null)

  IFS=',' read -r has_meta has_pages has_indexes <<< "$has_v3_keys"

  if [[ "$has_meta" == "True" ]]; then
    ok "v3 meta key (ً/U+064B) present"
  else
    fail "v3 meta key (ً/U+064B) missing — format changed!"
  fi

  if [[ "$has_pages" == "True" ]]; then
    ok "v3 'pages' array present"
  else
    fail "v3 'pages' array missing"
  fi

  if [[ "$has_indexes" == "True" ]]; then
    ok "v3 indexes key (٘/U+0658) present"
  else
    fail "v3 indexes key (٘/U+0658) missing"
  fi

  # Verify meta sub-keys
  echo "$resp" | python3 -c "
import json, sys
d = json.load(sys.stdin)
meta = d.get('\u064b', {})
expected = {
    '\u064c': 'id',
    '\u064d': 'name',
    '\u064e': 'cat_id',
    '\u064f': 'author_id',
    '\u0651': 'details',
    '\u0654': 'size',
}
for key, label in expected.items():
    if key in meta:
        print(f'OK:{label}')
    else:
        print(f'MISSING:{label}')
" 2>/dev/null | while IFS=: read -r status label; do
    if [[ "$status" == "OK" ]]; then
      ok "v3 meta.${label} present"
    else
      fail "v3 meta.${label} MISSING — key mapping broken!"
    fi
  done

  # Check page structure
  local page_keys
  page_keys=$(echo "$resp" | python3 -c "
import json, sys
d = json.load(sys.stdin)
pages = d.get('pages', [])
if pages:
    print(','.join(sorted(pages[0].keys())))
else:
    print('EMPTY')
" 2>/dev/null)

  if [[ "$page_keys" == *"text"* ]]; then
    ok "v3 pages[].text field present"
    info "Page keys: ${page_keys}"
  else
    fail "v3 pages[] structure changed! Got: ${page_keys}"
  fi
}

# ── Check 5: Search API ─────────────────────────────────────────

check_search_api() {
  echo -e "\n${BOLD}[5/5] Search API Response Structure${NC}"

  local encoded_search
  encoded_search=$(python3 -c "import urllib.parse; print(urllib.parse.quote('${TEST_SEARCH}'))")
  local resp
  resp=$(api_get "${API_BASE}/search?q=${encoded_search}&ver=${API_VER}")

  if [[ -z "$resp" ]]; then
    fail "Empty response from /search"
    return
  fi

  for field in count data; do
    if echo "$resp" | python3 -c "import json,sys; d=json.load(sys.stdin); assert '$field' in d" 2>/dev/null; then
      ok "/search has '${field}' field"
    else
      fail "/search missing '${field}' field"
    fi
  done

  # Check data item structure
  local item_fields
  item_fields=$(echo "$resp" | python3 -c "
import json, sys
d = json.load(sys.stdin)
items = d.get('data', [])
if items:
    print(','.join(sorted(items[0].keys())))
else:
    print('EMPTY')
" 2>/dev/null)

  if [[ "$item_fields" == *"book_id"* && "$item_fields" == *"text"* ]]; then
    ok "/search.data[] has core fields (book_id, text)"
    info "Item keys: ${item_fields}"
  else
    fail "/search.data[] structure changed! Got: ${item_fields}"
  fi
}

# ── Check 6 (optional): Browser Intercept ────────────────────────

check_browser() {
  echo -e "\n${BOLD}[6/6] Browser Network Intercept (agent-browser)${NC}"

  if ! command -v agent-browser &>/dev/null; then
    warn "agent-browser not installed — skipping browser check"
    info "Install: npm install -g agent-browser && agent-browser install"
    return
  fi

  # Open page and inject interceptor
  agent-browser open "https://app.turath.io/" >/dev/null 2>&1
  sleep 2

  agent-browser eval "
    window.__capturedRequests = [];
    const origFetch = window.fetch;
    window.fetch = function(...args) {
      window.__capturedRequests.push({
        type: 'fetch',
        url: typeof args[0] === 'string' ? args[0] : args[0]?.url || args[0]?.toString()
      });
      return origFetch.apply(this, args);
    };
    const origXHR = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
      window.__capturedRequests.push({ type: 'xhr', method, url: url?.toString() });
      return origXHR.apply(this, arguments);
    };
    'ready';
  " >/dev/null 2>&1

  # Click first book
  agent-browser snapshot -i --json 2>/dev/null | python3 -c "
import json, sys
data = json.load(sys.stdin)
# Find first book link ref
snapshot = data.get('data', {}).get('snapshot', '')
for line in snapshot.split('\n'):
    if 'link' in line and 'ref=' in line and 'كتب' not in line:
        ref = line.split('ref=')[1].split(']')[0]
        print(ref)
        break
" 2>/dev/null | head -1 | while read -r ref; do
    agent-browser click "@${ref}" >/dev/null 2>&1
  done

  sleep 3

  # Capture requests
  local requests
  requests=$(agent-browser eval "JSON.stringify(window.__capturedRequests)" 2>/dev/null | tr -d '"' | python3 -c "
import json, sys
try:
    data = json.loads(sys.stdin.read())
    for r in data:
        url = r.get('url', '')
        if 'turath' in url or 'api' in url:
            print(url)
except:
    pass
" 2>/dev/null)

  agent-browser close >/dev/null 2>&1

  if [[ -z "$requests" ]]; then
    warn "No API requests captured (page may not have loaded)"
    return
  fi

  echo "$requests" | while read -r url; do
    if [[ "$url" == *"api.turath.io/book"* ]]; then
      ok "Browser calls /book endpoint"
      info "$url"
    elif [[ "$url" == *"api.turath.io/page"* ]]; then
      ok "Browser calls /page endpoint"
      info "$url"
    elif [[ "$url" == *"files.turath.io/books-v3"* ]]; then
      ok "Browser uses books-v3 CDN"
      info "$url"
    elif [[ "$url" == *"files.turath.io/books/"* && "$url" != *"books-v3"* ]]; then
      fail "Browser uses OLD CDN path (books/ instead of books-v3)!"
      info "$url"
    elif [[ "$url" == *"turath"* ]]; then
      info "Other: $url"
    fi
  done
}

# ── Main ─────────────────────────────────────────────────────────

main() {
  echo -e "${BOLD}${CYAN}Turath API Change Detector${NC}"
  echo -e "${DIM}Testing against book ID ${TEST_BOOK_ID} (أصول في التفسير)${NC}"
  echo -e "${DIM}$(date '+%Y-%m-%d %H:%M:%S')${NC}"

  check_endpoints

  if [[ "${1:-}" == "--quick" ]]; then
    echo -e "\n${DIM}--quick mode: skipping structure checks${NC}"
  else
    check_book_api
    check_page_api
    check_bookfile_v3
    check_search_api
  fi

  if [[ "${1:-}" == "--browser" ]]; then
    check_browser
  fi

  # Summary
  echo -e "\n${BOLD}━━━ Summary ━━━${NC}"
  echo -e "  ${GREEN}✓ Passed: ${pass}${NC}"
  [[ $warn -gt 0 ]] && echo -e "  ${YELLOW}⚠ Warnings: ${warn}${NC}"
  [[ $fail -gt 0 ]] && echo -e "  ${RED}✗ Failed: ${fail}${NC}"

  if [[ $fail -gt 0 ]]; then
    echo -e "\n${RED}${BOLD}API HAS CHANGED! Review failures above and update code.${NC}"
    exit 1
  elif [[ $warn -gt 0 ]]; then
    echo -e "\n${YELLOW}Some warnings — review above.${NC}"
    exit 0
  else
    echo -e "\n${GREEN}${BOLD}All checks passed. API is stable.${NC}"
    exit 0
  fi
}

main "$@"
