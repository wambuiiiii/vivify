import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { ProductCard } from "@/components/site/ProductCard";
import { transformDjangoData, type UIProduct, type Variant } from "@/routes/shop";

export const Route = createFileRoute("/product/$id")({
  loader: async ({ params }) => {
    try {
      const res = await fetch("http://localhost:8000/api/bags/");
      const data = await res.json();

      const allProducts = transformDjangoData(data);
      const product = allProducts.find((p) => p.id === params.id);

      if (!product) throw notFound();

      return { product, allProducts };
    } catch (err) {
      throw notFound();
    }
  },
  notFoundComponent: () => (
    <div className="max-w-xl mx-auto py-32 text-center">
      <h1 className="font-display text-4xl">Bag not found</h1>
      <Link to="/shop" className="text-accent underline mt-4 inline-block">Back to shop</Link>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product, allProducts } = Route.useLoaderData();
  const { add } = useCart();

  // --- STATE ---
  const [variant, setVariant] = useState<Variant>(product.variants[0]);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  // --- EFFECTS ---
  // Reset the selected color to the default when a new bag is loaded
  // We ONLY watch [product.id] here to prevent the infinite loop!
  useEffect(() => {
    setVariant(product.variants[0]);
  }, [product.id]);

  // --- HANDLERS ---
  const handleMouseMove = (e: React.MouseEvent) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPos({ x, y });
  };

  const handleAddToCart = () => {
    add(product.id, String(variant.id), product.name, Number(product.price), variant);
  };

  // --- DERIVED DATA ---
  const relatedProducts: UIProduct[] = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  const isSoldOut = variant.stock === 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        {/* IMAGE GALLERY & ZOOM */}
        <div
          className="relative aspect-square overflow-hidden rounded-xl bg-secondary shadow-soft cursor-zoom-in"
          onMouseEnter={() => setZoom(true)}
          onMouseLeave={() => setZoom(false)}
          onMouseMove={handleMouseMove}
        >
          <img
            src={variant.image}
            alt={`${product.name} in ${variant.color}`}
            className="w-full h-full object-cover transition-transform duration-300"
            style={zoom ? { transform: "scale(2)", transformOrigin: `${pos.x}% ${pos.y}%` } : undefined}
          />
        </div>

        {/* PRODUCT DETAILS */}
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent">{product.categoryLabel}</p>
          <h1 className="font-display text-5xl mt-2">{product.name}</h1>
          <p className="text-2xl mt-3">KES {product.price}</p>
          <p className="text-muted-foreground mt-6">{product.description}</p>

          {/* COLOR SWATCHES */}
          <div className="mt-8">
            <p className="text-sm uppercase tracking-wider mb-3">
              Color — <span className="text-muted-foreground normal-case tracking-normal">{variant.color}</span>
            </p>
            <div className="flex gap-3">
              {product.variants.map((v: Variant) => (
                <button
                  key={v.id}
                  onClick={() => setVariant(v)}
                  aria-label={v.color}
                  className={`w-12 h-12 rounded-full border-2 transition ${
                    variant.id === v.id 
                      ? "border-accent ring-2 ring-accent/30" 
                      : "border-border hover:border-foreground/40"
                  }`}
                  style={{ background: v.swatch }}
                />
              ))}
            </div>
          </div>

          {/* VARIANT THUMBNAILS */}
          <div className="grid grid-cols-3 gap-2 mt-6">
            {product.variants.map((v: Variant) => (
              <button
                key={v.id}
                onClick={() => setVariant(v)}
                className={`aspect-square rounded-md overflow-hidden border ${
                  variant.id === v.id ? "border-accent" : "border-border"
                }`}
              >
                <img src={v.image} alt={v.color} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* ADD TO CART BUTTON */}
          <button
            onClick={handleAddToCart}
            disabled={isSoldOut}
            className={`mt-8 w-full py-4 rounded-md uppercase tracking-widest text-sm transition ${
              isSoldOut
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {isSoldOut ? "Sold Out" : `Add to cart — KES ${product.price}`}
          </button>

          {/* PRODUCT PERKS */}
          <div className="mt-8 text-sm text-muted-foreground space-y-2 border-t border-border pt-6">
            <p>✦ Hand-strung in Nairobi</p>
            <p>✦ Satin lining with interior pocket</p>
            <p>✦ Ships worldwide in 3–5 days</p>
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      <section className="mt-24">
        <h2 className="font-display text-3xl mb-6">You may also love</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {relatedProducts.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}