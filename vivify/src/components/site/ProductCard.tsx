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
      className={`group block min-w-0 animate-float-up ${isCompletelySoldOut ? "opacity-75" : ""}`}
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
          <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm text-foreground text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full font-medium shadow-sm z-10">
            Sold Out
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-3 left-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {product.variants.map((v) => {
            const isVariantSoldOut = v.stock === 0;
            return (
              <span
                key={v.id}
                className={`relative w-5 h-5 rounded-full border border-black/10 shadow-sm overflow-hidden ${
                  isVariantSoldOut ? "opacity-50" : ""
                }`}
                style={{ backgroundColor: v.swatch }}
              >
                {/* Tiny red slash for sold out colors on hover */}
                {isVariantSoldOut && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-full h-[1px] bg-red-600/90 rotate-45 absolute" />
                  </div>
                )}
              </span>
            );
          })}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 sm:mt-4">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs truncate">{product.categoryLabel}</p>
          <h3 className="font-display mt-0.5 text-base break-words sm:text-xl">{product.name}</h3>
        </div>
        <span className="shrink-0 text-sm font-medium sm:text-base">KES {product.price}</span>
      </div>
    </Link>
  );
}