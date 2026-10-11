export const projects = [
  {
    id: "01",
    name: "DOCKET",
    description: "Replaces separate spreadsheets for budgeting and freelance work.",
    stack: ["Next.js", "Supabase", "TypeScript"],
    scene: "docket", // draws the 3D Docket object in this row (see DocketObject.jsx)
    // Add href: "https://..." to a project once it has a real URL; its row then becomes a link.
  },
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