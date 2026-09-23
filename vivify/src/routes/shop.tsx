import { createFileRoute } from "@tanstack/react-router";
import { ProductCard } from "@/components/site/ProductCard";
import { useState, useEffect } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react"; // Import the spinner

// --- TYPES ---
export interface Variant {
  id: number;
  color: string;
  image: string;
  swatch: string;
  stock: number;
}

export interface UIProduct {
  id: string; // We use a URL-friendly slug of the name
  name: string;
  price: string;
  description: string;
  category: string;
  categoryLabel: string;
  is_featured: boolean;
  variants: Variant[];
}

const COLOR_SWATCHES: Record<string, string> = {
  "Tangerine": "#ff7a1a", "Butter": "#f5e58a", "Crimson": "#d8211a",
  "Cocoa": "#4a2418", "Fuchsia": "#e8259a", "Amethyst": "#8a52d4",
  "Lime": "#8ccf2f", "Hot Pink": "#ff3da5", "Sunset": "#ff3d8a",
  "Coral Glow": "#ff7a4a", "Clear": "#ecf3f8", "Ruby": "#d8211a",
  "Ember": "#d9381a", "Orchid": "#a64ad9", "Pearl & Blush": "#fde8ef",
  "Onyx & Gold": "#0f0f10", "Jet Multi": "#1a1a1a", "Noir & Rose": "#141414",
  "Citrus Grove": "#7fb84a", "Rose Quartz": "#ff8ab8",
};

export function transformDjangoData(djangoBags: any[]): UIProduct[] {
  const productMap = new Map<string, UIProduct>();

  djangoBags.forEach((bag) => {
    if (!productMap.has(bag.name)) {
      productMap.set(bag.name, {
        id: bag.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: bag.name,
        price: bag.price,
        description: bag.description,
        category: bag.category_slug,
        categoryLabel: bag.category_name,
        is_featured: bag.is_featured,
        variants: [],
      });
    }

    const product = productMap.get(bag.name)!;

    // THE FIX: Use Django's hex FIRST. If missing, look up the name in our dictionary. If all else fails, use grey.
    const safeSwatch = bag.color_hex || COLOR_SWATCHES[bag.color] || "#cccccc";

    product.variants.push({
      id: bag.id,
      color: bag.color,
      image: bag.image,
      swatch: safeSwatch, // Uses the guaranteed color!
      stock: bag.stock,
    });
  });

  const products = Array.from(productMap.values());
  products.forEach(p => p.variants.sort((a, b) => a.id - b.id));

  return products;
}

// --- ROUTE & COMPONENT ---
const searchSchema = z.object({ cat: z.string().optional() });

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Shop — Vivify Beaded Bags" },
      { name: "description", content: "Browse all Vivify beaded handbags by silhouette." },
    ],
  }),
  // 1. Moved the fetch into the loader
  loader: async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/bags/`);
      if (!res.ok) throw new Error("Database network response was not ok");
      const data = await res.json();
      return { products: transformDjangoData(data) };
    } catch (err) {
      console.error("Failed to fetch bags:", err);
      return { products: [] };
    }
  },
  // 2. Added the pending state to stop screen freezing
  pendingMs: 150,
  pendingComponent: () => (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-muted-foreground animate-in fade-in duration-300">
      <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
      <p className="text-xs uppercase tracking-widest font-medium">Loading Shop...</p>
    </div>
  ),
  component: Shop,
});

function Shop() {
  const search = Route.useSearch();
  // 3. Receive the loaded data instantly from the router
  const { products } = Route.useLoaderData();

  const [filter, setFilter] = useState<string | undefined>(search.cat);

  // Keep the filter in sync if the URL changes
  useEffect(() => {
    setFilter(search.cat);
  }, [search.cat]);

  // Dynamically generate category buttons from the actual data!
  const categories = Array.from(
    new Map(products.map((p) => [p.category, { id: p.category, label: p.categoryLabel }])).values()
  );

  const list = filter ? products.filter((p) => p.category === filter) : products;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 sm:py-16">
      <header className="text-center mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">shop</p>
        <h1 className="font-display text-4xl mt-2 sm:text-5xl">All bags</h1>
      </header>

      <div className="mb-10 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setFilter(undefined)}
          className={`px-5 py-2 rounded-full text-xs uppercase tracking-wider border transition ${!filter ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-accent"}`}
        >All</button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={`px-5 py-2 rounded-full text-xs uppercase tracking-wider border transition ${filter === c.id ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-accent"}`}
          >{c.label}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
        {list.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </div>
  );
}