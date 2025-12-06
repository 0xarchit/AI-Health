import { clearApiCache } from "@/hooks/use-fetch-cache";
import { useRouter } from "next/navigation";

let isRefreshing = false;
let refreshSubscribers: ((success: boolean) => void)[] = [];

function subscribeTokenRefresh(cb: (success: boolean) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(success: boolean) {
  refreshSubscribers.forEach((cb) => cb(success));
  refreshSubscribers = [];
}

async function refreshSession(): Promise<boolean> {
  try {
    
    const res = await fetch("/api/auth/refresh", { method: "POST" });
    return res.ok;
  } catch (error) {
    console.error("Failed to refresh session", error);
    return false;
  }
}

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  if (isRefreshing) {
    return new Promise((resolve) => {
      subscribeTokenRefresh(async (success) => {
        if (success) {
           resolve(fetch(url, options));
        } else {
           resolve(new Response(null, { status: 401, statusText: "Unauthorized" }));
        }
      });
    });
  }

  const res = await fetch(url, options);

  if (res.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      const success = await refreshSession();
      isRefreshing = false;
      onRefreshed(success);

      if (success) {
        
        return fetch(url, options);
      } else {
        
        clearApiCache();
        if (typeof window !== "undefined") {
            window.location.href = "/"; 
        }
        return res;
      }
    } else {
      
      return new Promise((resolve) => {
        subscribeTokenRefresh(async (success) => {
          if (success) {
             resolve(fetch(url, options));
          } else {
             resolve(res); 
          }
        });
      });
    }
  }

  return res;
}
