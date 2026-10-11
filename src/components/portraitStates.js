import { MathUtils } from "three";

// Pointer-follow strength the app already uses; the hero step keeps it exactly.
export const POINTER_GAZE_WEIGHT = 0.25;

// Pose, lighting and scale for each step of the journey.
// Facing (from portrait_animation.glb): the nose sits at +Z and the camera at
// +Z, so a positive yaw turns the head to the viewer's right — toward the copy
// and the timeline, which both sit on the right.
export const PORTRAIT_STATES = {
  hero: {
    pose: { yaw: 0, gazeWeight: POINTER_GAZE_WEIGHT },
    light: { key: 2.2, rimCyan: 3.0, rimBlue: 1.8, hemi: 1.2 },
    framing: { scale: 1 },
  },
  about: {
    pose: { yaw: MathUtils.degToRad(12), gazeWeight: 0.1 },
    light: { key: 3.0, rimCyan: 1.8, rimBlue: 2.2, hemi: 1.6 },
    framing: { scale: 1.05 },
  },
  experience: {
    pose: { yaw: MathUtils.degToRad(20), gazeWeight: 0 },
    light: { key: 1.4, rimCyan: 2.0, rimBlue: 3.2, hemi: 0.9 },
    framing: { scale: 0.82 },
  },
};

// One generic lerp that walks any nested object of numbers.
export function lerpDeep(a, b, t) {
  if (typeof a === "number") return a + (b - a) * t;
  const out = {};
  for (const key of Object.keys(a)) out[key] = lerpDeep(a[key], b[key], t);
  return out;
}
