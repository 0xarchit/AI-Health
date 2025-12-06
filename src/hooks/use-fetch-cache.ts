import { useState, useEffect, useCallback } from 'react';
import { fetchWithAuth } from "@/lib/api-client";

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const CACHE_DURATION = 60 * 60 * 1000; 

interface UseCachedFetchOptions extends RequestInit {
  withAuth?: boolean; 
}

export function useCachedFetch<T>(url: string, options?: UseCachedFetchOptions) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!!url);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (force = false) => {
    if (!url) return;
    
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

      const fetchOptions = { ...options };
      delete (fetchOptions as any).withAuth;

      if (force) {
        (fetchOptions as RequestInit).cache = 'reload';
      }

      
      const res = await fetchWithAuth(url, fetchOptions);

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
  
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key && key.startsWith('cache-')) {
        localStorage.removeItem(key);
      }
    });
    console.log("API Cache cleared");
  } catch (e) {
    console.error("Failed to clear API cache", e);
  }
}
