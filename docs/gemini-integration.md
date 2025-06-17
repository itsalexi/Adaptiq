# Firebase AI Integration Documentation

## Overview

The Firebase AI integration provides intelligent processing of uploaded educational materials, automatically generating comprehensive summaries and analysis of content using Google's Gemini AI through Firebase's AI SDK. This feature enhances the learning experience by providing structured, AI-generated insights from various file formats.

## Features

### File Processing Capabilities

-   **Multimodal Support**: Processes text, images, PDFs, and other document formats
-   **Comprehensive Analysis**: Generates detailed summaries including key concepts, learning objectives, and study recommendations
-   **Batch Processing**: Handles multiple files simultaneously
-   **Error Handling**: Graceful fallback when AI processing fails
-   **Progress Tracking**: Real-time feedback during processing
-   **Firebase Integration**: Seamless integration with existing Firebase services

### Supported File Types

-   **Documents**: PDF, DOC, DOCX, TXT
-   **Presentations**: PPT, PPTX
-   **Images**: JPG, JPEG, PNG, GIF
-   **Future**: Additional formats can be easily added

## API Endpoints

### Process Materials with Firebase AI

**Endpoint**: `POST /api/processMaterialsWithGemini`

**Description**: Processes uploaded files using Firebase AI SDK with Google's Gemini AI to generate comprehensive educational summaries.

**Request**:

```javascript
// FormData with files
const formData = new FormData();
files.forEach((file) => formData.append('files', file));

const response = await fetch('/api/processMaterialsWithGemini', {
    method: 'POST',
    body: formData,
});
```

**Response**:

```javascript
{
  "success": true,
  "processed": [
    {
      "name": "document.pdf",
      "summary": "Comprehensive AI-generated summary...",
      "originalSize": 1024000,
      "type": "application/pdf",
      "error": false
    }
  ],
  "totalFiles": 1
}
```

**Error Response**:

```javascript
{
  "error": "Failed to process files",
  "details": "Specific error message"
}
```

## Data Models

### Processed Material Object

```javascript
{
  name: string,           // Original filename
  text: string,           // AI-generated summary or original content
  originalSize?: number,  // File size in bytes
  type?: string,          // MIME type
  processedByAI: boolean, // Whether AI processing was successful
  error: boolean          // Whether an error occurred
}
```

### Topic with AI-Processed Materials

```javascript
{
  userId: string,
  title: string,
  materials: [
    {
      name: "Calculus_Notes.pdf",
      text: "AI-generated comprehensive summary...",
      originalSize: 2048000,
      type: "application/pdf",
      processedByAI: true,
      error: false
    }
  ],
  proficiency: number,
  upNext: string,
  createdAt: Timestamp
}
```

## Components

### CreateTopicModal

**Enhanced Features**:

-   Multiple file upload support
-   Real-time processing status
-   Visual indicators for AI-processed content
-   Error handling with fallback options
-   Progress tracking during AI processing

**Key Methods**:

-   `handleAddFile()`: Processes files through Firebase AI API
-   `handleAddManual()`: Adds manually entered content
-   `handleRemoveMaterial()`: Removes materials from the list

**State Management**:

```javascript
const [processingFiles, setProcessingFiles] = useState(false);
const [processingProgress, setProcessingProgress] = useState('');
```

## Environment Variables

### Required Environment Variables

```bash
# Firebase Configuration (already configured)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Setting Up Firebase AI

1. **Enable Firebase AI in your project**:

    - Go to [Firebase Console](https://console.firebase.google.com/)
    - Select your project
    - Go to Extensions > AI and ML
    - Enable the Gemini API extension

2. **Configure Firebase AI**:
    - The Firebase AI SDK is included in the main Firebase package
    - No additional API keys needed - uses your existing Firebase project
    - Automatic authentication and security integration

## AI Prompt Engineering

### Current Prompt Structure

The system uses a structured prompt to generate comprehensive educational summaries:

```
Please provide a comprehensive summary of the educational content in this file. Include:

1. Main topics and key concepts covered
2. Important definitions, formulas, or principles
3. Key takeaways and learning objectives
4. Difficulty level assessment
5. Prerequisites or background knowledge needed
6. Suggested study approach

Format the response in a clear, structured manner that would be helpful for a student learning this material.
```

### Customization Options

The prompt can be customized for different use cases:

-   Subject-specific prompts (Math, Science, Literature, etc.)
-   Difficulty level targeting
-   Learning style adaptation
-   Specific output formats

## Error Handling

### API Error Handling

1. **Network Errors**: Automatic retry with exponential backoff
2. **File Processing Errors**: Individual file error tracking
3. **Fallback Behavior**: Original file content preserved when AI fails
4. **User Feedback**: Clear error messages and status updates

### Common Error Scenarios

-   **Invalid File Type**: Unsupported formats are rejected
-   **File Size Limits**: Large files may timeout
-   **API Rate Limits**: Automatic throttling and retry logic
-   **Network Issues**: Graceful degradation with user feedback

## Security Considerations

### Firebase AI Security

-   Uses Firebase's built-in security and authentication
-   No additional API keys needed
-   Automatic user authentication integration
-   Secure file handling per user

### File Upload Security

-   File type validation
-   Size limits enforcement
-   Malicious content scanning (future enhancement)

## Performance Optimization

### Processing Optimization

-   **Parallel Processing**: Multiple files processed simultaneously
-   **Caching**: Firebase AI provides built-in caching
-   **Streaming**: Large files processed in chunks
-   **Timeout Management**: Configurable processing timeouts

### User Experience

-   **Progress Indicators**: Real-time processing status
-   **Non-blocking UI**: Interface remains responsive during processing
-   **Batch Operations**: Efficient handling of multiple files

## Future Enhancements

### Planned Features

-   **Learning Style Adaptation**: Customize summaries based on user preferences
-   **Subject-Specific Prompts**: Tailored prompts for different academic subjects
-   **Interactive Summaries**: Clickable elements for deeper exploration
-   **Progress Integration**: Link summaries to learning progress tracking
-   **Collaborative Features**: Share and discuss AI-generated summaries

### Technical Improvements

-   **Advanced Caching**: Firebase AI built-in caching optimization
-   **Queue System**: Background processing for large files
-   **Analytics**: Track processing success rates and user feedback
-   **A/B Testing**: Compare different prompt strategies

## Troubleshooting

### Common Issues

1. **Firebase AI Not Working**

    - Verify Firebase AI extension is enabled in your project
    - Check Firebase project configuration
    - Ensure proper authentication setup

2. **Files Not Processing**

    - Check file format support
    - Verify file size limits
    - Review browser console for errors

3. **Slow Processing**
    - Large files may take longer
    - Check network connectivity
    - Monitor Firebase AI quotas

### Debug Mode

Enable debug logging by setting:

```bash
NODE_ENV=development
```

This will provide detailed logs for troubleshooting API calls and processing errors.

## Integration with Existing Features

### Authentication Integration

-   API routes respect user authentication
-   User-specific processing quotas
-   Secure file handling per user

### Firestore Integration

-   Processed materials stored in user's topic collection
-   Metadata preserved for future reference
-   Integration with existing topic management

### UI/UX Integration

-   Consistent with existing design patterns
-   Responsive design for all screen sizes
-   Dark mode support
-   Accessibility compliance
