---
name: Project Status - Deployed, biology accuracy pass complete
description: DNA Transcription app deployed to GitHub/Vercel. Biology reviewed and corrected. WebGL fallback added. Responsive layout fixed for laptop viewports.
type: project
---

## DNA Transcription Interactive - Status

Two-mode educational app (Learn Mode + Creature Lab) teaching the central dogma of molecular biology to middle school students.

### GitHub & Deployment
- Repo: https://github.com/ryannorris14/dna-transcription
- Deployed via Vercel (connected to repo)
- Branch: master

### Completed Work
- **Batches 1-5**: Foundation, Learn Mode, 3D Helix, Creature Lab, Polish — all complete
- **Biology Accuracy Pass (2026-03-11)**: Coworker review surfaced misinformation. Fixed:
  - Replaced helicase with RNA Polymerase for transcription unwinding (helicase is for replication)
  - Recolored 3D unwinding fork from cyan to gold (matching polymerase — same enzyme)
  - Fixed "Every protein begins with Met!" → first amino acid added during translation
  - Fixed "all living things" → "in cells" for central dogma
  - Added 5 missing amino acids to codon reference table (Ile, Asn, Asp, Glu, Cys)
- **WebGL Fallback**: Error boundary + availability check with styled fallback message for laptops without WebGL support
- **Responsive Layout Fix**: Learn panel base badges sized to fit single line with stacked labels. Prevents wrapping ("grouped up" appearance on laptops).
- **Creature Lab 3D Transcription Panel**: 3-column layout (DNA editor | 3D animation | creature). Full pipeline animation: RNA Pol unwinds pair-by-pair → builds mRNA on template strand → mRNA drifts → crossfade to translation → ribosome reads codons → amino acids build → protein folds.
- **Backbone Fix**: Both backbone strands move radially outward when unzipping.
- **Creature Summary**: Protein chain + decoded traits shown below creature display.
- **SVG Favicon**: DNA double helix icon with color-coded rungs.

### Key Architecture
- `LabScene` in DNAHelix.jsx drives the creature lab 3D animation with phases: idle → helicase (unwinding) → polymerase (reading) → drift → translation → folding → done
- `LabTranscriptionCanvas` is the exported component used by CreatureLab.jsx
- Lab animation timing: 120ms/base unwinding, 120ms/base polymerase (follows 3 behind), 300ms/codon translation, 2s folding
- Stage cascade delay: 1200ms between pipeline stages
- Internal variable names still use "helicase" for the unwinding front (implementation detail, not user-facing)

### Key Files
- `src/biology.js` — Pure data layer, codon table, trait mappings
- `src/DNAHelix.jsx` — R3F 3D helix + translation scene (learn mode) + LabScene/LabTranscriptionCanvas (creature lab). Includes WebGLErrorBoundary and WebGLFallback.
- `src/LearnMode.jsx` — 12-step guided tutorial
- `src/CreatureLab.jsx` — DNA editor + 3D panel + pipeline cascade + creature display
- `src/Creature.jsx` — SVG creature renderer
- `src/App.css` — All styles (~2000+ lines)

### Known Considerations
- Chromebooks with Chrome handle WebGL fine. Issues are older laptops with hardware acceleration disabled or outdated GPU drivers.
- puppeteer is in devDependencies (added for screenshot testing, not committed to package.json)
