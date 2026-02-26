# ── Turath CLI Installer (Windows) ─────────────────────────────────
# Usage:
#   irm https://raw.githubusercontent.com/herbras/openclaw-plugin-turath/main/install.ps1 | iex
#
# Or review first:
#   irm https://raw.githubusercontent.com/herbras/openclaw-plugin-turath/main/install.ps1 -OutFile install.ps1
#   Get-Content install.ps1
#   .\install.ps1

$ErrorActionPreference = "Stop"

$REPO = "herbras/openclaw-plugin-turath"
$INSTALL_DIR = "$env:USERPROFILE\.local\bin"
$SKILL_DIR = "$env:USERPROFILE\.claude\skills\turath-research"

function Write-Info  { param($msg) Write-Host "[info] " -ForegroundColor Cyan -NoNewline; Write-Host $msg }
function Write-Ok    { param($msg) Write-Host "[ok] " -ForegroundColor Green -NoNewline; Write-Host $msg }
function Write-Warn  { param($msg) Write-Host "[warn] " -ForegroundColor Yellow -NoNewline; Write-Host $msg }
function Write-Err   { param($msg) Write-Host "[error] " -ForegroundColor Red -NoNewline; Write-Host $msg }

# ── Get latest release tag ───────────────────────────────────────
function Get-LatestVersion {
    $url = "https://api.github.com/repos/$REPO/releases/latest"
    try {
        $release = Invoke-RestMethod -Uri $url -UseBasicParsing
        return $release.tag_name
    } catch {
        Write-Err "Could not fetch latest version from GitHub."
        Write-Err "Check https://github.com/$REPO/releases"
        exit 1
    }
}

# ── Download binary ──────────────────────────────────────────────
function Install-Binary {
    param($Version)

    $filename = "turath-windows-x64.exe"
    $url = "https://github.com/$REPO/releases/download/$Version/$filename"
    $dest = Join-Path $INSTALL_DIR "turath.exe"

    Write-Info "Downloading turath $Version for windows-x64..."

    if (-not (Test-Path $INSTALL_DIR)) {
        New-Item -ItemType Directory -Path $INSTALL_DIR -Force | Out-Null
    }

    try {
        Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
        Write-Ok "Binary installed to $dest"
    } catch {
        Write-Err "Failed to download binary from $url"
        Write-Err $_.Exception.Message
        exit 1
    }
}

# ── Download skills ──────────────────────────────────────────────
function Install-Skills {
    param($Version)

    $baseUrl = "https://raw.githubusercontent.com/$REPO/$Version/skills/turath-research"

    Write-Info "Installing skills to $SKILL_DIR..."

    $dirs = @(
        $SKILL_DIR,
        "$SKILL_DIR\examples",
        "$SKILL_DIR\templates",
        "$SKILL_DIR\workflows"
    )
    foreach ($dir in $dirs) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
    }

    $files = @(
        "SKILL.md",
        "examples/01-terjemahan-kitab.md",
        "examples/02-riset-hukum-fiqih.md",
        "examples/03-cari-hadits.md",
        "examples/04-eksplorasi-ulama.md",
        "examples/05-konten-kajian.md",
        "examples/06-perbandingan-kitab.md",
        "templates/terjemahan.md",
        "templates/riset.md",
        "templates/konten.md",
        "workflows/terjemahan.md",
        "workflows/riset.md",
        "workflows/konten.md"
    )

    foreach ($file in $files) {
        $url = "$baseUrl/$file"
        $dest = Join-Path $SKILL_DIR ($file -replace "/", "\")
        try {
            Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing 2>$null
        } catch {
            Write-Warn "Failed to download $file, skipping..."
        }
    }

    Write-Ok "Skills installed to $SKILL_DIR"
}

# ── Ensure PATH ──────────────────────────────────────────────────
function Ensure-Path {
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")

    if ($userPath -split ";" | Where-Object { $_ -eq $INSTALL_DIR }) {
        return
    }

    $newPath = "$INSTALL_DIR;$userPath"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")

    # Also update current session
    $env:Path = "$INSTALL_DIR;$env:Path"

    Write-Warn "Added $INSTALL_DIR to user PATH"
    Write-Warn "New terminal windows will have 'turath' available automatically"
}

# ── Main ─────────────────────────────────────────────────────────
function Main {
    Write-Host ""
    Write-Host "  Turath CLI Installer" -ForegroundColor White
    Write-Host "  Search 100,000+ Islamic classical texts" -ForegroundColor DarkGray
    Write-Host ""

    Write-Info "Detected platform: windows-x64"

    $version = Get-LatestVersion
    Write-Info "Latest version: $version"

    Install-Binary -Version $version
    Install-Skills -Version $version
    Ensure-Path

    Write-Host ""
    Write-Host "  Installation complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Try it:  " -NoNewline; Write-Host "turath --help" -ForegroundColor Cyan
    Write-Host "  Search:  " -NoNewline; Write-Host 'turath search "فقه الصلاة"' -ForegroundColor Cyan
    Write-Host ""
}

Main
