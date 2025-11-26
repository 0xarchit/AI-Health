export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6 space-y-6">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1. Introduction</h2>
        <p>
          AI Health ("we", "our", "us") respects your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our web application.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">2. Data We Collect</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Google Account Information:</strong> When you sign in with Google, we collect your email address and Google ID to authenticate you.</li>
          <li><strong>Uploaded Images:</strong> Images you upload are processed solely for the purpose of nutrition analysis.</li>
          <li><strong>Usage Data:</strong> We may collect anonymous usage statistics to improve our service.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">3. How We Use Your Data</h2>
        <p>
          We use your data to:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Authenticate your access to the application.</li>
          <li>Process your image analysis requests using the Google Gemini API.</li>
          <li>Maintain your scan history within the application.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">4. Data Sharing</h2>
        <p>
          We do not sell your personal data. We share data only with:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Google Gemini API:</strong> Your uploaded images and prompts are sent to Google's Gemini API for processing. This is done under your own Google Cloud quota and subject to Google's AI Principles.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">5. Security</h2>
        <p>
          We implement industry-standard security measures, including encryption of sensitive tokens and secure communication channels (HTTPS).
        </p>
      </section>
    </div>
  );
}
