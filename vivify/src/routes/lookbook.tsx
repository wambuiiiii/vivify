import { createFileRoute } from "@tanstack/react-router";
import hero from "@/assets/hero-model.jpg";
import orangePearl from "@/assets/lookbook-orange-pearl.jpg";
import whiteRed from "@/assets/lookbook-white-red.jpg";

export const Route = createFileRoute("/lookbook")({
  head: () => ({
    meta: [
      { title: "Style It — Vivify" },
      { name: "description", content: "How to style Vivify beaded bags from day to evening." },
    ],
  }),
  component: Lookbook,
});

function Lookbook() {
  const looks = [
    { img: hero, title: "Cream Silk", caption: "Tangerine knot bag with a slip dress." },
    { img: orangePearl, title: "Tangerine Drama", caption: "Pearl bucket against a fiery orange gown." },
    { img: whiteRed, title: "Crimson Pop", caption: "Red beaded mini with a crisp white set." },
  ];
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <header className="text-center mb-12">
        <p className="font-script text-3xl text-accent">styled</p>
        <h1 className="font-display text-5xl">Style It</h1>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Real outfits, real moments — see exactly how to wear every Vivify piece.</p>
      </header>
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {looks.map((l, i) => (
          <figure key={i} className="break-inside-avoid animate-float-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="overflow-hidden rounded-xl shadow-soft group">
              <img src={l.img} alt={l.title} loading="lazy" className="w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <figcaption className="mt-3">
              <h3 className="font-display text-xl">{l.title}</h3>
              <p className="text-sm text-muted-foreground">{l.caption}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

