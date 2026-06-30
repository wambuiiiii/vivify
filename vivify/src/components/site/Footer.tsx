import logo from "@/assets/vivify-logo.png";
import { Camera, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="footer-gradient mt-16 relative overflow-hidden text-cream">
      <div className="absolute inset-x-0 top-0 h-[2px] gradient-bead opacity-80" />
      <div className="absolute -top-40 -right-40 w-[32rem] h-[32rem] rounded-full gradient-bead opacity-15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-32 w-[28rem] h-[28rem] rounded-full bg-accent/20 blur-3xl pointer-events-none" />

      {/* Brand band */}
      <div className="relative max-w-7xl mx-auto px-6 pt-5 pb-3 flex flex-col items-center text-center">
        <img src={logo} alt="Vivify" className="h-64 md:h-80 w-auto invert brightness-200" />
        <p className="font-display italic text-2xl md:text-3xl text-cream/85 mt-0 max-w-2xl">
          Handmade beaded bags from Nairobi — each piece strung with intention.
        </p>
        <div className="flex gap-3 mt-7">
          <a href="https://instagram.com/vivify_ke" target="_blank" rel="noreferrer"
            className="w-11 h-11 rounded-full border border-cream/25 flex items-center justify-center hover:bg-accent hover:text-accent-foreground hover:border-accent transition">
            <Camera className="w-5 h-5" />
          </a>
          <a href="mailto:hello@vivify.ke"
            className="w-11 h-11 rounded-full border border-cream/25 flex items-center justify-center hover:bg-accent hover:text-accent-foreground hover:border-accent transition">
            <Mail className="w-5 h-5" />
          </a>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pb-16 grid md:grid-cols-4 gap-12 border-t border-cream/10 pt-14">
        <div>
          <h4 className="text-xs uppercase tracking-[0.3em] mb-5 text-accent font-semibold">Shop</h4>
          <ul className="space-y-3 text-sm text-cream/80">
            <li className="hover:text-accent transition cursor-pointer">Knot Handle</li>
            <li className="hover:text-accent transition cursor-pointer">Crystal</li>
            <li className="hover:text-accent transition cursor-pointer">Bucket</li>
            <li className="hover:text-accent transition cursor-pointer">Floral</li>
            <li className="hover:text-accent transition cursor-pointer">Beaded Tops</li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.3em] mb-5 text-accent font-semibold">Care</h4>
          <ul className="space-y-3 text-sm text-cream/80">
            <li className="hover:text-accent transition cursor-pointer">Shipping</li>
            <li className="hover:text-accent transition cursor-pointer">Returns</li>
            <li className="hover:text-accent transition cursor-pointer">Bag Care</li>
            <li className="hover:text-accent transition cursor-pointer">Contact</li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.3em] mb-5 text-accent font-semibold">Visit</h4>
          <ul className="space-y-3 text-sm text-cream/80">
            <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-accent" /> Nairobi, Kenya</li>
            <li className="flex items-start gap-2"><Phone className="w-4 h-4 mt-0.5 text-accent" /> +254 700 000 000</li>
            <li className="flex items-start gap-2"><Mail className="w-4 h-4 mt-0.5 text-accent" /> hello@vivify.ke</li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.3em] mb-5 text-accent font-semibold">Newsletter</h4>
          <p className="text-sm text-cream/80 mb-4">New drops, first look — straight to your inbox.</p>
          <form className="flex gap-2">
            <input className="flex-1 bg-cream/5 border border-cream/25 rounded-md px-3 py-2.5 text-sm text-cream placeholder:text-cream/40 focus:border-accent focus:outline-none transition" placeholder="email@you.com" />
            <button className="bg-accent text-accent-foreground px-5 rounded-md text-xs uppercase tracking-wider font-semibold hover:bg-accent/90 transition">Join</button>
          </form>
        </div>
      </div>

      <div className="relative border-t border-cream/10 py-6 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-cream/55 tracking-wider">
        <span>© {new Date().getFullYear()} VIVIFY KE — Handmade with love in Nairobi.</span>
        <span className="flex gap-5">
          <a className="hover:text-accent transition cursor-pointer">Privacy</a>
          <a className="hover:text-accent transition cursor-pointer">Terms</a>
        </span>
      </div>
    </footer>
  );
}
