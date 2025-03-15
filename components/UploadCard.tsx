"use client";

import { useState, useCallback } from "react";
import { Activity, FileText, Upload, X, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import ResultsCard from "./ResultsCard";

interface UploadCardProps {
  isAnalyzing: boolean;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  onAnalyze: () => void;
  analysisMethod: "url" | "upload";
  setAnalysisMethod: (method: "url" | "upload") => void;
}

export default function UploadCard({
  isAnalyzing,
  setIsAnalyzing,
  onAnalyze,
  analysisMethod,
  setAnalysisMethod,
}: UploadCardProps) {
  const [fileUrl, setFileUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const { toast } = useToast();

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
      }
    },
    []
  );

  const removeFile = useCallback(() => {
    setFile(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (analysisMethod === "upload" && file) {
      setIsAnalyzing(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "File upload failed");
        }

        toast({
          title: "File processed successfully",
          description: "Your medical report has been analyzed.",
        });
        setAnalysisResult(result);
        onAnalyze();
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "There was a problem processing your file.",
          variant: "destructive",
        });
      } finally {
        setIsAnalyzing(false);
      }
    } else if (analysisMethod === "url" && fileUrl) {
      onAnalyze();
    }
  };

  return (
    <>
      <Card className="max-w-2xl mx-auto backdrop-blur-md bg-white/80 border border-gray-200/50 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            Upload Your Report
          </CardTitle>
          <CardDescription className="text-gray-600">
            Choose your preferred method to analyze your medical report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Tabs
              value={analysisMethod}
              onValueChange={(value) => setAnalysisMethod(value as "url" | "upload")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 rounded-xl bg-gray-100/50 p-1">
                <TabsTrigger
                  value="upload"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  File Upload
                </TabsTrigger>
                <TabsTrigger
                  value="url"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  URL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-4">
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => document.getElementById("file-upload")?.click()}
                  className="relative group cursor-pointer"
                >
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 transition-all duration-300 group-hover:border-blue-400 group-hover:bg-blue-50/50">
                    {file ? (
                      <div className="flex items-center justify-center space-x-2">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <span className="text-blue-600 font-medium">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="rounded-full hover:bg-red-50 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile();
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-10 h-10 mx-auto mb-4 text-blue-500" />
                        <p className="text-lg font-medium text-gray-700 mb-1">
                          Drag and drop your file here
                        </p>
                        <p className="text-sm text-gray-500">
                          or click to browse (PDF, JPEG, PNG)
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    id="file-upload"
                    onChange={handleFileChange}
                  />
                </div>
              </TabsContent>

              <TabsContent value="url" className="mt-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Enter the URL of your medical report"
                    type="url"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    className="w-full bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                  />
                  <p className="text-sm text-gray-500">
                    Paste a direct link to your medical report file
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-700 hover:to-violet-700 transition-all duration-300 shadow-md hover:shadow-lg"
              disabled={isAnalyzing || (analysisMethod === "url" ? !fileUrl : !file)}
            >
              {isAnalyzing ? (
                <>
                  <Activity className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Report...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Analyze Report
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {analysisResult && (
        <div className="mt-8">
          <ResultsCard analysisResult={analysisResult} />
        </div>
      )}
    </>
  );
}
