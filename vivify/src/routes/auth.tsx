import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { Eye, EyeOff, Check, X, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/supabase/client";

import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

import lightHero from "@/assets/bags/authlight.png";
import darkHero from "@/assets/bags/authdark.png";
import logo from "@/assets/vivify-logo.png";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) || undefined,
  }),
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
  const [mode, setMode] = useState<"signin" | "signup" | "reset" | "update">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const searchParams = new URLSearchParams(window.location.search);
  const redirectPath = searchParams.get("redirect") || "/";
  const fullRedirectUrl = `${window.location.origin}${redirectPath}`;

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  // 1. COMBINED INTERCEPTOR: Handles routing, expired links, and password recovery
  useEffect(() => {
    const hash = window.location.hash;

    // Check for expired OTP error first
    if (hash && hash.includes("error_code=otp_expired")) {
      toast.error("That password reset link has expired or was already used. Please request a new one.");
      setMode("reset");
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      return; // Stop execution
    }

    // Check for password recovery mode
    if (hash && hash.includes("type=recovery")) {
      setMode("update");
      return; // Stop execution, do not run the auto-redirect
    }

    // Standard session check
    supabase.auth.getSession().then(({ data }) => {
      // Only auto-redirect if we are NOT trying to update the password or reset it
      if (data.session && mode !== "update" && mode !== "reset") {
        navigate({ to: redirectPath as any });
      }
    });

    // Listen for specific Auth events
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("update");
      } else if (event === "SIGNED_OUT") {
        toast.success("You have been successfully logged out.");
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [navigate, redirectPath, mode]);

  const passwordRequirements = useMemo(() => {
    return [
      { label: "At least 8 characters", met: password.length >= 8 },
      { label: "One uppercase letter (A-Z)", met: /[A-Z]/.test(password) },
      { label: "One lowercase letter (a-z)", met: /[a-z]/.test(password) },
      { label: "One number (0-9)", met: /[0-9]/.test(password) },
      { label: "One special symbol (!@#$%...)", met: /[^A-Za-z0-9]/.test(password) },
    ];
  }, [password]);

  const isPasswordSecure = useMemo(() => {
    return passwordRequirements.every((r) => r.met);
  }, [passwordRequirements]);

  const parseAuthError = (err: any): string => {
    const msg = (err.message || err.error_description || "").toLowerCase();
    if (msg.includes("invalid login credentials") || msg.includes("invalid_grant")) {
      return "Incorrect email or password. If you originally signed up with Google, please use the Google button above, or reset your password.";
    }
    if (msg.includes("already registered") || msg.includes("already exists")) {
      return "An account with this email already exists. Please switch to Sign In.";
    }
    if (msg.includes("password should be at least") || msg.includes("weak_password")) {
      return "Your password does not meet the minimum security requirements.";
    }
    if (msg.includes("email not confirmed")) {
      return "Please verify your email address. Check your inbox for the confirmation link.";
    }
    if (msg.includes("rate limit") || msg.includes("too many requests")) {
      return "Too many attempts. Please wait a couple minutes before trying again.";
    }
    return err.message || "Authentication failed. Please verify your details.";
  };

  const switchMode = (newMode: "signin" | "signup" | "reset" | "update") => {
    setMode(newMode);
    setFormError(null);
    setFormSuccess(null);
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (mode === "signup" && !fullName.trim()) {
      setFormError("Please provide your full name.");
      return;
    }
    if ((mode === "signup" || mode === "update") && !isPasswordSecure) {
      setFormError("Please satisfy all password security requirements below.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "update") {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;

        toast.success("Password updated successfully!");
        navigate({ to: redirectPath as any });
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth?redirect=${redirectPath}`,
        });

        if (error) throw error;

        setFormSuccess("If an account exists, a password reset link has been sent to your email.");
        toast.success("Reset link sent!");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: fullRedirectUrl,
            data: { full_name: fullName.trim() },
          },
        });

        if (error) throw error;
        toast.success("Account created successfully!");
        navigate({ to: redirectPath as any });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: redirectPath as any });
      }
    } catch (err: any) {
      const friendlyMessage = parseAuthError(err);
      setFormError(friendlyMessage);
      toast.error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setFormError(null);
    setFormSuccess(null);
    setLoading(true);

    try {
      if (!credentialResponse.credential) throw new Error("No credential received.");

      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: credentialResponse.credential,
      });

      if (error) throw error;
      toast.success("Welcome back!");
      navigate({ to: redirectPath as any });
    } catch (err: any) {
      const friendlyMessage = parseAuthError(err);
      setFormError(friendlyMessage);
      toast.error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen grid bg-background lg:grid-cols-2">
        <div className="relative hidden lg:block overflow-hidden">
          <img src={lightHero} alt="Vivify beaded bags arranged" className="absolute inset-0 w-full h-full object-cover dark:hidden" />
          <img src={darkHero} alt="Vivify amber beaded bag in dramatic light" className="absolute inset-0 w-full h-full object-cover hidden dark:block" />
          <div className="absolute inset-0 bg-gradient-to-br from-background/40 via-background/10 to-background/70" />
        </div>

        <div className="relative flex flex-col items-center justify-center px-4 py-10 sm:px-8 sm:py-12 lg:px-12">

          {mode === "reset" || mode === "update" ? (
            <button
              onClick={() => {
                window.history.replaceState(null, "", window.location.pathname + window.location.search);
                switchMode("signin");
              }}
              className="absolute left-4 top-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground sm:left-6 sm:top-6 sm:text-xs"
            >
              ← Back to Sign In
            </button>
          ) : (
            <Link
              to="/"
              className="absolute left-4 top-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground sm:left-6 sm:top-6 sm:text-xs"
            >
              ← Back
            </Link>
          )}

          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="inline-block lg:hidden mb-6">
                <Link to="/" className="inline-flex justify-center">
                  <img src={logo} alt="Vivify" className="h-20 w-auto object-contain dark:invert dark:brightness-200" />
                </Link>
              </div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                {mode === "signin" ? "Member access" : mode === "signup" ? "Become a member" : "Account Recovery"}
              </p>
              <h1 className="font-display text-4xl sm:text-5xl mt-3">
                {mode === "signin" ? "Welcome back" : mode === "signup" ? "Join Vivify" : mode === "update" ? "Set New Password" : "Reset Password"}
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                {mode === "signin" ? "Sign in to continue your collection." :
                 mode === "signup" ? "Create your account in a few seconds." :
                 mode === "update" ? "Enter a new secure password below." :
                 "Enter your email and we'll send you a link to reset your password."}
              </p>
            </div>

            {mode !== "reset" && mode !== "update" && (
              <div className="relative grid grid-cols-2 p-1 rounded-full bg-muted/60 mb-6 text-sm">
                <span className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-background shadow-sm transition-all duration-300" style={{ left: mode === "signin" ? "4px" : "calc(50% + 0px)" }} />
                <button type="button" onClick={() => switchMode("signin")} className={`relative z-10 py-2 rounded-full transition ${mode === "signin" ? "text-foreground font-medium" : "text-muted-foreground"}`}>Sign in</button>
                <button type="button" onClick={() => switchMode("signup")} className={`relative z-10 py-2 rounded-full transition ${mode === "signup" ? "text-foreground font-medium" : "text-muted-foreground"}`}>Sign up</button>
              </div>
            )}

            {mode !== "reset" && mode !== "update" && (
              <>
                <div className="flex min-h-[44px] w-full justify-center overflow-hidden rounded-full">
                  <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => { setFormError("Google sign-in failed."); toast.error("Google sign-in failed."); }} shape="pill" size="large" width="100%" text={mode === "signin" ? "signin_with" : "signup_with"} />
                </div>
                <div className="my-6 flex items-center gap-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">or with email</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              </>
            )}

            {formError && (
              <div className="mb-5 p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">{formError}</div>
              </div>
            )}

            {formSuccess && (
              <div className="mb-5 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">{formSuccess}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="h-12 rounded-lg" />
                </div>
              )}

              {mode !== "update" && (
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 rounded-lg" placeholder="you@example.com" />
                </div>
              )}

              {mode !== "reset" && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">{mode === "update" ? "New Password" : "Password"}</Label>
                    {mode === "signin" && (
                      <button type="button" onClick={() => switchMode("reset")} className="text-[11px] text-muted-foreground hover:text-foreground transition underline underline-offset-2">Forgot password?</button>
                    )}
                  </div>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 rounded-lg pr-12" />
                    <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {(mode === "signup" || mode === "update") && (
                <div className="p-3 bg-muted/40 rounded-lg border border-border/50 space-y-2 mt-2">
                  <p className="text-[11px] font-medium text-foreground tracking-wide">Password Requirements:</p>
                  <div className="space-y-1">
                    {passwordRequirements.map((req, i) => (
                      <div key={i} className={`flex items-center gap-2 text-xs transition-colors duration-150 ${req.met ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                        {req.met ? <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" /> : <X className="w-3.5 h-3.5 shrink-0 text-muted-foreground/60" />}
                        <span>{req.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button type="submit" disabled={loading || ((mode === "signup" || mode === "update") && !isPasswordSecure)} className="w-full h-12 rounded-full uppercase tracking-[0.2em] text-xs font-medium flex items-center justify-center gap-2 mt-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Please wait…</> :
                 mode === "signin" ? "Sign in" :
                 mode === "signup" ? "Create account" :
                 mode === "update" ? "Save New Password" :
                 "Send Reset Link"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}