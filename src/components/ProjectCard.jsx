import { ArrowUpRight } from "lucide-react";

// One editorial row. It becomes a link only when the project has a real href.
export default function ProjectCard({ project }) {
  const { id, name, description, stack, href } = project;
  const Row = href ? "a" : "div";
  const linkProps = href ? { href, target: "_blank", rel: "noreferrer" } : {};

  return (
    <Row
      {...linkProps}
      className="project-row group relative grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-4 border-b border-[var(--hairline)] py-8 transition-opacity duration-300 after:absolute after:inset-x-0 after:-bottom-px after:h-px after:origin-left after:scale-x-0 after:bg-[var(--primary-accent)] after:transition-transform after:duration-500 hover:after:scale-x-100 focus-visible:after:scale-x-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary-accent)] md:grid-cols-[4rem_minmax(0,1.2fr)_minmax(0,1fr)] md:items-center md:py-10"
    >
      <span className="pt-2 text-xs tracking-[0.16em] text-[var(--muted-text)] md:pt-0">
        {id}
      </span>

      <h3 className="font-['Changa_One'] text-[clamp(2.25rem,6vw,5rem)] font-normal leading-none tracking-[-0.04em] text-[var(--primary-text)] transition-colors duration-300 group-hover:text-[var(--primary-accent)]">
        {name}
      </h3>

      <div className="col-start-2 md:col-start-auto">
        <p className="max-w-md text-sm leading-6 text-[var(--secondary-text)]">{description}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted-text)]">
          {stack.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>

      {href && (
        <ArrowUpRight
          aria-hidden="true"
          className="absolute right-0 top-9 h-5 w-5 text-[var(--muted-text)] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 md:top-1/2 md:-mt-2.5"
        />
      )}
    </Row>
  );
}