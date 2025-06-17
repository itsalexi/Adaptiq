import { NextRequest, NextResponse } from 'next/server';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import app from '@/lib/firebase';

// Initialize the Gemini Developer API backend service
const ai = getAI(app, { backend: new GoogleAIBackend() });

// Create a GenerativeModel instance
const model = getGenerativeModel(ai, { model: 'gemini-2.0-flash' });

export async function POST(request) {
    try {
        // Parse the form data
        const formData = await request.formData();
        const files = formData.getAll('files');

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'No files provided' },
                { status: 400 }
            );
        }

        const results = await Promise.all(
            files.map(async (file) => {
                try {
                    // Convert file to buffer
                    const buffer = await file.arrayBuffer();
                    const base64 = Buffer.from(buffer).toString('base64');

                    // Get file type
                    const mimeType = file.type || 'application/octet-stream';

                    // Create prompt for comprehensive analysis
                    const prompt = [
                        {
                            text: `Please extract and summarize all the important content from this educational material. Focus on preserving the key information for later use:

EXTRACT AND SUMMARIZE:
1. All main topics, concepts, and subject matter covered
2. Key facts, data points, and information presented
3. Important definitions, terms, and vocabulary
4. Formulas, equations, procedures, or step-by-step processes
5. Examples, case studies, or illustrations provided
6. Lists, tables, charts, or structured data
7. Any references, citations, or source materials mentioned

FORMAT: Organize the content in a clear, structured way that preserves the original information hierarchy. Use headings, bullet points, and clear sections. Focus on completeness and accuracy rather than interpretation or analysis.

GOAL: Create a comprehensive summary that retains all important educational content for future reference and processing.`,
                        },
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64,
                            },
                        },
                    ];

                    // Generate content with Firebase AI
                    const result = await model.generateContent(prompt);
                    const summary =
                        result.response.candidates?.[0]?.content?.parts?.[0]
                            ?.text || 'Unable to process this file.';

                    return {
                        name: file.name,
                        summary: summary,
                        originalSize: file.size,
                        type: mimeType,
                    };
                } catch (error) {
                    console.error(`Error processing file ${file.name}:`, error);
                    return {
                        name: file.name,
                        summary: `Error processing this file: ${error.message}`,
                        originalSize: file.size,
                        type: file.type || 'unknown',
                        error: true,
                    };
                }
            })
        );

        return NextResponse.json({
            processed: results,
            totalFiles: files.length,
            success: true,
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to process files',
                details: error.message,
            },
            { status: 500 }
        );
    }
}
