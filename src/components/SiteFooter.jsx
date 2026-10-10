import SocialLink from "./SocialLink";
import { socialLinks } from "../data/portfolioData";

export default function SiteFooter() {
  return (
    <footer
      id="contact"
      className="mt-20 border-t border-black/10 pt-10 dark:border-white/10"
    >
      <p className="mb-4 font-['Inter'] text-xs font-medium tracking-[0.18em] text-gray-500 dark:text-gray-400">
        LET&apos;S CONNECT:
      </p>
      <div className="flex flex-wrap gap-2">
        {socialLinks.map(({ label, href, icon: Icon }) => (
          <SocialLink key={label} href={href} icon={Icon} label={label} />
        ))}
      </div>

      <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-['Changa_One'] text-xl">AGSTN</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-gray-500">
          Built with intent / 2026
        </span>
      </div>
    </footer>
  );
}