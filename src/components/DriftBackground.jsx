import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import DocketObject from './DocketObject'

// Accent colour per section as the page scrolls: cyan -> blue -> light blue -> cyan
const PALETTE = ['#62E6F2', '#5B8CFF', '#8FA6FF', '#62E6F2'].map((c) => new THREE.Color(c))

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

function Shapes({ count, reduce, dark, glowRef }) {
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
  const mats = useMemo(
    () =>
      (dark ? [0x16233a, 0x1c2d4a, 0x101a2c] : [0xc4d4ee, 0xd3dff2, 0xb3c7e8]).map(
        (color) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.55, metalness: 0.1 }),
      ),
    [dark],
  )
  useEffect(() => () => mats.forEach((m) => m.dispose()), [mats])
  useEffect(() => () => geos.forEach((g) => g.dispose()), [geos])
  const items = useMemo(() => {
    const r = seeded(7)
    return Array.from({ length: count }, (_, i) => {
      const y = 6 - r() * 26
      return {
        i,
        scale: 0.3 + r() * 0.8,
        pos: [(r() - 0.5) * 34, y, (r() - 0.6) * 18],
        rot: [r() * 6, r() * 6, 0],
        speed: 0.08 + r() * 0.22,
        phase: r() * 6,
        baseY: y,
      }
    })
  }, [count])

  useEffect(() => {
    const readScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      st.current.tp = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      if (reduce) invalidate()
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

    const k = Math.min(1, dt * 3)
    s.mx += (pointer.current.x - s.mx) * k
    s.my += (pointer.current.y - s.my) * k
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
      m.rotation.x += o.speed * dt
      m.rotation.y += o.speed * 0.7 * dt
      m.position.y = o.baseY + Math.sin(t * 0.4 + o.phase) * 0.35
    })
    if (group.current) group.current.rotation.y = s.mx * 0.12

    const fov = size.width / size.height < 1 ? 62 : 50
    if (camera.fov !== fov) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
    camera.position.set(s.mx * 1.2, -p * 18 + s.my * 0.6, 14)
    camera.lookAt(s.mx * 0.4, -p * 18, 0)
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
            material={mats[o.i % 3]}
            position={o.pos}
            rotation={o.rot}
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
          frameloop={reduce ? 'demand' : 'always'}
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
          <Shapes count={mobile ? 22 : 42} reduce={reduce} dark={dark} glowRef={glowRef} />
          <DocketObject dark={dark} reduce={reduce} />
        </Canvas>
      )}
    </>
  )
}