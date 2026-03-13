import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DEFAULT_TEMPLATE, cycleBase, runPipeline,
  BASE_COLORS, PRESETS, CODON_TABLE, AA_INFO,
} from './biology'
import Creature from './Creature'
import { LabTranscriptionCanvas } from './DNAHelix'

// Pipeline animation stages
const STAGES = ['idle', 'coding', 'mrna', 'codons', 'amino', 'creature']
const STAGE_DELAY = 1200 // ms between each stage

export default function CreatureLab() {
  const [template, setTemplate] = useState([...DEFAULT_TEMPLATE])
  const [mutationCount, setMutationCount] = useState(0)
  const [changedIndex, setChangedIndex] = useState(-1)
  const [showCodonTable, setShowCodonTable] = useState(false)
  const [animStage, setAnimStage] = useState('creature') // start fully revealed
  const [dirty, setDirty] = useState(false) // DNA changed since last Go
  const silentTimerRef = useRef(null)
  const [silentMutation, setSilentMutation] = useState(false)
  const prevAAsRef = useRef(null)
  const [prevTraits, setPrevTraits] = useState('none') // 'none' = no snapshot yet, null = no-start-codon creature, object = real traits
  const [transcribing, setTranscribing] = useState(false) // 3D animation active

  // Run pipeline (always computed, but display is gated by animStage)
  const pipeline = useMemo(() => runPipeline(template), [template])
  const { coding, mRNA, codons, aminoAcids, started, stoppedEarly, traits } = pipeline

  // Stage index for comparison
  const stageIdx = STAGES.indexOf(animStage)

  // Animate through stages after Go
  useEffect(() => {
    if (animStage === 'idle' || animStage === 'creature') return
    const currentIdx = STAGES.indexOf(animStage)
    if (currentIdx < STAGES.length - 1) {
      const timer = setTimeout(() => {
        setAnimStage(STAGES[currentIdx + 1])
      }, STAGE_DELAY)
      return () => clearTimeout(timer)
    }
  }, [animStage])

  // Detect silent mutations when creature stage completes
  useEffect(() => {
    if (animStage !== 'creature') return
    if (prevAAsRef.current && dirty) {
      const prevStr = prevAAsRef.current.join(',')
      const newStr = aminoAcids.join(',')
      if (prevStr === newStr) {
        setSilentMutation(true)
        // Clear after 2.5 seconds
        if (silentTimerRef.current) clearTimeout(silentTimerRef.current)
        silentTimerRef.current = setTimeout(() => setSilentMutation(false), 2500)
      }
    }
    prevAAsRef.current = [...aminoAcids]
    setDirty(false)
  }, [animStage, aminoAcids, dirty])

  // Cleanup silent timer
  useEffect(() => {
    return () => { if (silentTimerRef.current) clearTimeout(silentTimerRef.current) }
  }, [])

  // Clear changed highlight
  useEffect(() => {
    if (changedIndex < 0) return
    const t = setTimeout(() => setChangedIndex(-1), 800)
    return () => clearTimeout(t)
  }, [changedIndex])

  const handleBaseClick = useCallback((index) => {
    // Snapshot current creature on first edit so old creature stays visible
    if (!dirty) setPrevTraits(traits)
    setTemplate((prev) => {
      const next = [...prev]
      next[index] = cycleBase(next[index])
      return next
    })
    setChangedIndex(index)
    setMutationCount((c) => c + 1)
    setDirty(true)
    setAnimStage('idle')
    setSilentMutation(false)
  }, [dirty, traits])

  const handleGo = useCallback(() => {
    // Start 3D transcription animation, then cascade pipeline
    setTranscribing(true)
    setAnimStage('coding')
  }, [])

  const handleTranscriptionComplete = useCallback(() => {
    setTranscribing(false)
  }, [])

  const handleReset = useCallback(() => {
    setTemplate([...DEFAULT_TEMPLATE])
    setMutationCount(0)
    setChangedIndex(-1)
    setAnimStage('creature')
    setDirty(false)
    setSilentMutation(false)
    prevAAsRef.current = null
  }, [])

  const handleRandomize = useCallback(() => {
    // Snapshot current creature before changing DNA
    setPrevTraits(traits)
    const bases = ['A', 'T', 'G', 'C']
    const newTemplate = ['T', 'A', 'C', ...Array.from({ length: 12 }, () => bases[Math.floor(Math.random() * 4)])]
    setTemplate(newTemplate)
    setMutationCount((c) => c + 1)
    setDirty(true)
    setAnimStage('idle')
    setSilentMutation(false)
  }, [traits])

  const handlePreset = useCallback((name) => {
    if (PRESETS[name]) {
      setPrevTraits(traits)
      setTemplate([...PRESETS[name]])
      setMutationCount(0)
      setDirty(true)
      setAnimStage('idle')
      setSilentMutation(false)
    }
  }, [traits])

  let creatureError = null
  if (!started) creatureError = 'no-start'
  else if (stoppedEarly && aminoAcids.length <= 1) creatureError = 'nonsense'

  const isAnimating = animStage !== 'idle' && animStage !== 'creature'

  return (
    <div className="creature-lab">
      {/* Left: DNA Editor + Pipeline */}
      <div className="lab-editor-panel card">
        <div className="card-title">DNA Editor</div>

        {/* Template strand */}
        <div className="section-label">Template Strand (3'→5') — click to mutate</div>
        <div className="editor-strand">
          {Array.from({ length: Math.ceil(template.length / 3) }, (_, g) => (
            <div key={g} className="codon-triplet">
              {template.slice(g * 3, g * 3 + 3).map((base, j) => {
                const i = g * 3 + j
                return (
                  <motion.button
                    key={i}
                    className={`base-btn ${base} ${changedIndex === i ? 'glow' : ''}`}
                    onClick={() => handleBaseClick(i)}
                    whileTap={{ scale: 0.9 }}
                    title={`Position ${i + 1}: ${base} → ${cycleBase(base)}`}
                  >
                    {base}
                  </motion.button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Controls row */}
        <div className="controls-row">
          <button className="btn" onClick={handleRandomize}>Randomize</button>
          <button className="btn" onClick={handleReset}>Reset</button>
          <select
            className="btn preset-select"
            onChange={(e) => { handlePreset(e.target.value); e.target.value = '' }}
            value=""
          >
            <option value="" disabled>Presets...</option>
            {Object.keys(PRESETS).map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <span className="mutation-counter">
            Mutations: <strong>{mutationCount}</strong>
          </span>
        </div>

        {/* GO button */}
        <motion.button
          className={`btn go-btn ${dirty ? 'ready' : ''}`}
          onClick={handleGo}
          disabled={!dirty && animStage === 'creature'}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {isAnimating ? 'Transcribing...' : dirty ? "Go! →" : 'Edit DNA above'}
        </motion.button>

        {/* Pipeline — reveals stage by stage */}
        <div className={`pipeline-cascade ${isAnimating ? 'animating' : ''}`}>
          {/* Coding strand */}
          <AnimatePresence>
            {stageIdx >= 1 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
              >
                <div className="pipeline-arrow">↓ Complement</div>
                <div className="section-label">Coding Strand (5'→3')</div>
                <div className="pipeline-bases">
                  {coding.map((b, i) => (
                    <span key={i} className={`base-badge ${b}`}>{b}</span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* mRNA */}
          <AnimatePresence>
            {stageIdx >= 2 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
              >
                <div className="pipeline-arrow">↓ Transcription</div>
                <div className="section-label">mRNA</div>
                <div className="pipeline-bases">
                  {mRNA.map((b, i) => (
                    <motion.span
                      key={i} className={`base-badge ${b}`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                    >{b}</motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Codons */}
          <AnimatePresence>
            {stageIdx >= 3 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
              >
                <div className="pipeline-arrow">↓ Split into Codons</div>
                <div className="section-label">Codons</div>
                <div className="pipeline-bases codon-row">
                  {codons.map((codon, i) => (
                    <motion.span
                      key={i} className="codon-chip"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >{codon}</motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Amino Acids */}
          <AnimatePresence>
            {stageIdx >= 4 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
              >
                <div className="pipeline-arrow">↓ Translation</div>
                <div className="section-label">Amino Acids</div>
                <div className="pipeline-bases aa-row">
                  {aminoAcids.length > 0 ? aminoAcids.map((aa, i) => (
                    <motion.span
                      key={i} className="aa-badge small"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.12, type: 'spring' }}
                      title={AA_INFO[aa] ? `${AA_INFO[aa].name} (${AA_INFO[aa].group})` : aa}
                    >{aa}</motion.span>
                  )) : (
                    <span className="no-data">No amino acids produced</span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Traits */}
          <AnimatePresence>
            {stageIdx >= 5 && traits && (
              <motion.div
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
              >
                <div className="pipeline-arrow">↓ Protein Folding</div>
                <div className="section-label">Creature Traits</div>
                <div className="traits-grid">
                  <div className="trait-item">
                    <span className="trait-label">Color</span>
                    <span className="trait-swatch" style={{ background: traits.bodyColor }} />
                  </div>
                  <div className="trait-item">
                    <span className="trait-label">Shape</span>
                    <span className="trait-value">{traits.bodyShape}</span>
                  </div>
                  <div className="trait-item">
                    <span className="trait-label">Eyes</span>
                    <span className="trait-value">{traits.eyes.count}x {traits.eyes.size} {traits.eyes.shape}</span>
                  </div>
                  <div className="trait-item">
                    <span className="trait-label">Accessory</span>
                    <span className="trait-value">{traits.accessory}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Codon table */}
        <button className="btn codon-table-toggle" onClick={() => setShowCodonTable(!showCodonTable)}>
          {showCodonTable ? 'Hide' : 'Show'} Codon Reference
        </button>

        <AnimatePresence>
          {showCodonTable && (
            <motion.div
              className="codon-ref-table card"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CodonReferenceTable />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Center: 3D Transcription Animation */}
      <div className="lab-transcription-panel">
        <div className="card transcription-card">
          <div className="card-title">Transcription</div>
          <LabTranscriptionCanvas
            template={template}
            active={transcribing || isAnimating}
            onComplete={handleTranscriptionComplete}
          />
          <div className="transcription-status">
            {transcribing ? 'RNA Polymerase → Ribosome → Protein Folding...' :
             isAnimating ? 'Building creature...' :
             dirty ? 'Press Go! to transcribe' :
             'Edit DNA to begin'}
          </div>
        </div>
      </div>

      {/* Right: Creature Display + Summary */}
      <div className="lab-creature-panel">
        <div className="creature-display card">
          {/* Dual pane: old creature + pending new */}
          {(dirty || isAnimating) && prevTraits !== 'none' ? (
            <div className="creature-comparison">
              <div className="creature-old">
                <div className="comparison-label">Current</div>
                <Creature traits={prevTraits} error={prevTraits ? null : 'no-start'} />
              </div>
              <div className="comparison-arrow">→</div>
              <div className="creature-new-placeholder">
                <div className="comparison-label">New</div>
                <div className="creature-frame">
                  <svg viewBox="0 0 300 300" className="creature-svg">
                    <circle cx={150} cy={150} r={100} fill="none" stroke="#2d3a52" strokeWidth="2" strokeDasharray="6 4" />
                    <circle cx={150} cy={150} r={98} fill="rgba(17, 24, 39, 0.4)" />
                    <text x={150} y={140} textAnchor="middle" fill={isAnimating ? '#818cf8' : '#475569'} fontSize="11" fontFamily="var(--font-mono)">
                      {isAnimating
                        ? (animStage === 'coding' ? 'Reading DNA...' :
                           animStage === 'mrna' ? 'Transcribing...' :
                           animStage === 'codons' ? 'Splitting codons...' :
                           animStage === 'amino' ? 'Translating...' : 'Building...')
                        : 'Hit Go! to build'}
                    </text>
                    {!isAnimating && (
                      <text x={150} y={160} textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="var(--font-mono)">
                        {mutationCount} mutation{mutationCount !== 1 ? 's' : ''} made
                      </text>
                    )}
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {stageIdx >= 5 ? (
                <motion.div
                  key={aminoAcids.join(',') + (creatureError || '')}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, type: 'spring', stiffness: 150 }}
                >
                  <Creature traits={traits} error={creatureError} />
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="creature-waiting"
                >
                  <Creature traits={traits} error={creatureError} />
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Silent mutation callout */}
          <AnimatePresence>
            {silentMutation && (
              <motion.div
                className="silent-mutation-callout"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                Silent mutation! DNA changed but the protein stayed the same.
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Protein & Traits summary — always visible below creature */}
        {stageIdx >= 5 && (
          <div className="creature-summary card">
            {/* Protein chain */}
            <div className="summary-section">
              <div className="section-label">Protein</div>
              <div className="summary-protein">
                {aminoAcids.length > 0 ? aminoAcids.map((aa, i) => (
                  <span key={i} className="aa-badge mini"
                    title={AA_INFO[aa] ? `${AA_INFO[aa].name} (${AA_INFO[aa].group})` : aa}
                  >{aa}</span>
                )) : (
                  <span className="no-data">No protein</span>
                )}
              </div>
            </div>

            {/* Traits */}
            {traits && (
              <div className="summary-section">
                <div className="section-label">Traits</div>
                <div className="summary-traits">
                  <div className="summary-trait">
                    <span className="trait-swatch" style={{ background: traits.bodyColor }} />
                    <span className="summary-trait-text">{traits.bodyShape}</span>
                  </div>
                  <div className="summary-trait">
                    <span className="summary-trait-text">{traits.eyes.count}x {traits.eyes.size} {traits.eyes.shape} eyes</span>
                  </div>
                  <div className="summary-trait">
                    <span className="summary-trait-text">{traits.accessory !== 'none' ? traits.accessory : 'no accessory'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function CodonReferenceTable() {
  const grouped = useMemo(() => {
    const map = {}
    for (const [codon, aa] of Object.entries(CODON_TABLE)) {
      if (!map[aa]) map[aa] = []
      map[aa].push(codon)
    }
    return map
  }, [])

  const displayOrder = ['Met', 'Gln', 'Tyr', 'Ala', 'Ser', 'Leu', 'Ile', 'Val', 'Pro', 'Thr', 'Asn', 'Phe', 'Trp', 'His', 'Lys', 'Arg', 'Asp', 'Glu', 'Cys', 'Gly', 'STOP']

  return (
    <div className="codon-table-content">
      <div className="card-title" style={{ fontSize: '0.85rem' }}>Codon Reference</div>
      <div className="codon-table-grid">
        {displayOrder.map((aa) => {
          const info = AA_INFO[aa]
          return (
            <div key={aa} className="codon-table-row">
              <span className={`aa-badge small ${aa === 'STOP' ? 'stop' : ''}`}>{aa}</span>
              {info && <span className="codon-table-name">{info.name}</span>}
              <span className="codon-table-codons">{(grouped[aa] || []).join(', ')}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
