import ProjectCard from "./ProjectCard";
import { projects, technologies } from "../data/portfolioData";

export default function PortfolioSections() {
  return (
    <section
      id="projects"
      className="grid grid-cols-1 gap-y-14 border-t border-[var(--hairline)] py-12 sm:py-16 lg:grid-cols-12 lg:gap-x-12"
      aria-label="Projects and stack"
    >
      <article className="lg:col-span-7">
        <h2 className="border-b border-[var(--hairline)] pb-4 text-sm font-medium text-[var(--muted-text)]">
          Projects
        </h2>
        <div>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </article>

      <article className="lg:col-span-5">
        <h2 className="border-b border-[var(--hairline)] pb-4 text-sm font-medium text-[var(--muted-text)]">
          Stack
        </h2>
        <div className="flex flex-wrap gap-x-5 gap-y-3 pt-5">
          {technologies.map((tech) => (
            <span key={tech} className="text-sm text-[var(--secondary-text)]">
              {tech}
            </span>
          ))}
        </div>
      </article>
    </section>
  );
}