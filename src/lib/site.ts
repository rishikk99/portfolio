/**
 * Single source of truth for all your content.
 * Edit the values here and the whole site updates — no need to touch components.
 */
export const site = {
  name: "Rishik Kanchanapally",
  role: "Software Engineer",
  // Short, punchy line that shows up large in the hero.
  tagline: "Full-stack developer with a backend and ML/AI focus.",
  // One sentence of positioning under the tagline.
  intro:
    "Recent M.S. Computer Science grad from UT Dallas (Intelligent Systems / AI track). I've shipped automation and ML systems at Paycom and Arkansas Blue Cross that saved real hours — and I like building things end to end, from REST APIs and data pipelines to the web apps on top.",
  location: "Dallas, TX",
  availability: "Open to full-time software engineering roles",
  email: "rishik.kanchanapally@gmail.com",
  resumeUrl: "/resume.pdf", // compile your LaTeX résumé to PDF and drop it in /public
  // Set this to the deployed domain (e.g. "https://rishik.dev") so social
  // shares get absolute URLs; empty is fine during local dev.
  url: "" as string,

  socials: {
    linkedin: "https://www.linkedin.com/in/rishikk",
    github: "https://github.com/rishikk99",
  },

  education: {
    degree: "M.S. & B.S. Computer Science",
    school: "The University of Texas at Dallas",
    note: "National Merit Scholar · CS² Honors",
  },

  about: [
    "I'm a software engineer who recently finished an M.S. in Computer Science at UT Dallas on the Intelligent Systems (AI) track. I'm most at home turning messy, real-world problems into reliable systems — whether that's a data pipeline, an ML model, or the web app that puts it in front of people.",
    "Across internships at Paycom and Arkansas Blue Cross & Blue Shield I shipped automation that saved thousands of manual hours, wrote test infrastructure, and built full-stack tools.",
  ],

  skills: [
    { group: "Languages", items: ["Python", "Java", "C# / .NET", "C++", "JavaScript", "SQL"] },
    { group: "Web & Backend", items: ["React / Next.js", "Flask", "REST APIs", "HTML & CSS"] },
    { group: "ML & Data", items: ["PyTorch", "NLP", "OpenCV", "Pandas / NumPy", "Tableau"] },
    { group: "DevOps & Cloud", items: ["Docker", "Kubernetes", "AWS", "Jenkins / CI-CD", "Git / GitLab", "Linux"] },
  ],

  experience: [
    {
      company: "Paycom",
      role: "Software Development Engineer",
      period: "May 2025 – Aug 2025",
      stack: ["C#", "Selenium", "SQL", "Docker"],
      points: [
        "Built Selenium regression tests in C# for payroll workflows, containerized with Docker.",
        "Automated SQL checks for database-migration testing and caught a schema mismatch before release.",
      ],
    },
    {
      company: "Arkansas Blue Cross & Blue Shield",
      role: "Software Engineer",
      period: "May 2024 – Dec 2024",
      stack: ["Java", "REST APIs", ".NET", "UiPath"],
      points: [
        "Built a Java automation system for Medicare claims pricing, projected to save ~10,000 manual hours per year.",
        "Trained an NLP + OCR model to digitize handwritten prior-authorization forms, cutting manual entry.",
        "Set up CI/CD pipelines with Jenkins and UrbanCode Deploy.",
      ],
    },
    {
      company: "Apothewell",
      role: "Full-Stack Engineer",
      period: "May 2021 – Apr 2022",
      stack: ["Python", "Flask", "JavaScript", "Linux"],
      points: [
        "Built and deployed a Flask web app on Linux with dynamic forms and email-based workflows.",
        "Configured Nginx as a reverse proxy and handled remote Linux server management.",
      ],
    },
  ],

  // Kept intentionally short so they're easy to swap per application.
  // The detail lives in your experience above and your résumé.
  // `demo` points at an in-page interactive demo (see src/components/demos/)
  // — used instead of live/code links for work that isn't public.
  projects: [
    {
      name: "Event-Market Trading Bot",
      tech: ["Python", "Whisper", "WebSockets", "NLP"],
      blurb: "Real-time audio→signal pipeline with ~1.5s end-to-end latency.",
      live: "",
      code: "",
      demo: "pipeline",
    },
    {
      name: "Deepfake Detector",
      tech: ["PyTorch", "OpenCV", "NumPy"],
      blurb: "Flags deepfakes from a single reference photo — 84% accuracy, under 3s per item.",
      live: "",
      code: "",
      demo: "",
    },
    {
      name: "Social-Media Sentiment Analysis",
      tech: ["Python", "Twitter API", "Tableau"],
      blurb: "Analyzed 30k tweets for sentiment and bot-driven activity.",
      live: "",
      code: "",
      demo: "sentiment",
    },
    {
      name: "This Website",
      tech: ["Next.js", "TypeScript", "Tailwind"],
      blurb: "The site you're reading — command palette, in-browser ML demos, and a live perf HUD.",
      live: "",
      code: "https://github.com/rishikk99/portfolio",
      demo: "",
    },
  ],
} as const;

export type Site = typeof site;
