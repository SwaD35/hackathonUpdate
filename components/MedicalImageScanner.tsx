'use client';

import React, { useState } from 'react';
import { Stethoscope, Brain, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface MedicalImageScannerProps {
  onAnalysisComplete: (analysis: string) => void;
}

export const MedicalImageScanner: React.FC<MedicalImageScannerProps> = ({ onAnalysisComplete }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageType, setImageType] = useState<'mri' | 'xray' | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size should be less than 10MB');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);

      // Create form data
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', imageType!);

      // Send to API
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze image');
      }

      const data = await response.json();
      onAnalysisComplete(data.analysis);
    } catch (err) {
      console.error('Error details:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
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
                alt="Medical Image Scanner"
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
            Analyze Your Medical Images
          </h2>
          <p className="text-lg text-gray-600">
            Upload your medical images and get instant AI-powered insights. Our advanced algorithms help you understand your medical scans better.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: <ImageIcon className="w-6 h-6 text-blue-600" />,
              title: "Multiple Formats",
              description: "Support for JPEG, PNG, and DICOM files",
            },
            {
              icon: <Brain className="w-6 h-6 text-blue-600" />,
              title: "AI Analysis",
              description: "Advanced machine learning algorithms",
            },
            {
              icon: <Stethoscope className="w-6 h-6 text-blue-600" />,
              title: "Medical Insights",
              description: "Detailed scan analysis and findings",
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

        {/* Upload Section */}
        <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Image Type
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setImageType('mri')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  imageType === 'mri'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                MRI
              </button>
              <button
                onClick={() => setImageType('xray')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  imageType === 'xray'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                X-ray
              </button>
            </div>
          </div>

          {imageType && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload {imageType.toUpperCase()} Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isAnalyzing}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Analyzing image...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}; 