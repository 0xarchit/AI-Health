import { OAuth2Client } from "google-auth-library";
import { redirect } from "next/navigation";

export async function POST() {
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const authorizeUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/cloud-platform",
      "https://www.googleapis.com/auth/generative-language.retriever",
      "https://www.googleapis.com/auth/generative-language.tuning",
    ],
    prompt: "consent", 
  });

  redirect(authorizeUrl);
}
