"use client";

import { useState } from "react";
import { Stethoscope, Brain, FileText } from "lucide-react";
import Image from "next/image";
import UploadCard from "./UploadCard";

interface MedicalReportAnalyzerProps {
  onAnalysisComplete: (result: string) => void;
}

export default function MedicalReportAnalyzer({ onAnalysisComplete }: MedicalReportAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMethod, setAnalysisMethod] = useState<"url" | "upload">("upload");

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsAnalyzing(false);
    onAnalysisComplete("Sample analysis result"); // Replace with actual analysis result
  };

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-1/3 right-0 w-72 h-72 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative w-24 h-24 mb-4">
              <Image
                src="/M.svg"
                alt="Medical Report Analyzer"
                width={96}
                height={96}
                className="object-contain"
                priority
              />
            </div>
            <div className="inline-flex items-center justify-center p-2 bg-blue-50 rounded-2xl shadow-sm">
              <Brain className="w-6 h-6 text-blue-600 mr-2" />
              <span className="text-blue-600 font-medium">AI-Powered Analysis</span>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4 mt-4">
            Analyze Your Medical Reports
          </h2>
          <p className="text-lg text-gray-600">
            Upload your medical reports and get instant AI-powered insights. Our advanced algorithms help you understand your health data better.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: <FileText className="w-6 h-6 text-blue-600" />,
              title: "Multiple Formats",
              description: "Support for PDF, JPEG, and PNG files",
            },
            {
              icon: <Brain className="w-6 h-6 text-blue-600" />,
              title: "AI Analysis",
              description: "Advanced machine learning algorithms",
            },
            {
              icon: <Stethoscope className="w-6 h-6 text-blue-600" />,
              title: "Medical Insights",
              description: "Detailed health parameter analysis",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-3 bg-blue-50 rounded-xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-center">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Upload Card Component */}
        <UploadCard
          isAnalyzing={isAnalyzing}
          onAnalyze={handleAnalyze}
          analysisMethod={analysisMethod}
          setAnalysisMethod={setAnalysisMethod}
          setIsAnalyzing={setIsAnalyzing}
        />
      </div>
    </section>
  );
}
