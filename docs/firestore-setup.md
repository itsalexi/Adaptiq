# Firestore Database Setup Guide

## Overview

This guide will help you set up Firestore Database for your Adaptiq project, including security rules and initial configuration.

## Step-by-Step Setup

### 1. Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create one if needed)

### 2. Create Firestore Database

1. **Navigate to Firestore**: Click "Firestore Database" in the left sidebar
2. **Create Database**: Click "Create database"
3. **Choose Mode**:
    - **Development**: Select "Start in test mode" (recommended for initial setup)
    - **Production**: Select "Start in production mode" (for live apps)
4. **Select Location**: Choose the closest region to your users
5. **Complete Setup**: Click "Done"

### 3. Configure Security Rules

1. **Go to Rules Tab**: In Firestore Database, click the "Rules" tab
2. **Replace Rules**: Copy and paste the following rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read and write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Future collections for subjects, progress, etc.
    match /subjects/{subjectId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
    }

    match /progress/{progressId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
    }

    match /modules/{moduleId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
    }
  }
}
```

3. **Publish Rules**: Click "Publish"

### 4. Test Database Connection

You can test if your Firestore is working by running the development server:

```bash
npm run dev
```

Then try to create an account - if successful, you should see a new document in the `users` collection.

## Database Structure

### Collections

#### `users` Collection

-   **Document ID**: User's Firebase Auth UID
-   **Fields**:
    ```javascript
    {
      email: string,
      name?: string, // From Google OAuth
      createdAt: string, // ISO timestamp
      onboardingCompleted: boolean,
      learningStyle?: string, // "Visual", "Auditory", "Text-Based", "Mixed"
      // Future fields:
      // subjects: array,
      // preferences: object,
      // settings: object
    }
    ```

#### Future Collections (To Be Implemented)

##### `subjects` Collection

```javascript
{
  userId: string, // Reference to user
  name: string, // "Algebra", "Biology 10"
  description?: string,
  materials?: array, // References to uploaded materials
  createdAt: string,
  updatedAt: string
}
```

##### `progress` Collection

```javascript
{
  userId: string,
  subjectId: string,
  topicId: string,
  mastery: number, // 0-100
  confidence: number, // 0-100
  timeSpent: number, // in minutes
  lastStudied: string,
  completedModules: array
}
```

##### `modules` Collection

```javascript
{
  userId: string,
  subjectId: string,
  type: string, // "flashcard", "quiz", "summary"
  content: object,
  difficulty: number, // 1-5
  completed: boolean,
  createdAt: string,
  completedAt?: string
}
```

## Security Rules Explanation

### Current Rules

-   **Users can only access their own data**: Each user can only read/write documents where their UID matches
-   **Authentication required**: All operations require a valid Firebase Auth session
-   **Future-proof**: Rules are set up for upcoming collections

### Rule Breakdown

```javascript
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

-   `request.auth != null`: User must be logged in
-   `request.auth.uid == userId`: User can only access their own profile

## Troubleshooting

### Common Issues

#### 1. "Missing or insufficient permissions"

-   **Cause**: Security rules are too restrictive
-   **Solution**: Check that rules allow the operation you're trying to perform

#### 2. "Firestore is not enabled"

-   **Cause**: Firestore database wasn't created
-   **Solution**: Follow Step 2 to create the database

#### 3. "Invalid API key"

-   **Cause**: Environment variables not set correctly
-   **Solution**: Check your `.env.local` file has the correct Firebase config

#### 4. "Network error"

-   **Cause**: Firestore location too far from user
-   **Solution**: Consider changing the database location in Firebase Console

### Testing Your Setup

1. **Create a test user**:

    - Go to your app and sign up
    - Check Firestore Console → users collection
    - You should see a new document with the user's data

2. **Test authentication**:

    - Sign out and sign back in
    - Verify the user profile loads correctly

3. **Test onboarding**:
    - Complete the learning style setup
    - Check that the user document is updated with `onboardingCompleted: true`

## Production Considerations

### Before Going Live

1. **Update Security Rules**: Change from "test mode" to production rules
2. **Set Up Indexes**: Create indexes for queries you'll use frequently
3. **Monitor Usage**: Set up Firebase Analytics and monitoring
4. **Backup Strategy**: Consider regular backups for important data

### Performance Optimization

1. **Use Indexes**: Create composite indexes for complex queries
2. **Limit Query Results**: Use `limit()` to prevent large data transfers
3. **Cache Data**: Implement client-side caching for frequently accessed data
4. **Batch Operations**: Use batch writes for multiple operations

## Next Steps

Once Firestore is set up, you can proceed with:

1. **Subject Setup**: Create the subject management system
2. **Diagnostic Tests**: Build the initial assessment functionality
3. **Progress Tracking**: Implement learning progress monitoring
4. **Analytics**: Add detailed learning analytics and insights
