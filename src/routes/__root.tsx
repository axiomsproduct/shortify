import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { NotFoundComponent } from "@/components/not-found";
import { syncRouteUrl, initGlobalActionTracking } from "@/lib/url-tracker";

function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something broke</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="btn-pill mt-4"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useRouterState({
    select: (s) => ({
      pathname: s.location.pathname,
      searchStr: s.location.searchStr,
      href: s.location.href,
    }),
  });

  useEffect(() => {
    syncRouteUrl(location.pathname);
  }, [location.pathname, location.searchStr, location.href]);

  useEffect(() => {
    initGlobalActionTracking();
    if ("serviceWorker" in navigator && typeof window !== "undefined") {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("Service worker registration failed:", error);
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Analytics />
      <SpeedInsights />
    </QueryClientProvider>
  );
}
