import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { CartProvider } from "@/contexts/CartContext";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CartDrawer } from "@/components/site/CartDrawer";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-display text-foreground">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">This page doesn't exist.</p>
        <Link to="/" className="inline-block mt-6 bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm uppercase tracking-wider">Go home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm uppercase tracking-wider"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

// REMOVED shellComponent and the SSR head logic
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
    head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Vivify — Handmade Beaded Bags" },
      { name: "description", content: "Luxury handmade beaded bags from Nairobi. Knot, crystal, bucket and floral styles, hand-strung one bead at a time." },
      { property: "og:title", content: "Vivify — Handmade Beaded Bags" },
      { property: "og:description", content: "Luxury handmade beaded bags from Nairobi." },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600&family=Dancing+Script:wght@600&display=swap" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Hide header/footer/cart on auth pages
  const isBare = pathname.startsWith("/auth");

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <div className="min-h-screen flex flex-col">
          {!isBare && <Header />}

          <main className="flex-1">
            <Outlet />
          </main>

          {!isBare && <Footer />}
          {!isBare && <CartDrawer />}
        </div>
      </CartProvider>
    </QueryClientProvider>
  );
}
