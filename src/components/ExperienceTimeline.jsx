// Only real entries belong here. Add more objects to this list when you have them.
const milestones = [
  {
    id: "independent-developer",
    date: "2024 — Present",
    title: "Independent Developer",
    description:
      "Building experimental applications, device tooling, web interfaces, and local-first utilities while studying information technology.",
  },
];

export default function ExperienceTimeline({ itemsRef }) {
  return (
    <section className="journey-timeline" aria-labelledby="experience-heading">
      <h2 id="experience-heading">Experience</h2>
      <div className="mt-10 h-px bg-[var(--hairline)]" />

      <div className="mt-8">
        <ol className="journey-timeline-list" ref={itemsRef}>
          {milestones.map((milestone) => (
            <li className="journey-timeline-item" key={milestone.id}>
              <span className="journey-timeline-date">{milestone.date}</span>
              <h3>{milestone.title}</h3>
              <p>{milestone.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}