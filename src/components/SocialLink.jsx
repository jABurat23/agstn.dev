import { ArrowUpRight } from "lucide-react";

// Large typographic link used in the closing contact section.
export default function SocialLink({ href, label }) {
  const external = href.startsWith("http");

  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="group inline-flex items-center gap-3 rounded-sm font-['Changa_One'] text-[clamp(2.25rem,6vw,4.5rem)] leading-none tracking-[-0.04em] text-[var(--primary-text)] transition-colors hover:text-[var(--primary-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[var(--primary-accent)]"
    >
      <span className="relative">
        {label}
        <span
          aria-hidden="true"
          className="absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-[var(--primary-accent)] transition-transform duration-500 group-hover:scale-x-100 group-focus-visible:scale-x-100"
        />
      </span>
      <ArrowUpRight
        aria-hidden="true"
        className="h-[0.55em] w-[0.55em] shrink-0 text-[var(--muted-text)] transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[var(--primary-accent)]"
      />
    </a>
  );
}