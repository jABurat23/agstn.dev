import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import DocketObject from './DocketObject'

// Accent colour per section as the page scrolls: cyan -> blue -> light blue -> cyan
const PALETTE = ['#62E6F2', '#5B8CFF', '#8FA6FF', '#62E6F2'].map((c) => new THREE.Color(c))

// ---- scroll response tunables (option C: depth travel + parallax) ----
// Shapes travel along z and are recycled in the same fixed set. Every shape is
// assigned one layer below, so deeper layers move slower than the near ones.
// Set SWAY and CURSOR_PARALLAX to 0 for the plain depth-travel look (option B).
const DEPTH_LAYERS = [
  { from: -38, to: 4, speed: 0.65 }, // far
  { from: -28, to: 8, speed: 1 }, // mid
  { from: -16, to: 10, speed: 1.5 }, // near
]
const SWAY = 2.5 // world units the whole group sways sideways across the scroll
const CURSOR_PARALLAX = 0.05 // radians of group tilt from the damped cursor (desktop only)
const EDGE_IN = 0.12 // fade in over the first 12% of the travel
const EDGE_OUT = 0.4 // fade out over the last 40%: near shapes never reach the text
const COUNTS = { desktop: 42, phone: 22 }

const isMobile = () => window.matchMedia('(max-width: 720px)').matches
const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

function seeded(seed) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const frac = (v) => v - Math.floor(v)

function Shapes({ count, reduce, dark, mobile, glowRef }) {
  const { camera, size, invalidate } = useThree()
  const keyLight = useRef()
  const group = useRef()
  const meshes = useRef([])
  const pointer = useRef({ x: 0, y: 0 })
  const st = useRef({ mx: 0, my: 0, sp: 0, tp: 0, sig: '' })
  const mood = useMemo(() => new THREE.Color(), [])

  const geos = useMemo(
    () => [
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.TetrahedronGeometry(1.15, 0),
      new THREE.OctahedronGeometry(1, 0),
    ],
    [],
  )
  // Same per-item layout as the approved preview. Y is recentred because the
  // camera is fixed now (the old code panned the camera down a y = 6 - r()*26 field).
  const items = useMemo(() => {
    const r = seeded(7)
    const r2 = seeded(31)
    return Array.from({ length: count }, (_, i) => {
      const y = (r() - 0.5) * 16
      return {
        i,
        scale: 0.3 + r() * 0.8,
        baseX: (r() - 0.5) * 34,
        baseY: y,
        baseZ: (r() - 0.6) * 18,
        rotX: r() * 6,
        rotY: r() * 6,
        speed: 0.08 + r() * 0.22,
        phase: r() * 6,
        offset: r2(),
        layer: Math.floor(r2() * DEPTH_LAYERS.length),
      }
    })
  }, [count])
  // One material per shape so each can fade on its own near the camera.
  const mats = useMemo(() => {
    const colors = dark ? [0x16233a, 0x1c2d4a, 0x101a2c] : [0xc4d4ee, 0xd3dff2, 0xb3c7e8]
    return items.map(
      (o) =>
        new THREE.MeshStandardMaterial({
          color: colors[o.i % 3],
          flatShading: true,
          roughness: 0.55,
          metalness: 0.1,
          transparent: true,
          opacity: 1,
        }),
    )
  }, [items, dark])
  useEffect(() => () => mats.forEach((m) => m.dispose()), [mats])
  useEffect(() => () => geos.forEach((g) => g.dispose()), [geos])

  useEffect(() => {
    const readScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      st.current.tp = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      invalidate()
    }
    const onMove = (e) => {
      if (reduce) return
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    readScroll()
    window.addEventListener('scroll', readScroll, { passive: true })
    window.addEventListener('resize', readScroll)
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('scroll', readScroll)
      window.removeEventListener('resize', readScroll)
      window.removeEventListener('pointermove', onMove)
    }
  }, [reduce, invalidate])

  useFrame((_, delta) => {
    const s = st.current
    const dt = reduce ? 0 : Math.min(delta, 0.05)
    const t = performance.now() / 1000

    // Damped cursor (desktop only: forced to 0 on phones, so no parallax there).
    const k = Math.min(1, dt * 3)
    s.mx += ((mobile ? 0 : pointer.current.x) - s.mx) * k
    s.my += ((mobile ? 0 : pointer.current.y) - s.my) * k
    s.sp += (s.tp - s.sp) * (reduce ? 1 : Math.min(1, dt * 4))
    const p = s.sp

    // mood: light colour + CSS glow follow the scroll position
    const f = p * (PALETTE.length - 1)
    const i = Math.min(PALETTE.length - 2, Math.floor(f))
    mood.copy(PALETTE[i]).lerp(PALETTE[i + 1], f - i)
    if (keyLight.current) keyLight.current.color.copy(mood)
    // only touch the CSS glow when its values actually change (it repaints a full-screen gradient)
    const hex = mood.getHexString()
    const gx = (74 - p * 44).toFixed(1)
    const gy = (16 + p * 64).toFixed(1)
    const sig = `${hex}${gx}${gy}`
    const el = glowRef.current
    if (el && sig !== s.sig) {
      s.sig = sig
      el.style.setProperty('--gc', `#${hex}`)
      el.style.setProperty('--gx', `${gx}%`)
      el.style.setProperty('--gy', `${gy}%`)
    }

    items.forEach((o) => {
      const m = meshes.current[o.i]
      if (!m) return
      // idle drift stays underneath the scroll response
      m.rotation.x += o.speed * dt
      m.rotation.y += o.speed * 0.7 * dt
      // depth travel: recycle within the layer's fixed range
      const layer = DEPTH_LAYERS[o.layer]
      const prog = frac(p * layer.speed + o.offset)
      m.position.set(
        o.baseX,
        o.baseY + (reduce ? 0 : Math.sin(t * 0.4 + o.phase) * 0.35),
        layer.from + prog * (layer.to - layer.from),
      )
      // fade both ends so wraps never pop and near shapes never reach the text
      const opacity = Math.min(clamp01(prog / EDGE_IN), clamp01((1 - prog) / EDGE_OUT))
      m.material.opacity = opacity
      m.visible = opacity > 0.002 // fully faded shapes cost no draw call
    })

    // small scroll-linked sway + very small damped cursor parallax
    if (group.current) {
      group.current.position.set(Math.sin(p * Math.PI * 2) * SWAY, 0, 0)
      group.current.rotation.set(s.my * CURSOR_PARALLAX, s.mx * CURSOR_PARALLAX, 0)
    }

    // Camera stays fixed; only the field of view follows the aspect ratio.
    const fov = size.width / size.height < 1 ? 62 : 50
    if (camera.fov !== fov) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }

    // frameloop="demand": keep the idle drift (and the shared DocketObject) animating
    if (!reduce) invalidate()
  })

  return (
    <>
      <fog attach="fog" args={[dark ? '#070B12' : '#FFFFFF', 20, 55]} />
      <ambientLight color={dark ? '#3a4a66' : '#dfe8ff'} intensity={dark ? 2.8 : 2.4} />
      <directionalLight ref={keyLight} position={[4, 6, 6]} intensity={dark ? 3.9 : 2.6} />
      <pointLight color="#5B8CFF" position={[-8, 2, 6]} intensity={dark ? 5 : 3} distance={60} decay={1} />
      <group ref={group}>
        {items.map((o) => (
          <mesh
            key={o.i}
            ref={(m) => (meshes.current[o.i] = m)}
            geometry={geos[o.i % 3]}
            material={mats[o.i]}
            position={[o.baseX, o.baseY, o.baseZ]}
            rotation={[o.rotX, o.rotY, 0]}
            scale={o.scale}
          />
        ))}
      </group>
    </>
  )
}

