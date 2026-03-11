import { useRef, useMemo, useState, useEffect, forwardRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { BASE_COLORS, transcribe, getCodingStrand, splitCodons, translateAll } from './biology'

const NUM_PAIRS = 15
const HELIX_RADIUS = 1.2
const HELIX_HEIGHT = 8
const TURNS = 1.5
const UNZIP_EXTRA = 2.0
const BASE_SPHERE_RADIUS = 0.2
const BACKBONE_RADIUS = 0.06

const TEMPLATE = ['T','A','C','G','T','C','A','T','G','C','G','A','A','C','T']
const CODING   = ['A','T','G','C','A','G','T','A','C','G','C','T','T','G','A']
const MRNA_BASES = ['A','U','G','C','A','G','U','A','C','G','C','U','U','G','A']
const CODONS = ['AUG','CAG','UAC','GCU','UGA']
const AAS = ['Met','Gln','Tyr','Ala']
const AA_COLORS = { Met: '#ffa502', Gln: '#1dd1a1', Tyr: '#10ac84', Ala: '#ff6b6b' }

function c(hex) { return new THREE.Color(hex) }

const _up = new THREE.Vector3(0, 1, 0)
const _dir = new THREE.Vector3()
const _quat = new THREE.Quaternion()
const _mid = new THREE.Vector3()

// Smooth lerp helper — works every frame
function damp(current, target, speed, delta) {
  return current + (target - current) * Math.min(1, delta * speed)
}

// ── Step mapping ─────────────────────────────────────────────
// 0: Meet DNA           → rotating helix
// 1: Base Pairing       → rotating helix
// 2: Helicase Unzips    → unzip animation
// 3: RNA Pol Binds      → polymerase flies in and attaches
// 4: Building mRNA      → polymerase slides, mRNA builds
// 5: mRNA Complete      → rezip, mRNA drifts to the side
// 6: Meet Ribosome      → translation scene fades in (mRNA + ribosome)
// 7: Start Codon        → highlight first codon
// 8: tRNA Delivery      → ribosome slides, AAs grow at ribosome
// 9: Stop Codon         → ribosome at stop, chain complete
// 10: Protein Complete  → mRNA fades, protein folds alone center stage
// 11: Central Dogma     → gentle rotating helix

function HelixScene({ step = 0 }) {
  const groupRef = useRef()
  const separationRef = useRef(new Float32Array(NUM_PAIRS).fill(0))
  const polyPosRef = useRef(-1)
  const [mRNABuilt, setMRNABuilt] = useState(0)
  const [helicaseFront, setHelicaseFront] = useState(-1)

  // Smooth opacity refs for crossfading
  const helixOpacityRef = useRef(1)
  const translationOpacityRef = useRef(0)

  const shouldRotate = step <= 1 || step === 11
  const showPolymerase = step >= 3 && step <= 4
  const showHelixTarget = step <= 5 || step === 11
  const showTranslationTarget = step >= 6 && step <= 10
  const mRNADrifting = step === 5
  const polyApproaching = step === 3
  const showHelicase = step === 2

  // Reset helicase when entering step 2
  useEffect(() => {
    if (step === 2) setHelicaseFront(-1)
    if (step === 4) { setMRNABuilt(0); polyPosRef.current = -1 }
  }, [step])

  // Helicase advances pair by pair (step 2)
  useEffect(() => {
    if (step !== 2 || helicaseFront >= NUM_PAIRS - 1) return
    const timer = setTimeout(() => setHelicaseFront(f => f + 1), 350)
    return () => clearTimeout(timer)
  }, [step, helicaseFront])

  // mRNA building (step 4)
  useEffect(() => {
    if (step !== 4 || mRNABuilt >= NUM_PAIRS) return
    const timer = setTimeout(() => {
      setMRNABuilt(b => b + 1)
      polyPosRef.current = mRNABuilt
    }, 500)
    return () => clearTimeout(timer)
  }, [step, mRNABuilt])

  useFrame((_, delta) => {
    // Per-pair separation based on helicase front
    const sep = separationRef.current
    for (let i = 0; i < NUM_PAIRS; i++) {
      let target = 0
      if (step >= 3 && step <= 4) {
        target = 1 // fully unzipped for polymerase
      } else if (step === 2) {
        target = i <= helicaseFront ? 1 : 0 // pair-by-pair
      }
      // steps 0,1,5,11 → target stays 0 (zipped)
      sep[i] = damp(sep[i], target, 3.5, delta)
    }

    if (groupRef.current) {
      groupRef.current.rotation.y += delta * (shouldRotate ? 0.25 : 0.015)
    }

    helixOpacityRef.current = damp(helixOpacityRef.current, showHelixTarget ? 1 : 0, 3, delta)
    translationOpacityRef.current = damp(translationOpacityRef.current, showTranslationTarget ? 1 : 0, 3, delta)
  })

  // Helix geometry
  const { leftPositions, rightPositions, leftCurve, rightCurve } = useMemo(() => {
    const lp = [], rp = [], leftPts = [], rightPts = []
    for (let i = 0; i < NUM_PAIRS; i++) {
      const t = i / (NUM_PAIRS - 1)
      const angle = t * Math.PI * 2 * TURNS
      const y = (t - 0.5) * HELIX_HEIGHT
      lp.push({ x: HELIX_RADIUS * Math.cos(angle), y, z: HELIX_RADIUS * Math.sin(angle), angle })
      rp.push({ x: HELIX_RADIUS * Math.cos(angle + Math.PI), y, z: HELIX_RADIUS * Math.sin(angle + Math.PI), angle: angle + Math.PI })
      leftPts.push(new THREE.Vector3(lp[i].x, lp[i].y, lp[i].z))
      rightPts.push(new THREE.Vector3(rp[i].x, rp[i].y, rp[i].z))
    }
    return {
      leftPositions: lp, rightPositions: rp,
      leftCurve: new THREE.CatmullRomCurve3(leftPts),
      rightCurve: new THREE.CatmullRomCurve3(rightPts),
    }
  }, [])

  return (
    <>
      {/* ── DNA Helix group ──────────────────────────────── */}
      <FadeGroup ref={groupRef} opacityRef={helixOpacityRef}>
        <BackboneStrand curve={leftCurve} positions={leftPositions} separationRef={separationRef} />
        <BackboneStrand curve={rightCurve} positions={rightPositions} separationRef={separationRef} isTemplate />

        {TEMPLATE.map((base, i) => (
          <BasePair key={i} index={i}
            leftBase={CODING[i]} rightBase={base}
            leftPos={leftPositions[i]} rightPos={rightPositions[i]}
            separationRef={separationRef} />
        ))}

        {/* Helicase — visible fork traveling along DNA during step 2 */}
        {showHelicase && helicaseFront >= 0 && (
          <HelicaseMesh
            leftPositions={leftPositions}
            rightPositions={rightPositions}
            frontIndex={helicaseFront}
            separationRef={separationRef}
          />
        )}

        {/* Polymerase — approaches on step 3, slides on step 4 */}
        {showPolymerase && (
          <PolymeraseMesh
            positions={rightPositions}
            separationRef={separationRef}
            currentIndex={polyApproaching ? 0 : Math.max(0, polyPosRef.current)}
            approaching={polyApproaching}
          />
        )}

        {/* mRNA being built (step 4) or drifting away (step 5) */}
        {(step === 4 || step === 5) && mRNABuilt > 0 && (
          <MRNAStrand
            positions={rightPositions}
            separationRef={separationRef}
            builtCount={step === 4 ? mRNABuilt : NUM_PAIRS}
            drifting={mRNADrifting}
          />
        )}
      </FadeGroup>

      {/* ── Translation scene ────────────────────────────── */}
      <TranslationScene step={step} opacityRef={translationOpacityRef} />
    </>
  )
}

// ── Helicase — wedge-shaped fork at the unzip front ─────────
function HelicaseMesh({ leftPositions, rightPositions, frontIndex, separationRef }) {
  const ref = useRef()
  const glowRef = useRef()

  useFrame((_, delta) => {
    if (!ref.current) return
    const i = Math.min(frontIndex, leftPositions.length - 1)
    const lp = leftPositions[i]
    const rp = rightPositions[i]
    // Position at midpoint between the two strands at the front
    const midX = (lp.x + rp.x) / 2
    const midY = lp.y
    const midZ = (lp.z + rp.z) / 2
    ref.current.position.set(midX, midY, midZ)
    // Look toward next pair
    if (i < leftPositions.length - 1) {
      const nextY = leftPositions[i + 1].y
      ref.current.lookAt(midX, nextY, midZ)
    }
    if (glowRef.current) glowRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.006) * 0.2)
  })

  return (
    <group ref={ref}>
      {/* Main body */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.45, 0.6, 6]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.7} roughness={0.3} />
      </mesh>
      {/* Glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.55, 12, 12]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.3} transparent opacity={0.2} />
      </mesh>
    </group>
  )
}

// ── FadeGroup: passes opacityRef to children for crossfade ───
const FadeGroup = forwardRef(function FadeGroup({ opacityRef, children }, ref) {
  const innerRef = useRef()
  // Merge refs
  const groupRef = ref || innerRef

  useFrame(() => {
    if (!groupRef.current) return
    const op = opacityRef.current
    // Scale to 0 when invisible, 1 when visible (smooth)
    const s = Math.max(0.001, op)
    groupRef.current.scale.setScalar(s)
    groupRef.current.visible = op > 0.01
  })

  return <group ref={groupRef}>{children}</group>
})

// ── Backbone strand ──────────────────────────────────────────
// Both strands move OUTWARD (radially away from center) when unzipping.
// Template backbone fades to lower opacity like its bases.
function BackboneStrand({ curve, positions, separationRef, isTemplate = false }) {
  const meshRef = useRef()
  const matRef = useRef()
  const tubeSegments = 64

  useFrame(() => {
    if (!meshRef.current) return
    const pts = positions.map((pos, i) => {
      const sep = separationRef.current[i]
      // Always push outward along the strand's own angle
      const dx = Math.cos(pos.angle) * sep * UNZIP_EXTRA
      const dz = Math.sin(pos.angle) * sep * UNZIP_EXTRA
      return new THREE.Vector3(pos.x + dx, pos.y, pos.z + dz)
    })
    const newCurve = new THREE.CatmullRomCurve3(pts)
    const newGeom = new THREE.TubeGeometry(newCurve, tubeSegments, BACKBONE_RADIUS, 8, false)
    meshRef.current.geometry.dispose()
    meshRef.current.geometry = newGeom

    // Fade template backbone with separation
    if (isTemplate && matRef.current) {
      const avgSep = separationRef.current.reduce((a, b) => a + b, 0) / positions.length
      matRef.current.opacity = 1 - avgSep * 0.75
    }
  })

  const initialGeom = useMemo(
    () => new THREE.TubeGeometry(curve, tubeSegments, BACKBONE_RADIUS, 8, false),
    [curve]
  )

  return (
    <mesh ref={meshRef} geometry={initialGeom}>
      <meshStandardMaterial ref={matRef} color="#8b9dc3" emissive="#4a5578" emissiveIntensity={0.4}
        roughness={0.4} metalness={0.4} transparent={isTemplate} opacity={1} />
    </mesh>
  )
}

// ── Base pair with quaternion rung ────────────────────────────
function BasePair({ index, leftBase, rightBase, leftPos, rightPos, separationRef }) {
  const leftRef = useRef()
  const rightRef = useRef()
  const rungRef = useRef()
  const leftMatRef = useRef()
  const rightMatRef = useRef()
  const leftColor = useMemo(() => c(BASE_COLORS[leftBase]), [leftBase])
  const rightColor = useMemo(() => c(BASE_COLORS[rightBase]), [rightBase])

  useFrame(() => {
    const sep = separationRef.current[index]
    const ldx = Math.cos(leftPos.angle) * sep * UNZIP_EXTRA
    const ldz = Math.sin(leftPos.angle) * sep * UNZIP_EXTRA
    const lx = leftPos.x + ldx, ly = leftPos.y, lz = leftPos.z + ldz
    leftRef.current.position.set(lx, ly, lz)

    const rdx = Math.cos(rightPos.angle) * sep * UNZIP_EXTRA
    const rdz = Math.sin(rightPos.angle) * sep * UNZIP_EXTRA
    const rx = rightPos.x + rdx, ry = rightPos.y, rz = rightPos.z + rdz
    rightRef.current.position.set(rx, ry, rz)

    _mid.set((lx + rx) / 2, (ly + ry) / 2, (lz + rz) / 2)
    _dir.set(rx - lx, ry - ly, rz - lz)
    const length = _dir.length()
    _dir.normalize()
    _quat.setFromUnitVectors(_up, _dir)
    rungRef.current.position.copy(_mid)
    rungRef.current.quaternion.copy(_quat)
    rungRef.current.scale.set(1, length, 1)
    rungRef.current.material.opacity = 1 - sep * 0.9

    // Fade template strand (right) to near-transparent when unzipped
    // Coding strand (left) stays visible
    const templateOpacity = 1 - sep * 0.85
    if (rightMatRef.current) rightMatRef.current.opacity = templateOpacity
  })

  return (
    <>
      <mesh ref={leftRef} position={[leftPos.x, leftPos.y, leftPos.z]}>
        <sphereGeometry args={[BASE_SPHERE_RADIUS, 16, 16]} />
        <meshStandardMaterial ref={leftMatRef} color={leftColor} emissive={leftColor} emissiveIntensity={0.6} roughness={0.3} transparent opacity={1} />
      </mesh>
      <mesh ref={rightRef} position={[rightPos.x, rightPos.y, rightPos.z]}>
        <sphereGeometry args={[BASE_SPHERE_RADIUS, 16, 16]} />
        <meshStandardMaterial ref={rightMatRef} color={rightColor} emissive={rightColor} emissiveIntensity={0.6} roughness={0.3} transparent opacity={1} />
      </mesh>
      <mesh ref={rungRef}>
        <cylinderGeometry args={[0.02, 0.02, 1, 4]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.15} transparent opacity={1} roughness={0.8} />
      </mesh>
    </>
  )
}

// ── RNA Polymerase ───────────────────────────────────────────
// Step 3: flies in from far away. Step 4: slides along.
function PolymeraseMesh({ positions, separationRef, currentIndex, approaching }) {
  const ref = useRef()
  const glowRef = useRef()
  const approachRef = useRef(approaching ? 8 : 0) // distance offset when approaching

  useFrame((_, delta) => {
    if (!ref.current) return
    const i = Math.min(currentIndex, positions.length - 1)
    const pos = positions[i]
    const sep = separationRef.current[i]
    // Template strand offset (right/negative side)
    const dx = Math.cos(pos.angle) * sep * UNZIP_EXTRA
    const dz = Math.sin(pos.angle) * sep * UNZIP_EXTRA

    // Approach animation: start far, lerp to 0
    approachRef.current = damp(approachRef.current, 0, 1.5, delta)

    // Bond directly to template strand — only tiny offset for visibility
    const baseX = pos.x + dx * -1
    const baseZ = pos.z + dz * -1
    ref.current.position.set(
      baseX + approachRef.current * 0.5,
      pos.y + approachRef.current * 1.2,
      baseZ + approachRef.current * 0.8
    )
    if (glowRef.current) glowRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.15)
  })

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} roughness={0.2} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.3} transparent opacity={0.25} />
      </mesh>
    </group>
  )
}

// ── mRNA Strand (transcription) ──────────────────────────────
// `drifting` = step 5: bases slide to the side of the helix
function MRNAStrand({ positions, separationRef, builtCount, drifting }) {
  return (
    <group>
      {MRNA_BASES.slice(0, builtCount).map((base, i) => (
        <MRNABase key={i} index={i} base={base} templatePos={positions[i]}
          separationRef={separationRef} drifting={drifting} />
      ))}
    </group>
  )
}

function MRNABase({ index, base, templatePos, separationRef, drifting }) {
  const ref = useRef()
  const color = useMemo(() => c(BASE_COLORS[base]), [base])
  const scaleRef = useRef(0)
  const driftRef = useRef(0) // 0 = next to template, 1 = fully drifted

  useFrame((_, delta) => {
    if (!ref.current) return
    const sep = separationRef.current[index]
    const dx = Math.cos(templatePos.angle) * sep * UNZIP_EXTRA
    const dz = Math.sin(templatePos.angle) * sep * UNZIP_EXTRA
    // Base offset from template
    const ox = Math.cos(templatePos.angle + Math.PI) * 0.8
    const oz = Math.sin(templatePos.angle + Math.PI) * 0.8

    // Drift: slide to x+4 as a vertical column beside the helix
    driftRef.current = damp(driftRef.current, drifting ? 1 : 0, 2, delta)
    const drift = driftRef.current

    const nearX = templatePos.x + dx * -1 + ox
    const nearZ = templatePos.z + dz * -1 + oz
    // Drifted position: vertical column at x=3.5
    const farX = 3.5
    const farY = templatePos.y
    const farZ = 0

    ref.current.position.set(
      nearX + (farX - nearX) * drift,
      templatePos.y + (farY - templatePos.y) * drift,
      nearZ + (farZ - nearZ) * drift
    )

    scaleRef.current = damp(scaleRef.current, 1, 6, delta)
    ref.current.scale.setScalar(scaleRef.current)
  })

  return (
    <mesh ref={ref} scale={0}>
      <sphereGeometry args={[BASE_SPHERE_RADIUS * 0.85, 12, 12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.3} />
    </mesh>
  )
}

// ══════════════════════════════════════════════════════════════
//  TRANSLATION SCENE (steps 6–10)
// ══════════════════════════════════════════════════════════════

const MRNA_X_START = -4
const MRNA_SPACING = 0.55
const MRNA_Y = 1.5 // mRNA strand y position
const AA_Y = -0.5  // amino acid chain y

function TranslationScene({ step, opacityRef }) {
  const groupRef = useRef()
  const [ribosomePos, setRibosomePos] = useState(0)
  const [aasBuilt, setAasBuilt] = useState(0)
  const [folding, setFolding] = useState(false)
  // Smooth opacity for mRNA within translation (fades at step 10)
  const mRNAVisRef = useRef(1)

  useEffect(() => {
    if (step === 6) { setRibosomePos(0); setAasBuilt(0); setFolding(false) }
    // Step 7 (Start Codon): ribosome at AUG, Met already recognized
    if (step === 7) { setRibosomePos(0); setAasBuilt(1); setFolding(false) }
  }, [step])

  // Step 8: ribosome advances through codons 1→3, building AAs
  // (codon 0/Met already built at step 7)
  useEffect(() => {
    if (step !== 8) return
    if (ribosomePos >= 3) return // stop at codon 3 (GCU/Ala), before stop codon
    const timer = setTimeout(() => {
      setRibosomePos(p => p + 1)
      setAasBuilt(a => Math.min(a + 1, 4))
    }, 1400)
    return () => clearTimeout(timer)
  }, [step, ribosomePos])

  // Step 9: ribosome advances to stop codon (position 4)
  useEffect(() => {
    if (step === 9) { setRibosomePos(4); setAasBuilt(4); setFolding(false) }
  }, [step])

  useEffect(() => {
    if (step === 10) { setRibosomePos(5); setAasBuilt(4); setFolding(true) }
  }, [step])

  // Smooth scale for the whole translation group
  useFrame((_, delta) => {
    if (!groupRef.current) return
    const op = opacityRef.current
    const s = Math.max(0.001, op)
    groupRef.current.scale.setScalar(s)
    groupRef.current.visible = op > 0.01

    // mRNA fades out during folding
    mRNAVisRef.current = damp(mRNAVisRef.current, folding ? 0 : 1, 2.5, delta)
  })

  const ribX = MRNA_X_START + ribosomePos * MRNA_SPACING * 3 + MRNA_SPACING * 1.5

  return (
    <group ref={groupRef}>
      {/* ── mRNA strand + ribosome (fade out during folding) ── */}
      <MRNALayer visible={mRNAVisRef} step={step} ribosomePos={ribosomePos} ribX={ribX} />

      {/* ── Amino acid chain — positioned right below ribosome ── */}
      {!folding && aasBuilt > 0 && (
        <AminoChain aasBuilt={aasBuilt} ribX={ribX} />
      )}

      {/* ── Folding: protein alone, center stage ── */}
      {folding && <FoldingAnimation />}
    </group>
  )
}

