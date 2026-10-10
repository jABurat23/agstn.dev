import { useEffect, useRef } from "react";

// Let the wordmark reveal twice, then keep it visible while visitors read.
const MAX_REVEALS = 2;
const REPLAY_MIN_MS = 3000;
const REPLAY_MAX_MS = 4200;
const REVEAL_MS = 700;
const STAGGER_MS = 90;
const FADE_OUT_MS = 280;
const REVEAL_FROM = { opacity: 0, transform: "translateY(0.35em)", filter: "blur(8px)" };
const REVEAL_TO = { opacity: 1, transform: "none", filter: "blur(0)" };

export default function Wordmark({ text }) {
  const letterRefs = useRef([]);

  useEffect(() => {
    // With reduced motion the name simply stays visible.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const letters = letterRefs.current.filter(Boolean);
    const timers = [];
    let revealCount = 0;
    const later = (callback, ms) => timers.push(setTimeout(callback, ms));
    const clearAnimations = () =>
      letters.forEach((letter) => letter.getAnimations().forEach((animation) => animation.cancel()));

    const cycle = () => {
      revealCount += 1;
      clearAnimations();
      letters.forEach((letter, index) => {
        letter.animate([REVEAL_FROM, REVEAL_TO], {
          duration: REVEAL_MS,
          delay: index * STAGGER_MS,
          easing: "cubic-bezier(0.2, 0.7, 0.2, 1)",
          fill: "both",
        });
      });

      later(() => {
        if (revealCount >= MAX_REVEALS) return;
        const hold = REPLAY_MIN_MS + Math.random() * (REPLAY_MAX_MS - REPLAY_MIN_MS);
        later(() => {
          letters.forEach((letter) =>
            letter.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE_OUT_MS, fill: "both" }),
          );
          later(cycle, FADE_OUT_MS + 20);
        }, hold);
      }, REVEAL_MS + (letters.length - 1) * STAGGER_MS);
    };

    cycle();

    return () => {
      timers.forEach(clearTimeout);
      clearAnimations();
    };
  }, [text]);

  return (
    <h1
      aria-label={text}
      className="journey-wordmark select-none whitespace-nowrap font-['Changa_One'] text-[clamp(4rem,10vw,9rem)] font-normal leading-[0.82] tracking-[-0.09em]"
    >
      {[...text].map((character, index) => (
        <span
          key={index}
          ref={(element) => {
            letterRefs.current[index] = element;
          }}
          aria-hidden="true"
          className="inline-block"
        >
          {character}
        </span>
      ))}
    </h1>
  );
}