import { ArrowUpRight } from "lucide-react";

export default function SocialLink({ href, icon: Icon, label }) {
  return (
    <a
      href={href}
      className="group inline-flex min-h-11 items-center gap-2 text-sm text-[var(--secondary-text)] transition-colors hover:text-[var(--primary-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary-accent)]"
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
      {label}
      <ArrowUpRight
        aria-hidden="true"
        className="h-3.5 w-3.5 opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </a>
  );
}
