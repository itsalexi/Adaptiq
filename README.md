# Adaptiq - AI-Powered Learning Platform

This is a [Next.js](https://nextjs.org) project that provides an AI-powered learning platform with intelligent content processing using Google's Gemini AI.

## Features

-   **AI-Powered Content Processing**: Upload educational materials and get comprehensive AI-generated summaries
-   **Multimodal Support**: Process PDFs, documents, presentations, and images
-   **User Authentication**: Firebase-based authentication with Google OAuth
-   **Learning Style Assessment**: Personalized onboarding with learning style detection
-   **Topic Management**: Organize and track your learning materials
-   **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

-   Node.js 18+
-   Firebase project
-   Google Gemini API key

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd adaptiq
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
# Create .env.local file
cp .env.local.example .env.local
```

4. Configure your environment variables in `.env.local`:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Gemini AI
GEMINI_API_KEY=your_google_gemini_api_key
```

### Setting Up Firebase

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password and Google)
3. Create a Firestore database
4. Copy your Firebase config to `.env.local`

### Setting Up Gemini AI

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add the key to your `.env.local` file

### Running the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

### Creating Topics with AI Processing

1. Click "Create Topic" in the sidebar
2. Enter a topic name (e.g., "Calculus 101")
3. Click "Add Material" and select files to upload
4. Files will be automatically processed by Gemini AI
5. Review the AI-generated summaries
6. Click "Create" to save your topic

### Supported File Types

-   **Documents**: PDF, DOC, DOCX, TXT
-   **Presentations**: PPT, PPTX
-   **Images**: JPG, JPEG, PNG, GIF

### AI-Generated Summaries

The system automatically generates comprehensive summaries including:

-   Main topics and key concepts
-   Important definitions and formulas
-   Learning objectives
-   Difficulty level assessment
-   Prerequisites
-   Suggested study approach

## API Endpoints

### Process Materials with Gemini

`POST /api/processMaterialsWithGemini`

Processes uploaded files using Google's Gemini AI to generate educational summaries.

**Request**: FormData with files
**Response**: Array of processed materials with AI-generated summaries

## Project Structure

```
├── app/
│   ├── api/processMaterialsWithGemini/  # Gemini AI processing endpoint
│   ├── auth/                            # Authentication pages
│   └── page.js                          # Main dashboard
├── components/
│   ├── auth/                            # Authentication components
│   ├── dashboard/                       # Dashboard components
│   └── onboarding/                      # Onboarding flow
├── contexts/                            # React contexts
├── lib/                                 # Utility libraries
└── docs/                                # Documentation
```

## Documentation

-   [Authentication & Onboarding](docs/auth.md)
-   [Gemini AI Integration](docs/gemini-integration.md)
-   [Firestore Setup](docs/firestore-setup.md)

## Testing

Run the test script to verify the Gemini API integration:

```bash
node test-gemini-api.js
```

## Learn More

To learn more about the technologies used:

-   [Next.js Documentation](https://nextjs.org/docs) - Next.js features and API
-   [Firebase Documentation](https://firebase.google.com/docs) - Firebase features
-   [Google Gemini AI](https://ai.google.dev/) - Gemini AI capabilities
-   [Tailwind CSS](https://tailwindcss.com/) - CSS framework

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
