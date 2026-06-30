import { createFileRoute } from "@tanstack/react-router";
import { ProductCard } from "@/components/site/ProductCard";
import { useState, useEffect } from "react";
import { z } from "zod";

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

// --- THE GROUPING MAGIC ---
// This turns Django's flat list into your beautiful nested Variant UI
export function transformDjangoData(djangoBags: any[]): UIProduct[] {
  const productMap = new Map<string, UIProduct>();

  djangoBags.forEach((bag) => {
    if (!productMap.has(bag.name)) {
      productMap.set(bag.name, {
        id: bag.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), // e.g., "bucket-bag"
        name: bag.name,
        price: bag.price,
        description: bag.description,
        category: bag.category_slug,
        categoryLabel: bag.category_name,
        is_featured: bag.is_featured,
        variants: [],
      });
    } // <--- THIS CLOSING BRACE WAS MISSING!

    // Grab the product shell from the map
    const product = productMap.get(bag.name)!;

    // FIX: If the bag was created before we added the color_hex field,
    // it might be empty. We default it to a nice silver-grey so it doesn't break!
    const safeSwatch = bag.color_hex ? bag.color_hex : "#cccccc";

    // Push this specific color row into the product's variants array
    product.variants.push({
      id: bag.id,
      color: bag.color,
      image: bag.image,
      swatch: safeSwatch,
      stock: bag.stock,
    });
  });

  const products = Array.from(productMap.values());

  // Sort variants by ID so the oldest (first created) is always the default!
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
  component: Shop,
});

function Shop() {
  const search = Route.useSearch();
  const [filter, setFilter] = useState<string | undefined>(search.cat);
  const [products, setProducts] = useState<UIProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch from Django on load
  useEffect(() => {
    fetch("http://localhost:8000/api/bags/")
      .then((res) => res.json())
      .then((data) => {
        setProducts(transformDjangoData(data));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch bags:", err);
        setLoading(false);
      });
  }, []);

  // Dynamically generate category buttons from the actual data!
  const categories = Array.from(
    new Map(products.map((p) => [p.category, { id: p.category, label: p.categoryLabel }])).values()
  );

  const list = filter ? products.filter((p) => p.category === filter) : products;

  if (loading) return <div className="py-32 text-center text-muted-foreground">Loading collection...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <header className="text-center mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">shop</p>
        <h1 className="font-display text-5xl mt-2">All bags</h1>
      </header>

      <div className="flex flex-wrap justify-center gap-2 mb-10">
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {list.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </div>
  );
}