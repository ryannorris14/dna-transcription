import { motion } from 'framer-motion'

// ── SVG Creature Renderer ────────────────────────────────────
// Takes a traits object and renders a creature as SVG.
// Null/missing traits = empty petri dish or error state.

const SVG_SIZE = 300
const CX = SVG_SIZE / 2
const CY = SVG_SIZE / 2

export default function Creature({ traits, error }) {
  if (error === 'no-start') {
    return (
      <div className="creature-frame">
        <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="creature-svg">
          <PetriDish />
          <text x={CX} y={CY} textAnchor="middle" fill="#64748b" fontSize="13" fontFamily="var(--font-mono)">
            No start codon (AUG)
          </text>
          <text x={CX} y={CY + 20} textAnchor="middle" fill="#475569" fontSize="11" fontFamily="var(--font-body)">
            Protein can't begin without it!
          </text>
        </svg>
      </div>
    )
  }

  if (error === 'nonsense') {
    return (
      <div className="creature-frame">
        <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="creature-svg">
          <PetriDish />
          <motion.g
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <circle cx={CX} cy={CY} r={30} fill="#475569" opacity={0.6} />
            <circle cx={CX - 8} cy={CY - 5} r={3} fill="#1e293b" />
            <circle cx={CX + 8} cy={CY - 5} r={3} fill="#1e293b" />
            <path d={`M ${CX - 8} ${CY + 8} Q ${CX} ${CY + 2} ${CX + 8} ${CY + 8}`} stroke="#1e293b" strokeWidth="2" fill="none" />
          </motion.g>
          <text x={CX} y={CY + 55} textAnchor="middle" fill="#f87171" fontSize="12" fontFamily="var(--font-mono)" fontWeight="700">
            Nonsense mutation!
          </text>
          <text x={CX} y={CY + 72} textAnchor="middle" fill="#475569" fontSize="10" fontFamily="var(--font-body)">
            Premature stop → truncated protein
          </text>
        </svg>
      </div>
    )
  }

  if (!traits) {
    return (
      <div className="creature-frame">
        <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="creature-svg">
          <PetriDish />
        </svg>
      </div>
    )
  }

  const { bodyColor, bodyShape, eyes, accessory } = traits

  // For hex colors, use with low opacity for petri glow accent
  const petriAccent = bodyColor ? `${bodyColor}0D` : undefined // 0D = ~5% opacity for hex

  return (
    <div className="creature-frame">
      <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="creature-svg">
        <PetriDish accentColor={petriAccent} />
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        >
          {/* Glow filter + radial gradient */}
          {/* Body */}
          <BodyShape shape={bodyShape} color={bodyColor} />

          {/* Eyes */}
          <Eyes config={eyes} />

          {/* Accessory */}
          <Accessory type={accessory} color={bodyColor} />
        </motion.g>
      </svg>
    </div>
  )
}

// ── Petri Dish background ────────────────────────────────────
function PetriDish({ accentColor }) {
  return (
    <g>
      <circle cx={CX} cy={CY} r={135} fill="none" stroke={accentColor || 'rgba(129,140,248,0.05)'} strokeWidth="8" opacity={0.5} />
      <circle cx={CX} cy={CY} r={130} fill="none" stroke="#2d3a52" strokeWidth="2" strokeDasharray="6 4" />
      <circle cx={CX} cy={CY} r={128} fill="rgba(17, 24, 39, 0.4)" />
    </g>
  )
}

