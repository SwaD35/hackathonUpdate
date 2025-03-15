import { NextRequest, NextResponse } from 'next/server';
import { analyzeMedicalImage } from '@/lib/huggingface-service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const type = formData.get('type') as 'mri' | 'xray';

    if (!file || !type) {
      return NextResponse.json(
        { error: 'Missing image or type' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an image file.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('Processing image:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      imageType: type
    });

    // Analyze the image
    const analysis = await analyzeMedicalImage(buffer, type);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error in analyze-image route:', error);
    
    // Check if it's an environment variable error
    if (error instanceof Error && error.message.includes('environment variable')) {
      return NextResponse.json(
        { error: 'API configuration error. Please check environment variables.' },
        { status: 500 }
      );
    }

    // Check if it's an API error
    if (error instanceof Error && (error.message.includes('Hugging Face API') || error.message.includes('Groq API'))) {
      return NextResponse.json(
        { error: error.message },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze image' },
      { status: 500 }
    );
  }
} 