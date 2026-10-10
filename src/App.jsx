import { useState } from "react";
import CustomCursor from "./components/CustomCursor";
import ExperienceJourney from "./components/ExperienceJourney";
import PortfolioSections from "./components/PortfolioSections";
import SiteFooter from "./components/SiteFooter";
import SiteNavigation from "./components/SiteNavigation";

export default function App() {
  const [dark, setDark] = useState(true);

  const toggleTheme = (event) => {
    const nextDark = !dark;
    const { clientX: x, clientY: y } = event;

    if (!document.startViewTransition) {
      setDark(nextDark);
      return;
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
      className={
        dark
          ? "dark min-h-screen bg-black text-white transition-colors duration-300"
          : "min-h-screen bg-white text-black transition-colors duration-300"
      }
    >
      <CustomCursor />

      <main className="mx-auto max-w-[1500px] px-5 pb-20 sm:px-8 lg:px-12">
        <SiteNavigation dark={dark} onToggleTheme={toggleTheme} />
        <ExperienceJourney />
        <PortfolioSections />
        <SiteFooter />
      </main>
    </div>
  );
}