// ── mRNA horizontal strand + ribosome ────────────────────────
function MRNALayer({ visible, step, ribosomePos, ribX }) {
  const ref = useRef()

  useFrame(() => {
    if (!ref.current) return
    const v = visible.current
    ref.current.visible = v > 0.05
    // Fade via scale — smooth disappearance
    ref.current.scale.setScalar(Math.max(0.001, v))
    ref.current.position.y = (1 - v) * -2 // slide down as it fades
  })

  return (
    <group ref={ref}>
      {/* Base spheres */}
      {MRNA_BASES.map((base, i) => {
        const x = MRNA_X_START + i * MRNA_SPACING
        const isCurrentCodon = step >= 7 && Math.floor(i / 3) === ribosomePos
        return (
          <mesh key={i} position={[x, MRNA_Y, 0]}>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshStandardMaterial
              color={c(BASE_COLORS[base])} emissive={c(BASE_COLORS[base])}
              emissiveIntensity={isCurrentCodon ? 0.8 : 0.3} roughness={0.3}
            />
          </mesh>
        )
      })}

      {/* Backbone */}
      <mesh position={[(MRNA_X_START + (NUM_PAIRS - 1) * MRNA_SPACING) / 2 + MRNA_X_START / 2, MRNA_Y, 0]}>
        <boxGeometry args={[NUM_PAIRS * MRNA_SPACING, 0.04, 0.04]} />
        <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={0.2} />
      </mesh>

      {/* Codon brackets */}
      {CODONS.map((_, i) => {
        const cx = MRNA_X_START + i * 3 * MRNA_SPACING + MRNA_SPACING
        return (
          <mesh key={i} position={[cx, MRNA_Y - 0.35, 0]}>
            <boxGeometry args={[MRNA_SPACING * 2.6, 0.03, 0.03]} />
            <meshStandardMaterial color="#475569" emissive="#475569" emissiveIntensity={0.1} />
          </mesh>
        )
      })}

      {/* Ribosome */}
      <RibosomeMesh targetX={ribX} y={MRNA_Y} />
    </group>
  )
}

