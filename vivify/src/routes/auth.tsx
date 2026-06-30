import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/supabase/client";
import heroImage from "@/assets/lookbook-orange-pearl.jpg";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In · Vivify" },
      { name: "description", content: "Sign in or create your Vivify account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Account created! Check your email to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: "/" });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

const handleGoogle = async () => {
    setLoading(true);
    try {
      // Replaced Lovable with the real Supabase OAuth function
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        }
      });

      if (error) {
        toast.error(error.message ?? "Google sign-in failed");
        setLoading(false);
        return;
      }

      // Note: We don't need 'navigate()' here. Supabase will physically
      // redirect the browser away to the Google login screen automatically.
    } catch (err: any) {
      toast.error(err.message ?? "Google sign-in failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Visual side */}
      <div className="relative hidden lg:block overflow-hidden">
        <img
          src={heroImage}
          alt="Vivify beaded bag styled"
          className="absolute inset-0 w-full h-full object-cover"
        />

      </div>

      {/* Form side */}
      <div className="relative flex flex-col items-center justify-center px-6 py-12 sm:px-12">
        <Link
          to="/"
          className="absolute top-6 left-6 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition"
        >
          ← Back
        </Link>

        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="inline-block lg:hidden mb-6">
              <Link to="/" className="font-display text-3xl">Vivify</Link>
            </div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              {mode === "signin" ? "Member access" : "Become a member"}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl mt-3">
              {mode === "signin" ? "Welcome back" : "Join Vivify"}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Sign in to continue your collection."
                : "Create your account in a few seconds."}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="relative grid grid-cols-2 p-1 rounded-full bg-muted/60 mb-8 text-sm">
            <span
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-background shadow-sm transition-all duration-300"
              style={{ left: mode === "signin" ? "4px" : "calc(50% + 0px)" }}
            />
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`relative z-10 py-2 rounded-full transition ${
                mode === "signin" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`relative z-10 py-2 rounded-full transition ${
                mode === "signup" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Sign up
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full h-12 gap-3 rounded-full font-normal"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              or with email
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Full name
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-12 rounded-lg"
                  placeholder="Jane Doe"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-lg"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-12 rounded-lg"
                placeholder="••••••••"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full uppercase tracking-[0.2em] text-xs font-medium"
            >
              {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            By continuing you agree to Vivify's{" "}
            <span className="underline underline-offset-2">Terms</span> &{" "}
            <span className="underline underline-offset-2">Privacy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
