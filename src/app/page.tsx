import { site } from "@/lib/site";
import { PaletteTrigger } from "@/components/palette-trigger";
import { ContactForm } from "@/components/contact-form";
import { ProjectsShowcase } from "@/components/projects-section";
import { ShortcutK } from "@/components/shortcut-key";

function SectionLabel({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="mb-8 flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-accent">
      <span>{n}</span>
      <span className="h-px w-8 bg-accent/50" />
      <span className="text-muted">{children}</span>
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <a href="#top" className="font-mono text-sm font-semibold tracking-tight">
            {site.name.toLowerCase().replace(/\s+/g, "")}
            <span className="text-accent">.</span>
          </a>
          <nav className="hidden items-center gap-6 font-mono text-xs text-muted sm:flex">
            <a href="#about" className="hover:text-foreground">about</a>
            <a href="#experience" className="hover:text-foreground">experience</a>
            <a href="#skills" className="hover:text-foreground">skills</a>
            <a href="#projects" className="hover:text-foreground">projects</a>
            <a href="#contact" className="hover:text-foreground">contact</a>
          </nav>
          <PaletteTrigger
            className="rounded-full border px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-foreground"
            label={<ShortcutK />}
          />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6">
        {/* Hero */}
        <section id="top" className="bg-grid relative flex min-h-[88vh] flex-col justify-center py-24">
          <p className="mb-5 font-mono text-sm text-accent">{"// " + site.location.toLowerCase()}</p>
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">{site.name}</h1>
          <p className="mt-4 font-display text-2xl font-medium text-muted sm:text-3xl">{site.role}</p>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-foreground/90">{site.tagline}</p>
          <p className="mt-4 max-w-xl leading-relaxed text-muted">{site.intro}</p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#experience"
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
            >
              See my experience
            </a>
            <a href={"mailto:" + site.email} className="rounded-full border px-5 py-2.5 text-sm font-medium transition-colors hover:border-accent">
              Get in touch
            </a>
            <PaletteTrigger
              className="font-mono text-xs text-muted transition-colors hover:text-foreground"
              label={
                <span>
                  or press <kbd className="rounded border px-1.5 py-0.5"><ShortcutK /></kbd> to explore
                </span>
              }
            />
          </div>
        </section>

        {/* About */}
        <section id="about" className="border-t py-24">
          <SectionLabel n="01">About</SectionLabel>
          <div className="grid gap-10 md:grid-cols-3">
            <div className="space-y-4 text-lg leading-relaxed text-foreground/90 md:col-span-2">
              {site.about.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <dl className="space-y-4 font-mono text-sm">
              <div>
                <dt className="text-muted">education</dt>
                <dd>{site.education.degree}</dd>
                <dd className="text-muted">{site.education.school}</dd>
              </div>
              <div>
                <dt className="text-muted">location</dt>
                <dd>{site.location}</dd>
              </div>
              <div>
                <dt className="text-muted">status</dt>
                <dd className="text-accent">{site.availability}</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Experience */}
        <section id="experience" className="border-t py-24">
          <SectionLabel n="02">Experience</SectionLabel>
          <div className="space-y-12">
            {site.experience.map((job) => (
              <article key={job.company} className="grid gap-4 md:grid-cols-[11rem_1fr] md:gap-8">
                <div className="font-mono text-sm text-muted">{job.period}</div>
                <div>
                  <h3 className="font-display text-xl font-semibold">
                    {job.role} <span className="text-accent">· {job.company}</span>
                  </h3>
                  <ul className="mt-3 space-y-2 leading-relaxed text-muted">
                    {job.points.map((pt, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-1 text-accent">—</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                  <ul className="mt-4 flex flex-wrap gap-2 font-mono text-xs text-muted">
                    {job.stack.map((t) => (
                      <li key={t} className="rounded-full border px-2 py-0.5">{t}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section id="skills" className="border-t py-24">
          <SectionLabel n="03">Skills &amp; stack</SectionLabel>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {site.skills.map((s) => (
              <div key={s.group}>
                <h3 className="mb-4 font-display text-lg font-semibold">{s.group}</h3>
                <ul className="space-y-2 font-mono text-sm text-muted">
                  {s.items.map((it) => (
                    <li key={it} className="flex items-center gap-2">
                      <span className="text-accent">▸</span>
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section id="projects" className="border-t py-24">
          <SectionLabel n="04">Selected projects</SectionLabel>
          <p className="mb-8 max-w-xl leading-relaxed text-muted">
            Not everything here has a public repo — a trading bot&apos;s edge doesn&apos;t survive
            one. So instead of dead links, two of these run right here: the technique, rebuilt
            for your browser.
          </p>
          <ProjectsShowcase />
        </section>

        {/* Contact */}
        <section id="contact" className="border-t py-24">
          <SectionLabel n="05">Contact</SectionLabel>
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h2 className="font-display text-4xl font-bold leading-tight sm:text-5xl">Let&apos;s talk.</h2>
              <p className="mt-4 max-w-md leading-relaxed text-muted">
                The fastest way to reach me is email — send a note and I&apos;ll get back to you.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-sm">
                <a href={"mailto:" + site.email} className="text-accent hover:underline">{site.email}</a>
                <a href={site.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-foreground">LinkedIn ↗</a>
                {site.socials.github && (
                  <a href={site.socials.github} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-foreground">GitHub ↗</a>
                )}
              </div>
              <p className="mt-10 font-mono text-xs text-muted">
                psst — open your browser console, or press <ShortcutK />. there&apos;s more here than meets the eye.
              </p>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-2 px-6 py-8 font-mono text-xs text-muted sm:flex-row sm:items-center">
          <span>
            © {new Date().getFullYear()} {site.name}
          </span>
          <span>Built with Next.js &amp; Tailwind · <ShortcutK /> to explore</span>
        </div>
      </footer>
    </div>
  );
}
