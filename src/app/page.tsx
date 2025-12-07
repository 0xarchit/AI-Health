"use client";

import LandingPageAurora from "@/components/landing-page-aurora";
import { useAuthStatus } from "@/hooks/use-auth-status";
import { useInitialLoad } from "@/hooks/use-initial-load";
import { InitialLoadingScreen } from "@/components/ui/initial-loading-screen";

export default function Page() {
  const { isAuthenticated, loading: authLoading } = useAuthStatus(false);
  
  const { isLoading, message } = useInitialLoad([
    { key: "auth", isLoading: authLoading, message: "INITIALIZING SYSTEM" }
  ]);

  if (isLoading) {
    return <InitialLoadingScreen message={message} />;
  }

  return <LandingPageAurora />;
}
