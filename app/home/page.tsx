'use client';

import { useState } from 'react';
import MedicalReportAnalyzer from '../../components/MedicalReportAnalyzer';
import { MedicalImageScanner } from '../../components/MedicalImageScanner';
import ResultsCard from '../../components/ResultsCard';
import Link from 'next/link';

export default function HomePage() {
  const [analysisResult, setAnalysisResult] = useState<{
    report: {
      originalDocument: string;
      analysis: string;
    };
  } | null>(null);

  const handleAnalysisComplete = (analysis: string) => {
    setAnalysisResult({
      report: {
        originalDocument: analysis,
        analysis: analysis
      }
    });
  };

  return (
    <main className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Medical Analysis Assistant</h1>
        <Link 
          href="/" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Switch to Side-by-Side Layout
        </Link>
      </div>
      
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Medical Report Analyzer */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">AI Summary Generator</h2>
          <MedicalReportAnalyzer />
        </div>

        {/* Medical Image Scanner */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Medical Image Analysis</h2>
          <MedicalImageScanner onAnalysisComplete={handleAnalysisComplete} />
        </div>

        {/* Results Card */}
        {analysisResult && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <ResultsCard analysisResult={analysisResult} />
          </div>
        )}
      </div>
    </main>
  );
} 