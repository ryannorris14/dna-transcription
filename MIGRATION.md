# Windows → Linux Migration Notes — dna-transcription

Generated 2026-09-21 ahead of a full Windows 10 → Ubuntu 26.04 wipe/rebuild.
Everything below is derived from what was actually on disk/in git at that time —
"unknown" is used where nothing observable answered the question.

## 1. What this project is

A single-page React app teaching the central dogma of molecular biology
(DNA → mRNA → Protein) to middle school students. Two modes: **Learn Mode**
(12-step guided tutorial) and **Creature Lab** (sandbox — edit DNA bases,
watch mutations cascade into a cartoon creature's traits). 3D DNA helix via
Three.js / react-three-fiber; 2D panels via Framer Motion.

- Full spec: `PRD.md` in repo root (design direction, biology content,
  step-by-step sequence, layout diagrams).
- No CLAUDE.md, no README.md in this repo.
- Repo: https://github.com/ryannorris14/dna-transcription.git
- Deployed to Vercel, connected to this GitHub repo (auto-deploy on push
  to `master` — confirmed only via memory notes, not verified live in
  this pass).

## 2. Task state / next steps / open decisions (from Claude memory + git log)

**Status per memory (`project_status.md`, dated 2026-03-11):** Batches 1–5
(Foundation, Learn Mode, 3D Helix, Creature Lab, Polish) complete. A
"biology accuracy pass" fixed several inaccuracies (see below). WebGL
fallback added. Responsive layout fixed for laptop viewports. Memory
describes this as essentially done/deployed — no open TODO list was found
in memory or in PRD.md.

**Git log (last 12 commits, oldest first):**
```
978ed71 DNA transcription simulation with creature lab
ca6d6de Fix backbone strands to separate outward instead of through center
9046f69 Extend lab transcription animation through full protein folding
28b9108 Fix polymerase never finishing — was stuck 3 pairs behind helicase
0f2e84a Fix stale mRNA on reset, add traits under creature, add favicon
9b71f7f Fix biology misinformation, add WebGL fallback, improve responsive layout
84cb775 Fix DNA intro callout — soften absolute claims for accuracy
1cf1805 Fix creature lab overflowing viewport on mobile
6afd62e Widen DNA editor panel, update favicon to match app helix icon
c44b379 Bump editor column to 410px — 400px was 4px too narrow for 9 buttons
dc3b73a Group editor bases into codon triplets, fix favicon clipping
026f307 Revert favicon to 45-deg rotated version for comparison
909b78e Windows-to-Linux migration pass (this pass — memory copy + pending dep commit)
```
Recent activity (before this pass) was UI polish: editor column width,
favicon iteration, codon-triplet grouping in the DNA editor, mobile
overflow fix. No in-progress/half-finished feature was visible in the
diff or log — the working tree was clean except for two things this pass
committed:
- `package.json`/`package-lock.json` had uncommitted changes already
  applied on disk: `puppeteer ^24.39.0` added to devDependencies (memory
  independently notes "puppeteer is in devDependencies... for screenshot
  testing, not committed to package.json" — this pass committed it), plus
  cosmetic reordering of the dependency lists.
- `.claude/agent-memory/` — did not exist in the repo before this pass.

**Open decisions:** none recorded in memory or PRD as pending. PRD.md
reads as a finished spec being implemented, not a live decision log.

**Known bugs:** none currently open. Memory's "Bugs Fixed" list (backbone
direction, polymerase chasing/never-finishing, stale mRNA on reset, helix
bond rotation, step index alignment, silent-mutation timer cleanup,
creature-comparison snapshot timing, stop-codon timing, responsive
overflow) are all marked fixed — kept in
`.claude/agent-memory/feedback_patterns.md` as "don't reintroduce" notes,
not open issues.

**How Ryan wants it built** (from `.claude/agent-memory/user_preferences.md`
and `feedback_patterns.md`):
- Biological accuracy is a hard requirement, not a nice-to-have (confirmed
  by an explicit coworker review that flagged even "minor" inaccuracies).
- Animations are the centerpiece — 3D helix and pipeline cascade should
  feel alive; nothing instant, nothing sluggish (300–500ms easing, per PRD).
- Info/2D panels are secondary to the 3D visual.
- Creature aesthetic should stay deliberately "cursed"/cartoonish (wonky
  eyes, silly mouths, flat color fill, no drop shadows).
- Audience is middle-school students on personal laptops/Chromebooks —
  layout must not require scrolling for key info, must collapse
  gracefully (3-col → 2-col at 1100px → 1-col at 768px).
- Deploys to Vercel from GitHub.

## 3. Git state at migration time

- Branch: `master` (only local branch; only remote branch is
  `origin/master` — no other branches, no stash).
- Ahead/behind origin before this pass: 0/0 (up to date).
- Uncommitted changes before this pass: `package.json` and
  `package-lock.json` (see above), plus untracked `.claude/agent-memory/`
  added by this pass. Both committed and pushed in this pass.
- **Pushed cleanly: YES.** New HEAD after this pass's commit and push:
  `909b78e7bd7efb30baf412d90964aa7103e75c20` (`origin/master` matches).
- No unpushed branches, no stashes.

## 4. Untracked / gitignored files needed to run the project

`.gitignore` covers: `node_modules`, `dist`, `.env`, `.DS_Store`, `*.local`.

Checked disk for actual matches (excluding `node_modules`):
- **No `.env` or `*.env*` file exists anywhere in the project.** Confirmed
  by direct filesystem search.
- `dist/` exists on disk (build output) — regenerable via `npm run build`,
  not needed for source setup.
- No `*.local` files present.
- **No `process.env.*` or `import.meta.env.*` usage anywhere in `src/`** —
  grep came back empty. This app has **no environment variables at all**
  and **no secrets to restore**. It is a fully static client-side app (no
  backend, no API keys) per PRD.md ("No backend, no localStorage, fully
  self-contained").

Windows full paths for reference (all now committed to git, nothing
machine-only remains except regenerable build artifacts):
- `C:\Users\Ryan Norris\trillium\sci-sims\dna-transcription\` — project root
- `C:\Users\Ryan Norris\trillium\sci-sims\dna-transcription\dist\` — build output, gitignored, regenerate with `npm run build`

## 5. Environment / toolchain

- Lockfile present: **yes**, `package-lock.json` (npm).
- `node -v`: v24.13.1
- `npm -v`: 11.10.0
- `package.json` has no `engines` field (no pinned Node/npm version
  requirement recorded).
- Scripts: `dev` (`vite`), `build` (`vite build`), `preview` (`vite preview`).
- Dependencies: `@react-three/drei ^10.0.0`, `@react-three/fiber ^9.0.0`,
  `framer-motion ^12.0.0`, `react ^19.0.0`, `react-dom ^19.0.0`,
  `three ^0.172.0`.
- devDependencies: `@vitejs/plugin-react ^4.0.0`, `puppeteer ^24.39.0`,
  `vite ^6.0.0`.
- No system-level dependencies invoked by any script (no native builds,
  no shell-outs in package.json scripts). `puppeteer` will download a
  bundled Chromium on `npm install` unless
  `PUPPETEER_SKIP_DOWNLOAD`/similar is set — not currently set anywhere in
  this repo; on a fresh Linux box `npm install` will pull Chromium unless
  that's undesired. It appears to be dev-only tooling for screenshot
  testing, not used by `dev`/`build`/`preview`.
- `type: "module"` in package.json (ESM throughout).

## 6. Windows-isms found

- **No hardcoded `C:\`, `C:/`, or `Ryan Norris` paths** anywhere in
  `src/`, root JS/JSON/HTML files (grep came back empty).
- **No `.bat`, `.ps1`, `.cmd` files**, no `powershell` references anywhere
  in the project outside `node_modules`.
- **No env vars used** (see section 4) — nothing OS-specific to translate.
- **Case sensitivity**: every `import` statement in `src/` was checked
  against actual filenames on disk (`App.jsx`, `Creature.jsx`,
  `CreatureLab.jsx`, `DNAHelix.jsx`, `Icons.jsx`, `LearnMode.jsx`,
  `biology.js`, `learnSteps.jsx`, `main.jsx`) — **all match case exactly**.
  No risk expected on Linux's case-sensitive filesystem.
- **Line endings**: repo has no `.gitattributes`. Git on this Windows
  machine has `core.autocrlf` converting LF→CRLF on checkout (git warned
  about this during `git add`), but the blobs stored in git are LF. A
  fresh Linux clone will simply get LF working files — no conversion
  needed, no risk.
- **`vite.config.js`** is minimal (`@vitejs/plugin-react` only) — no
  Windows-specific path handling, no OS-conditional logic.
- Nothing found that requires WSL, PowerShell, or a Windows-only tool.

## 7. Fresh-clone setup steps for Linux (Ubuntu 26.04)

```bash
# 1. Clone
git clone https://github.com/ryannorris14/dna-transcription.git
cd dna-transcription

# 2. Toolchain — match versions observed on the Windows box
#    (node v24.13.1, npm 11.10.0; no `engines` field enforces this,
#    so any reasonably recent Node 20+/npm 10+ should also work)
#    e.g. via nvm:
nvm install 24.13.1
nvm use 24.13.1

# 3. Install dependencies (lockfile present — use npm ci for a clean,
#    reproducible install)
npm ci
#    Note: puppeteer is a devDependency and will download a bundled
#    Chromium during install unless you set PUPPETEER_SKIP_DOWNLOAD=true
#    beforehand (fine either way — dev-only tooling, not used by
#    dev/build/preview scripts).

# 4. No secrets to restore — this app has zero environment variables
#    and no .env file (fully static client-side app, confirmed by
#    grep of process.env / import.meta.env across src/, both empty).

# 5. Restore Claude agent memory to the new machine's memory path.
#    Encode the new clone's absolute path per Claude Code's convention
#    (path separators → dashes), e.g. if cloned to
#    /home/<user>/trillium/sci-sims/dna-transcription:
mkdir -p ~/.claude/projects/-home-<user>-trillium-sci-sims-dna-transcription/memory
cp .claude/agent-memory/*.md \
   ~/.claude/projects/-home-<user>-trillium-sci-sims-dna-transcription/memory/
#    Verify: diff <(cd .claude/agent-memory && md5sum *.md | sort) \
#                 <(cd ~/.claude/projects/.../memory && md5sum *.md | sort)

# 6. Run dev server
npm run dev
#    Verify: open the printed localhost URL, confirm Learn Mode 3D helix
#    renders (requires WebGL — any modern Linux browser with GPU/software
#    rendering should work; app has a WebGLErrorBoundary + styled fallback
#    if WebGL is unavailable) and Creature Lab DNA editor responds to
#    clicks.

# 7. Production build sanity check
npm run build
npm run preview

# 8. Deploy target: Vercel, connected to this GitHub repo (per Claude
#    memory notes — push to `master` auto-deploys). Not independently
#    re-verified live in this migration pass; confirm Vercel project
#    link/ownership survived the account migration separately.
```

### Verification commands (post-clone)
```bash
git remote -v                 # expect origin -> ryannorris14/dna-transcription.git
git log --oneline -5          # expect HEAD = 909b78e7... at top
git status                    # expect clean
node -v && npm -v
npm run build                 # expect success, dist/ produced
ls .claude/agent-memory/       # expect 4 .md files, matching md5sums above
```

## 8. Reference: memory file inventory copied into this repo

`.claude/agent-memory/` (copied from the old Windows-path-keyed Claude
memory dir, md5-verified identical, 4 files):
- `MEMORY.md` — index
- `project_status.md` — deployment/build status, architecture, key files
- `feedback_patterns.md` — biology-accuracy corrections and bug fixes not
  to reintroduce, design preferences
- `user_preferences.md` — Ryan's design sensibilities for this project
