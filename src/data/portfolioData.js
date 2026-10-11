// Dev-only sample rows so the Projects layout can be checked with a few entries.
// `placeholder: true` marks content that must never ship; see AGENTS.MD. They carry
// no `scene`, so no 3D object is drawn in their row.
const placeholderProjects = [
  {
    id: "02",
    name: "Coming soon...",
    description: "",
    stack: [""],
    placeholder: true,
  },
  {
    id: "03",
    name: "Coming soon...",
    description: "",
    stack: [""],
    placeholder: true,
  },
];

export const projects = [
  {
    id: "01",
    name: "DOCKET",
    description: "Replaces separate spreadsheets for budgeting and freelance work.",
    stack: ["Next.js", "Supabase", "TypeScript"],
    scene: "docket", // draws the 3D Docket object in this row (see DocketObject.jsx)
    // Add href: "https://..." to a project once it has a real URL; its row then becomes a link.
  },
  // Placeholders are added only in development; a production build drops them entirely.
  ...(import.meta.env.DEV ? placeholderProjects : []),
];

export const stackGroups = [
  { title: "Languages", items: ["JavaScript", "Rust"] },
  { title: "Frameworks & runtime", items: ["React", "Next.js", "Node.js", "Tailwind"] },
  { title: "Tools & systems", items: ["Git", "Linux"] },
];

// Add a LinkedIn entry here when you have the real URL.
export const socialLinks = [
  { label: "Email", href: "mailto:agstn.dev@gmail.com" },
  { label: "GitHub", href: "https://github.com/jABurat23" },
];

// Credited in the footer.
export const inspiredBy = [
  { name: "Hamish Williams", href: "https://hamishw.com" },
  { name: "Chánh Đại", href: "https://chanhdai.com" },
];