export default function DriftBackground({ dark = true }) {
  const glowRef = useRef(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => setShown(true))
    })
    return () => cancelAnimationFrame(id)
  }, [])
  const { mobile, reduce, webgl } = useMemo(
    () => ({ mobile: isMobile(), reduce: prefersReduced(), webgl: hasWebGL() }),
    [],
  )

  return (
    <>
      {/* soft glow; also the fallback when WebGL is unavailable */}
      <div
        ref={glowRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          opacity: shown ? 1 : 0,
          transition: reduce ? 'none' : 'opacity 1.6s ease',
          '--gc': '#62E6F2',
          '--gx': '74%',
          '--gy': '16%',
          background:
            'radial-gradient(60vmax 50vmax at var(--gx) var(--gy), color-mix(in srgb, var(--gc) 16%, transparent), transparent 70%)',
        }}
      />
      {webgl && (
        <Canvas
          aria-hidden="true"
          frameloop="demand"
          dpr={[1, mobile ? 1.25 : 1.5]}
          gl={{ alpha: true, antialias: !mobile, powerPreference: 'low-power' }}
          camera={{ fov: 50, near: 0.1, far: 200, position: [0, 0, 14] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            opacity: shown ? 1 : 0,
            transition: reduce ? 'none' : 'opacity 1.6s ease',
          }}
        >
          <Shapes
            count={mobile ? COUNTS.phone : COUNTS.desktop}
            reduce={reduce}
            dark={dark}
            mobile={mobile}
            glowRef={glowRef}
          />
          <DocketObject dark={dark} reduce={reduce} />
        </Canvas>
      )}
    </>
  )
}