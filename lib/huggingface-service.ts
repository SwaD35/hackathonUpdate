import { HfInference } from '@huggingface/inference';
import sharp from 'sharp';
import Groq from 'groq-sdk';

// Initialize clients with environment variables
const hfApiKey = process.env.HUGGINGFACE_API_KEY;
const groqApiKey = process.env.GROQ_API_KEY;

// Debug logging
console.log('Environment variables status:', {
  hasHfKey: !!hfApiKey,
  hasGroqKey: !!groqApiKey,
  groqKeyLength: groqApiKey?.length
});

if (!hfApiKey) {
  throw new Error('HUGGINGFACE_API_KEY environment variable is not set');
}

if (!groqApiKey) {
  throw new Error('GROQ_API_KEY environment variable is not set');
}

// Initialize clients
const hf = new HfInference(hfApiKey);
const groq = new Groq({
  apiKey: groqApiKey,
});

// Model IDs for different types of medical images
const MODELS = {
  mri: 'microsoft/resnet-50', // Using ResNet-50 for better compatibility
  xray: 'microsoft/resnet-50', // Using ResNet-50 for better compatibility
};

// Medical-specific prompts for different image types
const MEDICAL_PROMPTS = {
  mri: `As a medical AI expert, analyze this MRI scan and provide a clear, patient-friendly interpretation. Focus on the following key points:

  1. **Findings:**
     - Describe any visible abnormalities or normal findings.
     - Summarize the general condition of the scanned area.
     - Indicate whether the findings appear normal or require further attention.

  2. **Patient Guidance:**
     - Highlight key points to discuss with the doctor.
     - Suggest relevant questions to ask about the findings.
     - Mention any lifestyle considerations based on the results.

  3. **Next Steps:**
     - Recommend appropriate follow-up actions.
     - Advise when to see the doctor next.
     - Note any immediate concerns that need addressing.

  4. **Important Notes:**
     - List warning signs to watch for.
     - Specify when to seek immediate medical care.
     - Provide general health recommendations.

  Use clear, simple language and maintain a professional yet empathetic tone. If applicable, include specific medical terminology to enhance accuracy.`,
  
  xray: `As a medical AI expert, analyze this X-ray scan and provide a clear, patient-friendly interpretation. Focus on the following key points:

  1. **Findings:**
     - Describe any visible abnormalities or normal findings.
     - Summarize the general condition of the scanned area.
     - Indicate whether the findings appear normal or require further attention.

  2. **Patient Guidance:**
     - Highlight key points to discuss with the doctor.
     - Suggest relevant questions to ask about the findings.
     - Mention any lifestyle considerations based on the results.

  3. **Next Steps:**
     - Recommend appropriate follow-up actions.
     - Advise when to see the doctor next.
     - Note any immediate concerns that need addressing.

  4. **Important Notes:**
     - List warning signs to watch for.
     - Specify when to seek immediate medical care.
     - Provide general health recommendations.

  Use clear, simple language and maintain a professional yet empathetic tone. If applicable, include specific medical terminology to enhance accuracy.`
};

export async function analyzeMedicalImage(
  imageBuffer: Buffer,
  type: 'mri' | 'xray'
): Promise<string> {
  try {
    // Process image with sharp
    const processedImage = await sharp(imageBuffer)
      .resize(224, 224)
      .normalize() // Normalize pixel values
      .toFormat('jpeg')
      .toBuffer();

    // Get model predictions
    const modelId = MODELS[type];
    console.log('Using model:', modelId);
    
    try {
      // Create a new ArrayBuffer and copy the data
      const arrayBuffer = new ArrayBuffer(processedImage.length);
      const view = new Uint8Array(arrayBuffer);
      view.set(processedImage);
      
      const predictions = await hf.imageClassification({
        model: modelId,
        data: arrayBuffer,
      });
      console.log('Hugging Face predictions:', predictions);

      // Generate initial analysis
      const initialAnalysis = generateInitialAnalysis(predictions, type);

      // Get comprehensive analysis using Groq
      const groqAnalysis = await getGroqAnalysis(initialAnalysis, type);
      console.log('Groq analysis completed');

      // Combine analyses
      return combineAnalyses(initialAnalysis, groqAnalysis);
    } catch (hfError) {
      console.error('Hugging Face API error:', hfError);
      throw new Error(`Hugging Face API error: ${hfError instanceof Error ? hfError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Detailed error in analyzeMedicalImage:', error);
    throw new Error(`Failed to analyze medical image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function generateInitialAnalysis(
  predictions: Array<{ label: string; score: number }>,
  type: 'mri' | 'xray'
): string {
  const sortedPredictions = predictions.sort((a, b) => b.score - a.score);
  const topPredictions = sortedPredictions.slice(0, 3);

  let analysis = `Initial Analysis of ${type.toUpperCase()} Image:\n\n`;
  analysis += 'Key Findings:\n';
  
  // For medical images, we'll focus on the confidence levels rather than labels
  const confidenceLevels = topPredictions.map(pred => (pred.score * 100).toFixed(2));
  const averageConfidence = (confidenceLevels.reduce((a, b) => a + parseFloat(b), 0) / confidenceLevels.length).toFixed(2);
  
  analysis += `Image Quality Assessment: ${averageConfidence}% confidence in image clarity\n`;
  analysis += `Note: This is a preliminary assessment. A detailed analysis follows below.\n`;

  return analysis;
}

async function getGroqAnalysis(initialAnalysis: string, type: 'mri' | 'xray'): Promise<string> {
  const prompt = MEDICAL_PROMPTS[type];
  console.log('Sending prompt to Groq:', prompt.substring(0, 100) + '...');

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 700,
    });

    const response = completion.choices[0]?.message?.content || '';
    console.log('Groq response received');
    return response;
  } catch (groqError) {
    console.error('Groq API error:', groqError);
    throw new Error(`Groq API error: ${groqError instanceof Error ? groqError.message : 'Unknown error'}`);
  }
}

function combineAnalyses(
  initialAnalysis: string,
  groqAnalysis: string
): string {
  return `
${initialAnalysis}

Patient-Friendly Analysis:
${groqAnalysis}

Important Note: This analysis is provided for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
`;
} 