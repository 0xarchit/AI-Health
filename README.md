# [AI Health - Smart Nutrition Analysis](https://aihealth.0xarchit.is-a.dev/)

[![Website Status](https://img.shields.io/website?url=https%3A%2F%2Faihealth.0xarchit.is-a.dev%2F&style=flat-square&label=Website)](https://aihealth.0xarchit.is-a.dev/)
[![GitHub stars](https://img.shields.io/github/stars/0xarchit/AI-Health?style=flat-square)](https://github.com/0xarchit/AI-Health/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/0xarchit/AI-Health?style=flat-square)](https://github.com/0xarchit/AI-Health/network)
[![GitHub issues](https://img.shields.io/github/issues/0xarchit/AI-Health?style=flat-square)](https://github.com/0xarchit/AI-Health/issues)
[![License](https://img.shields.io/badge/license-Custom-blue.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

**AI Health** is a secure web application that empowers users to analyze food images using their own personal AI quota. By leveraging Google's Gemini API via OAuth, users can get detailed nutrition breakdowns without relying on a shared developer key or paid subscription.

---

## 🚀 How It Works

AI Health operates on a **"Bring Your Own Key" (BYOK)** model via seamless OAuth integration.

1.  **Secure Login**: You sign in with your Google Account.
2.  **Permission Grant**: A specific scope request is made to access the Gemini API on your behalf.
3.  **Encrypted Storage**: Your session tokens are encrypted (AES-256-GCM) and stored in our secure **Postgres Database**.
4.  **AI Analysis**: When you analyze an image:
    *   The app retrieves your secure token.
    *   The image is processed by **Google Gemini** using your free tier quota.
    *   Results are instantly cached to prevent faster loading next time.

---

## ✨ Key Features

### 🥗 Smart Nutrition Analysis
- **Instant Breakdown**: Get calories, macronutrients (Protein, Carbs, Fats), and micronutrients via intuitive gauges.
- **Ingredient Detection**: Identifies primary ingredients visible in the image.
- **Health Assessment**: AI provides a healthiness score and highlights potential allergens or concerns.

### 🧬 Interactive 3D Analysis
- **Whole-Body Visualization**: A high-fidelity 3D human model (Male/Female) visualizes the impact of food on your body.
- **Organ Risk Mapping**: Specific organs (e.g., Heart, Liver, Kidneys) light up in **Red** (High Risk), **Yellow** (Moderate), or **Green** (Low) based on ingredients.
- **Interactive Tooltips**: Hover over affected areas to read detailed medical insights (e.g., *"High sodium impacts cardiovascular health"*).

### 🤖 AI Health Assistant (Chatbot)
- **Context-Aware**: The integrated chatbot knows about your recently analyzed food.
- **Personalized Advice**: Ask questions like *"Is this good for a keto diet?"* or *"How can I make this healthier?"*
- **Real-time Interaction**: Get instant answers to your nutrition queries.

### 📊 Comprehensive Dashboard
- **Scan History**: All your analyses are saved to the database.
- **Interactive Reports**: View detailed logs of your food intake over time.
- **Medication Tracking**: Keep track of your supplements or medications alongside your nutrition.
- **User Reports**: Generate insights based on your eating habits.

### 👤 User Profile & Health Context
- **Biological Context**: Define your gender, allergies, and existing conditions. The AI uses this to tailor its nutrition advice.

### ⚡ Advanced Performance
- **Smart Caching**: Duplicate images are detected immediately, saving your API quota and providing instant results.
- **Optimized Assets**: Images are delivered via **ImageKit.io** for lightning-fast loading.
- **Medical Archive**: Upload and store your medical records or prescriptions for easy access.
- **Privacy Mode**: All health data is encrypted and stored securely with row-level security policies.

---

## 🛠️ Usage Guide

### 1. Authentication
Click the **"Get Started"** button. You will be redirected to Google to sign in. 
> **Note**: We only ask for the permissions strictly necessary to analyze images using the Gemini API.

### 2. Dashboard Interface
Once logged in, you will see your personal dashboard.
- **Upload Area**: Drag & drop your food image here.
- **Recent Scans**: Your history is available in the sidebar.
- **Clear History**: Use the option in settings to wipe your data from our database.

### 3. Analyzing Food
1.  Upload an image.
2.  Click **"Analyze Nutrition"**.
3.  Wait a few seconds for Gemini to process the visual data.
4.  Review the **Nutrition Card** that appears with detailed stats.
5.  **Explore the 3D Model**: Rotate and zoom the 3D human model to see which organs are affected by your food choice.

### 4. Interactive Chat
After analysis, use the **Chat Assistant** floating button.
- It automatically loads the context of your current food.
- Ask for recipes, alternatives, or explanation of specific nutrients.

### 5. Managing Your Profile
Navigate to the **Profile** page to:
- **Update Health Context**: Add allergies (e.g., "Peanuts"), conditions (e.g., "Diabetes"), or medications.
- **Upload Records**: Store images of your prescriptions or lab results securely.

---

## 💻 Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: Postgres Database (via [Drizzle ORM](https://orm.drizzle.team/))
- **AI Model**: Google Gemini 2.0 Flash
- **Image CDN**: ImageKit.io
- **3D Models**: NIH 3D Print Exchange

---

## 🏆 Credits & Acknowledgements

We deeply appreciate the tools and resources that make this project possible.

| Resource | Usage |
| :--- | :--- |
| **[Google Gemini API](https://ai.google.dev/)** | The core intelligence engine for nutrition analysis. |
| **[ImageKit.io](https://imagekit.io/)** | High-performance image optimization and delivery. |
| **[NIH 3D Print Exchange](https://3d.nih.gov/)** | Source for accurate human anatomy 3D models. |
| **[Lucide Icons](https://lucide.dev/)** | Beautiful, consistent icons used throughout the app. |

### Copyright
**© 2025 0xArchit**. All Rights Reserved.
Licensed under the [Custom License](LICENSE).
Developed with ❤️ by [0xArchit](https://0xarchit.is-a.dev).

---

## 🤝 Community

- **[Code of Conduct](CODE_OF_CONDUCT.md)**
- **[Contributing Guidelines](CONTRIBUTING.md)**
- **[Security Policy](SECURITY.md)**

### Contact
- **Email**: mail@0xarchit.is-a.dev
- **Website**: [0xarchit.is-a.dev](https://0xarchit.is-a.dev)
- **GitHub**: [@0xarchit](https://github.com/0xarchit)

---

[**Back to Top ⬆️**](#ai-health---smart-nutrition-analysis)
