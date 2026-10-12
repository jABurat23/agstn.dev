import ProjectCard from "./ProjectCard";
import Section from "./Section";
import { projects } from "../data/portfolioData";

export default function ProjectsSection() {
  return (
    <Section id="projects" title="Projects">
      <div className="project-list">
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
    </Section>
  );
}
