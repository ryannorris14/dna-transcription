// ============================================================
// biology.js — Pure data & functions for the central dogma
// ============================================================

// ── Base colors (hex) ────────────────────────────────────────
export const BASE_COLORS = {
  A: '#4ade80', // green
  T: '#f87171', // red
  G: '#60a5fa', // blue
  C: '#facc15', // yellow
  U: '#c084fc', // purple
}

// ── Default template strand (read 3'→5') ─────────────────────
// This produces coding strand 5'→3': ATGCAGTACGCTTGA
// mRNA: AUGCAGUACGCUUGA
// Codons: AUG CAG UAC GCU UGA
// AAs: Met Gln Tyr Ala [stop]
export const DEFAULT_TEMPLATE = [
  'T', 'A', 'C', 'G', 'T', 'C', 'A', 'T', 'G', 'C', 'G', 'A', 'A', 'C', 'T',
]

// ── DNA complement ───────────────────────────────────────────
const DNA_COMPLEMENT = { A: 'T', T: 'A', G: 'C', C: 'G' }

export function getComplement(base) {
  return DNA_COMPLEMENT[base]
}

export function getCodingStrand(template) {
  return template.map(getComplement)
}

// ── Transcription: template DNA → mRNA ───────────────────────
const TRANSCRIPTION_MAP = { A: 'U', T: 'A', G: 'C', C: 'G' }

export function transcribe(templateDNA) {
  return templateDNA.map((base) => TRANSCRIPTION_MAP[base])
}

// ── Split mRNA into codons ───────────────────────────────────
export function splitCodons(mRNA) {
  const codons = []
  for (let i = 0; i + 2 < mRNA.length; i += 3) {
    codons.push(mRNA[i] + mRNA[i + 1] + mRNA[i + 2])
  }
  return codons
}

// ── Full 64-codon table ──────────────────────────────────────
export const CODON_TABLE = {
  // Phenylalanine
  UUU: 'Phe', UUC: 'Phe',
  // Leucine
  UUA: 'Leu', UUG: 'Leu', CUU: 'Leu', CUC: 'Leu', CUA: 'Leu', CUG: 'Leu',
  // Isoleucine
  AUU: 'Ile', AUC: 'Ile', AUA: 'Ile',
  // Methionine (start)
  AUG: 'Met',
  // Valine
  GUU: 'Val', GUC: 'Val', GUA: 'Val', GUG: 'Val',
  // Serine
  UCU: 'Ser', UCC: 'Ser', UCA: 'Ser', UCG: 'Ser', AGU: 'Ser', AGC: 'Ser',
  // Proline
  CCU: 'Pro', CCC: 'Pro', CCA: 'Pro', CCG: 'Pro',
  // Threonine
  ACU: 'Thr', ACC: 'Thr', ACA: 'Thr', ACG: 'Thr',
  // Alanine
  GCU: 'Ala', GCC: 'Ala', GCA: 'Ala', GCG: 'Ala',
  // Tyrosine
  UAU: 'Tyr', UAC: 'Tyr',
  // Stop codons
  UAA: 'STOP', UAG: 'STOP', UGA: 'STOP',
  // Histidine
  CAU: 'His', CAC: 'His',
  // Glutamine
  CAA: 'Gln', CAG: 'Gln',
  // Asparagine
  AAU: 'Asn', AAC: 'Asn',
  // Lysine
  AAA: 'Lys', AAG: 'Lys',
  // Aspartic acid
  GAU: 'Asp', GAC: 'Asp',
  // Glutamic acid
  GAA: 'Glu', GAG: 'Glu',
  // Cysteine
  UGU: 'Cys', UGC: 'Cys',
  // Tryptophan
  UGG: 'Trp',
  // Arginine
  CGU: 'Arg', CGC: 'Arg', CGA: 'Arg', CGG: 'Arg', AGA: 'Arg', AGG: 'Arg',
  // Glycine
  GGU: 'Gly', GGC: 'Gly', GGA: 'Gly', GGG: 'Gly',
}

// ── Translate codon → amino acid ─────────────────────────────
export function translateCodon(codon) {
  return CODON_TABLE[codon] || null
}

// ── Translate full codon array (start/stop aware) ────────────
export function translateAll(codons) {
  const aminoAcids = []
  let started = false
  let stoppedEarly = false

  for (const codon of codons) {
    const aa = translateCodon(codon)
    if (!started) {
      if (aa === 'Met') {
        started = true
        aminoAcids.push(aa)
      }
      // skip codons before start
      continue
    }
    if (aa === 'STOP') {
      stoppedEarly = aminoAcids.length < codons.length - 1
      break
    }
    if (aa) aminoAcids.push(aa)
  }

  return { aminoAcids, started, stoppedEarly }
}

