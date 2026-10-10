import { Moon, Sun } from "lucide-react";

export default function SiteNavigation({ dark, onToggleTheme }) {
  return (
    <nav
      className="flex h-24 items-center justify-end border-b border-black/10 dark:border-white/10"
      aria-label="Main navigation"
    >
      <div className="hero-nav-links flex items-center gap-7 font-['Inter'] text-sm font-medium">
        <a
          href="#projects"
          className="transition-colors hover:text-[var(--primary-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary-accent)]"
        >
          Projects
        </a>
        <a
          href="#experience"
          className="transition-colors hover:text-[var(--primary-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary-accent)]"
        >
          Experience
        </a>
        <button
          onClick={onToggleTheme}
          aria-label={`Switch to ${dark ? "light" : "dark"} theme`}
          className="rounded-full p-2 text-gray-600 transition-colors hover:text-[var(--primary-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-accent)] dark:text-[var(--secondary-text)]"
        >
          {dark ? (
            <Sun aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
          ) : (
            <Moon aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
          )}
        </button>
      </div>
    </nav>
  );
}
