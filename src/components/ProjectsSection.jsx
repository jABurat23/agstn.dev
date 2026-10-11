import ProjectCard from "./ProjectCard";
import SectionHeading from "./SectionHeading";
import { projects } from "../data/portfolioData";

export default function ProjectsSection() {
  return (
    <section id="projects" aria-labelledby="projects-heading" className="pt-24 sm:pt-32">
      <div data-reveal data-fade>
        <SectionHeading id="projects-heading">Projects</SectionHeading>
      </div>

      <div className="project-list mt-10">
        <div data-line className="h-px bg-[var(--hairline)]" />
        {projects.map((project) => (
          <div key={project.id} data-reveal data-fade className="relative">
            <ProjectCard project={project} />
            {project.scene === "docket" && (
              <div
                data-docket-zone
                aria-hidden="true"
                className="pointer-events-none absolute -inset-y-6 left-[34%] hidden w-[22%] md:block"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}