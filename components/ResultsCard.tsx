/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import {
  Heart,
  AlertCircle,
  Stethoscope,
  ClipboardList,
  Info,
  TrendingUp,
  TrendingDown,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ParameterDetails {
  value: string;
  range: string;
}

interface ResultsCardProps {
  analysisResult?: {
    report?: {
      originalDocument: string;
      analysis: string;
    };
  };
}

export default function ResultsCard({ analysisResult }: ResultsCardProps) {
  // Parse medical parameters from the document
  const parseParameters = (doc: string): Record<string, ParameterDetails> => {
    const parameterRegex = /\|([^|]+)\|([^|]+)\|([^|]+)\|/g;
    const parameters: Record<string, ParameterDetails> = {};

    let match;
    while ((match = parameterRegex.exec(doc)) !== null) {
      const [, param, value, range] = match;
      if (param.trim() !== "Parameter" && param.trim() !== "---") {
        parameters[param.trim()] = {
          value: value.trim(),
          range: range.trim(),
        };
      }
    }

    return parameters;
  };

  // Determine parameter status
  const getParameterStatus = (value: string, range: string) => {
    const parseRange = (rangeStr: string) => {
      const matches = rangeStr.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
      return matches
        ? { min: parseFloat(matches[1]), max: parseFloat(matches[2]) }
        : null;
    };

    const numericValue = parseFloat(value);
    const rangeObj = parseRange(range);

    if (rangeObj) {
      if (numericValue < rangeObj.min) return "low";
      if (numericValue > rangeObj.max) return "high";
    }

    return "normal";
  };

  const originalDocument = analysisResult?.report?.originalDocument || "";
  const analysis = analysisResult?.report?.analysis || "";
  const medicalParameters = parseParameters(originalDocument);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="backdrop-blur-md bg-white/80 border border-gray-200/50 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-violet-50 rounded-t-2xl">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <Stethoscope className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                Analysis Results
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Detailed breakdown of your medical report
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          {/* Parameters Grid */}
          <section className="space-y-4">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ClipboardList className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Health Parameters
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(medicalParameters).map(([param, details]) => {
                const status = getParameterStatus(details.value, details.range);
                const statusConfig = {
                  low: {
                    icon: <TrendingDown className="w-4 h-4" />,
                    class: "bg-blue-50/50 border-blue-200 text-blue-900",
                    badge: "bg-blue-100 text-blue-700",
                  },
                  normal: {
                    icon: <CheckCircle className="w-4 h-4" />,
                    class: "bg-green-50/50 border-green-200 text-green-900",
                    badge: "bg-green-100 text-green-700",
                  },
                  high: {
                    icon: <TrendingUp className="w-4 h-4" />,
                    class: "bg-red-50/50 border-red-200 text-red-900",
                    badge: "bg-red-100 text-red-700",
                  },
                };

                return (
                  <div
                    key={param}
                    className={`
                      ${statusConfig[status].class}
                      p-4 rounded-xl border backdrop-blur-sm
                      transition-all duration-300 hover:shadow-md
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          {statusConfig[status].icon}
                          <span className="font-medium">{param}</span>
                        </div>
                        <div className="text-sm opacity-70">
                          Range: {details.range}
                        </div>
                      </div>
                      <Badge
                        className={`${statusConfig[status].badge} text-sm font-medium px-2 py-0.5`}
                      >
                        {details.value}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <Separator className="bg-gradient-to-r from-blue-200 via-violet-200 to-blue-200" />

          {/* Analysis Section */}
          <section className="space-y-4">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-violet-50 rounded-lg">
                <Heart className="w-5 h-5 text-violet-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Detailed Analysis
              </h2>
            </div>

            <div className="prose prose-blue max-w-full">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ node, ...props }) => (
                    <h2
                      {...props}
                      className="text-lg font-semibold text-gray-800 mt-6 mb-3 flex items-center space-x-2"
                    >
                      <Info className="w-5 h-5 text-violet-600" />
                      <span>{props.children}</span>
                    </h2>
                  ),
                  p: ({ node, ...props }) => (
                    <p {...props} className="text-gray-600 leading-relaxed" />
                  ),
                }}
              >
                {analysis}
              </ReactMarkdown>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
