import { Canvas } from "@react-three/fiber";
import { Component, Suspense, useEffect, useState } from "react";
import PortraitModel from "./PortraitModel";

// If the model file is missing or fails to load, show the panel instead of crashing the page.
class PortraitBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function BiometricPortrait({ progressSourceRef }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [portraitElement, setPortraitElement] = useState(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);

    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => {
      mediaQuery.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  useEffect(() => {
    if (!portraitElement || !("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 },
    );
    observer.observe(portraitElement);

    return () => observer.disconnect();
  }, [portraitElement]);

  // Keep the canvas transparent so the portrait and halo sit directly on the page.
  const fallback = <div aria-hidden="true" className="absolute inset-0" />;

  return (
    <div
      ref={setPortraitElement}
      className="portrait-stage relative isolate aspect-[4/4.4] w-full"
      role="img"
      aria-label="Interactive 3D portrait that blinks and looks toward the cursor"
    >
      <PortraitBoundary fallback={fallback}>
        <Canvas
          className="portrait-canvas"
          aria-hidden="true"
          camera={{ position: [0, 0, 8], fov: 36 }}
          dpr={[1, 1.5]}
          frameloop={isVisible ? "always" : "demand"}
          fallback={fallback}
          gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        >
          <hemisphereLight args={["#cfe6ff", "#0d1420", 1.2]} />
          <directionalLight color="#ffffff" intensity={2.2} position={[2, 3, 5]} />
          <directionalLight color="#62e6f2" intensity={3} position={[-4, 1, -3]} />
          <directionalLight color="#5b8cff" intensity={1.8} position={[4, -1, -2]} />
          <Suspense fallback={null}>
            <PortraitModel
              reducedMotion={reducedMotion}
              progressSourceRef={progressSourceRef}
            />
          </Suspense>
        </Canvas>
      </PortraitBoundary>
    </div>
  );
}