import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { AnimationMixer, Group, LoopRepeat, MathUtils } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const MODEL_URL = `${import.meta.env.BASE_URL}models/portrait_animation.glb`;

const NECK_PIVOT_Y = -1.3; // the head turns around the base of the neck
const MAX_YAW = MathUtils.degToRad(15);
const MAX_PITCH = MathUtils.degToRad(8);
const POINTER_GAZE_WEIGHT = 0.25;
const BLINK_SPEED = 0.5;

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

export default function PortraitModel({
  reducedMotion = false,
  progressSourceRef,
}) {
  const gl = useThree((state) => state.gl);
  const gltf = useLoader(GLTFLoader, MODEL_URL);
  const portrait = useMemo(() => buildPortrait(gltf.scene), [gltf]);
  const mixer = useMemo(() => new AnimationMixer(portrait.root), [portrait]);
  const input = useRef({ x: 0, y: 0 });
  const motion = useRef({ yaw: 0, pitch: 0 });

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
    const { pivot } = portrait;
    const pose = input.current;

    if (reducedMotion) {
      pivot.rotation.set(0, 0, 0);
      return undefined;
    }

    // The head follows the pointer only while it is over the hero section. When the pointer
    // leaves the section or the window, the head keeps its last direction until it returns.
    const zone = gl.domElement.closest("section") ?? window;

    // Only remember the latest pointer position; the maths runs once per frame.
    const onMove = (event) => {
      pose.x = MathUtils.clamp((event.clientX / window.innerWidth) * 2 - 1, -1, 1);
      pose.y = MathUtils.clamp((event.clientY / window.innerHeight) * 2 - 1, -1, 1);
    };

    zone.addEventListener("pointermove", onMove, { passive: true });

    return () => zone.removeEventListener("pointermove", onMove);
  }, [gl, portrait, reducedMotion]);

  useFrame((_, delta) => {
    mixer.update(delta);
    if (reducedMotion) return;

    const dt = Math.min(delta, 0.05);
    const { pivot } = portrait;
    const pose = input.current;
    const m = motion.current;
    const progress = Number.parseFloat(
      progressSourceRef?.current?.style.getPropertyValue("--journey-progress"),
    ) || 0;
    const targetYaw = MathUtils.clamp(
      progress * MAX_YAW + pose.x * MAX_YAW * POINTER_GAZE_WEIGHT,
      -MAX_YAW,
      MAX_YAW,
    );

    // Scroll primarily turns toward the timeline; pointer input adds a smaller offset.
    m.yaw = MathUtils.damp(m.yaw, targetYaw, 4.5, dt);
    m.pitch = MathUtils.damp(
      m.pitch,
      pose.y * MAX_PITCH * POINTER_GAZE_WEIGHT,
      4.5,
      dt,
    );
    pivot.rotation.set(m.pitch, m.yaw, 0);
  });

  return (
    <group position={[0, 0.8, 0]}>
      <primitive object={portrait.root} />
    </group>
  );
}4