export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6 space-y-6">
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
        <p>
          By accessing and using AI Health, you agree to be bound by these Terms of Service.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">2. Use of Service</h2>
        <p>
          You agree to use the service only for lawful purposes. You are responsible for all activity that occurs under your account.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">3. API Usage</h2>
        <p>
          Our service utilizes the Google Gemini API. You agree to comply with Google's Generative AI Prohibited Use Policy. You acknowledge that API usage is subject to your own Google Cloud project quotas.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">4. Disclaimer</h2>
        <p>
          The nutrition information provided by this AI is for informational purposes only and should not be considered medical advice. Always consult a professional for dietary advice.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">5. Termination</h2>
        <p>
          We reserve the right to terminate or suspend your access to the service at any time, without notice, for any reason.
        </p>
      </section>
    </div>
  );
}
