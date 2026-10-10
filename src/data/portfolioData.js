import { Globe, Mail } from "lucide-react";

export const projects = [
  {
    id: "01",
    name: "ANCHOR",
    description: "Device management and telemetry platform.",
    stack: ["React", "Fastify", "WebSocket"],
  },
  {
    id: "02",
    name: "DEVLENS",
    description: "GitHub-inspired developer activity intelligence.",
    stack: ["Next.js", "Tailwind", "MySQL"],
  },
  {
    id: "03",
    name: "UDB_LINK",
    description: "Local-first USB reverse tethering utility.",
    stack: ["Rust", "USB", "Network"],
  },
];

export const technologies = [
  "JavaScript",
  "React",
  "Next.js",
  "Node.js",
  "Tailwind",
  "Rust",
  "Git",
  "Linux",
];

export const socialLinks = [
  { label: "Email", href: "mailto:agstn.dev@gmail.com", icon: Mail },
  { label: "GitHub", href: "https://github.com/jABurat23", icon: Globe },
];
