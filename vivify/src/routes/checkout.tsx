import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { CheckCircle2, Truck, Store, LocateFixed, MapPin, Loader2 } from "lucide-react";
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
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [shippingFee, setShippingFee] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  const [phone, setPhone] = useState("");

  const addressInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);

  const [addressDetails, setAddressDetails] = useState({
    address: '',
    lat: null as number | null,
    lng: null as number | null,
  });

  // NEW: Ensure total ignores shipping fee if Pickup Mtaani is selected
  const total = subtotal + (deliveryMethod === 'pickup' ? 0 : shippingFee);

  const calculateShipping = useCallback(async (lat: number, lng: number) => {
    setIsCalculating(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/shipping/calculate/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng })
      });
      const data = await response.json();
      if (response.ok && data.fee !== undefined) {
        setShippingFee(data.fee);
      }
    } catch {
      toast.error("Could not calculate delivery distance.");
    } finally {
      setIsCalculating(false);
    }
  }, []);

  const updateAddressFromCoords = useCallback((lat: number, lng: number) => {
    setAddressDetails(prev => ({ ...prev, lat, lng }));
    calculateShipping(lat, lng);

    if (window.google?.maps?.Geocoder) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
        if (status === "OK" && results?.[0]) {
          const formatted = results[0].formatted_address;
          setAddressDetails(prev => ({ ...prev, address: formatted }));
          if (addressInputRef.current) {
            addressInputRef.current.value = formatted;
          }
        }
      });
    }
  }, [calculateShipping]);

  // Auth & Session Restore
  useEffect(() => {
    supabase.auth.getSession().then(({ data }: any) => {
      setSession(data.session);
      setIsAuthLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event: any, s: any) => {
      setSession(s);
      setIsAuthLoading(false);
    });

    const savedState = sessionStorage.getItem("checkoutState");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.deliveryMethod) setDeliveryMethod(parsed.deliveryMethod);
        // REMOVED: Auto-calculating shipping based on saved session to force manual input
      } catch (e) {}
      sessionStorage.removeItem("checkoutState");
    }

    return () => authListener.subscription.unsubscribe();
  }, []);

  // Fetch Django Profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.access_token) return;
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const res = await fetch(`${apiUrl}/api/profile/`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.saved_phone && !phone) setPhone(data.saved_phone);
          // REMOVED: Auto-calculating shipping from saved profile coords to force manual Auto-Detect
        }
      } catch {}
    };
    fetchProfile();
  }, [session, phone]);

  // Init Google Maps (Advanced Marker API)
  useEffect(() => {
    if (deliveryMethod === 'pickup') return;

    let initStarted = false;
    const checkGoogleInterval = setInterval(async () => {
      if (window.google?.maps && !initStarted) {
        initStarted = true;
        clearInterval(checkGoogleInterval);

        // A. Autocomplete
        if (addressInputRef.current && !addressInputRef.current.hasAttribute('data-bound')) {
          addressInputRef.current.setAttribute('data-bound', 'true');
          const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
            componentRestrictions: { country: "ke" },
            fields: ["formatted_address", "geometry"],
          });

          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (place.geometry?.location) {
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
              updateAddressFromCoords(lat, lng);
            }
          });
        }

        // B. Map & Advanced Marker
        if (mapRef.current && !mapInstance.current) {
          const defaultPos = addressDetails.lat
            ? { lat: addressDetails.lat, lng: addressDetails.lng }
            : { lat: -1.286389, lng: 36.817223 }; // Nairobi

          try {
            const { Map } = await window.google.maps.importLibrary("maps");
            const { AdvancedMarkerElement } = await window.google.maps.importLibrary("marker");

            const map = new Map(mapRef.current, {
              center: defaultPos,
              zoom: addressDetails.lat ? 16 : 12,
              disableDefaultUI: true,
              zoomControl: true,
              mapId: "VIVIFY_CHECKOUT",
            });
            mapInstance.current = map;

            const marker = new AdvancedMarkerElement({
              position: defaultPos,
              map,
              gmpDraggable: true,
            });

            marker.addListener("dragend", () => {
              const pos = marker.position as google.maps.LatLng;
              const lat = typeof pos.lat === "function" ? pos.lat() : pos.lat;
              const lng = typeof pos.lng === "function" ? pos.lng() : pos.lng;
              updateAddressFromCoords(lat as number, lng as number);
            });
            markerInstance.current = marker;
          } catch (err) {
            console.error("Map load failed", err);
          }
        }
      }
    }, 150);

    return () => clearInterval(checkGoogleInterval);
  }, [deliveryMethod, addressDetails.lat, addressDetails.lng, updateAddressFromCoords]);

  // Center map on update
  useEffect(() => {
    if (mapInstance.current && markerInstance.current && addressDetails.lat && addressDetails.lng) {
      const pos = { lat: addressDetails.lat, lng: addressDetails.lng };
      mapInstance.current.setCenter(pos);
      mapInstance.current.setZoom(16);
      markerInstance.current.position = pos;
    }
  }, [addressDetails.lat, addressDetails.lng]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported.");
      return;
    }
    setIsCalculating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => updateAddressFromCoords(pos.coords.latitude, pos.coords.longitude),
      () => {
        toast.error("Please enable location permissions.");
        setIsCalculating(false);
      }
    );
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthLoading || deliveryMethod === 'pickup') return;

    if (!session) {
      toast.error("Please log in to checkout.");
      sessionStorage.setItem("checkoutState", JSON.stringify({ phone, addressDetails, deliveryMethod }));
      navigate({ to: "/auth", search: { redirect: "/checkout" } as any });
      return;
    }

    if (deliveryMethod === 'delivery' && (!addressDetails.lat || !addressDetails.lng)) {
      toast.error("Please specify an address on the map.");
      return;
    }

    if (!phone) {
      toast.error("Please enter your M-Pesa phone number.");
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/checkout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          items: items.map((it: any) => ({ bag_id: parseInt(it.variantId), quantity: it.qty || 1 })),
          delivery_method: deliveryMethod,
          shipping_latitude: addressDetails.lat,
          shipping_longitude: addressDetails.lng,
          phone_number: phone
        })
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || "Checkout failed.");

      clear();
      sessionStorage.removeItem("checkoutState");
      toast.success(resData.message || "Prompt sent! Enter your PIN.");
      setOrderSuccess(true);
    } catch (err: any) {
      toast.error(err.message || "Order failed.");
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-xl mx-auto px-6 py-32 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-600" />
        <h1 className="font-display text-4xl mt-6">Thank you!</h1>
        <p className="text-muted-foreground mt-2">Check your phone to complete payment.</p>
        <Link to="/shop" className="inline-block mt-8 bg-primary text-primary-foreground px-7 py-3 rounded-md">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-4xl mb-10">Checkout</h1>
      <div className="grid md:grid-cols-2 gap-12">
        <form onSubmit={handlePlaceOrder} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={() => setDeliveryMethod('delivery')} className={`p-4 border rounded-lg flex items-center justify-center gap-2 ${deliveryMethod === 'delivery' ? 'border-black bg-neutral-100 font-medium' : 'border-neutral-200 text-muted-foreground'}`}>
              <Truck className="w-5 h-5" /> Same Day Delivery
            </button>
            <button type="button" onClick={() => setDeliveryMethod('pickup')} className={`p-4 border rounded-lg flex items-center justify-center gap-2 ${deliveryMethod === 'pickup' ? 'border-black bg-neutral-100 font-medium' : 'border-neutral-200 text-muted-foreground'}`}>
              <Store className="w-5 h-5" /> Pickup Mtaani
            </button>
          </div>

          {/* RENDERS ONLY IF DELIVERY IS SELECTED */}
          {deliveryMethod === 'delivery' && (
            <>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <input ref={addressInputRef} placeholder="Search building, estate..." className="w-full border rounded-lg pl-10 pr-3 py-2.5 outline-none focus:ring-1 focus:ring-black" />
                  </div>
                  <button type="button" onClick={handleGetLocation} disabled={isCalculating} className="border border-neutral-200 px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-neutral-100 transition disabled:opacity-50">
                    {isCalculating ? <Loader2 className="w-5 h-5 animate-spin" /> : <LocateFixed className="w-5 h-5" />}
                    <span className="hidden sm:inline text-sm font-medium">Auto-Detect</span>
                  </button>
                </div>
                <div className="text-xs text-muted-foreground px-1">Drag the marker to pinpoint your exact gate.</div>
                <div ref={mapRef} className="w-full h-64 rounded-lg border border-neutral-200 bg-neutral-50 overflow-hidden" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">M-Pesa Number</label>
                <input type="tel" placeholder="e.g. 0700000000" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded-lg px-3 py-2.5 outline-none focus:ring-1 focus:ring-black" required />
              </div>

              {/* PAY BUTTON: Only displays for delivery, disabled until location is set */}
              <button
                type="submit"
                disabled={loading || isCalculating || isAuthLoading || !addressDetails.lat}
                className="w-full py-4 bg-black text-white font-medium rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending STK Prompt...</> : isCalculating ? "Calculating Delivery..." : `Pay KES ${total.toLocaleString()}`}
              </button>
            </>
          )}

          {/* RENDERS ONLY IF PICKUP IS SELECTED */}
          {deliveryMethod === 'pickup' && (
            <div className="border border-neutral-200 p-4 rounded-lg bg-neutral-50">
              <p className="text-sm mb-4 text-neutral-700">Pickup Mtaani coordinated via agent. Click below to confirm pickup location:</p>
              <div className="flex gap-2">
                <a href="https://wa.me/+254115565903" target="_blank" rel="noreferrer" className="flex-1 bg-[#25D366] text-white p-3 rounded-lg text-center font-medium">WhatsApp</a>
                <a href="tel:+254700000000" className="flex-1 bg-neutral-200 text-neutral-800 p-3 rounded-lg text-center font-medium">Call</a>
              </div>
            </div>
          )}
        </form>

        <aside className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 h-fit">
          <h2 className="text-2xl font-display mb-4">Order summary</h2>
          {detailed.length === 0 ? (
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
          ) : (
            <div className="divide-y divide-neutral-200">
              {detailed.map((it: any) => (
                <div key={it.variantId} className="grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3 py-3 text-sm">
                  <img src={it.variant.image} alt={it.name} className="h-14 w-14 rounded-md object-cover bg-neutral-200" />
                  <div className="min-w-0">
                    <div className="truncate font-medium text-neutral-800">{it.name}</div>
                    <div className="text-muted-foreground text-xs">Qty: {it.qty}</div>
                  </div>
                  <span className="shrink-0 font-medium tabular-nums">KES {(it.price * it.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
          <div className="pt-4 border-t border-neutral-200 mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-neutral-600"><span>Subtotal</span><span>KES {subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between text-neutral-600">
              <span>Delivery Fee</span>
              <span>
                {deliveryMethod === 'pickup'
                  ? 'Free (Pickup)'
                  : isCalculating
                    ? 'Calculating...'
                    : `KES ${shippingFee.toLocaleString()}`
                }
              </span>
            </div>
            <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-base text-black"><span>Total</span><span>KES {total.toLocaleString()}</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}