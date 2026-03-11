# PRD: DNA Transcription & Protein Synthesis Interactive

## Overview

A single-page interactive simulation for middle school science students that teaches the central dogma of molecular biology: **DNA → mRNA → Protein**. Built as a React app (single `.jsx` artifact or standalone HTML file) using **Three.js for a 3D DNA helix centerpiece** and **2D animated panels for the biological process**.

The app has **two equal modes**, accessible via top-level tabs:

1. **Learn Mode** — A guided 12-step walkthrough of transcription and translation, with the 3D helix responding to each step
2. **Creature Lab** — A sandbox where students directly edit DNA bases and watch mutations cascade through mRNA → codons → amino acids → visible traits on a cartoon creature, in real time

The audience is MS students (ages 11–14) encountering this material for the first time. Clarity and delight matter equally. Learn Mode builds the foundational knowledge; Creature Lab makes it tangible and playful.

---

## Design Direction

**Aesthetic: "Bio-Lab Neon"** — Dark background (deep navy/charcoal) with vivid, glowing molecular colors. Think bioluminescence meets a modern science museum exhibit. The 3D helix should feel alive — softly rotating, gently glowing. The 2D panels should be crisp, high-contrast, and easy to read at a glance.

### Visual Language
- **Background**: Dark (#0a0e1a or similar), with subtle dot-grid or faint hexagonal pattern for depth
- **DNA bases**: Each gets a distinct, saturated color — Adenine (green), Thymine (red), Guanine (blue), Cytosine (yellow). These colors are consistent EVERYWHERE in the app
- **Glow effects**: Soft box-shadows or CSS glow on active elements to draw focus
- **Typography**: A clean sans-serif for body (e.g., "DM Sans" or "Nunito"), a bolder display font for headers (e.g., "Space Mono" or "Outfit"). Must be highly legible on dark backgrounds
- **Transitions**: Smooth, purposeful — elements slide/fade in as each step progresses. Nothing instant, nothing sluggish. 300–500ms easing

---

## Architecture

**Single-file React component** using:
- `three` (Three.js) via CDN/import for the 3D helix
- React state + hooks for simulation progression
- CSS-in-JS or inline styles (no external CSS file)
- No backend, no localStorage, fully self-contained

### Layout (Desktop-first, responsive down to tablet)

```
┌─────────────────────────────────────────────────┐
│  Header: "From DNA to Protein"                   │
│  [ 🧬 Learn Mode ]  [ 🧪 Creature Lab ]  ← tabs │
├─────────────────────────────────────────────────┤
│                                                   │
│  (Content area switches based on active tab)      │
│                                                   │
│  LEARN MODE:                                      │
│  ┌──────────────────┬──────────────────────┐      │
│  │  3D DNA Helix    │  Process Panel       │      │
│  │  (Three.js)      │  (2D step-by-step)   │      │
│  │  Rotatable,      │  Callouts, diagrams  │      │
│  │  responds to     │                      │      │
│  │  sim state       │                      │      │
│  ├──────────────────┴──────────────────────┤      │
│  │  [◀ Back] [▶ Next Step] [🔄 Reset]      │      │
│  └─────────────────────────────────────────┘      │
│                                                   │
│  CREATURE LAB:                                    │
│  ┌──────────────────┬──────────────────────┐      │
│  │  DNA Editor      │  Creature Display    │      │
│  │  (clickable      │  (SVG/CSS creature   │      │
│  │   base pairs)    │   that morphs in     │      │
│  │                  │   real time)          │      │
│  │  mRNA readout    │                      │      │
│  │  Codon table     │  Trait summary       │      │
│  │  Amino acid      │  panel below         │      │
│  │  chain           │                      │      │
│  ├──────────────────┴──────────────────────┤      │
│  │  [🎲 Randomize] [🔄 Reset] [📋 Presets] │      │
│  └─────────────────────────────────────────┘      │
│                                                   │
└─────────────────────────────────────────────────┘
```

On smaller screens, stack left/right panels vertically within each mode.

---

## Biology Content & Step Sequence

Use this specific DNA template strand for the simulation (short enough to be readable, long enough to produce a meaningful peptide):

**Template DNA strand**: `3'— T A C A A G C T A C C A A T T —5'`
**Coding DNA strand**:  `5'— A T G T T C G A T G G T T A A —3'`

This produces:
- **mRNA**: `A U G U U C G A U G G U U A A`
- **Codons**: `AUG | UUC | GAU | GGU | UAA`
- **Amino acids**: Met (start) — Phe — Asp — Gly — STOP
- **Peptide**: Met-Phe-Asp-Gly (4 amino acids)

### Step Sequence

The simulation advances through these steps, triggered by the user clicking "Next Step" (or auto-play):

#### Phase 1: DNA Structure (Steps 1–2)
1. **"Meet the DNA"** — Show the full double helix rotating gently. 2D panel labels the structure: sugar-phosphate backbone, base pairs, hydrogen bonds. Callout: "DNA stores the instructions for building proteins."
2. **"Base Pairing Rules"** — Highlight base pairs one at a time in the 2D panel. A↔T (2 hydrogen bonds), G↔C (3 hydrogen bonds). The 3D helix subtly pulses each pair as it's highlighted. Callout: "A always pairs with T. G always pairs with C."

#### Phase 2: Transcription (Steps 3–6)
3. **"Unzipping"** — The 3D helix visually unzips (strands separate from one end). 2D panel shows the two strands pulling apart with helicase enzyme labeled. Callout: "The enzyme helicase unwinds and separates the DNA strands."
4. **"RNA Polymerase Arrives"** — 2D panel shows RNA polymerase binding to the template strand. Callout: "RNA polymerase reads the template strand and builds a matching mRNA strand."
5. **"Building mRNA"** — This is the key interactive step. Bases are added one at a time to the mRNA strand. Each new base appears with a brief glow/pop animation. The 2D panel shows the template DNA on top, the growing mRNA below, with each new base-pair connection highlighted. **Key teaching moment**: U replaces T in RNA (A→U, not A→T). Callout: "In RNA, Uracil (U) takes the place of Thymine (T)."
6. **"mRNA Complete"** — The finished mRNA strand detaches. 3D helix re-zips. 2D panel shows the free mRNA molecule. Callout: "The mRNA carries the genetic message from the nucleus to the ribosome."

#### Phase 3: Translation (Steps 7–11)
7. **"Reading the Code"** — 2D panel shows the mRNA divided into codons (groups of 3). A codon table/wheel reference appears (simplified — only show the codons relevant to this sequence plus 2–3 extras). Callout: "Every 3 bases on mRNA form a codon — each codon codes for one amino acid."
8. **"Ribosome Binds"** — A ribosome graphic (2D, stylized as two rounded blobs — large and small subunit) clamps onto the mRNA at AUG. Callout: "The ribosome finds the start codon AUG to begin reading."
9. **"tRNA Delivers Amino Acids"** — Step through each codon one at a time:
   - **AUG** → tRNA with anticodon UAC delivers **Methionine** (start)
   - **UUC** → tRNA with anticodon AAG delivers **Phenylalanine**
   - **GAU** → tRNA with anticodon CUA delivers **Aspartic Acid**
   - **GGU** → tRNA with anticodon CCA delivers **Glycine**
   - For each: tRNA "flies in" from the side, docks at the ribosome, amino acid links to the growing chain, tRNA exits. The growing peptide chain is visible and grows with each step.
10. **"Stop!"** — Ribosome reaches **UAA** (stop codon). No tRNA arrives. Release factor appears. Callout: "A stop codon tells the ribosome to release the finished protein."
11. **"Protein Complete"** — The peptide chain (Met-Phe-Asp-Gly) is released. Show it folding into a simplified 3D-ish blob shape. Celebration moment — confetti particles or a glow burst. Callout: "The amino acid chain folds into a functional protein!"

#### Phase 4: Summary (Step 12)
12. **"The Central Dogma"** — A clean summary diagram: DNA → (transcription) → mRNA → (translation) → Protein. All the specific bases/codons/amino acids from this simulation shown in a compact reference. A "Try Again" button resets the simulation.

---

## Mode 2: Creature Lab

### Concept

Students get a fictional creature ("Blobby") rendered as a simple SVG/CSS character. The creature's appearance is **deterministically controlled by a 15-base DNA strand** — the same strand from Learn Mode. Students click on individual DNA bases to cycle them (A→T→G→C→A), and the entire pipeline recalculates instantly:

**DNA base changed → complementary strand updates → mRNA recalculated → codons change → amino acids change → creature traits change**

This is the "aha moment" — students physically see that swapping one letter in DNA can change the protein, which changes the organism.

### The Creature: "Blobby"

A simple, charming 2D creature rendered in SVG or CSS. Think Tamagotchi meets a biology textbook figure. The creature should be:
- Cute/appealing (not gross or scary — these are 12-year-olds)
- Simple enough to render with basic shapes (circles, ellipses, rounded rects)
- Distinct enough that trait changes are OBVIOUS at a glance

### Trait Mapping

The DNA strand produces 4 amino acids (from the 4 coding codons before the stop). Each amino acid controls one visible trait. **The mapping uses the actual amino acid produced by the codon**, not an arbitrary assignment — this is biologically honest.

| Codon Position | Default Codon | Default AA | Trait Controlled | How It Maps |
|---|---|---|---|---|
| 1 (AUG) | AUG | Met | **Body Color** | Each of the 20 amino acids maps to a specific color. Met = green, Phe = blue, Leu = purple, etc. |
| 2 (UUC) | UUC | Phe | **Body Shape** | Circle, oval, square, triangle, star, blob, diamond, etc. (20 shapes for 20 AAs) |
| 3 (GAU) | GAU | Asp | **Eye Style** | Number of eyes (1–4), eye size (small/large), eye shape (round/oval/star). Each AA = a unique combo |
| 4 (GGU) | GGU | Gly | **Accessory** | Hat, antennae, tail, wings, spots, stripes, horns, crown, bow tie, etc. |

**Important edge cases to handle:**
- If a mutation creates a **premature stop codon** (UAA, UAG, UGA) in positions 1–4, the creature loses all traits from that point onward. Show the creature as a sad gray blob with a label: "Nonsense mutation! The protein was cut short." This teaches frameshift/nonsense mutations naturally.
- If a mutation changes the **start codon** (AUG → something else), show: "No start codon found — the ribosome can't begin reading! No protein is made." Show an empty petri dish instead of the creature.
- If the codon changes but codes for the **same amino acid** (synonymous/silent mutation), the creature stays the same. Highlight this with a callout: "Silent mutation! Different DNA, same amino acid, same trait." This is a key teaching moment.

### DNA Editor Interface

The left panel shows the full pipeline vertically:

```
TEMPLATE DNA:  [T] [A] [C] [A] [A] [G] [C] [T] [A] [C] [C] [A] [A] [T] [T]
               ←clickable! cycles through A, T, G, C on click

CODING DNA:    [A] [T] [G] [T] [T] [C] [G] [A] [T] [G] [G] [T] [T] [A] [A]
               ← auto-updates (complement)

     ↓ transcription

mRNA:          [A] [U] [G] [U] [U] [C] [G] [A] [U] [G] [G] [U] [U] [A] [A]

     ↓ reading frame

CODONS:        |AUG|  |UUC|  |GAU|  |GGU|  |UAA|
                 ↓      ↓      ↓      ↓     STOP
AMINO ACIDS:   Met    Phe    Asp    Gly     ■

     ↓ trait expression

TRAITS:        🟢     ⭕     👁️     🎩
               Green  Circle  2 eyes  Hat
```

- Each DNA base is a **colored, clickable button** (using the standard A/T/G/C color scheme)
- Clicking a base cycles it: A→T→G→C→A
- When a base changes, an **animation ripple** flows downward through the pipeline (200ms staggered): coding DNA updates → mRNA updates → codons re-split → amino acids recalculate → creature morphs
- The cascade animation is essential — students must SEE the domino effect, not just the result
- Changed elements briefly **glow or pulse** to draw attention

### Creature Display (Right Panel)

- The creature renders large and centered
- When a trait changes, the creature **morphs smoothly** (CSS transition on color, transform on shape, fade for accessories) — not an instant swap
- Below the creature: a **trait card** showing the 4 traits with labels:
  ```
  Body: Green (Met)  |  Shape: Circle (Phe)  |  Eyes: 2 round (Asp)  |  Accessory: Hat (Gly)
  ```
- When a silent mutation occurs, a floating label appears: "Silent mutation — no change!"
- When a nonsense mutation occurs, the creature visibly "breaks down" — gray out with a cracked effect

### Controls

- **🎲 Randomize**: Sets all 15 DNA bases to random values. Fun for exploration
- **🔄 Reset**: Returns to the default sequence from Learn Mode
- **📋 Presets**: A dropdown with 3–4 interesting mutations pre-loaded:
  - "Silent Mutation" — changes one base but produces the same amino acid
  - "Missense Mutation" — changes one base, changes one amino acid, changes one trait
  - "Nonsense Mutation" — creates a premature stop codon
  - "Start Codon Knockout" — mutates AUG to something else
- **Mutation counter**: Shows how many bases differ from the original sequence

### Codon Reference Table

A compact, always-visible reference (collapsible on mobile) showing the standard genetic code, but simplified:
- Only show the ~15 most relevant amino acids (the ones students are likely to produce by mutating the default sequence)
- Highlight the current 4 codons in the active sequence
- Color-code to match the base colors used everywhere else

---

## Learn Mode: Interaction Design

### 3D Helix (Three.js)
- **Geometry**: Two helical strands (sugar-phosphate backbone) as tube geometries, with sphere/box geometries for bases connecting them as "rungs"
- **Base colors**: Match the 4-color scheme defined above, with emissive glow
- **Rotation**: Gentle auto-rotation (y-axis, ~0.005 rad/frame). User can click-drag to rotate manually (OrbitControls)
- **State reactions**:
  - Steps 1–2: Full helix, gentle rotation
  - Steps 3–5: Helix unzips from top — the two backbones separate, rungs disconnect, gap widens. This should animate smoothly over ~1.5 seconds
  - Step 6: Helix re-zips
  - Steps 7–12: Helix rotates quietly in background (focus shifts to 2D panel)
- **Lighting**: Ambient + one directional light. Subtle bloom/glow effect if possible (EffectComposer). If too complex, simple emissive materials work fine
- **Performance**: Keep geometry count reasonable. 15 base pairs = 30 bases + 2 backbone strands. No need for thousands of polygons

### 2D Process Panel
- Renders the current step's content: diagrams, labels, callouts
- **Animated base-by-base building** during Steps 5 and 9 — each base/amino acid appears with a staggered delay (200–400ms)
- Color-coded consistently with the 3D helix
- **Codon highlight**: During translation, the current codon being read is highlighted/boxed on the mRNA strand
- **Amino acid chain**: Shown as colored circles/pills connected by lines, growing left to right
- **Text callouts**: Each step has a 1–2 sentence explanation in a styled callout box. Language is middle-school appropriate — no jargon without immediate definition

### Controls
- **Next Step / Back**: Primary navigation. Large, obvious buttons. Next Step is visually dominant (bright accent color)
- **Reset**: Returns to Step 1
- **Auto-play toggle**: Optional — advances steps on a timer (~5 seconds per step). Off by default
- **Step indicator**: A progress bar or numbered dots showing current position in the 12-step sequence

---

## Specific Implementation Notes

### Three.js Setup
```
- Use `THREE.WebGLRenderer` with `{ antialias: true, alpha: true }` for transparent background blending
- Camera: PerspectiveCamera, FOV ~60, positioned to frame the helix nicely
- OrbitControls for user rotation (limit zoom range so students can't lose the helix)
- The helix should be constructed parametrically:
  - For each base pair i (0 to 14):
    - angle = i * (2π / 10)  // ~10 pairs per full turn
    - y = i * verticalSpacing
    - strand1_x = radius * cos(angle)
    - strand1_z = radius * sin(angle)
    - strand2_x = radius * cos(angle + π)
    - strand2_z = radius * sin(angle + π)
  - Connect sequential points on each strand with TubeGeometry or line segments
  - Place base geometries between paired positions
```

### Unzip Animation
- During transcription steps, animate by interpolating base pair positions outward (increase the radius of each strand at affected base pairs) and fading/removing the connecting "rung" geometries
- Animate top-down (base pair 0 first, then 1, etc.) with staggered timing

### Responsive Behavior
- At viewport width < 900px: Stack layout (helix on top, panel below)
- Helix canvas should resize with its container
- Touch events should work for helix rotation on tablet

### Accessibility
- All text content meets WCAG AA contrast on dark background (use white or light cream for body text)
- Step callouts are readable without relying on color alone
- Controls are keyboard-navigable (tab + enter)

---

## What "Done" Looks Like

A student can:
1. Open the page and immediately see a cool rotating DNA helix
2. Click through 12 steps in **Learn Mode** and understand: DNA has a code → that code is copied to mRNA → the mRNA is read to build a protein
3. See the specific bases, codons, and amino acids at each step
4. Rotate the 3D helix and feel like they're interacting with a real molecule
5. Switch to **Creature Lab** and click on DNA bases to change them
6. Watch the entire cascade (DNA → mRNA → codons → amino acids → creature traits) animate in real time
7. Discover on their own that some mutations change the creature, some don't (silent mutations), and some break the protein entirely (nonsense mutations)
8. Walk away remembering: A-T, G-C (A-U in RNA), codons are 3 bases, proteins are chains of amino acids, and mutations in DNA cause changes in organisms

A teacher can:
1. Project this on a screen and walk through Learn Mode with the class
2. Give students 10 minutes of free play in Creature Lab and hear genuine engagement
3. Trust that the biology is accurate
4. Not need to explain the interface — it should be self-evident

---

## Out of Scope (for v1)
- Quiz/assessment mode
- Realistic protein folding simulation
- Audio narration
- Multi-language support
- Mobile phone layout (tablet minimum)
- Frameshift mutations (insertions/deletions — only substitutions in v1)
- Multiple gene / multi-creature comparison

---

## Technical Summary
| Aspect | Choice |
|---|---|
| Framework | React (single .jsx component) |
| 3D | Three.js (r128 via CDN) |
| 2D Creature | SVG or pure CSS shapes |
| Styling | Inline/CSS-in-JS, dark theme |
| State | React hooks (useState, useEffect, useRef) |
| Deployment | Static file, no backend |
| Target | Desktop + tablet, modern browsers |

---

## Implementation Strategy (for Claude Code)

Build in this order to avoid tangled state:

### Phase 1: Core Data Layer
1. Define the DNA→mRNA→codon→amino acid pipeline as pure functions (no UI). This logic is shared by both modes.
   - `getComplement(base)` — returns DNA complement
   - `transcribe(templateDNA)` — returns mRNA string
   - `splitCodons(mRNA)` — returns array of 3-letter strings
   - `translate(codon)` — returns amino acid name (use the standard genetic code)
   - `getTraits(aminoAcids)` — returns creature trait object
2. Write the full codon→amino acid lookup table (standard genetic code, all 64 codons)

### Phase 2: Learn Mode
3. Build the 2D step panel with all 12 steps (no 3D yet) — get the content and navigation working
4. Build the Three.js helix as an independent component mounted in a ref
5. Wire the helix state to respond to the step number

### Phase 3: Creature Lab
6. Build the DNA editor (clickable bases) + pipeline display
7. Build the creature SVG renderer (takes trait object, returns creature)
8. Wire them together with the cascade animation

### Phase 4: Polish
9. Tab navigation between modes
10. Responsive layout
11. Animation polish, glow effects, transitions
12. Edge case handling (nonsense mutations, start codon knockout, silent mutations)

**Key principle**: The data pipeline (Phase 1) is the foundation everything else depends on. Get that right first, test it in isolation, then build UIs on top of it.
