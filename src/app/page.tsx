import { site } from "@/lib/site";
import { LastWorkout } from "@/components/last-workout";
import { DemoToggle } from "@/components/demo-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { SideNav } from "@/components/side-nav";
import { LogoMark } from "@/components/logo-mark";
import { ContactForm } from "@/components/contact-form";

const SECTIONS = [
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" },
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-16 scroll-mt-8">
      <h2 className="mb-6 border-b pb-2 text-sm font-semibold text-heading">{title}</h2>
      {children}
    </section>
  );
}

export default function Home() {
  const f = site.featured;
  return (
    <div className="mx-auto max-w-[920px] px-5 lg:grid lg:grid-cols-[11rem_1fr] lg:gap-14">
      <aside className="hidden pt-20 lg:block">
        <SideNav items={SECTIONS} />
      </aside>

      <main className="max-w-[660px] pb-24 pt-20 text-[17px] leading-[1.65]">
        <div id="about" className="scroll-mt-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <LogoMark size={56} />
              <div>
                <h1 className="text-3xl font-semibold tracking-[-0.01em]">{site.name}</h1>
                <p className="mt-1 text-muted">
                  {site.role} in {site.location}
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <div className="mt-8 space-y-4">
            {site.about.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <p className="mt-6 flex flex-wrap gap-x-2 text-muted">
            <a className="text-link text-foreground" href={`mailto:${site.email}`}>{site.email}</a>
            <span>/</span>
            <a className="text-link" href={site.socials.github}>GitHub</a>
            <span>/</span>
            <a className="text-link" href={site.socials.linkedin}>LinkedIn</a>
            {site.resumeUrl && (
              <>
                <span>/</span>
                <a className="text-link" href={site.resumeUrl}>Résumé</a>
              </>
            )}
          </p>
        </div>

        <Section id="projects" title="Projects">
          <article>
            <h3 className="text-title text-xl font-semibold">
              <a className="text-link" href={f.code}>{f.name}</a>
            </h3>
            <p className="text-muted">{f.oneLiner}</p>
            <p className="mt-3">{f.description}</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 marker:text-muted">
              {f.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
            <LastWorkout />
            <p className="mt-3 text-sm text-muted">{f.tech.join(" · ")}</p>
          </article>

          <div className="mt-12 space-y-8">
            {site.projects.map((p) => (
              <article key={p.name}>
                <h3 className="text-title font-semibold">{p.name}</h3>
                <p>{p.description}</p>
                <p className="text-sm text-muted">{p.tech.join(" · ")}</p>
                {p.demo && (
                  <div className="mt-1">
                    <DemoToggle id={p.demo} />
                  </div>
                )}
              </article>
            ))}
          </div>
        </Section>

        <Section id="experience" title="Experience">
          <div className="space-y-9">
            {site.experience.map((job) => (
              <article key={job.company}>
                <h3 className="text-title font-semibold">{job.company}</h3>
                <ol className={job.roles.length > 1 ? "mt-2 space-y-4 border-l pl-4" : "mt-1"}>
                  {job.roles.map((r) => (
                    <li key={r.title}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                        <span className="text-muted">{r.title}</span>
                        <span className="text-sm tabular-nums text-muted">{r.period}</span>
                      </div>
                      {r.summary && <p className="mt-1">{r.summary}</p>}
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </Section>

        <Section id="education" title="Education">
          <p className="text-title font-semibold">{site.education.school}</p>
          <p>{site.education.degree}</p>
          <p className="text-muted">{site.education.note}</p>
        </Section>

        <Section id="contact" title="Contact">
          <p className="mb-5">
            Send me a note here, or email{" "}
            <a className="text-link" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            .
          </p>
          <ContactForm />
        </Section>

        <footer className="mt-20 border-t pt-4 text-sm text-muted">
          © {new Date().getFullYear()} {site.name}
        </footer>
      </main>
    </div>
  );
}
