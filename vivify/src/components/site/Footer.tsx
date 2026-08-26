import { Camera, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="footer-gradient mt-16 relative overflow-hidden text-cream">
      <div className="absolute inset-x-0 top-0 h-[2px] gradient-bead opacity-80" />
      <div className="absolute -top-40 -right-40 w-[32rem] h-[32rem] rounded-full gradient-bead opacity-15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-32 w-[28rem] h-[28rem] rounded-full bg-accent/20 blur-3xl pointer-events-none" />

      {/* Brand band */}
      <div className="relative max-w-7xl mx-auto px-6 py-6 flex flex-col items-center text-center">
        <p className="font-display italic text-xl md:text-2xl text-cream/85 mt-2 max-w-2xl">
          Handmade beaded bags from Nairobi — each piece strung with intention.
        </p>
        <div className="flex gap-3 mt-4">
          <a href="https://instagram.com/vivify_ke" target="_blank" rel="noreferrer"
            className="w-11 h-11 rounded-full border border-cream/25 flex items-center justify-center hover:bg-accent hover:text-accent-foreground hover:border-accent transition">
            <Camera className="w-4 h-4" />
          </a>
          <a href="mailto:hello@vivify.ke"
            className="w-10 h-10 rounded-full border border-cream/25 flex items-center justify-center hover:bg-accent hover:text-accent-foreground hover:border-accent transition">
            <Mail className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-start items-center justify-center gap-60 border-t border-cream/10">
        <div className="text-center">
          <h4 className="text-xs uppercase tracking-[0.3em] mb-3 text-accent font-semibold">Shop</h4>
          <ul className="space-y-2 text-sm text-cream/80">
            <li className="hover:text-accent transition cursor-pointer">Knot Handle</li>
            <li className="hover:text-accent transition cursor-pointer">Crystal</li>
            <li className="hover:text-accent transition cursor-pointer">Bucket</li>
            <li className="hover:text-accent transition cursor-pointer">Floral</li>
            <li className="hover:text-accent transition cursor-pointer">Beaded Tops</li>
          </ul>
        </div>

        <div className="text-center">
          <h4 className="text-xs uppercase tracking-[0.3em] mb-3 text-accent font-semibold">Contact</h4>
          <ul className="space-y-2 text-sm text-cream/80">
            <li className="flex items-center justify-center gap-2"><MapPin className="w-4 h-4 text-accent" /> Nairobi, Kenya</li>
            <li className="flex items-center justify-center gap-2"><Phone className="w-4 h-4 text-accent" /> +254 115 565 903</li>
            <li className="flex items-center justify-center gap-2"><Mail className="w-4 h-4 text-accent" /> hello@vivify.ke</li>
          </ul>
        </div>

      </div>

      <div className="relative border-t border-cream/10 py-4 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center gap-2 text-xs text-cream/55 tracking-wider">
        <span>© {new Date().getFullYear()} VIVIFY KE — Handmade with love in Nairobi.</span>
        <span className="flex gap-5">
          <a className="hover:text-accent transition cursor-pointer">Privacy</a>
          <a className="hover:text-accent transition cursor-pointer">Terms</a>
        </span>
      </div>
    </footer>
  );
}
