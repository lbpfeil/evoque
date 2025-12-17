import React, { useState } from 'react';
import { useStore } from '../components/StoreContext';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Import = () => {
  const { importData } = useStore();
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ newBooks: number; newHighlights: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.txt')) {
      alert('Please upload a .txt file (My Clippings.txt)');
      return;
    }

    setIsProcessing(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      setTimeout(async () => { // Simulate processing time for UX
        try {
          const res = await importData(text);
          setResult(res);
        } catch (err: any) {
          console.error(err);
          setError(err.message || "Failed to import highlights. Please check the file format.");
        } finally {
          setIsProcessing(false);
        }
      }, 800);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  if (result) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-8">
        <div className="w-24 h-24 bg-zinc-50 text-black border border-zinc-200 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-zinc-900">Import Successful</h2>
          <p className="text-zinc-500 text-lg">
            Added <span className="font-semibold text-zinc-900">{result.newBooks} books</span> and <span className="font-semibold text-zinc-900">{result.newHighlights} highlights</span>.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setResult(null)}
            className="px-8 py-3 border border-zinc-300 rounded-md font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Import Another
          </button>
          <button
            onClick={() => navigate('/library')}
            className="px-8 py-3 bg-black text-white rounded-md font-medium hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200"
          >
            Go to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Import Highlights</h1>
        <p className="text-zinc-500 mt-2 font-light">Upload your 'My Clippings.txt' file from your Kindle device.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div
        className={`
          relative border border-dashed rounded-md p-20 text-center transition-all duration-300 ease-in-out
          ${dragActive ? 'border-black bg-zinc-50' : 'border-zinc-300 bg-white hover:border-zinc-400'}
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".txt"
          onChange={handleChange}
        />

        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="w-20 h-20 bg-zinc-50 text-zinc-900 border border-zinc-100 rounded-full flex items-center justify-center">
            {isProcessing ? (
              <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xl font-medium text-zinc-900">
              {isProcessing ? 'Processing highlights...' : 'Drag and drop your file here'}
            </p>
            <p className="text-zinc-500">
              or <label htmlFor="file-upload" className="text-black hover:underline cursor-pointer font-medium">browse to upload</label>
            </p>
          </div>

          {!isProcessing && (
            <div className="flex items-center text-xs text-zinc-400 bg-zinc-50 px-4 py-2 rounded-full border border-zinc-100 font-mono">
              <FileText className="w-3 h-3 mr-2" />
              My Clippings.txt
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-md p-6 flex gap-4 items-start shadow-sm">
        <AlertCircle className="w-5 h-5 text-zinc-900 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-zinc-600 space-y-2">
          <p className="font-bold text-zinc-900 uppercase tracking-wide text-xs">Instructions</p>
          <ol className="list-decimal list-inside space-y-1 ml-1 leading-relaxed">
            <li>Connect your Kindle to your computer via USB.</li>
            <li>Open the "Kindle" drive in your file explorer.</li>
            <li>Look for the "documents" folder.</li>
            <li>Find the file named "My Clippings.txt".</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Import;