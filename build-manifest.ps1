# ============================================
# PFA Study Platform - Build Manifest Script
# ============================================
# Scans all chapter HTML files, reads metadata,
# and generates chapters.json
#
# USAGE: .\build-manifest.ps1
# Run this before every git push after adding chapters.
# ============================================

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PFA Study Platform - Build Manifest" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Subject configuration (emojis stored as simple strings)
$subjectConfig = @{
    "chemistry" = @{ name = "Chemistry"; color = "#00bcd4" }
    "physics"   = @{ name = "Physics"; color = "#ff9800" }
    "maths"     = @{ name = "Mathematics"; color = "#ab47bc" }
    "biology"   = @{ name = "Biology"; color = "#66bb6a" }
}

# Build manifest structure
$subjects = @{}
$totalChapters = 0

# Scan for subjects (top-level directories that could contain chapters)
$skipDirs = @('.git', 'css', 'js', 'engine', 'icons', 'templates', 'docs', '11th', '12th', 'node_modules')
$subjectDirs = Get-ChildItem -Path $root -Directory | Where-Object {
    $skipDirs -notcontains $_.Name
}

foreach ($subjectDir in $subjectDirs) {
    $subjectKey = $subjectDir.Name.ToLower()
    
    # Find chapter files recursively
    $chapterFiles = @()
    try {
        $chapterFiles = @(Get-ChildItem -Path $subjectDir.FullName -Recurse -Filter "ch*.html" -File)
    } catch {
        continue
    }
    
    if ($chapterFiles.Count -eq 0) {
        Write-Host "  [SKIP] $subjectKey - no chapter files found" -ForegroundColor DarkGray
        continue
    }

    $config = $subjectConfig[$subjectKey]
    if (-not $config) {
        $config = @{ name = $subjectKey.Substring(0,1).ToUpper() + $subjectKey.Substring(1); color = "#78909c" }
    }

    $classes = @{}

    Write-Host "  [SCAN] $($config.name)" -ForegroundColor Green

    foreach ($file in $chapterFiles) {
        # Read file content
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8

        # Extract JSON from <script type="application/json" id="chapter-meta">
        if ($content -match '<script\s+type="application/json"\s+id="chapter-meta">\s*(\{[^}]+\})\s*</script>') {
            $jsonStr = $Matches[1]
        } else {
            Write-Host "    [WARN] No metadata in $($file.Name) - skipping" -ForegroundColor Yellow
            continue
        }

        try {
            $meta = $jsonStr | ConvertFrom-Json
        }
        catch {
            Write-Host "    [ERROR] Bad JSON in $($file.Name) - skipping" -ForegroundColor Red
            continue
        }

        $cls = [string]$meta.class
        $chNum = [int]$meta.chapter
        $title = [string]$meta.title

        # Calculate relative file path from root
        $relativePath = $file.FullName.Substring($root.Length + 1).Replace('\', '/')

        # Ensure class entry exists
        if (-not $classes.ContainsKey($cls)) {
            $classes[$cls] = @{
                chapters = [System.Collections.ArrayList]::new()
            }
        }

        # Add chapter
        $chapterEntry = [ordered]@{
            chapter = $chNum
            title   = $title
            file    = $relativePath
        }

        [void]$classes[$cls].chapters.Add($chapterEntry)
        $totalChapters++

        Write-Host "    + Class $cls Ch $chNum - $title" -ForegroundColor White
    }

    # Sort chapters within each class
    foreach ($cls in @($classes.Keys)) {
        $sorted = @($classes[$cls].chapters | Sort-Object { $_.chapter })
        $classes[$cls].chapters = $sorted
    }

    $subjects[$subjectKey] = [ordered]@{
        name    = $config.name
        color   = $config.color
        classes = $classes
    }
}

# Build final manifest
$manifest = [ordered]@{
    generated = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss")
    subjects  = $subjects
}

# Write manifest as JSON
$outputPath = Join-Path $root "chapters.json"
$jsonOutput = $manifest | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText($outputPath, $jsonOutput, [System.Text.Encoding]::UTF8)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Manifest generated successfully!" -ForegroundColor Green
Write-Host "  Subjects: $($subjects.Count)" -ForegroundColor White
Write-Host "  Chapters: $totalChapters" -ForegroundColor White
Write-Host "  Output:   chapters.json" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
