
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { CheckCircle2, Truck, Store } from "lucide-react";

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/supabase/client";


declare global {
  interface Window {
    google: any;
  }
}

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clear, detailed, subtotal } = useCart();

  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [shippingFee, setShippingFee] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  const [phone, setPhone] = useState("");

  const addressInputRef = useRef<HTMLInputElement>(null);
  const [addressDetails, setAddressDetails] = useState({
    address: '',
    lat: null as number | null,
    lng: null as number | null,
  });

  const total = subtotal + shippingFee;

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }: any) => {
      setSession(data.session);
    });

    // Listen for auth state changes (crucial for when you are redirected back from Google)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (deliveryMethod === 'delivery' && addressInputRef.current && window.google) {
      const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        componentRestrictions: { country: "ke" },
        fields: ["formatted_address", "geometry"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          setAddressDetails({ address: place.formatted_address || '', lat, lng });
          calculateShipping(lat, lng);
        }
      });
    }
  }, [deliveryMethod]);

  useEffect(() => {
    if (deliveryMethod === 'pickup') {
      setShippingFee(0);
    } else if (addressDetails.lat) {
      calculateShipping(addressDetails.lat, addressDetails.lng!);
    }
  }, [deliveryMethod]);

  const calculateShipping = async (lat: number, lng: number) => {
    setIsCalculating(true);
    try {
      const response = await fetch("http://localhost:8000/api/shipping/calculate/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng })
      });
      const data = await response.json();
      if (response.ok) setShippingFee(data.fee);
    } catch (err) {
      toast.error("Could not calculate delivery distance.");
    } finally {
      setIsCalculating(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("Please log in to checkout.");
      navigate({ to: "/auth" });
      return;
    }
    if (deliveryMethod === 'delivery' && !addressDetails.lat) {
      toast.error("Please select a valid address.");
      return;
    }
    if (!phone) {
      toast.error("Please enter your M-Pesa number.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/checkout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          items: items.map((item: any) => ({ bag_id: parseInt(item.variantId), quantity: item.qty || 1 })),
          delivery_method: deliveryMethod,
          shipping_latitude: addressDetails.lat,
          shipping_longitude: addressDetails.lng,
          phone_number: phone
        })
      });
      if (!response.ok) throw new Error("Checkout failed.");
      clear();
      setOrderSuccess(true);
    } catch (err) {
      toast.error("Order failed.");
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-xl mx-auto px-6 py-32 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto text-accent" />
        <h1 className="font-display text-4xl mt-6">Thank you!</h1>
        <Link to="/shop" className="block mt-8 bg-primary text-primary-foreground px-7 py-3 rounded-md">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-display text-4xl mb-10">Checkout</h1>
      <div className="grid md:grid-cols-2 gap-12">
        <form onSubmit={handlePlaceOrder} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={() => setDeliveryMethod('delivery')} className={`p-4 border rounded flex items-center justify-center gap-2 ${deliveryMethod === 'delivery' ? 'border-accent bg-accent/5' : 'border-border'}`}>
              <Truck className="w-5 h-5" /> Same Day Delivery
            </button>
            <button type="button" onClick={() => setDeliveryMethod('pickup')} className={`p-4 border rounded flex items-center justify-center gap-2 ${deliveryMethod === 'pickup' ? 'border-accent bg-accent/5' : 'border-border'}`}>
              <Store className="w-5 h-5" /> Pickup Mtaani
            </button>
          </div>

          {deliveryMethod === 'delivery' ? (
            <input ref={addressInputRef} placeholder="Start typing your location..." className="w-full border rounded px-3 py-2.5" />
          ) : (
            <div className="border p-4 rounded bg-secondary/20">
              <p className="text-sm mb-4">Pickup Mtaani coordinated via agent. Click to contact:</p>
              <div className="flex gap-2">
                <a href="https://wa.me/254700000000" target="_blank" rel="noreferrer" className="flex-1 bg-[#25D366] text-white p-3 rounded text-center">WhatsApp</a>
                <a href="tel:+254700000000" className="flex-1 bg-muted p-3 rounded text-center">Call</a>
              </div>
            </div>
          )}

          <input type="tel" placeholder="M-Pesa Phone Number (e.g. 254700000000)" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded px-3 py-2.5" required />

          <button type="submit" disabled={loading || isCalculating} className="w-full py-4 bg-primary text-white rounded">
            {loading ? "Processing..." : `Pay KES ${total}`}
          </button>
        </form>

        <aside className="bg-secondary/50 rounded-xl p-6">
          <h2 className="text-2xl mb-4">Order summary</h2>
          {detailed.length === 0 ? (
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
          ) : (
            detailed.map((it: any) => (
              <div key={it.variantId} className="flex py-3 items-center">
                <div className="flex-1">{it.name} x{it.qty}</div>
                <span>KES {it.price * it.qty}</span>
              </div>
            ))
          )}
          <div className="pt-4 border-t mt-4 flex justify-between font-bold">
            <span>Total</span><span>KES {total}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}