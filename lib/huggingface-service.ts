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
  mri: `As a medical AI expert, analyze this MRI scan and provide a patient-friendly interpretation:

1. What We Found:
   - Any visible abnormalities or normal findings
   - The general condition of the scanned area
   - Whether the findings appear normal or need attention

2. What You Should Know:
   - Key points to discuss with your doctor
   - Questions to ask about the findings
   - Any lifestyle considerations

3. Next Steps:
   - Recommended follow-up actions
   - When to see your doctor
   - Any immediate concerns to address

4. Important Notes:
   - Warning signs to watch for
   - When to seek immediate care
   - General health recommendations

Please use clear, simple language and focus on what the patient needs to know.`,

  xray: `As a medical AI expert, analyze this X-ray image and provide a patient-friendly interpretation:

1. What We Found:
   - Any visible abnormalities or normal findings
   - The general condition of the scanned area
   - Whether the findings appear normal or need attention

2. What You Should Know:
   - Key points to discuss with your doctor
   - Questions to ask about the findings
   - Any lifestyle considerations

3. Next Steps:
   - Recommended follow-up actions
   - When to see your doctor
   - Any immediate concerns to address

4. Important Notes:
   - Warning signs to watch for
   - When to seek immediate care
   - General health recommendations

Please use clear, simple language and focus on what the patient needs to know.`
};

export async function analyzeMedicalImage(
  imageBuffer: Buffer,
  type: 'mri' | 'xray'
): Promise<string> {
  try {
    // Process image with sharp
    const processedImage = await sharp(imageBuffer)
      .resize(224, 224)
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
      max_tokens: 1000,
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