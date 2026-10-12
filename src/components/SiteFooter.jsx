import Section from "./Section";
import SocialLink from "./SocialLink";
import { inspiredBy, socialLinks } from "../data/portfolioData";

export default function SiteFooter() {
  return (
    <Section as="footer" id="contact" title="Let's connect">
      <div data-reveal>
        <div className="flex flex-wrap gap-x-12 gap-y-6">
          {socialLinks.map(({ label, href }) => (
            <div data-fade key={label}>
              <SocialLink href={href} label={label} />
            </div>
          ))}
        </div>

        <div className="mt-24 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <span data-fade className="font-['Changa_One'] text-xl text-[var(--primary-text)]">AGSTN</span>
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
      </div>
    </Section>
  );
}
