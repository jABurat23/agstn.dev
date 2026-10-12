import { useEffect, useRef, useState } from "react";
import memoji1 from "../assets/memoji-1.png";
import memoji2 from "../assets/memoji-2.png";
import memoji3 from "../assets/memoji-3.png";
import memoji4 from "../assets/memoji-4.png";
import memoji5 from "../assets/memoji-5.png";

const EXPRESSIONS = [memoji1, memoji2, memoji3, memoji4, memoji5];
const MIN_DELAY = 4000;
const MAX_DELAY = 7000;

const randomDelay = () => MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);

// Pick any expression other than the current one, so no two swaps in a row match.
const pickDifferent = (current) => {
  let next = current;
  while (next === current) next = Math.floor(Math.random() * EXPRESSIONS.length);
  return next;
};

// Fixed overlay mirrors main's centred container so the badge lines up with the
// nav's hairline start at every width, and stays put while the page scrolls.
export default function MemojiBadge() {
  const [reduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  // Two stacked <img> layers: `front` is the visible layer, `slots` holds each layer's expression.
  const [slots, setSlots] = useState([0, 0]);
  const [front, setFront] = useState(0);
  const frontRef = useRef(0);
  const currentRef = useRef(0);

  useEffect(() => {
    if (reduced) return undefined;

    // Preload every expression so a swap never flickers.
    EXPRESSIONS.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    let timer = 0;
    const schedule = () => {
      timer = window.setTimeout(() => {
        const next = pickDifferent(currentRef.current);
        const back = 1 - frontRef.current;
        setSlots((prev) => {
          const copy = [...prev];
          copy[back] = next;
          return copy;
        });
        setFront(back);
        frontRef.current = back;
        currentRef.current = next;
        schedule();
      }, randomDelay());
    };

    const onVisibility = () => {
      window.clearTimeout(timer);
      if (!document.hidden) schedule();
    };

    document.addEventListener("visibilitychange", onVisibility);
    schedule();

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  const layer = (i) => (
    <img
      key={i}
      src={EXPRESSIONS[slots[i]]}
      alt=""
      width={500}
      height={500}
      decoding="async"
      draggable={false}
      className="absolute inset-0 h-full w-full object-cover"
      style={{ opacity: front === i ? 1 : 0, transition: "opacity 250ms ease" }}
    />
  );

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="pointer-events-none mx-auto flex h-24 max-w-[1500px] items-center px-5 sm:px-8 lg:px-12">
        <a
          href="#top"
          aria-label="AGSTN, back to top"
          className="pointer-events-auto block h-8 w-8 shrink-0 rounded-full border border-[var(--hairline)] bg-[var(--page-bg)] p-[3px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-accent)] sm:h-10 sm:w-10"
        >
          <span className="relative block h-full w-full overflow-hidden rounded-full">
            {reduced ? (
              <img
                src={EXPRESSIONS[0]}
                alt=""
                width={500}
                height={500}
                decoding="async"
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              [0, 1].map(layer)
            )}
          </span>
        </a>
      </div>
    </div>
  );
}
