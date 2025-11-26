import LandingPage from "@/components/landing-page";
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token");
  const refreshToken = cookieStore.get("refresh_token");

  const isLoggedIn = !!(sessionToken || refreshToken);

  return <LandingPage isLoggedIn={isLoggedIn} />;
}
