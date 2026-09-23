import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, X } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function CartDrawer() {
  const { open, setOpen, detailed, setQty, remove, subtotal } = useCart();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full max-w-none overflow-x-hidden sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">Your Bag</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-auto -mx-6 px-6 mt-4">
          {detailed.length === 0 ? (
            <p className="text-muted-foreground text-sm py-12 text-center">Your bag is empty.</p>
          ) : (
            <ul className="space-y-5">
              {detailed.map((it) => (
                <li key={it.variantId} className="grid grid-cols-[4rem_minmax(0,1fr)] gap-3">
                  <img src={it.variant.image} alt={it.name} className="h-16 w-16 rounded-md bg-muted object-cover sm:h-20 sm:w-20" />
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{it.name}</p>
                        <p className="text-xs text-muted-foreground">{it.variant.color}</p>
                      </div>
                      <button onClick={() => remove(it.variantId)} aria-label="Remove">
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
                      <div className="flex items-center border border-border rounded-md">
                        <button onClick={() => setQty(it.variantId, it.qty - 1)} className="px-2 py-1"><Minus className="w-3 h-3" /></button>
                        <span className="px-2 text-sm">{it.qty}</span>
                        <button onClick={() => setQty(it.variantId, it.qty + 1)} className="px-2 py-1"><Plus className="w-3 h-3" /></button>
                      </div>
                      <span className="min-w-0 text-right font-medium tabular-nums">KES {(it.price * it.qty).toLocaleString()}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {detailed.length > 0 && (
          <div className="border-t border-border pt-4 mt-4 space-y-4">
            <div className="flex justify-between font-medium">
              <span>Subtotal</span>
              <span>KES {subtotal.toLocaleString()}</span>
            </div>
            <Link
              to="/checkout"
              onClick={() => setOpen(false)}
              className="block text-center bg-primary text-primary-foreground py-3 rounded-md uppercase tracking-wider text-sm hover:bg-accent hover:text-accent-foreground transition"
            >
              Checkout
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