// ── Body Shapes ──────────────────────────────────────────────
function BodyShape({ shape, color }) {
  const r = 55
  const props = { fill: color, opacity: 0.9 }

  switch (shape) {
    case 'circle':
      return <circle cx={CX} cy={CY} r={r} {...props} />
    case 'oval':
      return <ellipse cx={CX} cy={CY} rx={r * 1.3} ry={r * 0.8} {...props} />
    case 'blob':
      return (
        <path
          d={`M ${CX - 50} ${CY - 10}
              Q ${CX - 40} ${CY - 55} ${CX} ${CY - 50}
              Q ${CX + 45} ${CY - 48} ${CX + 52} ${CY - 5}
              Q ${CX + 55} ${CY + 40} ${CX + 10} ${CY + 50}
              Q ${CX - 20} ${CY + 55} ${CX - 48} ${CY + 30}
              Q ${CX - 58} ${CY + 5} ${CX - 50} ${CY - 10} Z`}
          {...props}
        />
      )
    case 'cloud':
      return (
        <g {...props}>
          <circle cx={CX - 20} cy={CY} r={35} fill={color} />
          <circle cx={CX + 20} cy={CY} r={35} fill={color} />
          <circle cx={CX} cy={CY - 15} r={35} fill={color} />
          <circle cx={CX} cy={CY + 10} r={30} fill={color} />
        </g>
      )
    case 'diamond':
      return (
        <path
          d={`M ${CX} ${CY - r}
              Q ${CX + r * 0.45} ${CY - r * 0.55} ${CX + r * 0.72} ${CY + 2}
              Q ${CX + r * 0.45} ${CY + r * 0.55} ${CX} ${CY + r}
              Q ${CX - r * 0.45} ${CY + r * 0.55} ${CX - r * 0.72} ${CY + 2}
              Q ${CX - r * 0.45} ${CY - r * 0.55} ${CX} ${CY - r} Z`}
          {...props}
        />
      )
    case 'hexagon':
      return <OrganicPolygon sides={6} r={r} {...props} />
    case 'pentagon':
      return <OrganicPolygon sides={5} r={r} {...props} />
    case 'octagon':
      return <OrganicPolygon sides={8} r={r} {...props} />
    case 'triangle':
      return <OrganicPolygon sides={3} r={r * 1.1} {...props} />
    case 'star':
      return <StarShape points={5} outerR={r} innerR={r * 0.45} {...props} />
    case 'starburst':
      return <StarShape points={8} outerR={r} innerR={r * 0.55} {...props} />
    case 'cross':
      return (
        <path
          d={`M ${CX - 16} ${CY - r}
              Q ${CX} ${CY - r + 6} ${CX + 16} ${CY - r}
              Q ${CX + 20} ${CY - r * 0.5} ${CX + r} ${CY - 16}
              Q ${CX + r - 6} ${CY} ${CX + r} ${CY + 16}
              Q ${CX + 20} ${CY + r * 0.5} ${CX + 16} ${CY + r}
              Q ${CX} ${CY + r - 6} ${CX - 16} ${CY + r}
              Q ${CX - 20} ${CY + r * 0.5} ${CX - r} ${CY + 16}
              Q ${CX - r + 6} ${CY} ${CX - r} ${CY - 16}
              Q ${CX - 20} ${CY - r * 0.5} ${CX - 16} ${CY - r} Z`}
          {...props}
        />
      )
    case 'arrow':
      return (
        <path
          d={`M ${CX} ${CY - r}
              Q ${CX + r * 0.35} ${CY - r * 0.7} ${CX + r * 0.6} ${CY + r * 0.25}
              Q ${CX + r * 0.45} ${CY + r * 0.35} ${CX + 16} ${CY + r * 0.3}
              Q ${CX + 18} ${CY + r * 0.7} ${CX + 14} ${CY + r}
              Q ${CX} ${CY + r + 4} ${CX - 14} ${CY + r}
              Q ${CX - 18} ${CY + r * 0.7} ${CX - 16} ${CY + r * 0.3}
              Q ${CX - r * 0.45} ${CY + r * 0.35} ${CX - r * 0.6} ${CY + r * 0.25}
              Q ${CX - r * 0.35} ${CY - r * 0.7} ${CX} ${CY - r} Z`}
          {...props}
        />
      )
    case 'droplet':
      return (
        <path
          d={`M ${CX} ${CY - r}
              Q ${CX + r * 0.8} ${CY - r * 0.2} ${CX + r * 0.6} ${CY + r * 0.3}
              Q ${CX + r * 0.4} ${CY + r} ${CX} ${CY + r}
              Q ${CX - r * 0.4} ${CY + r} ${CX - r * 0.6} ${CY + r * 0.3}
              Q ${CX - r * 0.8} ${CY - r * 0.2} ${CX} ${CY - r} Z`}
          {...props}
        />
      )
    case 'bean':
      return (
        <path
          d={`M ${CX - 40} ${CY - 20}
              Q ${CX - 30} ${CY - 55} ${CX + 10} ${CY - 45}
              Q ${CX + 55} ${CY - 35} ${CX + 45} ${CY + 10}
              Q ${CX + 35} ${CY + 55} ${CX - 5} ${CY + 48}
              Q ${CX - 55} ${CY + 40} ${CX - 40} ${CY - 20} Z`}
          {...props}
        />
      )
    case 'spark':
      return <StarShape points={4} outerR={r} innerR={r * 0.3} {...props} />
    case 'crescent': {
      const offset = 25
      return (
        <g>
          <circle cx={CX} cy={CY} r={r} {...props} />
          <circle cx={CX + offset} cy={CY - offset * 0.5} r={r * 0.7} fill="var(--bg-card)" />
        </g>
      )
    }
    case 'zigzag':
      return (
        <path
          d={`M ${CX - r} ${CY - 18}
              Q ${CX - r * 0.7} ${CY - r * 0.9} ${CX - r * 0.35} ${CY - r}
              Q ${CX} ${CY - r * 0.5} ${CX + r * 0.25} ${CY - r * 0.55}
              Q ${CX + r * 0.6} ${CY - r * 0.6} ${CX + r} ${CY - r * 0.5}
              Q ${CX + r * 0.9} ${CY} ${CX + r * 0.6} ${CY + 12}
              Q ${CX + r * 0.8} ${CY + r * 0.6} ${CX + r * 0.2} ${CY + r}
              Q ${CX - r * 0.2} ${CY + r * 0.9} ${CX - r * 0.5} ${CY + r * 0.4}
              Q ${CX - r * 0.8} ${CY + r * 0.2} ${CX - r} ${CY - 18} Z`}
          {...props}
        />
      )
    case 'flame':
      return (
        <path
          d={`M ${CX} ${CY - r}
              Q ${CX + r * 0.3} ${CY - r * 0.5} ${CX + r * 0.7} ${CY}
              Q ${CX + r * 0.5} ${CY + r * 0.7} ${CX} ${CY + r}
              Q ${CX - r * 0.5} ${CY + r * 0.7} ${CX - r * 0.7} ${CY}
              Q ${CX - r * 0.3} ${CY - r * 0.5} ${CX} ${CY - r} Z`}
          {...props}
        />
      )
    default:
      return <circle cx={CX} cy={CY} r={r} {...props} />
  }
}

