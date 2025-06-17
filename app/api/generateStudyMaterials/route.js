import { NextRequest, NextResponse } from 'next/server';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import app from '@/lib/firebase';

// Initialize the Gemini Developer API backend service
const ai = getAI(app, { backend: new GoogleAIBackend() });

// Create a GenerativeModel instance
const model = getGenerativeModel(ai, { model: 'gemini-2.0-flash' });

export async function POST(request) {
    try {
        const { topic, explanation, question, correctAnswer } =
            await request.json();

        if (!topic || !explanation) {
            return NextResponse.json(
                { error: 'Topic and explanation are required' },
                { status: 400 }
            );
        }

        // Create prompt for study materials generation
        const prompt = `Based on the following topic and explanation, generate flashcards and practice questions for effective learning.

TOPIC: "${topic}"

EXPLANATION:
${explanation}

${question ? `SAMPLE QUESTION: ${question}` : ''}
${correctAnswer ? `CORRECT ANSWER: ${correctAnswer}` : ''}

REQUIREMENTS:
1. Generate flashcards that:
   - Cover key concepts and definitions
   - Include question-answer pairs
   - Are clear and concise
   - Help with memorization and understanding

2. Generate practice questions that:
   - Are multiple choice with 4 options
   - Range from basic to advanced
   - Test understanding and application
   - Include explanations for correct answers

IMPORTANT: Respond with ONLY valid JSON. No additional text before or after the JSON.

{
  "studyMaterials": {
    "topic": "Topic name",
    "flashcards": [
      {
        "id": 1,
        "question": "Front of flashcard?",
        "answer": "Back of flashcard",
        "concept": "What concept this covers"
      }
    ],
    "practiceQuestions": [
      {
        "id": 1,
        "question": "Question text?",
        "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
        "correctAnswer": "A",
        "explanation": "Why this answer is correct",
        "difficulty": "basic"
      }
    ]
  }
}`;

        // Generate study materials with Firebase AI
        const result = await model.generateContent(prompt);
        const response =
            result.response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!response) {
            throw new Error('No response from AI model');
        }

        // Clean the response and try to parse JSON
        let studyData;
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

            const jsonString = cleanResponse.substring(jsonStart, jsonEnd);
            studyData = JSON.parse(jsonString);

            // Validate the structure
            if (
                !studyData.studyMaterials ||
                !studyData.studyMaterials.flashcards ||
                !Array.isArray(studyData.studyMaterials.flashcards) ||
                !studyData.studyMaterials.practiceQuestions ||
                !Array.isArray(studyData.studyMaterials.practiceQuestions)
            ) {
                throw new Error('Invalid study materials structure');
            }
        } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
            console.error('Raw response:', response);
            return NextResponse.json(
                {
                    error: 'Failed to generate valid study materials format',
                    details: parseError.message,
                    rawResponse: response.substring(0, 500) + '...', // First 500 chars for debugging
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            studyMaterials: studyData.studyMaterials,
            generatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate study materials',
                details: error.message,
            },
            { status: 500 }
        );
    }
}