// ── Run full pipeline from template strand ───────────────────
export function runPipeline(template) {
  const coding = getCodingStrand(template)
  const mRNA = transcribe(template)
  const codons = splitCodons(mRNA)
  const { aminoAcids, started, stoppedEarly } = translateAll(codons)
  const traits = started ? getTraits(aminoAcids) : null

  return { coding, mRNA, codons, aminoAcids, started, stoppedEarly, traits }
}

// ── Amino acid classification ────────────────────────────────
const AA_GROUPS = {
  hydrophobic: ['Ala', 'Val', 'Leu', 'Ile', 'Met', 'Phe', 'Trp', 'Pro'],
  hydrophilic: ['Ser', 'Thr', 'Asn', 'Gln', 'Tyr', 'Cys'],
  positive:    ['Lys', 'Arg', 'His'],
  negative:    ['Asp', 'Glu'],
  special:     ['Gly'],
}

function classifyAA(aa) {
  for (const [group, members] of Object.entries(AA_GROUPS)) {
    if (members.includes(aa)) return group
  }
  return 'special'
}

// ── Trait mapping tables ─────────────────────────────────────

// Body color: determined by first amino acid after Met
const BODY_COLORS = {
  // Hydrophobic → warm tones
  Ala: '#ff6b6b', Val: '#ff9f43', Leu: '#ee5a24', Ile: '#f368e0',
  Met: '#ffa502', Phe: '#e056fd', Trp: '#be2edd', Pro: '#fd79a8',
  // Hydrophilic → cool tones
  Ser: '#0abde3', Thr: '#48dbfb', Asn: '#00d2d3', Gln: '#1dd1a1',
  Tyr: '#10ac84', Cys: '#01a3a4',
  // Charged → bright/vibrant
  Lys: '#feca57', Arg: '#ff9ff3', His: '#f9ca24',
  Asp: '#ff6348', Glu: '#eb4d4b',
  // Special
  Gly: '#c8d6e5',
}

// Body shape: determined by second amino acid after Met
const BODY_SHAPES = {
  // Hydrophobic → angular
  Ala: 'hexagon', Val: 'diamond', Leu: 'pentagon', Ile: 'triangle',
  Met: 'octagon', Phe: 'star', Trp: 'cross', Pro: 'arrow',
  // Hydrophilic → round
  Ser: 'circle', Thr: 'oval', Asn: 'blob', Gln: 'cloud',
  Tyr: 'droplet', Cys: 'bean',
  // Charged → spiky/special
  Lys: 'starburst', Arg: 'spark', His: 'crescent',
  Asp: 'zigzag', Glu: 'flame',
  // Special
  Gly: 'circle',
}

// Eye style: determined by third amino acid after Met
const EYE_STYLES = {
  Ala: { count: 2, size: 'medium', shape: 'round' },
  Val: { count: 2, size: 'large', shape: 'round' },
  Leu: { count: 3, size: 'small', shape: 'round' },
  Ile: { count: 1, size: 'large', shape: 'round' },
  Met: { count: 2, size: 'medium', shape: 'oval' },
  Phe: { count: 2, size: 'small', shape: 'star' },
  Trp: { count: 4, size: 'small', shape: 'round' },
  Pro: { count: 2, size: 'medium', shape: 'slit' },
  Ser: { count: 2, size: 'large', shape: 'round' },
  Thr: { count: 2, size: 'medium', shape: 'round' },
  Asn: { count: 1, size: 'medium', shape: 'round' },
  Gln: { count: 2, size: 'large', shape: 'oval' },
  Tyr: { count: 3, size: 'medium', shape: 'round' },
  Cys: { count: 2, size: 'small', shape: 'round' },
  Lys: { count: 2, size: 'large', shape: 'star' },
  Arg: { count: 6, size: 'small', shape: 'round' },
  His: { count: 2, size: 'medium', shape: 'crescent' },
  Asp: { count: 2, size: 'medium', shape: 'diamond' },
  Glu: { count: 1, size: 'large', shape: 'oval' },
  Gly: { count: 2, size: 'medium', shape: 'round' },
}

// Accessory: determined by fourth amino acid (or group pattern)
const ACCESSORIES = {
  Ala: 'horns', Val: 'spikes', Leu: 'tail', Ile: 'wings',
  Met: 'crown', Phe: 'mohawk', Trp: 'tentacles', Pro: 'shell',
  Ser: 'halo', Thr: 'antennae', Asn: 'bow', Gln: 'bubbles',
  Tyr: 'leaf', Cys: 'scarf',
  Lys: 'lightning', Arg: 'cape', His: 'hat',
  Asp: 'flames', Glu: 'crystals',
  Gly: 'none',
}

