'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MedicalReportAnalyzer from '@/components/MedicalReportAnalyzer';
import ResultsCard from '@/components/ResultsCard';

export default function ReportAnalysisPage() {
  const [analysisResult, setAnalysisResult] = useState<{
    report: {
      originalDocument: string;
      analysis: string;
    };
  } | null>(null);

  const handleAnalysisComplete = (result: string) => {
    setAnalysisResult({
      report: {
        originalDocument: result,
        analysis: result
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Medical Report Analysis
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Upload your medical report and get instant AI-powered analysis and insights.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <MedicalReportAnalyzer onAnalysisComplete={handleAnalysisComplete} />
          </div>

          {analysisResult && (
            <div className="mt-8">
              <ResultsCard analysisResult={analysisResult} />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
} 