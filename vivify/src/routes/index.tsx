import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/site/ProductCard";
import { transformDjangoData, type UIProduct } from "@/routes/shop";
import hero from "@/assets/hero-model.jpg";

import {ArrowRight, Loader2} from "lucide-react";

export const Route = createFileRoute("/")({
  // The loader queries your live Django API for products before rendering the landing page
  loader: async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

      const res = await fetch(`${apiUrl}/api/bags/`);
      if (!res.ok) throw new Error("Database network response was not ok");
      const data = await res.json();

      // Transform Django's flat list into structured products with color variants
      const allProducts = transformDjangoData(data);
      return { allProducts };
    } catch (err) {
      console.error("Failed to load landing page products from Django:", err);
      return { allProducts: [] };
    }
  },
    pendingMs: 150, // Show spinner after 150ms to prevent screen freezing
    pendingComponent: () => (

        <div className="min-h-screen flex flex-col items-center justify-center text-muted-foreground animate-in fade-in duration-300">
          <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
          <p className="text-xs uppercase tracking-widest font-medium">Loading Collection...</p>
        </div>
      ),
    component: Index,
});

/* STREAMING_CHUNK:Resolving TypeScript types and category matching... */
function Index() {
  // Cast the loader data to UIProduct[] to satisfy TS6133
  const { allProducts } = Route.useLoaderData() as { allProducts: UIProduct[] };

  // NEW: Grab bags marked as featured. If none are featured yet, just fallback to the first 4 items!
  let featured = allProducts.filter((p) => p.is_featured).slice(0, 4);
  if (featured.length === 0) {
    featured = allProducts.slice(0, 4);
  }

  // Extract unique categories dynamically based on what you have added in the Django database
  const dynamicCategories = Array.from(
    new Map(
      allProducts.map((p) => [
        p.category, // Changed category_slug to category to satisfy TS2339
        {
          id: p.category, // Changed category_slug to category to satisfy TS2339
          label: p.categoryLabel,
          desc: `Stunning hand-strung ${p.categoryLabel.toLowerCase()} designs.`
        }
      ])
    ).values()
  );


  return (
    <div>
      {/* HERO */}
      <section className="marble-bg relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid gap-10 px-4 pt-10 pb-16 sm:px-6 md:grid-cols-2 md:pt-20 md:pb-32 md:items-center">
          <div className="min-w-0 animate-float-up">
            <p className="font-script text-2xl text-accent mb-4 sm:text-3xl">handmade in nairobi</p>
            <h1 className="font-display text-4xl leading-[1.05] sm:text-5xl md:text-7xl">
              Bags that <em className="text-accent">vivify</em><br />every outfit.
            </h1>
            <p className="mt-6 text-muted-foreground max-w-md text-lg">
              One-of-a-kind beaded handbags, hand-strung bead by bead. Crystal,
              pearl, and floral statement pieces made to be loved.
            </p>
            <div className="mt-8 grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:flex sm:gap-4">
              <Link to="/shop" className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3.5 rounded-md uppercase tracking-widest text-[11px] font-medium hover:bg-accent hover:text-accent-foreground transition shadow-soft sm:px-7 sm:text-xs">
                Shop the collection <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/lookbook" className="inline-flex items-center justify-center rounded-md border border-foreground/20 px-4 py-3.5 uppercase tracking-widest text-[11px] font-medium hover:border-accent hover:text-accent transition sm:px-7 sm:text-xs">
                Style It
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-6 -left-6 w-32 h-32 rounded-full gradient-bead opacity-30 blur-2xl" />
            <div className="absolute -bottom-6 -right-6 w-40 h-40 rounded-full bg-rose-bead/30 blur-3xl" />
            <img src={hero} alt="Model holding orange beaded bag" width={1024} height={1280} className="relative rounded-2xl shadow-lift object-cover w-full max-h-[640px]" />
          </div>
        </div>
      </section>

      {/* FEATURED 4 BAGS */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 md:py-28">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent">latest drop</p>
            <h2 className="font-display text-4xl md:text-5xl mt-2">The collection</h2>
          </div>
          <Link to="/shop" className="hidden md:inline-flex items-center gap-2 text-sm story-link">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-muted/20">
            <h3 className="font-display text-2xl mb-2">Your shop is empty</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
              Get started by uploading your exquisite beaded bags in your secure Django Admin dashboard!
            </p>
            <Link to="/shop" className="text-accent underline text-sm">Visit Shop Page</Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* CATEGORIES */}
      <section className="bg-secondary/40 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.3em] text-accent">explore</p>
            <h2 className="font-display text-4xl md:text-5xl mt-2">Shop by silhouette</h2>
          </div>

          {dynamicCategories.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm">No active categories found in database.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-4">
              {dynamicCategories.map((c) => (
                <Link
                  key={c.id}
                  to="/shop"
                  search={{ cat: c.id }}
                  className="group bg-card p-4 rounded-xl text-center shadow-soft hover:shadow-lift transition hover-scale sm:p-8"
                >
                  <div className="w-16 h-16 mx-auto rounded-full gradient-bead mb-4 group-hover:scale-110 transition" />
                  <h3 className="font-display text-xl">{c.label}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{c.desc}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>


      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-10">
        <div className="rounded-2xl gradient-warm p-8 md:p-12 text-center shadow-soft">
          <h2 className="font-display text-4xl md:text-5xl">Wear something nobody else has.</h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Every Vivify bag is made by hand in small batches. When it's gone, it's gone.
          </p>
          <Link to="/shop" className="inline-block mt-8 bg-primary text-primary-foreground px-8 py-3.5 rounded-md uppercase tracking-widest text-xs hover:bg-accent hover:text-accent-foreground transition">
            Shop now
          </Link>
        </div>
      </section>
    </div>
  );
}