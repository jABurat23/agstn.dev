import { lazy, Suspense, useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import ExperienceTimeline from "./ExperienceTimeline";
import RoleSwap from "./RoleSwap";
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

// Scroll plan, in viewport heights. The hero turns into the About state, which holds
// for reading, then hands over to the timeline. Each timeline entry gets its own share
// of the remaining hold; the total length is set in index.css.
const HERO_TO_ABOUT = 1.2;
const ABOUT_HOLD = 0.8;
const ABOUT_TO_EXPERIENCE = 0.6;

const isMobileLayout = () => window.matchMedia("(max-width: 760px)").matches;
const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp01 = (value) => Math.min(Math.max(value, 0), 1);

export default function ExperienceJourney() {
  const journeyRef = useRef(null);
  const heroCopyRef = useRef(null);
  const aboutRef = useRef(null);
  const timelineItemsRef = useRef(null);

  useEffect(() => {
    const journey = journeyRef.current;
    const heroCopy = heroCopyRef.current;
    const about = aboutRef.current;
    const items = timelineItemsRef.current?.querySelectorAll(
      ".journey-timeline-item",
    );
    if (!journey || !heroCopy || !about || !items) return undefined;

    // More timeline entries make the section longer, so everything stays readable.
    journey.style.setProperty("--journey-entries", String(items.length));

    let frame = 0;
    const update = () => {
      frame = 0;

      if (isMobileLayout() || prefersReducedMotion()) {
        [
          "--journey-progress",
          "--hero-opacity",
          "--about-opacity",
          "--timeline-opacity",
          "--portrait-left",
          "--scroll-cue-opacity",
        ].forEach((name) => journey.style.removeProperty(name));
        [heroCopy, about].forEach((panel) => {
          panel.inert = false;
          panel.removeAttribute("aria-hidden");
        });
        items.forEach((item) => item.classList.remove("is-active"));
        return;
      }

      const viewport = window.innerHeight;
      const scrolled = Math.max(-journey.getBoundingClientRect().top, 0);
      const scrollable = Math.max(journey.offsetHeight - viewport, 1);

      const aboutStart = HERO_TO_ABOUT * viewport;
      const aboutEnd = aboutStart + ABOUT_HOLD * viewport;
      const experienceStart = aboutEnd + ABOUT_TO_EXPERIENCE * viewport;

      // t: hero turns into About (portrait slides left). e: About hands over to the timeline.
      const t = clamp01(scrolled / aboutStart);
      const e = clamp01((scrolled - aboutEnd) / (experienceStart - aboutEnd));

      const aboutOpacity = Math.min(clamp01((t - 0.18) * 4), clamp01(1 - e * 4));

      journey.style.setProperty("--journey-progress", t.toFixed(4));
      journey.style.setProperty("--hero-opacity", Math.max(1 - t * 3.2, 0).toFixed(4));
      journey.style.setProperty("--about-opacity", aboutOpacity.toFixed(4));
      journey.style.setProperty("--timeline-opacity", clamp01((e - 0.3) * 4).toFixed(4));
      journey.style.setProperty("--portrait-left", `${55 - t * 46}%`);
      journey.style.setProperty("--scroll-cue-opacity", Math.max(1 - t * 4, 0).toFixed(4));

      const heroHidden = t >= 0.4;
      heroCopy.inert = heroHidden;
      heroCopy.setAttribute("aria-hidden", String(heroHidden));

      const aboutHidden = aboutOpacity < 0.1;
      about.inert = aboutHidden;
      about.setAttribute("aria-hidden", String(aboutHidden));

      // With several entries, each one gets its own share of the reading hold.
      const holdStart = aboutEnd + (experienceStart - aboutEnd) * 0.4;
      const hold = clamp01((scrolled - holdStart) / Math.max(scrollable - holdStart, 1));
      const activeIndex = Math.min(Math.floor(hold * items.length), items.length - 1);
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
      aria-label="Introduction, about and experience"
    >
      <div className="experience-journey-stage">
        <div className="journey-hero-copy" ref={heroCopyRef}>
          <Wordmark text={heroContent.wordmark} />
          <RoleSwap />

          <a
            data-reveal="load"
            data-delay="1.4"
            data-fade
            href="#projects"
            className="hero-cta group mt-10 inline-flex min-h-11 items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-900 transition-colors dark:text-[var(--primary-text)]"
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

        <section className="journey-about" ref={aboutRef} aria-labelledby="about-heading">
          <h2 id="about-heading">About</h2>
          <p>{heroContent.summary}</p>

          <div className="hero-details mt-8 grid grid-cols-1 gap-x-10 gap-y-4 text-xs sm:grid-cols-3 sm:gap-y-2">
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
        </section>

        <ExperienceTimeline itemsRef={timelineItemsRef} />

        <div
          className="journey-scroll-cue"
          aria-hidden="true"
          data-reveal="load"
          data-delay="1.9"
        >
          <span className="scroll-cue-inner" data-fade>
            <span className="scroll-mouse">
              <i />
            </span>
            <span>Scroll to explore</span>
          </span>
        </div>
      </div>
    </section>
  );
}