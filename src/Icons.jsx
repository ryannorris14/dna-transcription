// ── SVG Icon Components — Bio-Lab Neon Theme ────────────────
// Clean, geometric, scientific-diagram-style icons.
// All use currentColor so they inherit parent color.

export function HelixIcon({ size = 24, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <g transform="rotate(45 12 12)">
        {/* Strand A: crosses left→right→left→right (narrowed) */}
        <path d="M 6 0 C 6 4, 18 4, 18 8 C 18 12, 6 12, 6 16 C 6 20, 18 20, 18 24" />
        {/* Strand B: crosses right→left→right→left (narrowed) */}
        <path d="M 18 0 C 18 4, 6 4, 6 8 C 6 12, 18 12, 18 16 C 18 20, 6 20, 6 24" />
        {/* Base pair rungs */}
        <line x1="8" y1="2" x2="16" y2="2" opacity="0.5" />
        <line x1="7" y1="6" x2="17" y2="6" opacity="0.5" />
        <line x1="8" y1="10" x2="16" y2="10" opacity="0.5" />
        <line x1="7" y1="14" x2="17" y2="14" opacity="0.5" />
        <line x1="8" y1="17.5" x2="16" y2="17.5" opacity="0.5" />
        <line x1="7" y1="22" x2="17" y2="22" opacity="0.5" />
      </g>
    </svg>
  )
}

export function UnzipIcon({ size = 24, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Left strand separating */}
      <path d="M8 2v6" />
      <path d="M8 8C8 10 5 12 4 14c-1 2-1 4 2 6" />
      {/* Right strand separating */}
      <path d="M16 2v6" />
      <path d="M16 8c0 2 3 4 4 6 1 2 1 4-2 6" />
      {/* Rungs (connected at top, broken below) */}
      <line x1="8" y1="3" x2="16" y2="3" />
      <line x1="8" y1="5.5" x2="16" y2="5.5" />
      {/* Broken rungs showing separation */}
      <line x1="6.5" y1="10" x2="9" y2="10" opacity="0.5" />
      <line x1="15" y1="10" x2="17.5" y2="10" opacity="0.5" />
      {/* Arrow indicating separation */}
      <path d="M10 14l-2 1" strokeWidth="1.5" />
      <path d="M14 14l2 1" strokeWidth="1.5" />
    </svg>
  )
}

export function PolymeraseIcon({ size = 24, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Machine body — rounded rectangle */}
      <rect x="4" y="6" width="14" height="12" rx="3" />
      {/* Scanning beam / reading window */}
      <line x1="7" y1="10" x2="15" y2="10" />
      <line x1="7" y1="14" x2="13" y2="14" />
      {/* Arrow showing reading direction */}
      <path d="M18 12h4" />
      <path d="M20 10l2 2-2 2" />
      {/* Input strand indicator */}
      <path d="M2 8l2 4-2 4" />
    </svg>
  )
}

export function RibosomeIcon({ size = 24, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Large subunit (bottom half-circle) */}
      <path d="M4 13a8 8 0 0 0 16 0" />
      <line x1="4" y1="13" x2="20" y2="13" />
      {/* Small subunit (top half-circle) */}
      <path d="M6 11a6 5 0 0 1 12 0" />
      <line x1="6" y1="11" x2="18" y2="11" />
      {/* Channel / reading groove */}
      <line x1="10" y1="11" x2="10" y2="13" strokeDasharray="1 1" />
      <line x1="14" y1="11" x2="14" y2="13" strokeDasharray="1 1" />
    </svg>
  )
}

export function StrandIcon({ size = 24, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Single wavy mRNA strand */}
      <path d="M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0" />
      {/* Small circles representing bases */}
      <circle cx="5" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="11" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="17" cy="10" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function ProteinIcon({ size = 24, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Folded chain — connected circles in compact arrangement */}
      <circle cx="7" cy="7" r="2.5" />
      <circle cx="14" cy="5" r="2.5" />
      <circle cx="18" cy="11" r="2.5" />
      <circle cx="14" cy="17" r="2.5" />
      <circle cx="7" cy="16" r="2.5" />
      {/* Connections between amino acid nodes */}
      <line x1="9.2" y1="6.2" x2="11.8" y2="5.4" />
      <line x1="16" y1="6.5" x2="17.2" y2="9" />
      <line x1="17" y1="13.2" x2="15.5" y2="15" />
      <line x1="11.8" y1="17" x2="9.2" y2="16.4" />
    </svg>
  )
}

export function FlaskIcon({ size = 24, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Flask neck */}
      <line x1="9" y1="2" x2="15" y2="2" />
      <line x1="10" y1="2" x2="10" y2="9" />
      <line x1="14" y1="2" x2="14" y2="9" />
      {/* Flask body — erlenmeyer shape */}
      <path d="M10 9L4 20a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1L14 9" />
      {/* Liquid level */}
      <path d="M7 16h10" strokeDasharray="2 2" />
      {/* Bubbles */}
      <circle cx="10" cy="18" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="13" cy="17" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}
