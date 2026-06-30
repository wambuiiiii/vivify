import { createFileRoute } from "@tanstack/react-router";


export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Vivify" },
      { name: "description", content: "Vivify is a Nairobi-based atelier for handmade beaded bags." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 text-center">
      <p className="font-script text-3xl text-accent mt-6">our story</p>
      <h1 className="font-display text-5xl mt-2">Made by hand. Worn with joy.</h1>
      <p className="text-muted-foreground mt-8 text-lg leading-relaxed">
        Vivify began in a small Nairobi studio with a single bowl of beads and an
        idea: that everyday accessories could carry artistry, color, and the touch
        of a real human hand.
      </p>
      <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
        Every bag in our collection is hand-strung, one bead at a time. We work
        in tiny batches, choose vivid Kenyan-sourced beads, and finish each piece
        with satin lining sewn in-house.
      </p>
    </div>
  );
}
