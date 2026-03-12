import { BASE_COLORS } from './biology'
import { PolymeraseIcon, RibosomeIcon, HelixIcon, StrandIcon, ProteinIcon } from './Icons'

// Helper: render a colored base letter inline
function B({ base }) {
  return (
    <span
      style={{
        color: BASE_COLORS[base],
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
      }}
    >
      {base}
    </span>
  )
}

// Helper: render a sequence of bases
function Seq({ bases, label }) {
  return (
    <div className="pipeline-row">
      {label && <span className="pipeline-label">{label}</span>}
      <div className="pipeline-bases">
        {bases.map((b, i) => (
          <span key={i} className={`base-badge ${b}`}>{b}</span>
        ))}
      </div>
    </div>
  )
}

// Visual separator arrow
function Arrow() {
  return <div className="pipeline-arrow">↓</div>
}

// ── Step definitions ─────────────────────────────────────────
// Each step: { title, phase, callout, visual }
// `visual` is a React element rendered in the main panel.
// `helixState` tells the 3D helix what to do.

const TEMPLATE = ['T', 'A', 'C', 'G', 'T', 'C', 'A', 'T', 'G', 'C', 'G', 'A', 'A', 'C', 'T']
const CODING   = ['A', 'T', 'G', 'C', 'A', 'G', 'T', 'A', 'C', 'G', 'C', 'T', 'T', 'G', 'A']
const MRNA     = ['A', 'U', 'G', 'C', 'A', 'G', 'U', 'A', 'C', 'G', 'C', 'U', 'U', 'G', 'A']

