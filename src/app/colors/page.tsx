// Temporary: compare color palettes on the real home page. Delete once one is picked.
const PALETTES = [
  { id: "", name: "Current", note: "All ink, gray labels" },
  { id: "rust", name: "Rust", note: "Section labels, names and links in the site's rust" },
  { id: "navy", name: "Navy & rust", note: "Rust labels, navy names, blue links" },
  { id: "forest", name: "Forest", note: "Labels, names and links in deep green" },
  { id: "teal", name: "Teal & coral", note: "Teal labels and names, coral links" },
  { id: "blue", name: "Blue", note: "Blue labels and links, ink names" },
];

const W = 1200;
const H = 1400;
const SCALE = 0.4;

export default function Colors() {
  return (
    <main className="mx-auto max-w-[1080px] px-5 py-12">
      <h1 className="text-2xl font-semibold">Color options</h1>
      <p className="mt-1 text-muted">The real home page with each text palette; the background stays the same. Pick one and I&apos;ll make a matching dark mode.</p>
      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        {PALETTES.map((p) => (
          <figure key={p.name}>
            <div className="overflow-hidden rounded-lg border" style={{ width: W * SCALE, height: H * SCALE }}>
              <iframe
                title={p.name}
                src={`/?theme=light${p.id ? `&palette=${p.id}` : ""}`}
                width={W}
                height={H}
                style={{ transform: `scale(${SCALE})`, transformOrigin: "0 0", border: 0 }}
              />
            </div>
            <figcaption className="mt-2">
              <span className="font-semibold">{p.name}</span> <span className="text-muted">· {p.note}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
