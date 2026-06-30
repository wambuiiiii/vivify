import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag, Search, Moon, Sun, User, LogOut } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import logo from "@/assets/vivify-logo.png";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/supabase/client";
import { toast } from "sonner";

export function Header() {
  const { count, setOpen } = useCart();
  const navigate = useNavigate();

  // -- State --
  const [dark, setDark] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // -- Effects --
  // Close profile dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Theme & Auth tracking
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);

    // Get initial auth state
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    // Listen for auth changes (logins, logouts)
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // -- Handlers --
  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfileOpen(false);
    toast.success("Successfully logged out. Your old token has been cleared!");
    navigate({ to: "/" });
  };

  // Extract user details
  const userName = session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.first_name || "Vivify Shopper";
  const userEmail = session?.user?.email || "";

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/75 border-b border-border/60">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover-scale shrink-0">
          <img src={logo} alt="Vivify" className="h-40 md:h-48 w-auto -my-12 dark:invert dark:brightness-200" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm tracking-wide uppercase">
          <Link to="/" className="story-link">Home</Link>
          <Link to="/shop" className="story-link">Shop</Link>
          <Link to="/lookbook" className="story-link">Style It</Link>
          <Link to="/about" className="story-link">About</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} aria-label="Toggle theme" className="p-2.5 hover:text-accent transition">
            {dark ? <Sun className="w-7 h-7" strokeWidth={1.5} /> : <Moon className="w-7 h-7" strokeWidth={1.5} />}
          </button>

          <button aria-label="Search" className="p-2.5 hover:text-accent transition">
            <Search className="w-7 h-7" strokeWidth={1.5} />
          </button>

          <button
            onClick={() => setOpen(true)}
            aria-label="Cart"
            className="relative p-2.5 hover:text-accent transition"
          >
            <ShoppingBag className="w-7 h-7" strokeWidth={1.5} />
            {count > 0 && (
              <span className="absolute top-0 right-0 bg-accent text-accent-foreground text-[11px] rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {count}
              </span>
            )}
          </button>

          {/* User Profile / Auth Toggle */}
          {session ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className={`p-2.5 rounded-full transition flex items-center gap-2 ${profileOpen ? 'text-accent' : 'hover:text-accent'}`}
              >
                <User className="w-7 h-7" strokeWidth={1.5} />
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-border mb-2 bg-secondary/30">
                    <p className="font-medium text-sm truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{userEmail}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-secondary/80 transition flex items-center gap-3"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" aria-label="Sign in" className="p-2.5 hover:text-accent transition">
              <User className="w-7 h-7" strokeWidth={1.5} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}