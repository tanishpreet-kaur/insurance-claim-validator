
import React, { useState, useCallback } from 'react';
import { ClaimFile, AnalysisResult } from './types';
import { analyzeDocuments } from './services/geminiService';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import ResultDisplay from './components/ResultDisplay';
import Loader from './components/Loader';
import { ShieldCheckIcon } from './components/icons/ShieldCheckIcon';

const App: React.FC = () => {
  const [files, setFiles] = useState<ClaimFile[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (newFiles: File[]) => {
    const processedFiles: Promise<ClaimFile>[] = newFiles.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            base64: base64,
          });
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(processedFiles).then(newClaimFiles => {
      setFiles(prevFiles => [...prevFiles, ...newClaimFiles]);
    }).catch(err => {
        console.error("Error processing files:", err);
        setError("There was an error processing your files. Please try again.");
    });
  };

  const removeFile = (fileName: string) => {
    setFiles(files.filter(file => file.name !== fileName));
  };
  
  const handleAnalyze = useCallback(async () => {
    if (files.length === 0) {
      setError("Please upload at least one document to analyze.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeDocuments(files);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze documents. The AI model may be overloaded. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [files]);

  const getStartedView = () => (
    <div className="text-center p-8">
      <div className="flex justify-center items-center mb-6">
        <ShieldCheckIcon className="w-24 h-24 text-blue-500" />
      </div>
      <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">AI Insurance Claim Validator</h2>
      <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
        Upload your claim documents (PDFs, images of invoices, photos, etc.) and our AI agents will perform a comprehensive analysis for validity, fraud, and policy compliance.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-200 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <FileUpload files={files} onFileChange={handleFileChange} onRemoveFile={removeFile} />
            <div className="mt-6">
              <button
                onClick={handleAnalyze}
                disabled={isLoading || files.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center text-lg"
              >
                {isLoading ? 'Analyzing...' : `Analyze ${files.length} Document(s)`}
              </button>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 min-h-[400px] flex items-center justify-center">
            {error && <div className="text-red-500 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg">{error}</div>}
            {isLoading && <Loader />}
            {!isLoading && !error && analysisResult && <ResultDisplay result={analysisResult} />}
            {!isLoading && !error && !analysisResult && getStartedView()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
