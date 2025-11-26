# AI Health - Smart Nutrition Analysis

AI Health is a secure, production-ready web application that empowers users to analyze food images using their own personal AI quota. By leveraging Google's Gemini Vision API via OAuth, users can get detailed nutrition breakdowns without relying on a shared developer key or paid subscription.

## Features

### Core Functionality
- **User-Owned AI**: Connects directly to the user's Google Account to use their free Gemini API quota.
- **Secure Authentication**: 
  - Google OAuth 2.0 integration.
  - Enterprise-grade encryption (AES-256-GCM) for storing refresh tokens.
  - Automatic token rotation and secure HTTP-only cookies.
- **Smart Analysis**:
  - Instantly analyzes food images for calories, macros (protein, carbs, fat), and micros (sugar, fiber, sodium).
  - Identifies ingredients and provides a health assessment.
  - Displays confidence scores and health warnings (e.g., allergens).

### Advanced Features
- **Duplicate Analysis Prevention**: 
  - Smart caching system detects if an image has already been analyzed.
  - Returns cached results instantly to save the user's API quota and time.
- **Scan History**:
  - Automatically saves all successful scans to the database.
  - Users can view their recent history on the dashboard.
  - **Interactive History**: Click on any past scan to instantly reload its full details.
  - **History Management**: Users can clear their entire scan history with a single click.
- **Smart Landing Page**:
  - Automatically detects logged-in users.
  - seamless navigation: "Sign In" buttons transform into "Go to Dashboard" for returning users.
  - Classic, professional aesthetic with a clean monochrome design.

### Technical Highlights
- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL) with Drizzle ORM.
- **Styling**: Tailwind CSS with a custom design system (Dark/Light mode support).
- **Security**: strict Content Security Policy, secure headers, and encrypted database fields.

## Getting Started

### Prerequisites
- Node.js 18 or higher.
- A Supabase project for the database.
- A Google Cloud Console project with the "Generative Language API" enabled.

### Installation

1.  Clone the repository to your local machine.
2.  Install the necessary dependencies using your package manager.
3.  Set up your environment variables. You will need credentials for Supabase and Google OAuth, as well as a secure encryption key.
4.  Run the database migrations to set up the required tables (Users, Scans, Refresh Tokens).

### Running the App

Start the development server using the standard Next.js command. The application will be available at your local host address (usually port 3000).

## Usage Guide

1.  **Sign In**: Click "Get Started" to sign in with your Google Account. Grant the necessary permissions for the app to access the Gemini API on your behalf.
2.  **Upload**: Drag and drop a food image onto the dashboard or click to select one.
3.  **Analyze**: Click "Analyze Nutrition". The app will process the image and display detailed results.
4.  **Review**: Check the calories, ingredients, and health assessment.
5.  **History**: View your past scans in the sidebar. Click any item to view it again, or use the "Clear" button to wipe your history.

## Privacy & Security

AI Health is designed with privacy first. Your images are processed securely and are not used to train public models without your consent. Your personal API tokens are encrypted at rest and never exposed to the client.
