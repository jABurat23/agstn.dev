import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { AnimationMixer, Group, LoopRepeat, MathUtils } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { PORTRAIT_STATES, lerpDeep } from "./portraitStates";

const MODEL_URL = `${import.meta.env.BASE_URL}models/portrait_animation_v2.glb`;

const NECK_PIVOT_Y = -1.5; // the head turns around the base of the neck
const MAX_YAW = MathUtils.degToRad(15);
const MAX_PITCH = MathUtils.degToRad(8);
const BLINK_SPEED = 0.5;
const TILT_DURATION = 0.7; // seconds
const TILT_AMOUNT = MathUtils.degToRad(5);
const ABOUT_ENTRY_T = 0.5;
const SETTLE_EPSILON = 1e-3;

const clamp01 = (value) => Math.min(Math.max(value, 0), 1);
const smoothstep = (x) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
const isMobileLayout = () => window.matchMedia("(max-width: 760px)").matches;

// Preserve the GLB's original hierarchy so its animation tracks keep their local transforms.
function buildPortrait(sourceScene) {
  const scene = sourceScene.clone(true);
  const root = new Group();
  const shoulder = scene.getObjectByName("shoulder");
  if (shoulder) root.attach(shoulder);

  const pivot = new Group();
  pivot.position.set(0, NECK_PIVOT_Y, 0);
  const modelOffset = new Group();
  modelOffset.position.set(0, -NECK_PIVOT_Y, 0);
  pivot.add(modelOffset);
  root.add(pivot);
  modelOffset.attach(scene);

  return { root, pivot };
}

// One piecewise blend: hero -> about by t, then about -> experience by e.
function blendPortrait(t, e) {
  const inExperience = e > 0;
  const from = inExperience ? PORTRAIT_STATES.about : PORTRAIT_STATES.hero;
  const to = inExperience ? PORTRAIT_STATES.experience : PORTRAIT_STATES.about;
  const mix = smoothstep(inExperience ? e : t);
  return {
    pose: lerpDeep(from.pose, to.pose, mix),
    light: lerpDeep(from.light, to.light, mix),
    framing: lerpDeep(from.framing, to.framing, mix),
  };
}