// ── Organic polygon helper — soft curved edges ──────────────
function OrganicPolygon({ sides, r, ...props }) {
  const vertices = Array.from({ length: sides }, (_, i) => {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2
    // Slight radius variation per vertex for organic asymmetry
    const wobble = 1 + ((i * 7 + sides * 3) % 5 - 2) * 0.04
    const vr = r * wobble
    return { x: CX + vr * Math.cos(angle), y: CY + vr * Math.sin(angle) }
  })

  // Build path with quadratic bezier curves between vertices
  // Control point is pushed outward from midpoint for convex bulge
  const bulge = 0.18
  let d = `M ${vertices[0].x} ${vertices[0].y}`
  for (let i = 0; i < sides; i++) {
    const curr = vertices[i]
    const next = vertices[(i + 1) % sides]
    const mx = (curr.x + next.x) / 2
    const my = (curr.y + next.y) / 2
    // Push control point outward from center
    const dx = mx - CX
    const dy = my - CY
    const cpx = mx + dx * bulge
    const cpy = my + dy * bulge
    d += ` Q ${cpx} ${cpy} ${next.x} ${next.y}`
  }
  d += ' Z'
  return <path d={d} {...props} />
}

// ── Star shape helper ────────────────────────────────────────
function StarShape({ points: numPoints, outerR, innerR, ...props }) {
  const pts = []
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2
    const r = i % 2 === 0 ? outerR : innerR
    pts.push(`${CX + r * Math.cos(angle)},${CY + r * Math.sin(angle)}`)
  }
  return <polygon points={pts.join(' ')} {...props} />
}

