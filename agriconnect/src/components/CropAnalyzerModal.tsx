import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  Loader2,
  AlertTriangle,
  Sparkles,
  Image as ImageIcon,
  RefreshCw,
  Info,
  CheckCircle2,
  Bug,
  Droplet,
  Scissors,
  Shield,
  Clock,
  Thermometer,
  Leaf,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface CropScanRecord {
  id: string;
  previewUrl: string;
  timestamp: string;
  result: CropAnalysisResult;
}

interface CropAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete?: (record: CropScanRecord) => void;
  onAttachToListing?: (imageUrl: string) => void;
  scanHistory?: CropScanRecord[];
  onViewHistory?: () => void;
}

interface CropAnalysisResult {
  cropName: string;
  cropCondition: string;
  quality: string;
  growthStage: string;
  possibleDiseases: string[];
  diseaseDetails: string;
  fertilizers: { name: string; dosage: string; timing: string; purpose: string }[];
  harvestDaysEstimate: string;
  precautions: string[];
  overallScore: number;
  explanation: string;
}

type AnalysisStep = 'upload' | 'preview' | 'analyzing' | 'results' | 'error';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-rose-600';
};

const getScoreBg = (score: number) => {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-blue-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-rose-500';
};

export const CropAnalyzerModal: React.FC<CropAnalyzerModalProps> = ({ isOpen, onClose, onScanComplete, onAttachToListing, scanHistory, onViewHistory }) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<AnalysisStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<CropAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [attachingImage, setAttachingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setStep('upload');
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setErrorMessage('');
    setExpandedSection(null);
    setShowHistory(false);
    setAttachingImage(null);
  };

  const handleClose = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    resetState();
    onClose();
  };

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Unsupported format. Please use JPEG, PNG, WebP, or GIF.';
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
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(selectedFile);
      });

      const res = await fetch('/api/ai/analyze-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to analyze crop image');
      }

      const data = await res.json();
      if (data.data) {
        setResult(data.data);
        setStep('results');
        // Save to scan history
        if (onScanComplete && previewUrl) {
          onScanComplete({
            id: `scan-${Date.now()}`,
            previewUrl,
            timestamp: new Date().toISOString(),
            result: data.data,
          });
        }
      } else {
        throw new Error('No analysis data returned');
      }
    } catch (err: any) {
      console.error('Crop analysis error:', err);
      setErrorMessage(err.message || 'Unable to analyze the crop image. Please try again with a clear photo of the plant.');
      setStep('error');
    }
  };

  const handleRetry = () => {
    resetState();
  };

  const handleShareWhatsApp = () => {
    if (!result) return;

    const shareText = [
      `🌾 *Crop Analysis Report — AgriConnect*`,
      '',
      `🌱 *Crop:* ${result.cropName}`,
      `📋 *Condition:* ${result.cropCondition}`,
      `⭐ *Quality:* ${result.quality}`,
      `📈 *Growth Stage:* ${result.growthStage}`,
      `🎯 *Health Score:* ${result.overallScore}/100`,
      '',
      result.possibleDiseases.length > 0 && result.possibleDiseases[0].toLowerCase() !== 'none'
        ? `🦠 *Possible Diseases:*\n${result.possibleDiseases.map(d => `• ${d}`).join('\n')}`
        : `🦠 *Disease Status:* No visible diseases detected`,
      '',
      `💊 *Fertilizer Recommendations:*`,
      ...result.fertilizers.map(f => `• ${f.name} (${f.dosage}) — ${f.timing}\n  ${f.purpose}`),
      '',
      `📅 *Estimated Harvest:* ${result.harvestDaysEstimate}`,
      '',
      `⚠️ *Precautions:*`,
      ...result.precautions.map(p => `• ${p}`),
      '',
      `📝 *Notes:* ${result.explanation}`,
      '',
      `⚠️ _This is an AI-generated estimate. Please verify locally when needed._`,
      '',
      `— Shared from AgriConnect 🌾`,
    ].filter(Boolean).join('\n');

    const encodedText = encodeURIComponent(shareText);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  const toggleSection = (key: string) => {
    setExpandedSection(expandedSection === key ? null : key);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-xs" id="crop-analyzer-modal">
      <div className="bg-white border border-slate-200 rounded-t-2xl sm:rounded-2xl max-w-lg w-full max-h-[92vh] sm:max-h-[88vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Smart Crop Camera & Advisory</h3>
              <p className="text-[10px] text-green-100">AI-powered plant health & farm advisory</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-white/20 transition cursor-pointer"
            id="close-crop-analyzer-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Step Indicator */}
          {step !== 'error' && (
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[8px]">1</span>
                Upload
              </div>
              <div className={`w-4 h-px ${step === 'preview' || step === 'analyzing' || step === 'results' ? 'bg-emerald-400' : 'bg-slate-200'}`} />
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${step === 'preview' || step === 'analyzing' || step === 'results' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${step === 'preview' || step === 'analyzing' || step === 'results' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
                Analyze
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
                id="crop-upload-dropzone"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <ImageIcon className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-800">Upload a crop or plant photo</p>
                  <p className="text-xs text-slate-500 mt-1">Get AI-powered disease detection, growth analysis & fertilizer recommendations</p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    Choose from Gallery
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
                id="crop-camera-capture-btn"
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
                id="crop-file-upload-input"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
                id="crop-camera-capture-input"
              />

              {/* Tips */}
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-blue-800 space-y-1">
                    <p className="font-semibold">📸 Tips for best results:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-blue-700">
                      <li>Take a close-up photo of the affected leaf or plant part</li>
                      <li>Ensure good lighting for accurate disease detection</li>
                      <li>Include both healthy and affected areas if possible</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Scan History */}
              {scanHistory && scanHistory.length > 0 && (
                <div className="space-y-2">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider hover:text-slate-700 transition cursor-pointer"
                    id="crop-history-toggle"
                  >
                    <Clock className="w-3 h-3" />
                    Recent Scans ({scanHistory.length})
                    {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  {showHistory && (
                    <div className="space-y-2">
                      {scanHistory.slice(0, 5).map((record) => (
                        <div
                          key={record.id}
                          className="flex items-center gap-3 bg-white rounded-xl p-2.5 border border-slate-200 hover:border-emerald-200 transition"
                        >
                          <img
                            src={record.previewUrl}
                            alt={record.result.cropName}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{record.result.cropName}</p>
                            <p className="text-[10px] text-slate-500">Score: {record.result.overallScore}/100 • {record.result.growthStage}</p>
                            <p className="text-[9px] text-slate-400">{new Date(record.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          {onAttachToListing && (
                            <button
                              onClick={() => onAttachToListing(record.previewUrl)}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded border border-emerald-200 transition cursor-pointer shrink-0"
                            >
                              Reuse Photo
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* PREVIEW Step */}
          {step === 'preview' && previewUrl && (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <img
                  src={previewUrl}
                  alt="Crop preview"
                  className="w-full max-h-64 object-contain bg-slate-100"
                  id="crop-preview-image"
                />
                <div className="absolute bottom-2 left-2 bg-slate-900/70 text-white px-2 py-0.5 rounded text-[10px] font-semibold backdrop-blur-sm">
                  {selectedFile?.name}
                </div>
              </div>

              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-800 space-y-1">
                    <p className="font-semibold">Ready to analyze your crop</p>
                    <p className="text-emerald-700">
                      Our AI will analyze the plant image to detect diseases, assess crop condition
                      and quality, identify growth stage, recommend fertilizers, and estimate
                      harvest timing.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleRetry}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  id="crop-change-image-btn"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Change Image
                </button>
                <button
                  onClick={handleAnalyze}
                  className="flex-[2] py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  id="crop-analyze-btn"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Analyze Crop
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
                <p className="font-bold text-sm text-slate-800">Analyzing your crop...</p>
                <p className="text-xs text-slate-500 mt-1">AI is detecting diseases, assessing quality & growth stage</p>
              </div>
              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Disease Detection
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
                  Quality Analysis
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.6s' }} />
                  Advisory
                </span>
              </div>
            </div>
          )}

          {/* RESULTS Step */}
          {step === 'results' && result && (
            <div className="space-y-4" id="crop-analysis-results">
              {/* Crop Header & Score */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="font-bold text-lg text-slate-800">{result.cropName}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">AI Crop Health Analysis</p>
                </div>
                <div className="text-center shrink-0">
                  <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center bg-gradient-to-br ${result.overallScore >= 70 ? 'from-emerald-100 to-emerald-50 border border-emerald-200' : result.overallScore >= 40 ? 'from-amber-100 to-amber-50 border border-amber-200' : 'from-rose-100 to-rose-50 border border-rose-200'}`}>
                    <span className={`text-lg font-bold ${getScoreColor(result.overallScore)}`}>{result.overallScore}</span>
                    <span className="text-[8px] text-slate-500 font-semibold">/100</span>
                  </div>
                </div>
              </div>

              {/* Score bar */}
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${getScoreBg(result.overallScore)}`}
                  style={{ width: `${result.overallScore}%` }}
                />
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Leaf className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Condition</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">{result.cropCondition}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3 h-3 text-blue-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Quality</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">{result.quality}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Thermometer className="w-3 h-3 text-amber-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Growth Stage</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">{result.growthStage}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="w-3 h-3 text-teal-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Harvest In</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">{result.harvestDaysEstimate}</p>
                </div>
              </div>

              {/* Disease Detection */}
              <div
                className="bg-white rounded-xl border border-slate-200 p-3 hover:border-rose-200 transition cursor-pointer"
                onClick={() => toggleSection('diseases')}
                id="crop-disease-section"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bug className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-bold text-slate-700">Disease & Condition Detection</span>
                  </div>
                  {expandedSection === 'diseases' ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                </div>
                {expandedSection === 'diseases' && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    {result.possibleDiseases.length > 0 && result.possibleDiseases[0].toLowerCase() !== 'none' ? (
                      result.possibleDiseases.map((disease, idx) => (
                        <div key={idx} className="flex items-start gap-2 bg-rose-50 rounded-lg p-2 border border-rose-100">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <span className="text-xs text-rose-800">{disease}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-2 bg-emerald-50 rounded-lg p-2.5 border border-emerald-100">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-800">No visible diseases detected</span>
                      </div>
                    )}
                    {result.diseaseDetails && (
                      <p className="text-[11px] text-slate-600 leading-relaxed">{result.diseaseDetails}</p>
                    )}
                  </div>
                )}
                {expandedSection !== 'diseases' && (
                  <p className="mt-1 text-[10px] text-slate-400 truncate">
                    {result.possibleDiseases.length > 0 && result.possibleDiseases[0].toLowerCase() !== 'none'
                      ? `${result.possibleDiseases.length} issue(s) detected`
                      : 'No visible diseases'}
                  </p>
                )}
              </div>

              {/* Fertilizer Recommendations */}
              <div
                className="bg-white rounded-xl border border-slate-200 p-3 hover:border-blue-200 transition cursor-pointer"
                onClick={() => toggleSection('fertilizers')}
                id="crop-fertilizer-section"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-slate-700">Fertilizer & Nutrient Recommendations</span>
                  </div>
                  {expandedSection === 'fertilizers' ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                </div>
                {expandedSection === 'fertilizers' && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    {result.fertilizers.map((fert, idx) => (
                      <div key={idx} className="bg-blue-50 rounded-lg p-2.5 border border-blue-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-blue-800">{fert.name}</span>
                          <span className="text-[10px] font-semibold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">{fert.dosage}</span>
                        </div>
                        <p className="text-[11px] text-blue-700"><strong>When:</strong> {fert.timing}</p>
                        <p className="text-[11px] text-blue-700"><strong>Why:</strong> {fert.purpose}</p>
                      </div>
                    ))}
                  </div>
                )}
                {expandedSection !== 'fertilizers' && (
                  <p className="mt-1 text-[10px] text-slate-400">
                    {result.fertilizers.length} recommendation(s) — tap to expand
                  </p>
                )}
              </div>

              {/* Harvest Estimate */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <Scissors className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Harvest Estimate</span>
                </div>
                <p className="text-sm font-bold text-amber-900">{result.harvestDaysEstimate}</p>
                <p className="text-[10px] text-amber-700 mt-1">This is an approximate estimate based on visual growth stage analysis.</p>
              </div>

              {/* Precautions */}
              <div
                className="bg-white rounded-xl border border-slate-200 p-3 hover:border-amber-200 transition cursor-pointer"
                onClick={() => toggleSection('precautions')}
                id="crop-precautions-section"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-700">Precautions & Farm Care</span>
                  </div>
                  {expandedSection === 'precautions' ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                </div>
                {expandedSection === 'precautions' && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                    {result.precautions.map((precaution, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-amber-50 rounded-lg p-2 border border-amber-100">
                        <span className="text-amber-600 shrink-0 text-xs mt-0.5">⚠️</span>
                        <span className="text-[11px] text-amber-800 leading-relaxed">{precaution}</span>
                      </div>
                    ))}
                  </div>
                )}
                {expandedSection !== 'precautions' && (
                  <p className="mt-1 text-[10px] text-slate-400">
                    {result.precautions.length} precaution(s) — tap to expand
                  </p>
                )}
              </div>

              {/* Explanation */}
              {result.explanation && (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Summary</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{result.explanation}</p>
                </div>
              )}

              {/* Disclaimer */}
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-700 leading-relaxed">
                    <strong>Disclaimer:</strong> These AI recommendations are estimates based on visual analysis only.
                    Actual crop conditions may vary. Please verify with local agricultural experts or extension officers
                    when needed. Fertilizer and pesticide applications should be confirmed with your local soil health data.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleRetry}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  id="crop-analyze-another-btn"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Analyze Another
                </button>
                <button
                  onClick={handleShareWhatsApp}
                  className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  id="crop-share-whatsapp-btn"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Share on WhatsApp
                </button>
              </div>

              {/* Attach to Listing */}
              {onAttachToListing && previewUrl && (
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-emerald-800">Use this scan photo in a marketplace listing?</p>
                      <p className="text-[10px] text-emerald-600 mt-0.5">Attach the crop photo so buyers can see your crop health analysis</p>
                    </div>
                    <button
                      onClick={() => onAttachToListing(previewUrl)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shrink-0 ml-2"
                      id="crop-attach-to-listing-btn"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Attach to Listing
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ERROR Step */}
          {step === 'error' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-rose-600" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-800">Unable to Analyze Crop</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">{errorMessage}</p>
              </div>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 mx-auto cursor-pointer"
                id="crop-retry-btn"
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
