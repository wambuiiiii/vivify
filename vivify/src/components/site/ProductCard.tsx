import { Link } from "@tanstack/react-router";
// Import our new UIProduct type directly from the shop route
import type { UIProduct } from "@/routes/shop";

export function ProductCard({ product, index = 0 }: { product: UIProduct; index?: number }) {
  // NEW: Calculate if every single color variant of this bag is out of stock
  const isCompletelySoldOut = product.variants.every((v) => v.stock === 0);

  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      className={`group block animate-float-up ${isCompletelySoldOut ? "opacity-75" : ""}`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-secondary shadow-soft">
        <img
          src={product.variants[0].image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* NEW: Premium Sold Out Badge Overlay */}
        {isCompletelySoldOut && (
          <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm text-foreground text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full font-medium shadow-sm">
            Sold Out
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-3 left-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {product.variants.map((v) => (
            <span key={v.id} className="w-5 h-5 rounded-full border-2 border-cream shadow" style={{ background: v.swatch }} />
          ))}
        </div>
      </div>
      <div className="mt-4 flex justify-between items-baseline">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{product.categoryLabel}</p>
          <h3 className="font-display text-xl mt-0.5">{product.name}</h3>
        </div>
        <span className="font-medium">KES {product.price}</span>
      </div>
    </Link>
  );
}