// ── Eyes (cartoonish, expressive) ──────────────────────────────
function Eyes({ config }) {
  if (!config) return null
  const { count, size, shape } = config
  const sizeMap = { small: 7, medium: 11, large: 16 }
  const r = sizeMap[size] || 11

  const eyeY = CY - 12
  const spread = Math.min(38, count > 1 ? 76 / (count - 1) : 0)
  const startX = CX - ((count - 1) * spread) / 2

  // Deterministic wonky offsets for personality
  const wobble = (i) => ((i * 7 + count * 3) % 5) - 2

  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const ex = count === 1 ? CX : startX + i * spread
        const sizeWobble = 1 + (wobble(i) * 0.1)
        const yWobble = wobble(i + 1) * 1.5
        const eyeR = r * sizeWobble
        // Pupil offset for derpy cross-eyed look
        const pupilDx = wobble(i) * 1.2
        const pupilDy = wobble(i + 2) * 0.8
        return (
          <g key={i}>
            {/* White sclera */}
            <EyeShape shape={shape} cx={ex} cy={eyeY + yWobble} r={eyeR} fill="#fff" />
            {/* Dark pupil */}
            <circle cx={ex + pupilDx} cy={eyeY + yWobble + pupilDy} r={eyeR * 0.45} fill="#1e293b" />
            {/* Highlight dot */}
            <circle cx={ex + pupilDx + eyeR * 0.15} cy={eyeY + yWobble + pupilDy - eyeR * 0.15} r={eyeR * 0.15} fill="#fff" />
          </g>
        )
      })}

      {/* Mouth */}
      <Mouth count={count} eyeSize={size} />
    </g>
  )
}

// ── Mouth (cartoonish, silly) ────────────────────────────────
function Mouth({ count, eyeSize }) {
  const mouthY = CY + 18
  const variant = (count + (eyeSize === 'small' ? 0 : eyeSize === 'medium' ? 1 : 2)) % 6

  switch (variant) {
    case 0: // Wide grin
      return <path d={`M ${CX - 16} ${mouthY} Q ${CX} ${mouthY + 16} ${CX + 16} ${mouthY}`} stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    case 1: // Tiny surprised O
      return <circle cx={CX + 2} cy={mouthY + 5} r={5} fill="none" stroke="#1e293b" strokeWidth="2" />
    case 2: // Wavy line
      return <path d={`M ${CX - 14} ${mouthY + 4} Q ${CX - 5} ${mouthY - 2} ${CX} ${mouthY + 4} Q ${CX + 5} ${mouthY + 10} ${CX + 14} ${mouthY + 4}`} stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round" />
    case 3: // Toothy grin
      return (
        <g>
          <path d={`M ${CX - 14} ${mouthY + 2} Q ${CX} ${mouthY + 14} ${CX + 14} ${mouthY + 2}`} stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round" />
          <line x1={CX - 5} y1={mouthY + 4} x2={CX - 5} y2={mouthY + 8} stroke="#1e293b" strokeWidth="1.5" />
          <line x1={CX + 5} y1={mouthY + 4} x2={CX + 5} y2={mouthY + 8} stroke="#1e293b" strokeWidth="1.5" />
        </g>
      )
    case 4: // Tongue out
      return (
        <g>
          <path d={`M ${CX - 12} ${mouthY + 2} Q ${CX} ${mouthY + 12} ${CX + 12} ${mouthY + 2}`} stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round" />
          <ellipse cx={CX + 2} cy={mouthY + 10} rx={5} ry={6} fill="#f472b6" opacity={0.7} />
        </g>
      )
    case 5: // Wonky smile
      return <path d={`M ${CX - 10} ${mouthY + 6} Q ${CX - 2} ${mouthY} ${CX + 12} ${mouthY + 4}`} stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    default:
      return null
  }
}

