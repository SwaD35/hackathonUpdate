import Groq from "groq-sdk";
import endent from "endent";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function processMedicalReport(documents: { text: string }[]) {
  const documentText = documents.map(doc => doc.text).join("\n");
  
  const medicalKeywords = ["blood", "test", "diagnosis", "report", "scan", "doctor", "CBC", "WBC", "hemoglobin"];
  const containsMedicalKeywords = medicalKeywords.some(kw => 
    documentText.toLowerCase().includes(kw.toLowerCase())
  );

  if (!containsMedicalKeywords) {
    return { originalDocument: documentText, analysis: "Invalid medical report. No relevant medical terms detected." };
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: endent`
            You are a medical AI that provides precise, patient-friendly insights from medical reports.
            Your task is to analyze the report, summarize the key findings, and provide clear recommendations on what the patient should do next.
          `,
        },
        {
          role: "user",
          content: endent`
            Analyze the following medical report and provide:
            1. A clear, concise summary of the key findings.
            2. Specific recommendations on what the patient should do based on the results.
            3. Highlight the major pointer or things
            
            Medical Report:
            ${documentText}
          `,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 700,
    });

    console.log("Groq API Response:", JSON.stringify(chatCompletion, null, 2));

    return {
      originalDocument: documentText,
      analysis: chatCompletion.choices?.[0]?.message?.content ?? "Unable to analyze report",
    };
  } catch (error) {
    console.error("Error processing medical report:", error);
    return { originalDocument: documentText, analysis: "Failed to analyze medical report due to an internal error." };
  }
}
