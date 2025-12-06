import LandingPage from "@/components/landing-page";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function Page() {
  return <LandingPage />;
}