// ── Ribosome ─────────────────────────────────────────────────
function RibosomeMesh({ targetX, y }) {
  const ref = useRef()
  const posRef = useRef(targetX)

  useFrame((_, delta) => {
    if (!ref.current) return
    posRef.current = damp(posRef.current, targetX, 2.5, delta)
    ref.current.position.set(posRef.current, y, 0)
  })

  return (
    <group ref={ref} position={[targetX, y, 0]}>
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.55, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.3}
          transparent opacity={0.65} roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.4, 0]}>
        <sphereGeometry args={[0.65, 16, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.3}
          transparent opacity={0.65} roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// ── Amino acid chain — drops from ribosome position ──────────
function AminoChain({ aasBuilt, ribX }) {
  return (
    <group>
      {Array.from({ length: aasBuilt }, (_, i) => {
        // Each AA appears at the ribosome, then trails to the left in a chain
        const codonCenterX = MRNA_X_START + i * 3 * MRNA_SPACING + MRNA_SPACING
        return <AminoAcidSphere key={i} aa={AAS[i]}
          spawnX={ribX} finalX={codonCenterX} index={i} />
        })}

      {/* Connector line between amino acids */}
      {aasBuilt > 1 && (
        <AAConnector count={aasBuilt} />
      )}

      {/* tRNA label showing delivery */}
      {aasBuilt > 0 && (
        <TRNAIndicator x={MRNA_X_START + (aasBuilt - 1) * 3 * MRNA_SPACING + MRNA_SPACING} />
      )}
    </group>
  )
}

function AminoAcidSphere({ aa, spawnX, finalX, index }) {
  const ref = useRef()
  const scaleRef = useRef(0)
  const xRef = useRef(spawnX)
  const yRef = useRef(MRNA_Y) // starts at ribosome height
  const color = useMemo(() => c(AA_COLORS[aa] || '#818cf8'), [aa])

  useFrame((_, delta) => {
    if (!ref.current) return
    scaleRef.current = damp(scaleRef.current, 1, 4, delta)
    xRef.current = damp(xRef.current, finalX, 3, delta)
    yRef.current = damp(yRef.current, AA_Y, 3, delta)
    ref.current.scale.setScalar(scaleRef.current)
    ref.current.position.set(xRef.current, yRef.current, 0)
  })

  return (
    <mesh ref={ref} scale={0}>
      <sphereGeometry args={[0.35, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} roughness={0.3} />
    </mesh>
  )
}

// Connector line between amino acid spheres
function AAConnector({ count }) {
  const ref = useRef()

  useFrame(() => {
    if (!ref.current || count < 2) return
    const x0 = MRNA_X_START + 0 * 3 * MRNA_SPACING + MRNA_SPACING
    const x1 = MRNA_X_START + (count - 1) * 3 * MRNA_SPACING + MRNA_SPACING
    const midX = (x0 + x1) / 2
    const len = Math.abs(x1 - x0)
    ref.current.position.set(midX, AA_Y, 0)
    ref.current.scale.set(len, 1, 1)
  })

  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 0.05, 0.05]} />
      <meshStandardMaterial color="#818cf8" emissive="#818cf8" emissiveIntensity={0.3} />
    </mesh>
  )
}

