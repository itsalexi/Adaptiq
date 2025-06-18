import { NextRequest, NextResponse } from 'next/server';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import app from '@/lib/firebase';

// Initialize the Gemini Developer API backend service
const ai = getAI(app, { backend: new GoogleAIBackend() });

// Create a GenerativeModel instance
const model = getGenerativeModel(ai, { model: 'gemini-2.0-flash' });

export async function POST(request) {
  try {
    const { topicTitle, materials } = await request.json();

    if (!topicTitle || !materials || materials.length === 0) {
      return NextResponse.json(
        { error: 'Topic title and materials are required' },
        { status: 400 }
      );
    }

    // Combine all materials into context
    const materialsContext = materials
      .map(
        (material) => `Material: ${material.name}\nContent: ${material.text}`
      )
      .join('\n\n');

    // Create prompt for diagnostic quiz generation
    const prompt = `Based on the following educational materials for the topic "${topicTitle}", generate a diagnostic quiz to assess student knowledge and identify learning gaps.

MATERIALS CONTEXT:
${materialsContext}

QUIZ REQUIREMENTS:
- Generate exactly 12 questions
- ALL questions must be multiple choice with 4 options (A, B, C, D)
- Cover all major topics and concepts from the materials
- Range from basic to intermediate difficulty
- Focus on identifying knowledge gaps and baseline proficiency
- Questions should be clear and unambiguous

IMPORTANT: Respond with ONLY valid JSON. No additional text before or after the JSON.

{
  "quiz": {
    "title": "Diagnostic Quiz: ${topicTitle}",
    "description": "This quiz will help assess your current knowledge and identify areas for focused study.",
    "totalQuestions": 12,
    "estimatedTime": "15 minutes",
    "questions": [
      {
        "id": 1,
        "type": "multiple_choice",
        "question": "Question text here?",
        "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
        "correctAnswer": "A",
        "explanation": "Brief explanation of why this answer is correct",
        "topic": "Specific topic/concept this question covers",
        "difficulty": "basic"
      }
    ]
  }
}`;

    // Generate quiz with Firebase AI
    const result = await model.generateContent(prompt);
    const response = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!response) {
      throw new Error('No response from AI model');
    }

    // Clean the response and try to parse JSON
    let quizData;
    try {
      // Remove any markdown code blocks or extra text
      let cleanResponse = response.trim();

      // Remove markdown code blocks if present
      cleanResponse = cleanResponse
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '');

      // Find the JSON object
      const jsonStart = cleanResponse.indexOf('{');
      const jsonEnd = cleanResponse.lastIndexOf('}') + 1;

      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No JSON object found in response');
      }

      let jsonString = cleanResponse.substring(jsonStart, jsonEnd);
      // Remove trailing commas before closing brackets/braces
      jsonString = jsonString.replace(/,\s*([}\]])/g, '$1');

      quizData = JSON.parse(jsonString);

      // Validate the structure
      if (
        !quizData.quiz ||
        !quizData.quiz.questions ||
        !Array.isArray(quizData.quiz.questions)
      ) {
        throw new Error('Invalid quiz structure');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', response);
      return NextResponse.json(
        {
          error: 'Failed to generate valid quiz format',
          details: parseError.message,
          rawResponse: response.substring(0, 500) + '...', // First 500 chars for debugging
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      quiz: quizData.quiz,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate diagnostic quiz',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
