import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Image as ImageIcon,
  BarChart3,
  IndianRupee,
  Target,
  Info,
  RefreshCw
} from 'lucide-react';

interface ProduceAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AnalysisResult {
  product: string;
  quantity: {
    value: number | null;
    unit: string;
    estimated: boolean;
  };
  quality_score: number;
  grade: string;
  defects: string[];
  price: {
    min: number;
    max: number;
    unit: string;
    estimated: boolean;
  };
  total_value: {
    min: number | null;
    max: number | null;
    currency: string;
  };
  confidence: number;
  explanation: string;
}

type AnalysisStep = 'upload' | 'preview' | 'analyzing' | 'results' | 'error';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const getGradeColor = (grade: string) => {
  switch (grade?.toUpperCase()) {
    case 'A': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'B': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'C': return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'D': return 'bg-rose-100 text-rose-800 border-rose-300';
    default: return 'bg-slate-100 text-slate-800 border-slate-300';
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-rose-600';
};

const getConfidenceLabel = (confidence: number) => {
  if (confidence >= 80) return 'High';
  if (confidence >= 50) return 'Moderate';
  return 'Low';
};

export const ProduceAnalyzerModal: React.FC<ProduceAnalyzerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<AnalysisStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setStep('upload');
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setErrorMessage('');
  };

  const handleClose = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    resetState();
    onClose();
  };

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `Unsupported format. Please use JPEG, PNG, WebP, or GIF.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum size is 10MB.`;
    }
    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setErrorMessage(error);
      setStep('error');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setStep('preview');
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setStep('analyzing');

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(selectedFile);
      });

      const res = await fetch('/api/ai/analyze-produce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to analyze image');
      }

      const data = await res.json();

      if (data.data) {
        setResult(data.data);
        setStep('results');
      } else {
        throw new Error('No analysis data returned');
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(err.message || 'Unable to analyze the image. Please try again with a clear photo of the produce.');
      setStep('error');
    }
  };

  const handleRetry = () => {
    resetState();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-xs" id="produce-analyzer-modal">
      <div className="bg-white border border-slate-200 rounded-t-2xl sm:rounded-2xl max-w-lg w-full max-h-[92vh] sm:max-h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Analyze Produce</h3>
              <p className="text-[10px] text-emerald-100">AI-powered quality & price estimation</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-white/20 transition cursor-pointer"
            id="close-produce-analyzer-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Step Indicator */}
          {step !== 'error' && (
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold">
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${step === 'upload' ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-100 text-emerald-700'}`}>
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[8px]">1</span>
                Upload
              </div>
              <div className={`w-4 h-px ${step === 'preview' || step === 'analyzing' || step === 'results' ? 'bg-emerald-400' : 'bg-slate-200'}`} />
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${step === 'preview' || step === 'analyzing' || step === 'results' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${step === 'preview' || step === 'analyzing' || step === 'results' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
                Preview
              </div>
              <div className={`w-4 h-px ${step === 'analyzing' || step === 'results' ? 'bg-emerald-400' : 'bg-slate-200'}`} />
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${step === 'analyzing' || step === 'results' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${step === 'analyzing' || step === 'results' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>3</span>
                Results
              </div>
            </div>
          )}

          {/* UPLOAD Step */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-emerald-300 rounded-xl p-8 text-center space-y-3 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                id="upload-dropzone"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <ImageIcon className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-800">Upload a photo of your produce</p>
                  <p className="text-xs text-slate-500 mt-1">Get AI-powered quality assessment and market price estimates</p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    Choose Image
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Supports JPEG, PNG, WebP, GIF • Max 10MB</p>
              </div>

              <div className="text-center">
                <p className="text-[11px] text-slate-400">— or —</p>
              </div>

              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full py-3 bg-gradient-to-r from-emerald-100 to-teal-100 hover:from-emerald-200 hover:to-teal-200 text-emerald-800 font-semibold text-sm rounded-xl border border-emerald-200 transition flex items-center justify-center gap-2 cursor-pointer"
                id="camera-capture-btn"
              >
                <Camera className="w-4 h-4" />
                Take Photo with Camera
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload-input"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
                id="camera-capture-input"
              />
            </div>
          )}

          {/* PREVIEW Step */}
          {step === 'preview' && previewUrl && (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <img
                  src={previewUrl}
                  alt="Produce preview"
                  className="w-full max-h-64 object-contain bg-slate-100"
                  id="produce-preview-image"
                />
                <div className="absolute bottom-2 left-2 bg-slate-900/70 text-white px-2 py-0.5 rounded text-[10px] font-semibold backdrop-blur-sm">
                  {selectedFile?.name}
                </div>
              </div>

              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-800 space-y-1">
                    <p className="font-semibold">Ready to analyze</p>
                    <p className="text-emerald-700">
                      Our AI will identify the produce, assess quality grade (A–D), detect visible defects,
                      and estimate current market prices in INR.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleRetry}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  id="change-image-btn"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Change Image
                </button>
                <button
                  onClick={handleAnalyze}
                  className="flex-[2] py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  id="analyze-produce-btn"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Analyze Produce
                </button>
              </div>
            </div>
          )}

          {/* ANALYZING Step */}
          {step === 'analyzing' && (
            <div className="py-12 text-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                </div>
                <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-emerald-300 border-t-transparent animate-spin mx-auto" style={{ animationDuration: '1.5s' }} />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-800">Analyzing your produce...</p>
                <p className="text-xs text-slate-500 mt-1">AI is identifying crop, assessing quality, and estimating prices</p>
              </div>
              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Identification
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
                  Quality Grading
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.6s' }} />
                  Price Analysis
                </span>
              </div>
            </div>
          )}

          {/* RESULTS Step */}
          {step === 'results' && result && (
            <div className="space-y-4" id="analysis-results">
              {/* Product Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-lg text-slate-800">{result.product}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">AI Quality Assessment</p>
                </div>
                <div className={`px-3 py-1 rounded-lg border font-bold text-sm ${getGradeColor(result.grade)}`}>
                  Grade {result.grade}
                </div>
              </div>

              {/* Score Bars */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-2">
                    <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quality Score</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className={`text-2xl font-bold ${getScoreColor(result.quality_score)}`}>
                      {result.quality_score}
                    </span>
                    <span className="text-xs text-slate-400 mb-0.5">/100</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        result.quality_score >= 80 ? 'bg-emerald-500' :
                        result.quality_score >= 60 ? 'bg-blue-500' :
                        result.quality_score >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${result.quality_score}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Target className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Confidence</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className={`text-2xl font-bold ${getScoreColor(result.confidence)}`}>
                      {result.confidence}
                    </span>
                    <span className="text-xs text-slate-400 mb-0.5">% • {getConfidenceLabel(result.confidence)}</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full transition-all duration-1000"
                      style={{ width: `${result.confidence}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Price Estimation */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                <div className="flex items-center gap-1.5 mb-3">
                  <IndianRupee className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Market Price Estimate</span>
                  {result.price.estimated && (
                    <span className="text-[9px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                      ESTIMATED
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase">Price Range</p>
                    <p className="text-lg font-bold text-emerald-800">
                      ₹{result.price.min} – ₹{result.price.max}
                    </p>
                    <p className="text-[10px] text-emerald-600">{result.price.unit}</p>
                  </div>
                  {result.total_value.min !== null && result.total_value.max !== null && (
                    <div>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase">Estimated Total Value</p>
                      <p className="text-lg font-bold text-emerald-800">
                        ₹{result.total_value.min.toLocaleString()} – ₹{result.total_value.max.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-emerald-600">{result.total_value.currency}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity */}
              {result.quantity.value !== null && (
                <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-lg">📦</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Estimated Quantity</p>
                    <p className="text-sm font-bold text-slate-700">
                      ~{result.quantity.value} {result.quantity.unit}
                      {result.quantity.estimated && (
                        <span className="text-[9px] text-slate-400 ml-1 font-normal">(estimate)</span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Defects */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Visible Defects</p>
                {result.defects.length === 0 || (result.defects.length === 1 && result.defects[0].toLowerCase().includes('none')) ? (
                  <div className="flex items-center gap-2 bg-emerald-50 rounded-lg p-2.5 border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-800">No visible defects detected</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {result.defects.map((defect, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-amber-50 rounded-lg p-2 border border-amber-100">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="text-xs text-amber-800">{defect}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Explanation */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Assessment Summary</p>
                <p className="text-xs text-slate-700 leading-relaxed">{result.explanation}</p>
              </div>

              {/* Disclaimer */}
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-700 leading-relaxed">
                    <strong>Disclaimer:</strong> This is an AI-generated estimate based on visual analysis only.
                    Actual quality, quantity, and prices may vary. Internal damage, pesticide residues, and
                    exact weight cannot be determined from images alone.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleRetry}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  id="analyze-another-btn"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Analyze Another
                </button>
              </div>
            </div>
          )}

          {/* ERROR Step */}
          {step === 'error' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-rose-600" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-800">Unable to Analyze Image</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">{errorMessage}</p>
              </div>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 mx-auto cursor-pointer"
                id="retry-btn"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
