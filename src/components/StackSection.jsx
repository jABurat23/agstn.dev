import SectionHeading from "./SectionHeading";
import { stackGroups } from "../data/portfolioData";

export default function StackSection() {
  return (
    <section id="stack" aria-labelledby="stack-heading" className="pt-24 sm:pt-32">
      <div data-reveal data-fade>
        <SectionHeading id="stack-heading">Stack</SectionHeading>
      </div>

      <div className="mt-10">
        <div data-line className="h-px bg-[var(--hairline)]" />
        <div className="grid gap-10 pt-8 sm:grid-cols-3">
          {stackGroups.map(({ title, items }) => (
            <div key={title} data-reveal>
              <h3
                data-fade
                className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted-text)]"
              >
                {title}
              </h3>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li
                    key={item}
                    data-fade
                    className="w-fit text-lg text-[var(--secondary-text)] transition-colors hover:text-[var(--primary-text)]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}