# Adaptiq Setup Guide

## Firebase Configuration

To get started with Adaptiq, you'll need to set up Firebase for authentication and database functionality.

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "adaptiq-learning")
4. Follow the setup wizard

### 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Enable "Google" authentication (optional but recommended)

### 3. Set up Firestore Database

1. Go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for development
4. Select a location close to your users

### 4. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (</>)
4. Register your app with a nickname
5. Copy the configuration object

### 5. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Replace the values with your actual Firebase configuration.

### 6. Install Dependencies

```bash
npm install
```

### 7. Run the Development Server

```bash
npm run dev
```

## Features Implemented

### Authentication & Onboarding

-   ✅ User registration and login
-   ✅ Google OAuth integration
-   ✅ Learning style assessment
-   ✅ Onboarding flow with quiz or manual selection
-   ✅ User profile management

### Next Steps (To Be Implemented)

-   [ ] Subject setup and material upload
-   [ ] Initial diagnostic tests
-   [ ] Personalized study plans
-   [ ] Adaptive learning modules
-   [ ] Progress tracking and analytics

## Project Structure

```
├── app/
│   ├── auth/page.js          # Authentication page
│   ├── layout.js             # Root layout with AuthContext
│   └── page.js               # Main dashboard
├── components/
│   ├── auth/
│   │   ├── LoginForm.js      # Login form component
│   │   └── SignUpForm.js     # Signup form component
│   └── onboarding/
│       ├── OnboardingFlow.js # Main onboarding orchestrator
│       ├── LearningStyleQuiz.js # Learning style assessment
│       └── LearningStyleSelection.js # Manual style selection
├── contexts/
│   └── AuthContext.js        # Authentication context
├── lib/
│   └── firebase.js           # Firebase configuration
└── SETUP.md                  # This file
```

## Learning Styles Supported

-   **Visual**: Learn best through images, diagrams, charts, and visual aids
-   **Auditory**: Learn best through listening, discussions, and verbal explanations
-   **Text-Based**: Learn best through reading, writing, and text-based materials
-   **Mixed**: Learn best through a combination of different methods

The system will use this information to prioritize content formats and create personalized learning experiences.
