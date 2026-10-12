import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

// "Developer" stays; the word after the + is replaced in a loop.
const WORDS = ["Builder", "Explorer", "Tinkerer"];

export default function RoleSwap() {
  const swapRef = useRef(null);

  useLayoutEffect(() => {
    const swap = swapRef.current;
    if (!swap) return undefined;

    // Reduced motion: nothing runs, so only the first word is shown.
    const mm = gsap.matchMedia(swap);
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const words = gsap.utils.toArray(swap.children);
      gsap.set(words.slice(1), { yPercent: 115, visibility: "visible" });

      // The current word leaves upward while the next one rises in.
      const loop = gsap.timeline({ repeat: -1, delay: 2.6 });
      words.forEach((current, i) => {
        loop
          .to(current, { yPercent: -115, duration: 0.55, ease: "power3.in" }, "+=1.9")
          .fromTo(
            words[(i + 1) % words.length],
            { yPercent: 115 },
            { yPercent: 0, duration: 0.7, ease: "power3.out", immediateRender: false },
            "<+=0.3",
          );
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <div
      data-reveal="load"
      data-delay="0.5"
      role="group"
      aria-label="Developer plus builder, explorer or tinkerer"
      className="mt-8 font-['Inter'] text-[clamp(1.8rem,3.4vw,2.9rem)] font-medium leading-[1.2] tracking-[-0.03em] text-[var(--primary-text)]"
    >
      <div aria-hidden="true">
        <div className="flex items-center gap-5">
          <span data-mask className="block">
            <span className="inline-block">Developer</span>
          </span>
          <i
            data-line
            className="block h-px w-[clamp(60px,12vw,200px)] bg-[var(--muted-text)]"
          />
        </div>
        <div className="flex items-start gap-3">
          <b data-fade className="font-extrabold text-[var(--muted-text)]">
            +
          </b>
          <span data-mask ref={swapRef} className="relative block h-[1.25em] w-[6.2em]">
            {WORDS.map((word, i) => (
              <span
                key={word}
                className={`absolute left-0 top-0 whitespace-nowrap ${i ? "invisible" : ""}`}
              >
                {word}
              </span>
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}