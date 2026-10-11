import { useEffect, useMemo, useRef, useState } from "react";
import { socialLinks } from "../data/portfolioData";

const SECTIONS = [
  { id: "experience", label: "Go to Experience" },
  { id: "projects", label: "Go to Projects" },
  { id: "stack", label: "Go to Stack" },
  { id: "contact", label: "Go to Contact" },
];

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function scrollToId(id) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

export default function CommandPalette({ open, setOpen, onToggleTheme }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(false);
  const inputRef = useRef(null);
  const returnFocus = useRef(null);

  // Ctrl/Cmd + K toggles the menu from anywhere.
  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  // Commands reuse the existing socialLinks data instead of repeating it.
  const commands = useMemo(() => {
    const navigate = SECTIONS.map(({ id, label }) => ({
      id: `go-${id}`,
      group: "Navigate",
      label,
      run: () => scrollToId(id),
    }));
    const actions = [
      {
        id: "theme",
        group: "Actions",
        label: "Toggle theme",
        run: () =>
          onToggleTheme({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 }),
      },
    ];
    const email = socialLinks.find((link) => link.href.startsWith("mailto:"));
    if (email) {
      actions.push({
        id: "copy-email",
        group: "Actions",
        label: "Copy email address",
        run: () => navigator.clipboard?.writeText(email.href.replace("mailto:", "")),
      });
    }
    const links = socialLinks.map(({ label, href }) => ({
      id: `link-${label}`,
      group: "Links",
      label: href.startsWith("mailto:") ? "Send an email" : `Open ${label}`,
      run: () => {
        if (href.startsWith("mailto:")) window.location.href = href;
        else window.open(href, "_blank", "noopener,noreferrer");
      },
    }));
    return [...navigate, ...actions, ...links];
  }, [onToggleTheme]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? commands.filter((c) => c.label.toLowerCase().includes(q)) : commands;
  }, [commands, query]);

  useEffect(() => {
    if (open) {
      returnFocus.current = document.activeElement;
      setQuery("");
      setActive(0);
      const frame = requestAnimationFrame(() => {
        setShown(true);
        inputRef.current?.focus();
      });
      return () => cancelAnimationFrame(frame);
    }
    setShown(false);
    returnFocus.current?.focus?.();
    return undefined;
  }, [open]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    document.getElementById(`cmd-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  const close = () => setOpen(false);
  const choose = (command) => {
    if (!command) return;
    close();
    setTimeout(command.run, 60); // let the menu unmount first so it never ends up in a theme-change snapshot
  };

  const onInputKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(results[active]);
    } else if (event.key === "Tab") {
      event.preventDefault(); // keep focus inside the menu
    }
  };

  let lastGroup = "";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[16vh]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 -z-10 bg-black/40 backdrop-blur-sm transition-opacity duration-200 motion-reduce:transition-none ${shown ? "opacity-100" : "opacity-0"}`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command menu"
        className={`w-full max-w-lg overflow-hidden rounded-xl border border-black/10 bg-white/95 font-['Inter'] text-black shadow-2xl transition duration-200 motion-reduce:transition-none dark:border-white/10 dark:bg-[#0b111b]/95 dark:text-white ${shown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onInputKeyDown}
          role="combobox"
          aria-expanded="true"
          aria-controls="cmd-list"
          aria-activedescendant={results.length ? `cmd-${active}` : undefined}
          aria-label="Search commands"
          placeholder="Type a command or search…"
          className="w-full border-b border-black/10 bg-transparent px-4 py-3.5 text-sm outline-none placeholder:text-gray-400 dark:border-white/10 dark:placeholder:text-white/40"
        />
        <ul id="cmd-list" role="listbox" className="max-h-72 overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-gray-500 dark:text-white/50">
              No results
            </li>
          )}
          {results.map((command, index) => {
            const heading = command.group !== lastGroup ? command.group : null;
            lastGroup = command.group;
            return (
              <li key={command.id} role="presentation">
                {heading && (
                  <div className="px-3 pb-1 pt-3 text-[10px] font-medium uppercase tracking-[0.18em] text-gray-500 dark:text-white/40">
                    {heading}
                  </div>
                )}
                <div
                  id={`cmd-${index}`}
                  role="option"
                  aria-selected={index === active}
                  onMouseMove={() => setActive(index)}
                  onClick={() => choose(command)}
                  className={`cursor-pointer rounded-md px-3 py-2 text-sm ${index === active ? "bg-black/5 dark:bg-white/10" : ""}`}
                >
                  {command.label}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-between border-t border-black/10 px-4 py-2 text-[11px] text-gray-500 dark:border-white/10 dark:text-white/40">
          <span>↑ ↓ to move, Enter to select</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
}