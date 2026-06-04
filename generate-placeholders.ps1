# Generate placeholder chapter files for all subjects
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# Chapter definitions: subject -> class -> [chapter_num, title]
$chapters = @{
    "Chemistry" = @{
        "11" = @(
            @(1, "Some Basic Concepts of Chemistry"),
            @(2, "Structure of Atom"),
            @(3, "Classification of Elements and Periodicity in Properties"),
            @(4, "Chemical Bonding and Molecular Structure"),
            @(5, "Thermodynamics"),
            @(6, "Equilibrium"),
            @(7, "Redox Reactions"),
            @(8, "Organic Chemistry - Some Basic Principles and Techniques"),
            @(9, "Hydrocarbons")
        )
        "12" = @(
            @(1, "The Solid State"),
            @(2, "Solutions"),
            @(3, "Electrochemistry"),
            @(4, "Chemical Kinetics"),
            @(5, "Surface Chemistry"),
            @(6, "General Principles and Processes of Isolation of Elements"),
            @(7, "The p-Block Elements"),
            @(8, "The d- and f-Block Elements"),
            @(9, "Coordination Compounds"),
            @(10, "Haloalkanes and Haloarenes"),
            @(11, "Alcohols Phenols and Ethers"),
            @(12, "Aldehydes Ketones and Carboxylic Acids"),
            @(13, "Amines"),
            @(14, "Biomolecules")
        )
    }
    "Physics" = @{
        "11" = @(
            @(1, "Physical World"),
            @(2, "Units and Measurements"),
            @(3, "Motion in a Straight Line"),
            @(4, "Motion in a Plane"),
            @(5, "Laws of Motion"),
            @(6, "Work Energy and Power"),
            @(7, "System of Particles and Rotational Motion"),
            @(8, "Gravitation"),
            @(9, "Mechanical Properties of Solids"),
            @(10, "Mechanical Properties of Fluids"),
            @(11, "Thermal Properties of Matter"),
            @(12, "Thermodynamics"),
            @(13, "Kinetic Theory"),
            @(14, "Oscillations"),
            @(15, "Waves")
        )
        "12" = @(
            @(1, "Electric Charges and Fields"),
            @(2, "Electrostatic Potential and Capacitance"),
            @(3, "Current Electricity"),
            @(4, "Moving Charges and Magnetism"),
            @(5, "Magnetism and Matter"),
            @(6, "Electromagnetic Induction"),
            @(7, "Alternating Current"),
            @(8, "Electromagnetic Waves"),
            @(9, "Ray Optics and Optical Instruments"),
            @(10, "Wave Optics"),
            @(11, "Dual Nature of Radiation and Matter"),
            @(12, "Atoms"),
            @(13, "Nuclei"),
            @(14, "Semiconductor Electronics")
        )
    }
    "Mathematics" = @{
        "11" = @(
            @(1, "Sets"),
            @(2, "Relations and Functions"),
            @(3, "Trigonometric Functions"),
            @(4, "Complex Numbers and Quadratic Equations"),
            @(5, "Linear Inequalities"),
            @(6, "Permutations and Combinations"),
            @(7, "Binomial Theorem"),
            @(8, "Sequences and Series"),
            @(9, "Straight Lines"),
            @(10, "Conic Sections"),
            @(11, "Introduction to Three Dimensional Geometry"),
            @(12, "Limits and Derivatives"),
            @(13, "Statistics"),
            @(14, "Probability")
        )
        "12" = @(
            @(1, "Relations and Functions"),
            @(2, "Inverse Trigonometric Functions"),
            @(3, "Matrices"),
            @(4, "Determinants"),
            @(5, "Continuity and Differentiability"),
            @(6, "Application of Derivatives"),
            @(7, "Integrals"),
            @(8, "Application of Integrals"),
            @(9, "Differential Equations"),
            @(10, "Vector Algebra"),
            @(11, "Three Dimensional Geometry"),
            @(12, "Linear Programming"),
            @(13, "Probability")
        )
    }
}

# Subject folder keys
$subjectFolders = @{
    "Chemistry" = "chemistry"
    "Physics" = "physics"
    "Mathematics" = "maths"
}

$template = @'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ch {CHNUM} — {TITLE} | PFA Study Portal</title>
  <link rel="stylesheet" href="../../../css/style.css" />
  <link rel="manifest" href="../../../manifest.json" />
  <meta name="theme-color" content="{COLOR}" />
</head>
<body data-pfa-page="chapter">

  <script type="application/json" id="chapter-meta">
  {
    "subject": "{SUBJECT}",
    "class": "{CLASS}",
    "chapter": {CHNUM},
    "title": "{TITLE}"
  }
  </script>

  <div id="pfa-app" class="container fade-in">
    <div id="pfa-header"></div>
    <div id="pfa-tabs"></div>

    <!-- SECTION: Notes -->
    <div class="pfa-section" data-section="notes" data-label="📝 Notes">
      <button class="print-btn">🖨️ Print Notes</button>
      <p>Content coming soon for <strong>{TITLE}</strong>.</p>
    </div>

    <!-- SECTION: Formulas -->
    <div class="pfa-section" data-section="formulas" data-label="🔢 Formulas">
      <div class="formula-grid">
        <!-- Add formulas here -->
      </div>
    </div>

    <div id="pfa-nav"></div>
    <div id="pfa-footer"></div>
  </div>

  <script src="../../../engine/platform.js"></script>
  <script src="../../../engine/progress.js"></script>
  <script src="../../../engine/search.js"></script>
  <script src="../../../engine/components.js"></script>
  <script src="../../../js/main.js"></script>
</body>
</html>
'@

$colors = @{
    "Chemistry" = "#00bcd4"
    "Physics" = "#ff9800"
    "Mathematics" = "#ab47bc"
}

$created = 0
$skipped = 0

foreach ($subject in $chapters.Keys) {
    $folder = $subjectFolders[$subject]
    $color = $colors[$subject]

    foreach ($cls in $chapters[$subject].Keys) {
        $dir = Join-Path $root "$folder\${cls}th\chapters"
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Host "  [DIR] Created $folder/${cls}th/chapters/" -ForegroundColor Yellow
        }

        foreach ($ch in $chapters[$subject][$cls]) {
            $num = $ch[0]
            $title = $ch[1]
            $file = Join-Path $dir "ch$num.html"

            if (Test-Path $file) {
                Write-Host "  [SKIP] $folder/${cls}th/ch$num - already exists" -ForegroundColor DarkGray
                $skipped++
                continue
            }

            $html = $template `
                -replace '{SUBJECT}', $subject `
                -replace '{CLASS}', $cls `
                -replace '{CHNUM}', $num `
                -replace '{TITLE}', $title `
                -replace '{COLOR}', $color

            [System.IO.File]::WriteAllText($file, $html, [System.Text.Encoding]::UTF8)
            Write-Host "  [NEW] $folder/${cls}th/ch$num - $title" -ForegroundColor Green
            $created++
        }
    }
}

Write-Host ""
Write-Host "Done! Created: $created | Skipped: $skipped" -ForegroundColor Cyan
