---
name: Key Feedback and Bug Patterns
description: Bugs encountered and design feedback to avoid repeating — includes backbone direction, polymerase placement, animation reset bugs, biology accuracy corrections
type: feedback
---

### Biology Accuracy (don't reintroduce)
- **Helicase is for replication, NOT transcription**: RNA Polymerase itself unwinds the DNA during transcription. The app originally showed helicase as a separate step — corrected to RNA Polymerase doing the unwinding. Internal code still uses "helicase" variable names for the unwinding front (implementation detail only).
- **"Every protein begins with Met" is an overstatement**: Met is often cleaved post-translationally. Say "first amino acid added during translation" instead.
- **Central dogma "all living things"**: Retroviruses reverse the flow. Use "in cells" to be accurate.
- **Codon reference table must include all 20 amino acids**: Was missing Ile, Asn, Asp, Glu, Cys.
- **3D unwinding fork color**: Must be gold (#fbbf24) to match the polymerase sphere — they represent the same enzyme (RNA Polymerase).

### Bugs Fixed (don't reintroduce)
- **Backbone direction**: BackboneStrand must push OUTWARD (along its own angle). Using `side=-1` for the template strand sent it inward through the center, creating a "hanging helix." Both strands use outward direction now.
- **Polymerase chasing bug**: Polymerase target was capped at `helicaseFront - 2`, so it could never reach `numPairs - 1` and the drift phase never triggered. Fix: once helicase is done, polymerase target becomes `numPairs - 1`.
- **Stale mRNA on reset**: When `active` goes false, ALL state (mRNABuilt, polyFront, helicaseFront, ribosomePos, aasBuilt, folding, opacity refs) must be reset — not just phase. Otherwise mRNA bases remain rendered on the helix.
- Helix bond rotation: Must use quaternion `setFromUnitVectors` not `lookAt` for local-space rotation
- Step index alignment: DNAHelix step conditions must match 0-indexed step numbers from learnSteps.jsx
- Silent mutation dialog: Needs explicit timer cleanup via ref
- Creature comparison: `handleGo` must NOT overwrite prevTraits — snapshot is taken on first edit in `handleBaseClick`
- Randomize/preset: Must snapshot prevTraits before changing template
- No-start-codon old creature: Use `'none'` sentinel to distinguish "no snapshot" from "null traits"
- Stop codon timing: Ribosome must not reach stop codon before step 9 — cap ribosomePos at 3 during step 8
- **Responsive overflow**: `pipeline-bases` with `flex-wrap: nowrap` needs `min-width: 0` on every flex/grid ancestor to allow shrinking. Framer Motion `<motion.div>` wrappers break the chain if not addressed. In the learn panel, stacking labels above + smaller badges (18px) is more reliable than scroll containers in deeply nested flex.

### Design Preferences
- **Biological accuracy matters**: User explicitly wants accurate biology. Confirmed by coworker review — even "very minor" misinformation matters.
- **Animation speed for iteration**: Lab animations should be fast enough to not slow down mutation iteration (~120ms/base) but slow enough to see what's happening
- Don't show RNA during protein folding step — just the folding protein alone
- mRNA should drift to the side when released, not disappear
- Polymerase should animate flying in on step 3, not just appear
- Amino acid chain should build next to tRNA so the connection is clear
- Pipeline animation delay: 1200ms per stage

### Creature Art Decisions
- **Keep cartoonish** eyes (white sclera, dark pupils, derpy offsets, highlight dots) and silly mouths (#1e293b strokes)
- **No drop shadow or radial gradient** on creature body — flat color fill
- **Body shapes should be organic** (bezier curves, slight wobble)

### 3D Helix Decisions
- **Template strand** (right) fades when unzipped, **coding strand** (left) stays bright
- **Template backbone** fades to lower opacity during unzipping to match its bases
- Camera at z=14 (user asked to zoom out from z=11)
- Both backbones move OUTWARD radially — never through center

### Layout Decisions
- Creature Lab uses 3-column grid: editor (340px) | 3D panel (1fr) | creature (300px)
- Protein chain + traits summary repeated below creature for visibility without scrolling
- Collapses to 2-col at 1100px, 1-col at 768px — students are on personal laptops
- Learn panel base badges: 18px with 2px gap, labels stacked above (not beside) to fit 15 bases in one line at 360px panel width