// tRNA "delivery" indicator — small T-shape above the most recent AA
function TRNAIndicator({ x }) {
  const ref = useRef()
  const targetX = useRef(x)
  targetX.current = x

  useFrame((_, delta) => {
    if (!ref.current) return
    const curX = ref.current.position.x
    ref.current.position.x = damp(curX, targetX.current, 4, delta)
  })

  const armY = AA_Y + 0.8

  return (
    <group ref={ref} position={[x, 0, 0]}>
      {/* Stem */}
      <mesh position={[0, (AA_Y + armY) / 2, 0]}>
        <boxGeometry args={[0.06, armY - AA_Y, 0.06]} />
        <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={0.4} />
      </mesh>
      {/* Arms */}
      <mesh position={[0, armY, 0]}>
        <boxGeometry args={[0.6, 0.06, 0.06]} />
        <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={0.4} />
      </mesh>
      {/* Label dot */}
      <mesh position={[0, armY + 0.2, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={0.6} />
      </mesh>
    </group>
  )
}

// ── Folding Animation — protein alone, centered ──────────────
function FoldingAnimation() {
  const groupRef = useRef()
  const positionsRef = useRef(
    AAS.map((_, i) => {
      const codonX = MRNA_X_START + i * 3 * MRNA_SPACING + MRNA_SPACING
      return {
        current: new THREE.Vector3(codonX, AA_Y, 0),
        target: new THREE.Vector3(
          Math.cos((i / 4) * Math.PI * 2) * 0.45,
          Math.sin((i / 4) * Math.PI * 2) * 0.45,
          Math.sin((i / 4) * Math.PI) * 0.35
        ),
      }
    })
  )

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const children = groupRef.current.children
    positionsRef.current.forEach((p, i) => {
      if (!children[i]) return
      p.current.lerp(p.target, Math.min(1, delta * 1.8))
      children[i].position.copy(p.current)
    })
    groupRef.current.rotation.y += delta * 0.4
  })

  return (
    <group ref={groupRef}>
      {AAS.map((aa, i) => {
        const color = c(AA_COLORS[aa] || '#818cf8')
        const codonX = MRNA_X_START + i * 3 * MRNA_SPACING + MRNA_SPACING
        return (
          <mesh key={i} position={[codonX, AA_Y, 0]}>
            <sphereGeometry args={[0.45, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.3} />
          </mesh>
        )
      })}
      {/* Outer glow shell at center */}
      <mesh>
        <sphereGeometry args={[1.0, 16, 16]} />
        <meshStandardMaterial color="#818cf8" emissive="#818cf8" emissiveIntensity={0.15}
          transparent opacity={0.1} roughness={0.5} />
      </mesh>
    </group>
  )
}

// ── Exported Canvas (Learn Mode) ─────────────────────────────
export default function DNAHelix({ step = 0, className = '' }) {
  return (
    <div className={`dna-helix-container ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 14], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, -3, 3]} intensity={0.4} color="#818cf8" />
        <pointLight position={[0, -5, 5]} intensity={0.3} color="#4ade80" />

        <HelixScene step={step} />

        <OrbitControls enablePan={false} minDistance={5} maxDistance={16} autoRotate={false} />
      </Canvas>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  LAB TRANSCRIPTION CANVAS (Creature Lab)
// ══════════════════════════════════════════════════════════════

const LAB_SPEED = 120 // ms per base pair — fast for iteration
const LAB_TRANSLATE_SPEED = 300 // ms per codon during translation

// Broader palette for amino acid colors in lab mode
const LAB_AA_COLORS = {
  Met: '#ffa502', Gln: '#1dd1a1', Tyr: '#10ac84', Ala: '#ff6b6b',
  Ser: '#0abde3', Thr: '#48dbfb', Asn: '#00d2d3', Leu: '#ee5a24',
  Val: '#ff9f43', Ile: '#f368e0', Phe: '#e056fd', Trp: '#be2edd',
  Pro: '#fd79a8', Cys: '#01a3a4', Lys: '#feca57', Arg: '#ff9ff3',
  His: '#f9ca24', Asp: '#ff6348', Glu: '#eb4d4b', Gly: '#c8d6e5',
}

// Phases: idle → helicase → polymerase → drift → translation → folding → done
function LabScene({ template, active, onComplete }) {
  const groupRef = useRef()
  const separationRef = useRef(new Float32Array(NUM_PAIRS).fill(0))
  const [helicaseFront, setHelicaseFront] = useState(-1)
  const [polyFront, setPolyFront] = useState(-1)
  const [mRNABuilt, setMRNABuilt] = useState(0)
  const [phase, setPhase] = useState('idle')
  const [ribosomePos, setRibosomePos] = useState(0)
  const [aasBuilt, setAasBuilt] = useState(0)
  const [folding, setFolding] = useState(false)
  const completedRef = useRef(false)

  // Crossfade refs
  const helixOpacityRef = useRef(1)
  const translationOpacityRef = useRef(0)
  const mRNAVisRef = useRef(1)

  // Compute strands from template
  const codingBases = useMemo(() => getCodingStrand(template), [template])
  const mrnaBases = useMemo(() => transcribe(template), [template])
  const numPairs = template.length

  // Compute codons & amino acids for translation
  const labCodons = useMemo(() => splitCodons(mrnaBases), [mrnaBases])
  const { aminoAcids: labAAs, started: labStarted } = useMemo(() => translateAll(labCodons), [labCodons])
  const numCodons = labCodons.length
  const numAAs = labAAs.length

  // Helix geometry
  const { leftPositions, rightPositions } = useMemo(() => {
    const lp = [], rp = []
    for (let i = 0; i < numPairs; i++) {
      const t = i / (numPairs - 1)
      const angle = t * Math.PI * 2 * TURNS
      const y = (t - 0.5) * HELIX_HEIGHT
      lp.push({ x: HELIX_RADIUS * Math.cos(angle), y, z: HELIX_RADIUS * Math.sin(angle), angle })
      rp.push({ x: HELIX_RADIUS * Math.cos(angle + Math.PI), y, z: HELIX_RADIUS * Math.sin(angle + Math.PI), angle: angle + Math.PI })
    }
    return { leftPositions: lp, rightPositions: rp }
  }, [numPairs])

  const leftCurve = useMemo(() => {
    const pts = leftPositions.map(p => new THREE.Vector3(p.x, p.y, p.z))
    return new THREE.CatmullRomCurve3(pts)
  }, [leftPositions])

  const rightCurve = useMemo(() => {
    const pts = rightPositions.map(p => new THREE.Vector3(p.x, p.y, p.z))
    return new THREE.CatmullRomCurve3(pts)
  }, [rightPositions])

  // Reset when active changes
  useEffect(() => {
    if (active) {
      setHelicaseFront(-1)
      setPolyFront(-1)
      setMRNABuilt(0)
      setPhase('helicase')
      setRibosomePos(0)
      setAasBuilt(0)
      setFolding(false)
      completedRef.current = false
      helixOpacityRef.current = 1
      translationOpacityRef.current = 0
      mRNAVisRef.current = 1
    } else {
      setPhase('idle')
    }
  }, [active])

  // ── Helicase advances ──
  useEffect(() => {
    if (phase !== 'helicase' && phase !== 'polymerase') return
    if (helicaseFront >= numPairs - 1) return
    const timer = setTimeout(() => setHelicaseFront(f => f + 1), LAB_SPEED)
    return () => clearTimeout(timer)
  }, [phase, helicaseFront, numPairs])

  // ── Polymerase follows 3 pairs behind helicase ──
  useEffect(() => {
    if (helicaseFront >= 2 && phase === 'helicase') setPhase('polymerase')
  }, [helicaseFront, phase])

  useEffect(() => {
    if (phase !== 'polymerase') return
    if (polyFront >= numPairs - 1) return
    const target = Math.min(helicaseFront - 2, numPairs - 1)
    if (polyFront < target) {
      const timer = setTimeout(() => {
        setPolyFront(f => f + 1)
        setMRNABuilt(b => b + 1)
      }, LAB_SPEED)
      return () => clearTimeout(timer)
    }
  }, [phase, polyFront, helicaseFront, numPairs])

  // ── Polymerase done → mRNA drifts ──
  useEffect(() => {
    if (phase !== 'polymerase') return
    if (polyFront >= numPairs - 1) {
      const timer = setTimeout(() => setPhase('drift'), 300)
      return () => clearTimeout(timer)
    }
  }, [phase, polyFront, numPairs])

  // ── Drift → transition to translation ──
  useEffect(() => {
    if (phase !== 'drift') return
    const timer = setTimeout(() => {
      setPhase('translation')
      // Start with Met already recognized if start codon exists
      if (labStarted) { setRibosomePos(0); setAasBuilt(1) }
    }, 1200)
    return () => clearTimeout(timer)
  }, [phase, labStarted])

  // ── Translation: ribosome reads codons ──
  useEffect(() => {
    if (phase !== 'translation') return
    if (!labStarted || aasBuilt >= numAAs) {
      // Done translating — move to folding
      const timer = setTimeout(() => setPhase('folding'), 400)
      return () => clearTimeout(timer)
    }
    const timer = setTimeout(() => {
      setRibosomePos(p => p + 1)
      setAasBuilt(a => a + 1)
    }, LAB_TRANSLATE_SPEED)
    return () => clearTimeout(timer)
  }, [phase, aasBuilt, numAAs, labStarted])

  // ── Folding phase ──
  useEffect(() => {
    if (phase !== 'folding') return
    setFolding(true)
    const timer = setTimeout(() => {
      setPhase('done')
      if (onComplete && !completedRef.current) {
        completedRef.current = true
        onComplete()
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [phase, onComplete])

  // ── Rendering loop ──
  useFrame((_, delta) => {
    // Helix separation
    const sep = separationRef.current
    for (let i = 0; i < numPairs; i++) {
      let target = 0
      if (phase === 'helicase' || phase === 'polymerase') {
        target = i <= helicaseFront ? 1 : 0
      } else if (phase === 'drift') {
        target = 1 // still unzipped while mRNA drifts
      }
      // After drift, helix rezips (target stays 0)
      sep[i] = damp(sep[i], target, 4, delta)
    }

    // Crossfade helix vs translation
    const showHelix = phase === 'idle' || phase === 'helicase' || phase === 'polymerase' || phase === 'drift'
    const showTranslation = phase === 'translation' || phase === 'folding' || phase === 'done'
    helixOpacityRef.current = damp(helixOpacityRef.current, showHelix ? 1 : 0, 3, delta)
    translationOpacityRef.current = damp(translationOpacityRef.current, showTranslation ? 1 : 0, 3, delta)

    // mRNA fades during folding
    mRNAVisRef.current = damp(mRNAVisRef.current, folding ? 0 : 1, 2.5, delta)

    if (groupRef.current) {
      groupRef.current.rotation.y += delta * (phase === 'idle' ? 0.25 : 0)
    }
  })

  const ribX = MRNA_X_START + ribosomePos * MRNA_SPACING * 3 + MRNA_SPACING * 1.5

  return (
    <>
      {/* ── Transcription (helix) group ── */}
      <LabFadeGroup ref={groupRef} opacityRef={helixOpacityRef}>
        <BackboneStrand curve={leftCurve} positions={leftPositions} separationRef={separationRef} />
        <BackboneStrand curve={rightCurve} positions={rightPositions} separationRef={separationRef} isTemplate />

        {template.map((base, i) => (
          <BasePair key={i} index={i}
            leftBase={codingBases[i]} rightBase={base}
            leftPos={leftPositions[i]} rightPos={rightPositions[i]}
            separationRef={separationRef} />
        ))}

        {(phase === 'helicase' || phase === 'polymerase') && helicaseFront >= 0 && (
          <HelicaseMesh
            leftPositions={leftPositions}
            rightPositions={rightPositions}
            frontIndex={helicaseFront}
            separationRef={separationRef}
          />
        )}

        {phase === 'polymerase' && polyFront >= 0 && (
          <PolymeraseMesh
            positions={rightPositions}
            separationRef={separationRef}
            currentIndex={polyFront}
            approaching={false}
          />
        )}

        {mRNABuilt > 0 && phase !== 'translation' && phase !== 'folding' && phase !== 'done' && (
          <LabMRNAStrand
            bases={mrnaBases}
            positions={rightPositions}
            separationRef={separationRef}
            builtCount={mRNABuilt}
            drifting={phase === 'drift'}
          />
        )}
      </LabFadeGroup>

      {/* ── Translation group ── */}
      <LabTranslationScene
        opacityRef={translationOpacityRef}
        mRNAVisRef={mRNAVisRef}
        mrnaBases={mrnaBases}
        labCodons={labCodons}
        labAAs={labAAs}
        ribosomePos={ribosomePos}
        ribX={ribX}
        aasBuilt={aasBuilt}
        folding={folding}
        phase={phase}
      />
    </>
  )
}

// FadeGroup for the lab scene
const LabFadeGroup = forwardRef(function LabFadeGroup({ opacityRef, children }, ref) {
  const innerRef = useRef()
  const groupRef = ref || innerRef
  useFrame(() => {
    if (!groupRef.current) return
    const op = opacityRef.current
    const s = Math.max(0.001, op)
    groupRef.current.scale.setScalar(s)
    groupRef.current.visible = op > 0.01
  })
  return <group ref={groupRef}>{children}</group>
})

// ── Lab Translation Scene ────────────────────────────────────
function LabTranslationScene({ opacityRef, mRNAVisRef, mrnaBases, labCodons, labAAs, ribosomePos, ribX, aasBuilt, folding, phase }) {
  const groupRef = useRef()

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const op = opacityRef.current
    groupRef.current.scale.setScalar(Math.max(0.001, op))
    groupRef.current.visible = op > 0.01
  })

  return (
    <group ref={groupRef}>
      {/* mRNA strand + ribosome */}
      <LabMRNALayer
        visible={mRNAVisRef}
        mrnaBases={mrnaBases}
        labCodons={labCodons}
        ribosomePos={ribosomePos}
        ribX={ribX}
        phase={phase}
      />

      {/* Amino acid chain */}
      {!folding && aasBuilt > 0 && (
        <LabAminoChain aas={labAAs} aasBuilt={aasBuilt} ribX={ribX} />
      )}

      {/* Folding animation */}
      {folding && <LabFoldingAnimation aas={labAAs} />}
    </group>
  )
}

function LabMRNALayer({ visible, mrnaBases, labCodons, ribosomePos, ribX, phase }) {
  const ref = useRef()

  useFrame(() => {
    if (!ref.current) return
    const v = visible.current
    ref.current.visible = v > 0.05
    ref.current.scale.setScalar(Math.max(0.001, v))
    ref.current.position.y = (1 - v) * -2
  })

  const isTranslating = phase === 'translation' || phase === 'folding' || phase === 'done'

  return (
    <group ref={ref}>
      {/* Base spheres */}
      {mrnaBases.map((base, i) => {
        const x = MRNA_X_START + i * MRNA_SPACING
        const isCurrentCodon = isTranslating && Math.floor(i / 3) === ribosomePos
        return (
          <mesh key={i} position={[x, MRNA_Y, 0]}>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshStandardMaterial
              color={c(BASE_COLORS[base])} emissive={c(BASE_COLORS[base])}
              emissiveIntensity={isCurrentCodon ? 0.8 : 0.3} roughness={0.3}
            />
          </mesh>
        )
      })}

      {/* Backbone */}
      <mesh position={[(MRNA_X_START + (mrnaBases.length - 1) * MRNA_SPACING) / 2 + MRNA_X_START / 2, MRNA_Y, 0]}>
        <boxGeometry args={[mrnaBases.length * MRNA_SPACING, 0.04, 0.04]} />
        <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={0.2} />
      </mesh>

      {/* Codon brackets */}
      {labCodons.map((_, i) => {
        const cx = MRNA_X_START + i * 3 * MRNA_SPACING + MRNA_SPACING
        return (
          <mesh key={i} position={[cx, MRNA_Y - 0.35, 0]}>
            <boxGeometry args={[MRNA_SPACING * 2.6, 0.03, 0.03]} />
            <meshStandardMaterial color="#475569" emissive="#475569" emissiveIntensity={0.1} />
          </mesh>
        )
      })}

      {/* Ribosome */}
      {isTranslating && <RibosomeMesh targetX={ribX} y={MRNA_Y} />}
    </group>
  )
}

function LabAminoChain({ aas, aasBuilt, ribX }) {
  return (
    <group>
      {Array.from({ length: Math.min(aasBuilt, aas.length) }, (_, i) => {
        const codonCenterX = MRNA_X_START + i * 3 * MRNA_SPACING + MRNA_SPACING
        const aaColor = LAB_AA_COLORS[aas[i]] || '#818cf8'
        return <LabAASphere key={i} aa={aas[i]} color={aaColor}
          spawnX={ribX} finalX={codonCenterX} />
      })}

      {aasBuilt > 1 && (
        <AAConnector count={Math.min(aasBuilt, aas.length)} />
      )}
    </group>
  )
}

function LabAASphere({ aa, color, spawnX, finalX }) {
  const ref = useRef()
  const scaleRef = useRef(0)
  const xRef = useRef(spawnX)
  const yRef = useRef(MRNA_Y)
  const col = useMemo(() => c(color), [color])

  useFrame((_, delta) => {
    if (!ref.current) return
    scaleRef.current = damp(scaleRef.current, 1, 4, delta)
    xRef.current = damp(xRef.current, finalX, 3, delta)
    yRef.current = damp(yRef.current, AA_Y, 3, delta)
    ref.current.scale.setScalar(scaleRef.current)
    ref.current.position.set(xRef.current, yRef.current, 0)
  })

  return (
    <mesh ref={ref} scale={0}>
      <sphereGeometry args={[0.35, 16, 16]} />
      <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.7} roughness={0.3} />
    </mesh>
  )
}

function LabFoldingAnimation({ aas }) {
  const groupRef = useRef()
  const positionsRef = useRef(
    aas.map((_, i) => {
      const codonX = MRNA_X_START + i * 3 * MRNA_SPACING + MRNA_SPACING
      return {
        current: new THREE.Vector3(codonX, AA_Y, 0),
        target: new THREE.Vector3(
          Math.cos((i / Math.max(aas.length, 1)) * Math.PI * 2) * 0.5,
          Math.sin((i / Math.max(aas.length, 1)) * Math.PI * 2) * 0.5,
          Math.sin((i / Math.max(aas.length, 1)) * Math.PI) * 0.4
        ),
      }
    })
  )

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const children = groupRef.current.children
    positionsRef.current.forEach((p, i) => {
      if (!children[i]) return
      p.current.lerp(p.target, Math.min(1, delta * 1.8))
      children[i].position.copy(p.current)
    })
    groupRef.current.rotation.y += delta * 0.4
  })

  return (
    <group ref={groupRef}>
      {aas.map((aa, i) => {
        const color = c(LAB_AA_COLORS[aa] || '#818cf8')
        const codonX = MRNA_X_START + i * 3 * MRNA_SPACING + MRNA_SPACING
        return (
          <mesh key={i} position={[codonX, AA_Y, 0]}>
            <sphereGeometry args={[0.45, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.3} />
          </mesh>
        )
      })}
      <mesh>
        <sphereGeometry args={[1.0, 16, 16]} />
        <meshStandardMaterial color="#818cf8" emissive="#818cf8" emissiveIntensity={0.15}
          transparent opacity={0.1} roughness={0.5} />
      </mesh>
    </group>
  )
}

function LabMRNAStrand({ bases, positions, separationRef, builtCount, drifting }) {
  return (
    <group>
      {bases.slice(0, builtCount).map((base, i) => (
        <MRNABase key={i} index={i} base={base} templatePos={positions[i]}
          separationRef={separationRef} drifting={drifting} />
      ))}
    </group>
  )
}

export function LabTranscriptionCanvas({ template, active, onComplete, className = '' }) {
  return (
    <div className={`lab-transcription-container ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 14], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, -3, 3]} intensity={0.4} color="#818cf8" />
        <pointLight position={[0, -5, 5]} intensity={0.3} color="#4ade80" />

        <LabScene template={template} active={active} onComplete={onComplete} />

        <OrbitControls enablePan={false} minDistance={8} maxDistance={18} autoRotate={false} />
      </Canvas>
    </div>
  )
}
