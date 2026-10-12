import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useThemeColors } from '../themeColors'

// Renders inside the background canvas (no extra WebGL context). The object is
// pinned on screen to the element marked data-docket-zone in the Projects row.
const ZONE_SELECTOR = '[data-docket-zone]'
const DOCKET_NAMES = ['--docket-panel', '--docket-accent', '--docket-edge']
const NOMINAL_HEIGHT = 2.8 // object height in world units at scale 1

const LINK_A = new THREE.Vector3(-0.95, -0.7, 0.2) // Pipeline
const LINK_B = new THREE.Vector3(-0.95, 0.7, 0) // Budget
const BARS = [
  [-0.5, 0.4, 0.22],
  [-0.1, 0.6, 0],
  [0.04, 0.28, -0.22],
] // [x, width, y]
const PANELS = [
  { id: 'budget', pos: [-0.95, 0.7, 0] },
  { id: 'report', pos: [0.95, 0.7, -0.25] },
  { id: 'pipeline', pos: [-0.95, -0.7, 0.2] },
  { id: 'goals', pos: [0.95, -0.7, -0.1], dim: true }, // not built yet, so it stays faint
]

export default function DocketObject({ dark, reduce }) {
  const group = useRef()
  const pipeline = useRef()
  const pulseA = useRef()
  const pulseB = useRef()
  const zoneEl = useRef(null)
  const presence = useRef(0)
  const { camera, size } = useThree()

  const [panel, accent, edge] = useThemeColors(DOCKET_NAMES, dark)
  const colors = useMemo(() => ({ panel, accent, edge }), [panel, accent, edge])
  const boxGeo = useMemo(() => new THREE.BoxGeometry(1.5, 0.95, 0.05), [])
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(boxGeo), [boxGeo])
  const link = useMemo(
    () =>
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([LINK_A, LINK_B]),
        new THREE.LineBasicMaterial({ color: colors.edge, transparent: true, opacity: 0.75 }),
      ),
    [colors.edge],
  )
  const ray = useMemo(() => new THREE.Vector3(), [])

  useEffect(
    () => () => {
      boxGeo.dispose()
      edgeGeo.dispose()
    },
    [boxGeo, edgeGeo],
  )
  useEffect(
    () => () => {
      link.geometry.dispose()
      link.material.dispose()
    },
    [link],
  )

  useFrame(({ clock }, delta) => {
    const g = group.current
    if (!g) return

    if (!zoneEl.current || !zoneEl.current.isConnected) zoneEl.current = document.querySelector(ZONE_SELECTOR)
    const r = zoneEl.current ? zoneEl.current.getBoundingClientRect() : null
    const onScreen = !!r && r.width > 40 && r.height > 40

    // show the object while its row is near the middle of the viewport
    let want = 0
    if (onScreen) {
      const cy = r.top + r.height / 2
      want = Math.abs(cy - size.height / 2) / (size.height * 0.7) < 1 ? 1 : 0
    }
    presence.current += (want - presence.current) * (reduce ? 1 : Math.min(1, delta * 6))
    const s = presence.current
    g.visible = s > 0.01 && onScreen
    if (!g.visible) return

    // screen position of the zone -> world position on the z = 0 plane
    camera.updateMatrixWorld()
    ray
      .set(((r.left + r.width / 2) / size.width) * 2 - 1, -(((r.top + r.height / 2) / size.height) * 2 - 1), 0.5)
      .unproject(camera)
      .sub(camera.position)
      .normalize()
    const dist = -camera.position.z / ray.z
    g.position.copy(camera.position).addScaledVector(ray, dist)

    const unit = (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * Math.abs(camera.position.z)) / size.height
    const base = (Math.min(r.height * 1.1, r.width * 0.7) * unit) / NOMINAL_HEIGHT
    g.scale.setScalar(Math.max(base * s, 0.0001))

    const t = reduce ? 0 : clock.elapsedTime
    g.rotation.set(-0.15, reduce ? 0.5 : Math.sin(t * 0.4) * 0.5, 0)
    if (pipeline.current) pipeline.current.position.z = 0.2 + Math.sin(t * 1.2) * 0.04
    if (pulseA.current) pulseA.current.position.lerpVectors(LINK_A, LINK_B, (t * 0.45) % 1)
    if (pulseB.current) pulseB.current.position.lerpVectors(LINK_A, LINK_B, (t * 0.45 + 0.5) % 1)
  })

  return (
    <group ref={group} visible={false}>
      {PANELS.map(({ id, pos, dim }) => (
        <group key={id} ref={id === 'pipeline' ? pipeline : undefined} position={pos}>
          <mesh geometry={boxGeo}>
            <meshStandardMaterial
              color={colors.panel}
              flatShading
              roughness={0.5}
              metalness={0.2}
              transparent={!!dim}
              opacity={dim ? 0.28 : 1}
            />
          </mesh>
          <lineSegments geometry={edgeGeo}>
            <lineBasicMaterial color={colors.edge} transparent opacity={dim ? 0.3 : 0.75} />
          </lineSegments>
          {BARS.map(([x, w, y]) => (
            <mesh key={x} position={[x, y, 0.04]}>
              <boxGeometry args={[w, 0.07, 0.02]} />
              <meshBasicMaterial color={dim ? colors.panel : colors.accent} />
            </mesh>
          ))}
        </group>
      ))}
      <primitive object={link} />
      {[pulseA, pulseB].map((ref, i) => (
        <mesh key={i} ref={ref}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={colors.accent} />
        </mesh>
      ))}
    </group>
  )
}