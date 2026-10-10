import { useEffect, useRef } from "react";

const FOLLOW_SPEED = 18; // higher = snappier, lower = more trailing
const INTERACTIVE = "a, button, [role='button'], summary, input, select, textarea, label";
const HOVER_SCALE = 0.4; // the ring shrinks to this fraction of its size over links and buttons

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const ring = ringRef.current;
    if (!cursor || !ring) return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = { x: -100, y: -100 };
    const current = { x: -100, y: -100 };
    let frame = 0;
    let last = 0;
    let running = false;
    let placed = false;

    if (reducedMotion) ring.style.transition = "none";

    const place = () => {
      cursor.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%)`;
    };

    // One frame loop eases the ring toward the pointer, then stops once it arrives.
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const ease = reducedMotion ? 1 : 1 - Math.exp(-FOLLOW_SPEED * dt);
      current.x += (target.x - current.x) * ease;
      current.y += (target.y - current.y) * ease;
      place();

      if (Math.abs(target.x - current.x) < 0.05 && Math.abs(target.y - current.y) < 0.05) {
        running = false;
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    // The handler only stores the latest position; no React state, no layout work.
    const onMove = (event) => {
      target.x = event.clientX;
      target.y = event.clientY;

      if (!placed) {
        placed = true;
        current.x = target.x;
        current.y = target.y;
        place();
      }
      if (!running) {
        running = true;
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };

    // Runs only when the pointer enters a new element: shrink over links/buttons, restore elsewhere.
    const onOver = (event) => {
      const overInteractive = event.target instanceof Element && event.target.closest(INTERACTIVE);
      ring.style.transform = overInteractive ? `scale(${HOVER_SCALE})` : "scale(1)";
      ring.style.backgroundColor = overInteractive ? "#ffffff" : "transparent";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden mix-blend-difference will-change-transform md:block"
      style={{ transform: "translate3d(-100px, -100px, 0) translate(-50%, -50%)" }}
    >
      <div
        ref={ringRef}
        className="h-5 w-5 rounded-full border border-white"
        style={{
          transform: "scale(1)",
          backgroundColor: "transparent",
          transition: "transform 180ms ease, background-color 180ms ease",
        }}
      />
    </div>
  );
}