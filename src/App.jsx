import { lazy, Suspense, useEffect, useRef, useState } from "react";
import CustomCursor from "./components/CustomCursor";
import ExperienceJourney from "./components/ExperienceJourney";
import PortfolioSections from "./components/PortfolioSections";
import SiteFooter from "./components/SiteFooter";
import SiteNavigation from "./components/SiteNavigation";
import useScrollReveals from "./hooks/useScrollReveals";

const DriftBackground = lazy(() => import("./components/DriftBackground"));

export default function App() {
  const [dark, setDark] = useState(true);
  const mainRef = useRef(null);
  const [bgReady, setBgReady] = useState(false);
  useScrollReveals(mainRef);

  // Load the 3D background after the hero intro, so parsing it never competes with the reveals.
  useEffect(() => {
    let idle;
    const start = () => setBgReady(true);
    const timer = setTimeout(() => {
      idle = "requestIdleCallback" in window ? requestIdleCallback(start, { timeout: 1500 }) : start();
    }, 1400);
    return () => {
      clearTimeout(timer);
      if (idle && "cancelIdleCallback" in window) cancelIdleCallback(idle);
    };
  }, []);

  const toggleTheme = (event) => {
    const nextDark = !dark;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!document.startViewTransition || prefersReduced) {
      setDark(nextDark);
      return;
    }

    let x = event?.clientX;
    let y = event?.clientY;
    if ((x === undefined || (x === 0 && y === 0)) && event?.currentTarget?.getBoundingClientRect) {
      const rect = event.currentTarget.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    } else {
      x = x ?? window.innerWidth / 2;
      y = y ?? window.innerHeight / 2;
    }

    const transition = document.startViewTransition(() => {
      setDark(nextDark);
    });
    transition.ready.then(() => {
      const maxX = Math.max(x, window.innerWidth - x);
      const maxY = Math.max(y, window.innerHeight - y);
      const radius = Math.hypot(maxX, maxY);

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 650,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  };

  return (
    <div
      className={`${dark ? "dark " : ""}min-h-screen bg-[var(--page-bg)] text-[var(--primary-text)] transition-colors duration-300`}
    >
      <CustomCursor />
      {bgReady && (
        <Suspense fallback={null}>
          <DriftBackground dark={dark} />
        </Suspense>
      )}
      <main
        ref={mainRef}
        className="relative z-10 mx-auto max-w-[1500px] px-5 pb-20 sm:px-8 lg:px-12"
      >
        <SiteNavigation dark={dark} onToggleTheme={toggleTheme} />
        <ExperienceJourney />
        <PortfolioSections />
        <SiteFooter />
      </main>
    </div>
  );
}