export default function PortraitModel({
  reducedMotion = false,
  progressSourceRef,
}) {
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);
  const gltf = useLoader(GLTFLoader, MODEL_URL);
  const portrait = useMemo(() => buildPortrait(gltf.scene), [gltf]);
  const mixer = useMemo(() => new AnimationMixer(portrait.root), [portrait]);

  const groupRef = useRef();
  const hemiRef = useRef();
  const keyRef = useRef();
  const rimCyanRef = useRef();
  const rimBlueRef = useRef();
  const input = useRef({ x: 0, y: 0 });
  const motion = useRef({ yaw: 0, pitch: 0, roll: 0 });
  const tilt = useRef({ start: -1, active: false });

  useEffect(() => {
    for (const clip of gltf.animations) {
      mixer
        .clipAction(clip)
        .setLoop(LoopRepeat, Infinity)
        .setEffectiveTimeScale(BLINK_SPEED)
        .play();
    }

    return () => mixer.stopAllAction();
  }, [gltf.animations, mixer]);

  useEffect(() => {
    if (reducedMotion) return undefined;

    // The head follows the pointer only while it is over the hero section. When the pointer
    // leaves the section or the window, the head keeps its last direction until it returns.
    const zone = gl.domElement.closest("section") ?? window;

    // Only remember the latest pointer position; the maths runs once per frame.
    const onMove = (event) => {
      input.current.x = MathUtils.clamp((event.clientX / window.innerWidth) * 2 - 1, -1, 1);
      input.current.y = MathUtils.clamp((event.clientY / window.innerHeight) * 2 - 1, -1, 1);
    };

    zone.addEventListener("pointermove", onMove, { passive: true });

    return () => zone.removeEventListener("pointermove", onMove);
  }, [gl, reducedMotion]);

  useFrame((state, delta) => {
    mixer.update(delta);

    const dt = Math.min(delta, 0.05);
    const style = progressSourceRef?.current?.style;
    const t = clamp01(Number.parseFloat(style?.getPropertyValue("--journey-t")) || 0);
    const e = clamp01(Number.parseFloat(style?.getPropertyValue("--journey-e")) || 0);
    const view = blendPortrait(t, e);

    // Pointer input is scaled by the step's gaze weight and dropped under reduced motion.
    const gaze = reducedMotion ? 0 : view.pose.gazeWeight;
    const pose = reducedMotion ? { x: 0, y: 0 } : input.current;
    const targetYaw = view.pose.yaw + pose.x * MAX_YAW * gaze;
    const targetPitch = pose.y * MAX_PITCH * gaze;

    // One-time small head tilt when About is entered; re-armed after leaving About.
    let targetRoll = 0;
    if (!reducedMotion) {
      const inAbout = e === 0 && t > ABOUT_ENTRY_T;
      if (inAbout && !tilt.current.active) tilt.current.start = state.clock.elapsedTime;
      tilt.current.active = inAbout;
      if (tilt.current.start >= 0) {
        const elapsed = state.clock.elapsedTime - tilt.current.start;
        if (elapsed < TILT_DURATION) {
          targetRoll = -Math.sin(Math.PI * (elapsed / TILT_DURATION)) * TILT_AMOUNT;
        }
      }
    }

    const m = motion.current;
    let settled;
    if (reducedMotion) {
      // States snap; no easing, no tilt.
      m.yaw = targetYaw;
      m.pitch = targetPitch;
      m.roll = targetRoll;
      settled = true;
    } else {
      m.yaw = MathUtils.damp(m.yaw, targetYaw, 4.5, dt);
      m.pitch = MathUtils.damp(m.pitch, targetPitch, 4.5, dt);
      m.roll = MathUtils.damp(m.roll, targetRoll, 5.5, dt);
      settled =
        Math.abs(m.yaw - targetYaw) < SETTLE_EPSILON &&
        Math.abs(m.pitch - targetPitch) < SETTLE_EPSILON &&
        Math.abs(m.roll - targetRoll) < SETTLE_EPSILON;
    }
    portrait.pivot.rotation.set(m.pitch, m.yaw, m.roll);

    // The portrait owns its lights (its own Canvas, not shared with the background).
    if (hemiRef.current) hemiRef.current.intensity = view.light.hemi;
    if (keyRef.current) keyRef.current.intensity = view.light.key;
    if (rimCyanRef.current) rimCyanRef.current.intensity = view.light.rimCyan;
    if (rimBlueRef.current) rimBlueRef.current.intensity = view.light.rimBlue;

    // Full scale on desktop; a mild zoom on phones.
    const mobile = isMobileLayout();
    const scale = mobile ? 1 + (view.framing.scale - 1) * 0.3 : view.framing.scale;
    if (groupRef.current) groupRef.current.scale.setScalar(scale);

    // frameloop is "demand" while the portrait is offscreen; keep asking for
    // frames until the damping settles.
    if (!settled) invalidate();
  });

  return (
    <>
      <hemisphereLight
        ref={hemiRef}
        args={["#cfe6ff", "#0d1420", PORTRAIT_STATES.hero.light.hemi]}
      />
      <directionalLight
        ref={keyRef}
        color="#ffffff"
        intensity={PORTRAIT_STATES.hero.light.key}
        position={[2, 3, 5]}
      />
      <directionalLight
        ref={rimCyanRef}
        color="#62e6f2"
        intensity={PORTRAIT_STATES.hero.light.rimCyan}
        position={[-4, 1, -3]}
      />
      <directionalLight
        ref={rimBlueRef}
        color="#5b8cff"
        intensity={PORTRAIT_STATES.hero.light.rimBlue}
        position={[4, -1, -2]}
      />
      <group ref={groupRef} position={[0, 0.8, 0]}>
        <primitive object={portrait.root} />
      </group>
    </>
  );
}