function EyeShape({ shape, cx, cy, r, fill }) {
  switch (shape) {
    case 'oval':
      return <ellipse cx={cx} cy={cy} rx={r * 1.3} ry={r} fill={fill} />
    case 'star':
      return (
        <polygon
          points={Array.from({ length: 10 }, (_, i) => {
            const angle = (i * Math.PI) / 5 - Math.PI / 2
            const rad = i % 2 === 0 ? r : r * 0.5
            return `${cx + rad * Math.cos(angle)},${cy + rad * Math.sin(angle)}`
          }).join(' ')}
          fill={fill}
        />
      )
    case 'slit':
      return <ellipse cx={cx} cy={cy} rx={r * 0.6} ry={r} fill={fill} />
    case 'diamond':
      return (
        <polygon
          points={`${cx},${cy - r} ${cx + r * 0.7},${cy} ${cx},${cy + r} ${cx - r * 0.7},${cy}`}
          fill={fill}
        />
      )
    case 'crescent':
      return (
        <g>
          <circle cx={cx} cy={cy} r={r} fill={fill} />
          <circle cx={cx + 2} cy={cy - 2} r={r * 0.6} fill="#1e293b" opacity="0.15" />
        </g>
      )
    default:
      return <circle cx={cx} cy={cy} r={r} fill={fill} />
  }
}

