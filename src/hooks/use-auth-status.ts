import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuthStatus(redirectOnFail: boolean = false) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/status");
        if (mounted) {
          if (res.ok) {
            const data = await res.json();
            setIsAuthenticated(data.isAuthenticated);
            if (redirectOnFail && !data.isAuthenticated) {
              router.push("/");
            }
          } else {
            setIsAuthenticated(false);
            if (redirectOnFail) router.push("/");
          }
        }
      } catch (error) {
        if (mounted) {
          setIsAuthenticated(false);
          if (redirectOnFail) router.push("/");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [redirectOnFail, router]);

  return { isAuthenticated, loading };
}