export const LEARN_STEPS = [
  // ── Step 1: Meet the DNA ───────────────────────────────────
  {
    title: 'Meet the DNA',
    phase: 'Introduction',
    callout: 'DNA is like an instruction manual for building and running your body. Almost every cell contains a complete copy — about 6 feet of it, coiled up so tightly it fits inside a space too small to see.',
    helixState: 'full',
    visual: (
      <div className="step-content">
        <div className="step-diagram">
          <div className="dna-intro-card">
            <h3>Double Helix Structure</h3>
            <p>DNA is made of two strands twisted together. Each strand is a chain of <strong>bases</strong> — the letters of the genetic code.</p>
            <div className="base-legend">
              <div className="base-legend-item">
                <span className="base-badge A">A</span>
                <span>Adenine</span>
              </div>
              <div className="base-legend-item">
                <span className="base-badge T">T</span>
                <span>Thymine</span>
              </div>
              <div className="base-legend-item">
                <span className="base-badge G">G</span>
                <span>Guanine</span>
              </div>
              <div className="base-legend-item">
                <span className="base-badge C">C</span>
                <span>Cytosine</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },

  // ── Step 2: Base Pairing Rules ─────────────────────────────
  {
    title: 'Base Pairing Rules',
    phase: 'Introduction',
    callout: 'Bases always pair the same way: A with T, and G with C. This is called complementary base pairing.',
    helixState: 'full',
    visual: (
      <div className="step-content">
        <div className="step-diagram">
          <div className="pairing-demo">
            <div className="pair-row">
              <span className="base-badge A" style={{ width: 48, height: 48, fontSize: '1.1rem' }}>A</span>
              <span className="pair-bond">═══</span>
              <span className="base-badge T" style={{ width: 48, height: 48, fontSize: '1.1rem' }}>T</span>
            </div>
            <div className="pair-label">Adenine always pairs with Thymine</div>
            <div className="pair-row" style={{ marginTop: 16 }}>
              <span className="base-badge G" style={{ width: 48, height: 48, fontSize: '1.1rem' }}>G</span>
              <span className="pair-bond">≡≡≡</span>
              <span className="base-badge C" style={{ width: 48, height: 48, fontSize: '1.1rem' }}>C</span>
            </div>
            <div className="pair-label">Guanine always pairs with Cytosine</div>
          </div>
          <p className="step-note">This means if you know one strand, you can figure out the other!</p>
        </div>
      </div>
    ),
  },

  // ── Step 3: RNA Polymerase Unwinds ──────────────────────────
  {
    title: 'RNA Polymerase Unwinds the DNA',
    phase: 'Transcription',
    callout: 'An enzyme called RNA Polymerase finds the gene and begins separating the two DNA strands so the template can be read.',
    helixState: 'unzipping',
    visual: (
      <div className="step-content">
        <div className="step-diagram">
          <div className="enzyme-card">
            <div className="enzyme-icon"><PolymeraseIcon size={40} /></div>
            <h3>RNA Polymerase</h3>
            <p>This molecular machine finds the gene's start point (the <strong>promoter</strong>) and opens up the double helix — like unzipping a zipper!</p>
          </div>
          <div className="strand-preview">
            <Seq bases={CODING} label="Coding 5'→3'" />
            <div className="unzip-indicator">← separating →</div>
            <Seq bases={TEMPLATE} label="Template 3'→5'" />
          </div>
        </div>
      </div>
    ),
  },

  // ── Step 4: Transcription Rules ────────────────────────────
  {
    title: 'Transcription Rules',
    phase: 'Transcription',
    callout: 'RNA Polymerase reads the template strand and builds a messenger RNA (mRNA) copy using complementary base pairing.',
    helixState: 'unzipped',
    visual: (
      <div className="step-content">
        <div className="step-diagram">
          <div className="enzyme-card">
            <div className="enzyme-icon"><PolymeraseIcon size={40} /></div>
            <h3>Reading the Template</h3>
            <p>RNA Polymerase reads the <strong>template strand</strong> (3'→5') and builds a complementary mRNA strand.</p>
            <p style={{ marginTop: 8 }}>It uses the same base pairing rules as DNA, except <B base="U" /> (Uracil) replaces <B base="T" /> (Thymine) in RNA!</p>
          </div>
          <div className="rule-box">
            <div className="rule-item"><B base="A" /> in DNA → <B base="U" /> in mRNA</div>
            <div className="rule-item"><B base="T" /> in DNA → <B base="A" /> in mRNA</div>
            <div className="rule-item"><B base="G" /> in DNA → <B base="C" /> in mRNA</div>
            <div className="rule-item"><B base="C" /> in DNA → <B base="G" /> in mRNA</div>
          </div>
        </div>
      </div>
    ),
  },

  // ── Step 5: Building the mRNA ──────────────────────────────
  {
    title: 'Building the mRNA',
    phase: 'Transcription',
    callout: 'Watch as RNA Polymerase reads each base on the template strand and adds the matching RNA base to the growing mRNA strand!',
    helixState: 'unzipped',
    // This step has animated content handled by LearnMode
    animate: 'transcription',
    visual: null, // rendered dynamically in LearnMode
  },

  // ── Step 6: mRNA Complete ──────────────────────────────────
  {
    title: 'mRNA Complete!',
    phase: 'Transcription',
    callout: 'The mRNA strand is finished! The DNA zips back together, and the mRNA heads to the ribosome to be translated into a protein.',
    helixState: 'rezipping',
    visual: (
      <div className="step-content">
        <div className="step-diagram">
          <Seq bases={TEMPLATE} label="Template" />
          <Arrow />
          <Seq bases={MRNA} label="mRNA" />
          <div className="complete-badge">Transcription Complete!</div>
          <p className="step-note">The mRNA is a portable copy of the gene. It will carry the instructions from the nucleus to the ribosome.</p>
        </div>
      </div>
    ),
  },

  // ── Step 7: Meet the Ribosome ──────────────────────────────
  {
    title: 'Meet the Ribosome',
    phase: 'Translation',
    callout: 'The ribosome is the cell\'s protein factory. It reads mRNA three letters at a time — these triplets are called codons.',
    helixState: 'background',
    visual: (
      <div className="step-content">
        <div className="step-diagram">
          <div className="enzyme-card">
            <div className="enzyme-icon"><RibosomeIcon size={40} /></div>
            <h3>Ribosome</h3>
            <p>This molecular machine reads the mRNA and assembles amino acids into a protein chain.</p>
          </div>
          <div className="codon-preview">
            <h4>Reading in Codons (triplets):</h4>
            <div className="codon-groups">
              {['AUG', 'CAG', 'UAC', 'GCU', 'UGA'].map((codon, i) => (
                <div key={i} className="codon-group">
                  {codon.split('').map((base, j) => (
                    <span key={j} className={`base-badge ${base}`}>{base}</span>
                  ))}
                  <span className="codon-label">
                    {codon === 'AUG' ? 'START' : codon === 'UGA' ? 'STOP' : `Codon ${i + 1}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  },

  // ── Step 8: Start Codon ────────────────────────────────────
  {
    title: 'Start Codon: AUG',
    phase: 'Translation',
    callout: 'Translation always begins at AUG — the start codon. It codes for the amino acid Methionine (Met) and signals "start building here!"',
    helixState: 'background',
    visual: (
      <div className="step-content">
        <div className="step-diagram">
          <div className="start-codon-highlight">
            <div className="codon-group highlight-start">
              <span className="base-badge A">A</span>
              <span className="base-badge U">U</span>
              <span className="base-badge G">G</span>
            </div>
            <div className="codon-arrow">→</div>
            <div className="aa-badge met">Met</div>
          </div>
          <p className="step-note"><strong>AUG</strong> is special — it's both the start signal AND codes for Methionine, the first amino acid added during translation.</p>
        </div>
      </div>
    ),
  },

  // ── Step 9: tRNA Delivery ──────────────────────────────────
  {
    title: 'tRNA Delivers Amino Acids',
    phase: 'Translation',
    callout: 'Transfer RNA (tRNA) molecules bring the right amino acid for each codon. Watch as the protein chain grows!',
    helixState: 'background',
    animate: 'translation',
    visual: null, // rendered dynamically in LearnMode
  },

  // ── Step 10: Stop Codon ────────────────────────────────────
  {
    title: 'Stop Codon: UGA',
    phase: 'Translation',
    callout: 'When the ribosome hits a stop codon (UGA, UAA, or UAG), translation ends. No amino acid is added — the protein is released!',
    helixState: 'background',
    visual: (
      <div className="step-content">
        <div className="step-diagram">
          <div className="stop-codon-display">
            <div className="protein-chain">
              {['Met', 'Gln', 'Tyr', 'Ala'].map((aa, i) => (
                <div key={i} className="aa-badge">{aa}</div>
              ))}
              <div className="stop-badge">STOP</div>
            </div>
            <div className="stop-codons-list">
              <h4>Stop Codons:</h4>
              <div className="stop-codon-row">
                {['UAA', 'UAG', 'UGA'].map((codon) => (
                  <div key={codon} className="codon-group stop">
                    {codon.split('').map((base, j) => (
                      <span key={j} className={`base-badge ${base}`}>{base}</span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },

  // ── Step 11: Protein Complete ──────────────────────────────
  {
    title: 'Protein Complete!',
    phase: 'Translation',
    callout: 'Congratulations! You\'ve watched a gene become a protein. The amino acid chain will fold into a 3D shape that determines its function.',
    helixState: 'background',
    animate: 'celebrate',
    visual: (
      <div className="step-content">
        <div className="step-diagram">
          <div className="celebration">
            <div className="protein-result">
              <h3>Your Protein</h3>
              <div className="protein-chain large">
                {['Met', 'Gln', 'Tyr', 'Ala'].map((aa, i) => (
                  <div key={i} className="aa-badge glow">{aa}</div>
                ))}
              </div>
              <p>4 amino acids long</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },

  // ── Step 12: The Central Dogma ─────────────────────────────
  {
    title: 'The Central Dogma',
    phase: 'Summary',
    callout: 'DNA → RNA → Protein. This is the central dogma of molecular biology — the fundamental flow of genetic information in cells.',
    helixState: 'background',
    visual: (
      <div className="step-content">
        <div className="step-diagram">
          <div className="central-dogma-diagram">
            <div className="dogma-stage">
              <div className="dogma-icon"><HelixIcon size={32} /></div>
              <h4>DNA</h4>
              <p>The master blueprint stored in the nucleus</p>
            </div>
            <div className="dogma-arrow">
              <span>Transcription</span>
              <div className="arrow-line">→</div>
            </div>
            <div className="dogma-stage">
              <div className="dogma-icon"><StrandIcon size={32} /></div>
              <h4>mRNA</h4>
              <p>A portable copy that leaves the nucleus</p>
            </div>
            <div className="dogma-arrow">
              <span>Translation</span>
              <div className="arrow-line">→</div>
            </div>
            <div className="dogma-stage">
              <div className="dogma-icon"><ProteinIcon size={32} /></div>
              <h4>Protein</h4>
              <p>The worker molecules that run the cell</p>
            </div>
          </div>
          <div className="summary-pipeline">
            <Seq bases={TEMPLATE} label="Template" />
            <Arrow />
            <Seq bases={MRNA} label="mRNA" />
            <Arrow />
            <div className="pipeline-row">
              <span className="pipeline-label">Codons</span>
              <div className="pipeline-bases">
                {['AUG', 'CAG', 'UAC', 'GCU', 'UGA'].map((codon, i) => (
                  <span key={i} className="codon-chip">{codon}</span>
                ))}
              </div>
            </div>
            <Arrow />
            <div className="pipeline-row">
              <span className="pipeline-label">Protein</span>
              <div className="pipeline-bases">
                {['Met', 'Gln', 'Tyr', 'Ala'].map((aa, i) => (
                  <span key={i} className="aa-badge small">{aa}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
]