// ── Accessories ──────────────────────────────────────────────
function Accessory({ type, color }) {
  if (!type || type === 'none') return null

  switch (type) {
    case 'horns':
      return (
        <g>
          <line x1={CX - 25} y1={CY - 50} x2={CX - 35} y2={CY - 80} stroke={color} strokeWidth="4" strokeLinecap="round" />
          <line x1={CX + 25} y1={CY - 50} x2={CX + 35} y2={CY - 80} stroke={color} strokeWidth="4" strokeLinecap="round" />
        </g>
      )
    case 'antennae':
      return (
        <g>
          <line x1={CX - 15} y1={CY - 55} x2={CX - 25} y2={CY - 85} stroke={color} strokeWidth="2" />
          <circle cx={CX - 25} cy={CY - 88} r={5} fill={color} />
          <line x1={CX + 15} y1={CY - 55} x2={CX + 25} y2={CY - 85} stroke={color} strokeWidth="2" />
          <circle cx={CX + 25} cy={CY - 88} r={5} fill={color} />
        </g>
      )
    case 'crown':
      return (
        <polygon
          points={`${CX - 30},${CY - 52} ${CX - 20},${CY - 75} ${CX - 10},${CY - 60} ${CX},${CY - 80} ${CX + 10},${CY - 60} ${CX + 20},${CY - 75} ${CX + 30},${CY - 52}`}
          fill="#fbbf24"
          stroke="#f59e0b"
          strokeWidth="1.5"
        />
      )
    case 'hat':
      return (
        <g>
          <rect x={CX - 35} y={CY - 58} width={70} height={8} rx={2} fill="#475569" />
          <rect x={CX - 20} y={CY - 85} width={40} height={28} rx={4} fill="#475569" />
        </g>
      )
    case 'halo':
      return (
        <ellipse cx={CX} cy={CY - 68} rx={30} ry={8} fill="none" stroke="#fbbf24" strokeWidth="3" opacity="0.8" />
      )
    case 'wings':
      return (
        <g opacity="0.6">
          <ellipse cx={CX - 65} cy={CY} rx={25} ry={40} fill={color} transform={`rotate(-15 ${CX - 65} ${CY})`} />
          <ellipse cx={CX + 65} cy={CY} rx={25} ry={40} fill={color} transform={`rotate(15 ${CX + 65} ${CY})`} />
        </g>
      )
    case 'spikes':
      return (
        <g>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const rad = (angle * Math.PI) / 180
            const x1 = CX + 50 * Math.cos(rad)
            const y1 = CY + 50 * Math.sin(rad)
            const x2 = CX + 72 * Math.cos(rad)
            const y2 = CY + 72 * Math.sin(rad)
            return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="3" strokeLinecap="round" />
          })}
        </g>
      )
    case 'tail':
      return (
        <path
          d={`M ${CX} ${CY + 50} Q ${CX + 30} ${CY + 80} ${CX + 10} ${CY + 100} Q ${CX - 10} ${CY + 115} ${CX + 15} ${CY + 120}`}
          stroke={color}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
      )
    case 'mohawk':
      return (
        <g>
          {[-15, -5, 5, 15].map((dx, i) => (
            <rect key={i} x={CX + dx - 3} y={CY - 55 - (i % 2 ? 15 : 10)} width={6} height={20 + (i % 2 ? 5 : 0)} rx={3} fill={color} />
          ))}
        </g>
      )
    case 'tentacles':
      return (
        <g>
          {[-30, -10, 10, 30].map((dx, i) => (
            <path
              key={i}
              d={`M ${CX + dx} ${CY + 50} Q ${CX + dx + (i % 2 ? 15 : -15)} ${CY + 75} ${CX + dx} ${CY + 95}`}
              stroke={color}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              opacity={0.7}
            />
          ))}
        </g>
      )
    case 'shell':
      return (
        <g opacity="0.5">
          <path
            d={`M ${CX - 10} ${CY + 45} Q ${CX - 50} ${CY + 30} ${CX - 40} ${CY - 20} Q ${CX - 30} ${CY - 60} ${CX + 5} ${CY - 55} Q ${CX + 40} ${CY - 50} ${CX + 45} ${CY - 10}`}
            stroke={color}
            strokeWidth="3"
            fill="none"
          />
        </g>
      )
    case 'bow':
      return (
        <g>
          <polygon points={`${CX},${CY - 55} ${CX - 20},${CY - 70} ${CX},${CY - 60} ${CX + 20},${CY - 70}`} fill="#f472b6" />
          <circle cx={CX} cy={CY - 57} r={4} fill="#ec4899" />
        </g>
      )
    case 'bubbles':
      return (
        <g opacity="0.5">
          <circle cx={CX + 50} cy={CY - 30} r={8} fill="none" stroke={color} strokeWidth="1.5" />
          <circle cx={CX + 62} cy={CY - 50} r={5} fill="none" stroke={color} strokeWidth="1.5" />
          <circle cx={CX + 45} cy={CY - 55} r={3} fill="none" stroke={color} strokeWidth="1.5" />
        </g>
      )
    case 'leaf':
      return (
        <g>
          <path
            d={`M ${CX} ${CY - 55} Q ${CX + 20} ${CY - 80} ${CX + 5} ${CY - 90} Q ${CX - 15} ${CY - 80} ${CX} ${CY - 55}`}
            fill="#4ade80"
            opacity={0.8}
          />
          <line x1={CX} y1={CY - 55} x2={CX + 3} y2={CY - 82} stroke="#22c55e" strokeWidth="1" />
        </g>
      )
    case 'scarf':
      return (
        <g>
          <path
            d={`M ${CX - 40} ${CY + 35} Q ${CX} ${CY + 50} ${CX + 40} ${CY + 35}`}
            stroke="#818cf8"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          <rect x={CX + 32} y={CY + 32} width={8} height={25} rx={4} fill="#818cf8" />
        </g>
      )
    case 'lightning':
      return (
        <polygon
          points={`${CX + 35},${CY - 65} ${CX + 45},${CY - 45} ${CX + 55},${CY - 48} ${CX + 40},${CY - 25}`}
          fill="#fbbf24"
        />
      )
    case 'cape':
      return (
        <path
          d={`M ${CX - 45} ${CY - 20} Q ${CX - 60} ${CY + 40} ${CX - 35} ${CY + 70} L ${CX + 35} ${CY + 70} Q ${CX + 60} ${CY + 40} ${CX + 45} ${CY - 20}`}
          fill={color}
          opacity={0.3}
        />
      )
    case 'flames':
      return (
        <g opacity="0.6">
          {[-25, 0, 25].map((dx, i) => (
            <path
              key={i}
              d={`M ${CX + dx - 8} ${CY + 55} Q ${CX + dx} ${CY + 35 - i * 5} ${CX + dx + 8} ${CY + 55}`}
              fill="#f87171"
            />
          ))}
        </g>
      )
    case 'crystals':
      return (
        <g opacity="0.7">
          {[[-30, -50, 12], [30, -45, 10], [40, -60, 8]].map(([dx, dy, h], i) => (
            <polygon
              key={i}
              points={`${CX + dx},${CY + dy - h} ${CX + dx + 5},${CY + dy} ${CX + dx - 5},${CY + dy}`}
              fill="#818cf8"
            />
          ))}
        </g>
      )
    default:
      return null
  }
}
