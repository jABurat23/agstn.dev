import SocialLink from "./SocialLink";
import { inspiredBy, socialLinks } from "../data/portfolioData";

export default function SiteFooter() {
  return (
    <footer id="contact" data-reveal className="mt-28 sm:mt-40">
      <div data-line className="h-px bg-[var(--hairline)]" />

      <h2
        data-fade
        className="mt-16 text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted-text)]"
      >
        Let&apos;s connect
      </h2>

      <div className="mt-8 flex flex-wrap gap-x-12 gap-y-6">
        {socialLinks.map(({ label, href }) => (
          <div data-fade key={label}>
            <SocialLink href={href} label={label} />
          </div>
        ))}
      </div>

      <div data-line className="mt-24 h-px bg-[var(--hairline)]" />

      <div className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <span data-fade className="font-['Changa_One'] text-xl text-[var(--primary-text)]">AGSTN</span>
        <span
          data-fade
          className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--muted-text)]"
        >
          Built with intent / 2026
        </span>
        <a
          data-fade
          href="#"
          className="w-fit rounded-sm text-xs text-[var(--secondary-text)] transition-colors hover:text-[var(--primary-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary-accent)]"
        >
          Back to top ↑
        </a>
      </div>

      <dl className="mt-10 grid gap-x-10 gap-y-5 text-xs sm:grid-cols-3">
        <div data-fade>
          <dt className="font-medium uppercase tracking-[0.16em] text-[var(--muted-text)]">Typeface</dt>
          <dd className="mt-1.5 text-[var(--secondary-text)]">Inter, Changa One</dd>
        </div>
        <div data-fade>
          <dt className="font-medium uppercase tracking-[0.16em] text-[var(--muted-text)]">Built with</dt>
          <dd className="mt-1.5 text-[var(--secondary-text)]">React, Vite, Tailwind, Three.js, GSAP</dd>
        </div>
        <div data-fade>
          <dt className="font-medium uppercase tracking-[0.16em] text-[var(--muted-text)]">Inspired by</dt>
          <dd className="mt-1.5 text-[var(--secondary-text)]">
            {inspiredBy.map(({ name, href }, index) => (
              <span key={name}>
                {index > 0 && ", "}
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-[var(--hairline)] underline-offset-4 transition-colors hover:text-[var(--primary-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary-accent)]"
                >
                  {name}
                </a>
              </span>
            ))}
          </dd>
        </div>
      </dl>
    </footer>
  );
}