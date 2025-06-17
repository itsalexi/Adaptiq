# Authentication & Onboarding Documentation

## Overview

The authentication and onboarding system provides a complete user registration, login, and learning style setup flow for the Adaptiq platform.

## Features

### Authentication

-   **Email/Password Registration**: Users can create accounts with email and password
-   **Email/Password Login**: Existing users can sign in with their credentials
-   **Google OAuth**: One-click sign-in/sign-up with Google accounts
-   **Session Management**: Automatic session persistence and state management
-   **Logout**: Secure logout functionality

### Onboarding Flow

-   **Learning Style Assessment**: Interactive quiz with scenario-based questions and preference sliders
-   **Manual Style Selection**: Direct selection for users who know their learning style
-   **Skip Option**: Users can skip onboarding and set preferences later
-   **Profile Management**: Automatic user profile creation and updates

## Components

### Authentication Components

#### `LoginForm.js`

-   Email and password input fields
-   Google OAuth button
-   Form validation and error handling
-   Loading states during authentication
-   Toggle to sign-up form

#### `SignUpForm.js`

-   Email, password, and confirm password fields
-   Password validation (minimum 6 characters, confirmation match)
-   Google OAuth sign-up
-   Form validation and error handling
-   Toggle to login form

### Onboarding Components

#### `OnboardingFlow.js`

-   Main orchestrator for the onboarding process
-   Handles flow between intro, selection, and quiz steps
-   Manages user profile updates
-   Loading states and completion handling

#### `LearningStyleSelection.js`

-   Visual selection interface for learning styles
-   Four learning style options with descriptions and icons
-   Option to take assessment quiz instead
-   Responsive grid layout

#### `LearningStyleQuiz.js`

-   6-question assessment (3 scenario-based, 3 preference sliders)
-   Progress indicator
-   Navigation between questions
-   Automatic scoring and style determination
-   Support for mixed learning styles

## Data Models

### User Profile (Firestore)

```javascript
{
  email: string,
  name?: string, // From Google OAuth
  createdAt: string, // ISO timestamp
  onboardingCompleted: boolean,
  learningStyle?: string, // "Visual", "Auditory", "Text-Based", "Mixed", or combinations
  // Future fields for subjects, progress, etc.
}
```

### Learning Styles

-   **Visual**: Learn best through images, diagrams, charts, and visual aids
-   **Auditory**: Learn best through listening, discussions, and verbal explanations
-   **Text-Based**: Learn best through reading, writing, and text-based materials
-   **Mixed**: Learn best through a combination of different methods

## API Endpoints

### Authentication Routes

-   `/auth` - Main authentication page with login/signup forms
-   `/` - Protected dashboard (redirects to `/auth` if not authenticated)

### Protected Routes

-   All routes except `/auth` require authentication
-   Users without completed onboarding are redirected to onboarding flow

## State Management

### AuthContext

-   Global authentication state management
-   User profile data
-   Authentication methods (signIn, signUp, signInWithGoogle, logout)
-   Profile update functionality

### Local State

-   Form inputs and validation
-   Loading states
-   Error messages
-   Onboarding flow progression

## Security

### Firebase Security Rules

```javascript
// Firestore rules (to be configured in Firebase Console)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Environment Variables

-   All Firebase configuration stored in environment variables
-   No hardcoded API keys or sensitive data
-   Client-side configuration uses `NEXT_PUBLIC_` prefix

## User Flow

1. **Initial Visit**: User visits `/` → redirected to `/auth`
2. **Authentication**: User signs up or logs in
3. **Onboarding Check**: System checks if onboarding is completed
4. **Learning Style Setup**:
    - Option A: User knows style → direct selection
    - Option B: User takes assessment quiz
    - Option C: User skips for later
5. **Dashboard**: User reaches main dashboard with personalized experience

## Error Handling

-   **Authentication Errors**: Displayed in form with user-friendly messages
-   **Network Errors**: Graceful fallbacks and retry options
-   **Validation Errors**: Real-time form validation with helpful feedback
-   **Firebase Errors**: Mapped to user-friendly error messages

## Responsive Design

-   Mobile-first design approach
-   Responsive grid layouts
-   Touch-friendly interface elements
-   Dark mode support
-   Accessible form controls

## Future Enhancements

-   Email verification
-   Password reset functionality
-   Social login providers (GitHub, Microsoft, etc.)
-   Advanced profile customization
-   Learning style recalibration
-   Multi-language support
