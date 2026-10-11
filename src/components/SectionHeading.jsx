// Shared heading style so every section matches the Experience heading.
export default function SectionHeading({ id, children }) {
  return (
    <h2
      id={id}
      className="text-[clamp(1.75rem,3vw,2.6rem)] font-medium tracking-[-0.055em] text-[var(--primary-text)]"
    >
      {children}
    </h2>
  );
}