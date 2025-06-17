# Diagnostic Quiz System

## Overview

The diagnostic quiz system provides an initial assessment of student knowledge based on uploaded materials. It generates personalized quizzes using AI and tracks learning gaps to create adaptive study plans.

## Features

### Quiz Generation

-   **AI-Powered**: Uses Firebase AI (Gemini 2.0 Flash) to analyze uploaded materials
-   **Question Format**: All multiple choice questions (4 options each)
-   **Question Count**: Exactly 12 questions per quiz
-   **Difficulty Range**: Basic to intermediate level
-   **Topic Coverage**: Comprehensive coverage of all material concepts

### Assessment & Scoring

-   **Overall Proficiency**: Percentage score across all questions
-   **Topic Breakdown**: Individual scores for each subject area
-   **Knowledge Gaps**: Detailed tracking of incorrect answers
-   **Weak Areas**: Topics scoring below 60% threshold
-   **Performance Indicators**: Color-coded visual feedback

### Data Storage & Tracking

-   **Onboarding Status**: Topics marked as onboarded after quiz completion
-   **Knowledge Gaps**: Stored with question details, explanations, and difficulty
-   **Weak Areas**: Priority study topics identified from low performance
-   **Diagnostic Results**: Complete quiz performance data
-   **Proficiency Scores**: Overall and topic-specific performance metrics

## Technical Implementation

### API Endpoint

-   **Route**: `/api/generateDiagnosticQuiz`
-   **Method**: POST
-   **Input**: Topic title and materials array
-   **Output**: Structured quiz JSON with questions and metadata

### Database Schema

```javascript
// Topic document structure after diagnostic completion
{
  hasCompletedDiagnostic: true,
  isOnboarded: true,
  diagnosticResults: {
    overallScore: 75,
    correctAnswers: 9,
    totalQuestions: 12,
    topicProficiencies: [...],
    detailedResults: [...],
    knowledgeGaps: [...],
    weakAreas: [...],
    completedAt: "2024-01-15T10:30:00Z"
  },
  knowledgeGaps: [
    {
      topic: "Advanced Concepts",
      question: "What is the primary purpose of...",
      difficulty: "intermediate",
      userAnswer: "B",
      correctAnswer: "A",
      explanation: "The correct answer is A because..."
    }
  ],
  weakAreas: ["Advanced Concepts", "Data Structures"],
  proficiency: 75,
  upNext: "Foundation Building"
}
```

### Question Structure

```javascript
{
  id: 1,
  type: "multiple_choice",
  question: "What is the primary concept of...?",
  options: ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
  correctAnswer: "A",
  explanation: "Brief explanation of correct answer",
  topic: "Specific topic/concept",
  difficulty: "basic"
}
```

## User Experience Flow

### 1. Quiz Launch

-   Automatically triggered after topic creation with materials
-   Can be skipped (marks topic as onboarded with no diagnostic data)
-   Progressive question navigation with previous/next buttons

### 2. Question Interface

-   Clean, focused question display
-   Multiple choice options with clear labeling
-   Progress indicator showing current question position
-   Navigation controls for moving between questions

### 3. Results Display

-   **Overall Performance**: Score percentage with visual progress bar
-   **Topic Breakdown**: Individual topic scores with color coding
-   **Knowledge Gaps**: Top 5 areas needing improvement with explanations
-   **Priority Study Areas**: Weak topics highlighted as focus areas
-   **Action Button**: Continue to personalized study plan

### 4. Dashboard Integration

-   **Status Badges**: Onboarded, Assessed, AI Processed indicators
-   **Proficiency Display**: Visual progress bars with color coding
-   **Knowledge Gaps**: Quick preview of improvement areas
-   **Priority Areas**: Highlighted weak topics for focused study

## Adaptive Learning Features

### Performance-Based Next Steps

-   **80%+ Score**: Advanced Practice
-   **60-79% Score**: Targeted Review
-   **40-59% Score**: Foundation Building
-   **<40% Score**: Basic Concepts

### Knowledge Gap Analysis

-   Tracks incorrect answers with full context
-   Provides explanations for better understanding
-   Identifies patterns in weak performance areas
-   Enables targeted remediation strategies

### Visual Feedback System

-   **Green (80%+)**: Excellent performance
-   **Yellow (60-79%)**: Good with room for improvement
-   **Red (<60%)**: Needs focused attention

## Error Handling & Reliability

### JSON Parsing

-   Robust parsing with multiple fallback strategies
-   Detailed error logging for debugging
-   Graceful degradation when AI response is malformed
-   Raw response truncation for debugging without overwhelming logs

### Question Validation

-   Ensures all questions have proper structure
-   Validates multiple choice format compliance
-   Confirms required fields are present
-   Fallback error messages for invalid quiz data

### User Experience Safeguards

-   Skip option available for users who prefer not to take diagnostic
-   Clear error messages for technical issues
-   Automatic retry mechanisms for transient failures
-   Progress preservation during navigation

## Future Enhancements

### Planned Features

-   Adaptive question difficulty based on performance
-   Time-based performance tracking
-   Detailed analytics and progress reports
-   Integration with spaced repetition algorithms
-   Custom quiz creation for specific topics

### Performance Optimizations

-   Question caching for faster load times
-   Batch processing for multiple topic assessments
-   Progressive loading for large quiz sets
-   Offline quiz capability for mobile users
