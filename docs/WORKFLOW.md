# PFA Study Platform — Content Workflow Guide

## Quick Start: Adding a New Chapter

### Step 1: Copy the Template
```
Copy: templates/chapter-template.html
Paste: {subject}/{class}th/chapters/ch{N}.html
```

**Example:** To add Physics Class 11 Chapter 1:
```
Copy: templates/chapter-template.html
To:   physics/11th/chapters/ch1.html
```

### Step 2: Edit the Metadata
Open the file and edit the JSON block at the top:

```html
<script type="application/json" id="chapter-meta">
{
  "subject": "Physics",
  "class": "11",
  "chapter": 1,
  "title": "Physical World"
}
</script>
```

### Step 3: Fill In Your Content
Add content to any section you want. **Empty sections are automatically hidden** — you only need to fill what you have.

### Step 4: Generate Manifest
```powershell
.\build-manifest.ps1
```

### Step 5: Push to GitHub
```bash
git add .
git commit -m "Add Physics 11 Ch1"
git push
```

### Step 6: Done!
The chapter automatically appears in:
- ✅ Main dashboard
- ✅ Subject dashboard
- ✅ Class chapter list
- ✅ Search results
- ✅ Navigation (prev/next)
- ✅ Progress tracking

---

## Adding a New Subject

1. Create the folder structure:
```
newsubject/
├── index.html          ← Copy from any existing subject's index.html
├── 11th/
│   ├── index.html      ← Copy from any existing class index
│   └── chapters/
└── 12th/
    ├── index.html
    └── chapters/
```

2. In each copied `index.html`, change the `data-subject` attribute:
```html
<body data-pfa-page="subject-dashboard" data-subject="newsubject">
```

3. Add chapter files using the template
4. Run `.\build-manifest.ps1`
5. Push to GitHub
6. The main portal auto-detects the new subject!

**To add custom emoji/color**, edit `engine/platform.js` → `PFA.config.subjectMeta`:
```javascript
newsubject: { name: 'New Subject', emoji: '🔮', color: '#e040fb', icon: '🔮' }
```

---

## Using Components in Chapters

### Formula Box
```html
<div class="pfa-formula" data-name="Speed" data-formula="v = d / t"></div>
```

### MCQ (Interactive)
```html
<div class="pfa-mcq" data-correct="b">
  <div class="mcq-question">Question text?</div>
  <div class="pfa-option" data-key="a">Option A</div>
  <div class="pfa-option" data-key="b">Option B (correct)</div>
  <div class="pfa-option" data-key="c">Option C</div>
  <div class="pfa-option" data-key="d">Option D</div>
  <div class="mcq-explanation">Explanation shown after answering.</div>
</div>
```

### PYQ Box
```html
<div class="pfa-pyq" data-year="2024" data-marks="3">
  <p>Previous year question text here...</p>
</div>
```

### Numerical Problem (Show/Hide Solution)
```html
<div class="pfa-numerical">
  <div class="numerical-question"><strong>Q1.</strong> Problem statement...</div>
  <div class="numerical-answer">Step-by-step solution...</div>
</div>
```

### Warning / Common Mistake
```html
<div class="pfa-warning">
  Students often confuse X with Y. Remember: X is... while Y is...
</div>
```

### Revision Point
```html
<div class="pfa-revision">
  <strong>Key Point:</strong> Important revision note...
</div>
```

### Summary Box
```html
<div class="pfa-summary">
  <h3>Chapter Summary</h3>
  <ul>
    <li>Point 1</li>
    <li>Point 2</li>
  </ul>
</div>
```

### Reaction Box
```html
<div class="pfa-reaction" data-type="important">
  <div class="reaction-label">Combustion of Methane</div>
  CH₄ + 2O₂ → CO₂ + 2H₂O
</div>
```

### Assertion-Reason
```html
<div class="pfa-assertion" data-correct="a">
  <div class="assertion-text"><strong>Assertion (A):</strong> ...</div>
  <div class="reason-text"><strong>Reason (R):</strong> ...</div>
  <div class="pfa-option" data-key="a">Both true, R explains A</div>
  <div class="pfa-option" data-key="b">Both true, R doesn't explain A</div>
  <div class="pfa-option" data-key="c">A true, R false</div>
  <div class="pfa-option" data-key="d">A false, R true</div>
</div>
```

### Collapsible Content
```html
<div class="pfa-collapsible" data-title="Show Detailed Solution">
  <p>Hidden content that can be expanded...</p>
</div>
```

### Practice Test (Timed)
```html
<div class="pfa-practice-test" data-time="15">
  <!-- Put pfa-mcq items here -->
</div>
```

---

## Folder Structure Reference

```
CHEMISTRY/
├── index.html              ← Main portal dashboard
├── chapters.json           ← Auto-generated manifest
├── build-manifest.ps1      ← Run before pushing
├── manifest.json           ← PWA config
├── sw.js                   ← Service worker
│
├── engine/                 ← Platform engine (DO NOT EDIT)
│   ├── platform.js
│   ├── search.js
│   ├── progress.js
│   └── components.js
│
├── css/style.css           ← Global styles
├── js/main.js              ← Theme + initialization
├── icons/                  ← PWA icons
├── templates/              ← Chapter template
│
├── chemistry/
│   ├── index.html
│   ├── 11th/
│   │   ├── index.html
│   │   └── chapters/ch1.html, ch2.html...
│   └── 12th/
│       ├── index.html
│       └── chapters/ch1.html...
│
├── physics/                ← Same structure
├── maths/                  ← Same structure
└── biology/                ← Same structure
```

---

## Your Daily Workflow

```
1. Copy template     →  templates/chapter-template.html
2. Paste content     →  {subject}/{class}th/chapters/ch{N}.html
3. Edit metadata     →  Change subject, class, chapter, title
4. Fill sections     →  Add notes, formulas, MCQs, etc.
5. Save file         →  Ctrl+S
6. Run script        →  .\build-manifest.ps1
7. Push to GitHub    →  git add . && git commit && git push
```

**That's it! Everything else is automatic.**
