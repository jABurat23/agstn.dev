import SectionHeading from "./SectionHeading";

// One wrapper for every content section, so the heading, hairline, spacing and
// height stay identical everywhere. Renders <section> by default; pass
// `as="footer"` for the closing contact block.
export default function Section({
  id,
  title,
  as: Tag = "section",
  headingId = `${id}-heading`,
  children,
}) {
  return (
    <Tag id={id} aria-labelledby={headingId} className="section-shell">
      <div data-reveal data-fade>
        <SectionHeading id={headingId}>{title}</SectionHeading>
      </div>

      <div data-line className="mt-10 h-px bg-[var(--hairline)]" />

      <div className="mt-8">{children}</div>
    </Tag>
  );
}
