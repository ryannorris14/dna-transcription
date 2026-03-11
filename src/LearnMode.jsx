import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LEARN_STEPS } from './learnSteps'
import { BASE_COLORS } from './biology'
import DNAHelix from './DNAHelix'

const TEMPLATE = ['T','A','C','G','T','C','A','T','G','C','G','A','A','C','T']
const MRNA     = ['A','U','G','C','A','G','U','A','C','G','C','U','U','G','A']
const CODONS   = ['AUG','CAG','UAC','GCU','UGA']
const AAS      = ['Met','Gln','Tyr','Ala']

const PHASE_COLORS = {
  Introduction: 'var(--base-G)',
  Transcription: 'var(--base-A)',
  Translation: 'var(--base-U)',
  Summary: 'var(--accent)',
}

export default function LearnMode() {
  const [step, setStep] = useState(0)
  const [autoPlay, setAutoPlay] = useState(false)
  const autoPlayRef = useRef(autoPlay)
  autoPlayRef.current = autoPlay

  const current = LEARN_STEPS[step]
  const isFirst = step === 0
  const isLast = step === LEARN_STEPS.length - 1

  const next = useCallback(() => {
    setStep((s) => Math.min(s + 1, LEARN_STEPS.length - 1))
  }, [])

  const prev = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0))
  }, [])

  const reset = useCallback(() => {
    setStep(0)
    setAutoPlay(false)
  }, [])

  // Auto-play
  useEffect(() => {
    if (!autoPlay || isLast) { if (isLast) setAutoPlay(false); return }
    const timer = setTimeout(() => { if (autoPlayRef.current) next() }, 5000)
    return () => clearTimeout(timer)
  }, [autoPlay, step, isLast, next])

  // Keyboard nav
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next() }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [next, prev])

  return (
    <div className="learn-mode">
      {/* Progress dots */}
      <div className="learn-progress">
        {LEARN_STEPS.map((s, i) => (
          <button
            key={i}
            className={`progress-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
            onClick={() => setStep(i)}
            title={s.title}
            style={{ '--dot-color': PHASE_COLORS[s.phase] }}
          >
            <span className="progress-num">{i + 1}</span>
          </button>
        ))}
      </div>

      {/* Main content: Big helix + side text */}
      <div className="learn-content-grid">
        {/* 3D Helix — the star of the show */}
        <div className="learn-helix-panel">
          <DNAHelix step={step} />
          {/* Overlay label on the 3D panel */}
          <div className="helix-overlay-label">
            {step === 2 && 'Helicase unzipping the DNA...'}
            {step === 3 && 'RNA Polymerase binding to template...'}
            {step === 4 && 'RNA Polymerase building mRNA...'}
            {step === 5 && 'DNA rezipping — mRNA released!'}
            {step === 6 && 'mRNA arriving at ribosome...'}
            {step === 7 && 'Start codon AUG found!'}
            {step === 8 && 'Ribosome reading codons...'}
            {step === 9 && 'Stop codon reached!'}
            {step === 10 && 'Protein folding...'}
          </div>
          <div className="helix-interact-hint">Drag to rotate · Scroll to zoom</div>
        </div>

        {/* Info panel — secondary */}
        <div className="learn-info-panel">
          <div className="learn-header">
            <span className="phase-badge" style={{ color: PHASE_COLORS[current.phase] }}>
              {current.phase}
            </span>
            <h2 className="learn-title">
              {current.phase === 'Summary' ? 'Summary' : `Step ${step + 1}: ${current.title}`}
            </h2>
          </div>

          <div className="callout learn-callout">{current.callout}</div>

          {/* Step-specific visual content */}
          <div className="learn-step-visual">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                {current.animate === 'transcription' ? (
                  <TranscriptionAnimation />
                ) : current.animate === 'translation' ? (
                  <TranslationAnimation />
                ) : current.animate === 'celebrate' ? (
                  <CelebrationStep>{current.visual}</CelebrationStep>
                ) : (
                  current.visual
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="learn-nav">
        <button className="btn" onClick={prev} disabled={isFirst}>← Back</button>
        <div className="learn-nav-center">
          <button className={`btn ${autoPlay ? 'btn-primary' : ''}`} onClick={() => setAutoPlay(!autoPlay)}>
            {autoPlay ? 'Pause' : 'Auto-play'}
          </button>
          <button className="btn" onClick={reset}>Reset</button>
        </div>
        <button className="btn btn-primary" onClick={next} disabled={isLast}>Next →</button>
      </div>
    </div>
  )
}

// ── Step 5 inline: Transcription readout ─────────────────────
function TranscriptionAnimation() {
  const [built, setBuilt] = useState(0)

  useEffect(() => {
    if (built >= TEMPLATE.length) return
    const timer = setTimeout(() => setBuilt((b) => b + 1), 500)
    return () => clearTimeout(timer)
  }, [built])

  return (
    <div className="transcription-readout">
      <div className="section-label">Watch the 3D view — bases appearing!</div>
      <div className="pipeline-row compact">
        <span className="pipeline-label">Template</span>
        <div className="pipeline-bases">
          {TEMPLATE.map((b, i) => (
            <span key={i} className={`base-badge ${b} ${i < built ? 'read' : ''}`}>{b}</span>
          ))}
        </div>
      </div>
      <div className="pipeline-row compact">
        <span className="pipeline-label">mRNA</span>
        <div className="pipeline-bases">
          {MRNA.map((b, i) => (
            <motion.span
              key={i}
              className={`base-badge ${b}`}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={i < built ? { opacity: 1, scale: 1 } : { opacity: 0.15, scale: 0.8 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
            >
              {b}
            </motion.span>
          ))}
        </div>
      </div>
      {built >= TEMPLATE.length && (
        <motion.div className="complete-badge" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          mRNA strand complete!
        </motion.div>
      )}
    </div>
  )
}

// ── Step 9: Translation Animation ────────────────────────────
function TranslationAnimation() {
  const [delivered, setDelivered] = useState(0)

  useEffect(() => {
    if (delivered >= 4) return
    const timer = setTimeout(() => setDelivered((d) => d + 1), 1800)
    return () => clearTimeout(timer)
  }, [delivered])

  return (
    <div className="translation-readout">
      <div className="codon-reader">
        {CODONS.map((codon, i) => (
          <div key={i} className={`codon-group ${i === delivered && i < 4 ? 'current' : ''} ${i < delivered ? 'reading' : ''}`}>
            {codon.split('').map((base, j) => (
              <span key={j} className={`base-badge ${base}`}>{base}</span>
            ))}
            <span className="codon-label">{codon === 'UGA' ? 'STOP' : AAS[i] || ''}</span>
          </div>
        ))}
      </div>
      <div className="protein-chain growing">
        <span className="chain-label">Protein:</span>
        {AAS.map((aa, i) => (
          <motion.div
            key={i}
            className="aa-badge"
            initial={{ opacity: 0, scale: 0 }}
            animate={i < delivered ? { opacity: 1, scale: 1 } : { opacity: 0.15, scale: 0.5 }}
            transition={{ duration: 0.4, type: 'spring' }}
          >
            {aa}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── Step 11: Celebration — bioluminescent rising particles ───
function CelebrationStep({ children }) {
  const [particles] = useState(() => {
    const bases = ['A', 'U', 'G', 'C']
    const colors = ['var(--base-A)', 'var(--base-U)', 'var(--base-G)', 'var(--base-C)']
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: 5 + Math.random() * 90,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 4,
      color: colors[i % 4],
      base: bases[i % 4],
      size: 18 + Math.random() * 14,
      drift: (Math.random() - 0.5) * 60,
    }))
  })

  return (
    <div className="celebration-wrapper">
      <div className="confetti-container">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="biolum-particle"
            style={{
              left: `${p.x}%`,
              width: p.size,
              height: p.size,
              color: p.color,
              borderColor: p.color,
            }}
            initial={{ y: 300, opacity: 0, x: 0, scale: 0.3 }}
            animate={{ y: -40, opacity: [0, 0.7, 0.5, 0], x: p.drift, scale: [0.3, 1, 0.8] }}
            transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
          >
            {p.base}
          </motion.div>
        ))}
      </div>
      {children}
    </div>
  )
}
