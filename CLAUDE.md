# dna-transcription (sci-sims)

Single-page React 19 + Vite 6 app teaching the central dogma (DNA → mRNA →
Protein) to middle-school students. Learn Mode (12-step guided tutorial) and
Creature Lab (edit DNA bases, watch mutations change a cartoon creature).
3D helix via three / @react-three/fiber / drei; 2D panels via framer-motion.
Fully static client-side app: no backend, no env vars, no secrets.

- Spec: `PRD.md`. Migration history: `MIGRATION.md`.
- Source: `src/` (`App.jsx`, `LearnMode.jsx`, `CreatureLab.jsx`,
  `DNAHelix.jsx`, `Creature.jsx`, `Icons.jsx`, `biology.js`,
  `learnSteps.jsx`, `main.jsx`). Linux is case-sensitive — keep import case
  exact.
- Deploy: Vercel, auto-deploys on push to `master` (github.com/ryannorris14/dna-transcription).

## Dev environment (Ubuntu 26.04, since 2026-09-21)

Location: `/home/ryan/projects/sci-sims-dna-transcription`. Node 24 / npm 11.

```bash
npm ci            # npm 11 skips install scripts; that's fine here
npm run dev       # vite dev server
npm run build     # production build -> dist/
npm run preview   # serve dist/
```

No test suite. `puppeteer` is a devDependency for ad-hoc screenshot checks
only; its bundled Chromium is not downloaded — use
`PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome` (or `npm rebuild puppeteer`).

## Working rules

- Biological accuracy is a hard requirement.
- Animations are the centerpiece (300–500 ms easing; nothing instant or sluggish).
- Creature stays deliberately cartoonish/"cursed"; flat fills, no drop shadows.
- Layout for laptops/Chromebooks: no scrolling for key info; 3-col → 2-col at
  1100px → 1-col at 768px.
- Agent memory lives in `.claude/agent-memory/` (wired via the gitignored
  `.claude/settings.local.json` `autoMemoryDirectory`).
