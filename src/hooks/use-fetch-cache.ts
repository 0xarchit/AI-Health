import { useState, useEffect, useCallback } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const CACHE_DURATION = 60 * 60 * 1000; 

interface UseCachedFetchOptions extends RequestInit {
  withAuth?: boolean;
}

let refreshPromise: Promise<Response> | null = null;

export function useCachedFetch<T>(url: string, options?: UseCachedFetchOptions) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);

    try {
      
      const cached = localStorage.getItem(`cache-${url}`);
      if (cached && !force) {
        const parsed: CacheItem<T> = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_DURATION) {
          setData(parsed.data);
          setLoading(false);
          
          return;
        }
      }

      let fetchOptions = { ...options };
      
      
      if (options?.withAuth) {
        try {
          if (!refreshPromise) {
            refreshPromise = fetch("/api/auth/refresh", { 
              method: "POST",
              credentials: "include" 
            }).then(res => {
              setTimeout(() => { refreshPromise = null; }, 1000); 
              return res;
            }).catch(err => {
              refreshPromise = null;
              throw err;
            });
          }
          
          const refreshRes = await refreshPromise;
          const resClone = refreshRes.clone();

          if (resClone.ok) {
            const { token } = await resClone.json();
            const headers = new Headers(fetchOptions.headers);
            headers.set("Authorization", `Bearer ${token}`);
            fetchOptions.headers = headers;
          } else {
             throw new Error("Unauthorized");
          }
        } catch (e) {
           console.warn("Token refresh failed", e);
           throw new Error("Unauthorized");
        }
      }

      
      delete (fetchOptions as any).withAuth;

      if (force) {
        (fetchOptions as RequestInit).cache = 'reload';
      }

      const res = await fetch(url, fetchOptions);
      
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }

      if (!res.ok) {
        throw new Error(`Error: ${res.statusText}`);
      }

      const json = await res.json();
      
      
      try {
        localStorage.setItem(`cache-${url}`, JSON.stringify({
          data: json,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.warn("Failed to save to localStorage", e);
      }

      setData(json);
    } catch (err: any) {
      setError(err);
      
      if (err.message === "Unauthorized") {
         localStorage.removeItem(`cache-${url}`);
      }
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(options)]); 

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = () => fetchData(true);

  return { data, loading, error, refresh };
}

export function clearApiCache() {
  if (typeof window === 'undefined') return;
  
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('cache-')) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
}
