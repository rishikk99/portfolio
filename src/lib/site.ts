/**
 * Single source of truth for all your content.
 * Edit the values here and the whole site updates — no need to touch components.
 */
export const site = {
  name: "Rishik Kanchanapally",
  role: "Backend engineer",
  location: "Dallas, TX",
  // Used for search results and link previews.
  tagline: "Backend engineer in Dallas. APIs, data pipelines, and tools I actually use.",
  intro:
    "Software engineer in Dallas with an M.S. in Computer Science from UT Dallas. AI developer at Arkansas Blue Cross; backend work and tools I actually use.",
  email: "rishik.kanchanapally@gmail.com",
  // Hidden until the résumé is updated; set back to "/resume.pdf" (and LAUNCHED in worker/index.ts).
  resumeUrl: "" as string,
  // Set this to the deployed domain (e.g. "https://rishikk.com") so social
  // shares get absolute URLs; empty is fine during local dev.
  url: "https://rishikk.com" as string,

  socials: {
    linkedin: "https://www.linkedin.com/in/rishikk",
    github: "https://github.com/rishikk99",
  },

  about: [
    "I'm a software engineer in Dallas. I finished my M.S. in Computer Science at UT Dallas this year, and I like backend work. At Arkansas Blue Cross I'm an AI developer, building services that read documents with LLMs so people don't have to.",
    "Outside work I go to the gym and build tools for myself, like a way to ask Claude about my workouts.",
  ],

  education: {
    degree: "M.S. & B.S. Computer Science",
    school: "The University of Texas at Dallas",
    note: "National Merit Scholar · CS² Honors",
  },

  // The lead project. `liveUrl` feeds the "live from the connector" card.
  featured: {
    name: "hevy-mcp",
    oneLiner: "A Claude connector for my workout app",
    description:
      "I log every workout in Hevy. hevy-mcp lets me ask Claude about them from my phone (volume per muscle, PRs, what I did last week) and have it build routines straight into the app.",
    details: [
      "Runs on Cloudflare Workers for $0 a month, with an hourly sync into SQLite",
      "Its own OAuth 2.1 sign-in, so only I can use it",
      "Numbers match Hevy's own to the gram; 351 tests",
    ],
    tech: ["TypeScript", "Python", "Cloudflare Workers", "SQLite", "OAuth"],
    code: "https://github.com/rishikk99/hevy-mcp",
    liveUrl: "https://hevy.rishikk.com/public/last-workout",
  },

  // `demo` opens an in-page demo (src/components/demos/). Demos are small
  // browser rebuilds of the technique, not the original project.
  projects: [
    {
      name: "Deepfake detector",
      description: "Flags deepfakes from a single reference photo of the person. 84% accuracy, under 3 seconds per item.",
      tech: ["PyTorch", "OpenCV"],
      demo: "",
    },
    {
      name: "Tweet sentiment analysis",
      description: "Sorted 30,000 tweets by sentiment and flagged bot-driven activity.",
      tech: ["Python", "Tableau"],
      demo: "sentiment",
    },
  ],

  // One entry per company; roles newest first.
  experience: [
    {
      company: "Arkansas Blue Cross & Blue Shield",
      roles: [
        {
          title: "AI Developer",
          period: "Jul 2026 – present",
          summary: "Building Python services that use LLMs to read incoming documents and pull out the information people used to type in by hand.",
        },
        {
          title: "Software Engineer, part-time",
          period: "Aug 2024 – Dec 2024",
          summary: "",
        },
        {
          title: "Software Engineering Intern",
          period: "May 2024 – Aug 2024",
          summary: "Built a Java automation system for Medicare claims pricing, projected to save ~10,000 manual hours a year. It's still in production.",
        },
      ],
    },
    {
      company: "Paycom",
      roles: [
        {
          title: "Software Development Engineer",
          period: "May 2025 – Aug 2025",
          summary: "Built Selenium regression tests in C# for payroll workflows, containerized with Docker.",
        },
      ],
    },
    {
      company: "Apothewell",
      roles: [
        {
          title: "Full-Stack Engineer",
          period: "May 2021 – Apr 2022",
          summary: "Built and deployed a Flask web app on Linux with dynamic forms and email-based workflows.",
        },
      ],
    },
  ],
} as const;

export type Site = typeof site;
