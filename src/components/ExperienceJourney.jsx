import { lazy, Suspense, useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import ExperienceTimeline from "./ExperienceTimeline";
import Wordmark from "./Wordmark";

const BiometricPortrait = lazy(() => import("./BiometricPortrait"));

const heroContent = {
  wordmark: "AG$TN",
  summary:
    "An Information Technology student and independent developer who enjoys building practical software, exploring systems, and turning ideas into simple, thoughtful digital experiences.",
  details: [
    { label: "Location", value: "PH" },
    { label: "Status", value: "Building" },
    { label: "Focus", value: "Software / Web" },
  ],
};

const isMobileLayout = () => window.matchMedia("(max-width: 760px)").matches;
const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function ExperienceJourney() {
  const journeyRef = useRef(null);
  const heroCopyRef = useRef(null);
  const timelineItemsRef = useRef(null);

  useEffect(() => {
    const journey = journeyRef.current;
    const heroCopy = heroCopyRef.current;
    const items = timelineItemsRef.current?.querySelectorAll(
      ".journey-timeline-item",
    );
    if (!journey || !heroCopy || !items) return undefined;

    let frame = 0;
    const update = () => {
      frame = 0;

      if (isMobileLayout() || prefersReducedMotion()) {
        journey.style.removeProperty("--journey-progress");
        journey.style.removeProperty("--hero-opacity");
        journey.style.removeProperty("--timeline-opacity");
        journey.style.removeProperty("--portrait-left");
        journey.style.removeProperty("--scroll-cue-opacity");
        heroCopy.inert = false;
        heroCopy.removeAttribute("aria-hidden");
        items.forEach((item) => item.classList.remove("is-active"));
        return;
      }

      const bounds = journey.getBoundingClientRect();
      const scrollableDistance = Math.max(
        journey.offsetHeight - window.innerHeight,
        1,
      );
      const progress = Math.min(
        Math.max(-bounds.top / scrollableDistance, 0),
        1,
      );

      journey.style.setProperty("--journey-progress", progress.toFixed(4));
      journey.style.setProperty(
        "--hero-opacity",
        Math.max(1 - progress * 3.2, 0).toFixed(4),
      );
      journey.style.setProperty(
        "--timeline-opacity",
        Math.min(Math.max((progress - 0.18) * 4, 0), 1).toFixed(4),
      );
      journey.style.setProperty(
        "--portrait-left",
        `${55 - progress * 46}%`,
      );
      journey.style.setProperty(
        "--scroll-cue-opacity",
        Math.max(1 - progress * 4, 0).toFixed(4),
      );

      const heroHidden = progress >= 0.4;
      heroCopy.inert = heroHidden;
      heroCopy.setAttribute("aria-hidden", String(heroHidden));

      const activeIndex = Math.min(
        Math.floor(progress * items.length),
        items.length - 1,
      );
      items.forEach((item, index) => {
        item.classList.toggle("is-active", index === activeIndex);
      });
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const layoutQuery = window.matchMedia("(max-width: 760px)");
    motionQuery.addEventListener("change", requestUpdate);
    layoutQuery.addEventListener("change", requestUpdate);
    update();

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      motionQuery.removeEventListener("change", requestUpdate);
      layoutQuery.removeEventListener("change", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      id="experience"
      ref={journeyRef}
      className="experience-journey"
      aria-label="Introduction and experience"
    >
      <div className="experience-journey-stage">
        <div className="journey-hero-copy" ref={heroCopyRef}>
          <Wordmark text={heroContent.wordmark} />
          <p className="mt-10 max-w-xl font-['Inter'] text-base leading-7 text-gray-600 dark:text-[var(--secondary-text)] sm:text-lg">
            {heroContent.summary}
          </p>

          <div className="hero-details mt-7 grid grid-cols-1 gap-x-10 gap-y-4 text-xs sm:grid-cols-3 sm:gap-y-2">
            {heroContent.details.map(({ label, value }) => (
              <div className="flex flex-col gap-1.5" key={label}>
                <span className="font-medium uppercase tracking-[0.16em] text-gray-500 dark:text-[var(--muted-text)]">
                  {label}
                </span>
                <span className="tracking-[0.04em] text-gray-700 dark:text-[var(--secondary-text)]">
                  {value}
                </span>
              </div>
            ))}
          </div>

          <a
            href="#projects"
            className="hero-cta group mt-8 inline-flex min-h-11 items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-900 transition-colors dark:text-[var(--primary-text)]"
          >
            <span>View work</span>
            <ArrowUpRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        </div>

        <div className="journey-portrait">
          <Suspense
            fallback={
              <div
                aria-hidden="true"
                className="portrait-stage aspect-[4/4.4] w-full"
              />
            }
          >
            <BiometricPortrait progressSourceRef={journeyRef} />
          </Suspense>
        </div>

        <ExperienceTimeline itemsRef={timelineItemsRef} />

        <div className="journey-scroll-cue" aria-hidden="true">
          Scroll to explore
        </div>
      </div>
    </section>
  );
}
