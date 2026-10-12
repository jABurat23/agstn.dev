import Section from "./Section";
import { stackGroups } from "../data/portfolioData";

export default function StackSection() {
  return (
    <Section id="stack" title="Stack">
      <div className="grid gap-10 sm:grid-cols-3">
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
    </Section>
  );
}