// ── Build traits from amino acid chain ───────────────────────
export function getTraits(aminoAcids) {
  if (!aminoAcids || aminoAcids.length === 0) {
    return null
  }

  // Index 0 is always Met (start codon). Traits come from subsequent AAs.
  const aa1 = aminoAcids[1] || 'Gly' // body color
  const aa2 = aminoAcids[2] || 'Gly' // body shape
  const aa3 = aminoAcids[3] || 'Gly' // eye style
  // For accessory, use the dominant group of the whole chain
  const groupCounts = { hydrophobic: 0, hydrophilic: 0, positive: 0, negative: 0, special: 0 }
  for (const aa of aminoAcids) {
    groupCounts[classifyAA(aa)]++
  }
  const dominantGroup = Object.entries(groupCounts).sort((a, b) => b[1] - a[1])[0][0]
  // Pick the accessory AA as the most-represented AA in the dominant group
  const dominantAAs = aminoAcids.filter((aa) => classifyAA(aa) === dominantGroup)
  const accessoryAA = dominantAAs.length > 1 ? dominantAAs[dominantAAs.length - 1] : (aminoAcids[aminoAcids.length - 1] || 'Gly')

  // Short chains (fewer than 4 AAs) get no eyes or accessories
  const isShort = aminoAcids.length < 4

  return {
    bodyColor: BODY_COLORS[aa1] || BODY_COLORS.Gly,
    bodyShape: BODY_SHAPES[aa2] || BODY_SHAPES.Gly,
    eyes: isShort ? { count: 0, size: 'medium', shape: 'round' } : (EYE_STYLES[aa3] || EYE_STYLES.Gly),
    accessory: isShort ? 'none' : (ACCESSORIES[accessoryAA] || ACCESSORIES.Gly),
    aminoAcids,
    dominantGroup,
  }
}

// ── Cycle a DNA base (for editor) ────────────────────────────
const BASE_ORDER = ['A', 'T', 'G', 'C']

export function cycleBase(base) {
  const idx = BASE_ORDER.indexOf(base)
  return BASE_ORDER[(idx + 1) % 4]
}

// ── Preset DNA sequences for Creature Lab ────────────────────
export const PRESETS = {
  'Default': [...DEFAULT_TEMPLATE],
  'Speedy': ['T', 'A', 'C', 'C', 'T', 'C', 'G', 'A', 'A', 'G', 'C', 'A', 'A', 'C', 'T'],
  'Sparkle': ['T', 'A', 'C', 'A', 'A', 'G', 'U' === 'U' ? 'A' : 'A', 'G', 'C', 'T', 'T', 'C', 'A', 'C', 'T'],
  'Blobby':  ['T', 'A', 'C', 'A', 'G', 'A', 'A', 'A', 'T', 'T', 'G', 'C', 'A', 'C', 'T'],
  'Spiky':   ['T', 'A', 'C', 'T', 'T', 'C', 'G', 'T', 'C', 'C', 'A', 'G', 'A', 'C', 'T'],
}

// ── Amino acid display info ──────────────────────────────────
export const AA_INFO = {
  Ala: { abbrev: 'A', name: 'Alanine', group: 'hydrophobic' },
  Val: { abbrev: 'V', name: 'Valine', group: 'hydrophobic' },
  Leu: { abbrev: 'L', name: 'Leucine', group: 'hydrophobic' },
  Ile: { abbrev: 'I', name: 'Isoleucine', group: 'hydrophobic' },
  Met: { abbrev: 'M', name: 'Methionine', group: 'hydrophobic' },
  Phe: { abbrev: 'F', name: 'Phenylalanine', group: 'hydrophobic' },
  Trp: { abbrev: 'W', name: 'Tryptophan', group: 'hydrophobic' },
  Pro: { abbrev: 'P', name: 'Proline', group: 'hydrophobic' },
  Ser: { abbrev: 'S', name: 'Serine', group: 'hydrophilic' },
  Thr: { abbrev: 'T', name: 'Threonine', group: 'hydrophilic' },
  Asn: { abbrev: 'N', name: 'Asparagine', group: 'hydrophilic' },
  Gln: { abbrev: 'Q', name: 'Glutamine', group: 'hydrophilic' },
  Tyr: { abbrev: 'Y', name: 'Tyrosine', group: 'hydrophilic' },
  Cys: { abbrev: 'C', name: 'Cysteine', group: 'hydrophilic' },
  Lys: { abbrev: 'K', name: 'Lysine', group: 'positive' },
  Arg: { abbrev: 'R', name: 'Arginine', group: 'positive' },
  His: { abbrev: 'H', name: 'Histidine', group: 'positive' },
  Asp: { abbrev: 'D', name: 'Aspartic acid', group: 'negative' },
  Glu: { abbrev: 'E', name: 'Glutamic acid', group: 'negative' },
  Gly: { abbrev: 'G', name: 'Glycine', group: 'special' },
}
