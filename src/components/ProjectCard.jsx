import { ArrowUpRight } from "lucide-react";

export default function ProjectCard({ project }) {
  return (
    <article className="group border-b border-[var(--hairline)] py-6 transition-colors first:border-t">
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-['Inter'] text-xl font-medium tracking-tight text-[var(--primary-text)] transition-colors group-hover:text-[var(--primary-accent)]">
          {project.name}
        </h3>
        <ArrowUpRight
          aria-hidden="true"
          className="mt-1 h-4 w-4 shrink-0 text-[var(--muted-text)] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
        />
      </div>

      <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--secondary-text)]">
        {project.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
        {project.stack.map((item) => (
          <span
            key={item}
            className="text-xs text-[var(--muted-text)]"
          >
            {item}
          </span>
        ))}
      </div>
    </article>
  );
}
