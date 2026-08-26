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
  Bug,
  Leaf,
  Shield,
  Beaker,
  SprayCan,
  MessageCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface LeafDiseaseDetectorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LeafAnalysisResult {
  plantName: string;
  scientificName: string;
  diseaseName: string;
  diseaseNameLocal: string;
  confidence: number;
  severity: string;
  symptoms: string[];
  causes: string[];
  treatment: {
    chemical: string[];
    organic: string[];
  };
  applicationInstructions: string[];
  prevention: string[];
  isLeafImage: boolean;
  imageQuality: string;
  additionalNotes: string;
}

type AnalysisStep = 'upload' | 'preview' | 'analyzing' | 'results' | 'error' | 'not-leaf';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const getSeverityColor = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case 'healthy': return 'text-emerald-600';
    case 'mild': return 'text-amber-600';
    case 'moderate': return 'text-orange-600';
    case 'severe': return 'text-rose-600';
    default: return 'text-slate-600';
  }
};

const getSeverityBg = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case 'healthy': return 'bg-emerald-50 border-emerald-200';
    case 'mild': return 'bg-amber-50 border-amber-200';
    case 'moderate': return 'bg-orange-50 border-orange-200';
    case 'severe': return 'bg-rose-50 border-rose-200';
    default: return 'bg-slate-50 border-slate-200';
  }
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 80) return 'text-emerald-600';
  if (confidence >= 60) return 'text-blue-600';
  if (confidence >= 40) return 'text-amber-600';
  return 'text-rose-600';
};

const getConfidenceLabel = (confidence: number) => {
  if (confidence >= 80) return 'High';
  if (confidence >= 60) return 'Moderate';
  if (confidence >= 40) return 'Low';
  return 'Very Low';
};

export const LeafDiseaseDetector: React.FC<LeafDiseaseDetectorProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<AnalysisStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<LeafAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setStep('upload');
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setErrorMessage('');
    setExpandedSection(null);
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

      const res = await fetch('/api/ai/analyze-leaf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to analyze leaf image');
      }

      const data = await res.json();

      if (data.data) {
        const leafData = data.data as LeafAnalysisResult;
        if (leafData.isLeafImage === false) {
          setErrorMessage('The uploaded image does not appear to be a plant leaf. Please upload a clear photo of a leaf for disease analysis.');
          setResult(leafData);
          setStep('not-leaf');
          return;
        }
        if (leafData.imageQuality === 'Unclear') {
          setErrorMessage('The image quality is too low or unclear for accurate disease detection. Please try again with a well-lit, focused photo of the leaf.');
          setResult(leafData);
          setStep('error');
          return;
        }
        setResult(leafData);
        setStep('results');
      } else {
        throw new Error('No analysis data returned');
      }
    } catch (err: any) {
      console.error('Leaf analysis error:', err);
      setErrorMessage(err.message || 'Unable to analyze the leaf image. Please try again with a clear photo of the leaf.');
      setStep('error');
    }
  };

  const handleRetry = () => {
    resetState();
  };

  const handleShareWhatsApp = () => {
    if (!result) return;
    const shareText = [
      `🍃 *Leaf Disease Analysis Report — AgriConnect*`,
      '',
      `🌱 *Plant:* ${result.plantName} (${result.scientificName})`,
      `🦠 *Disease:* ${result.diseaseName}`,
      `⚡ *Severity:* ${result.severity}`,
      `🎯 *Confidence:* ${result.confidence}%`,
      '',
      `🔍 *Symptoms:*`,
      ...result.symptoms.map(s => `• ${s}`),
      '',
      `💊 *Treatment (Chemical):*`,
      ...result.treatment.chemical.map(c => `• ${c}`),
      '',
      `🌿 *Treatment (Organic):*`,
      ...result.treatment.organic.map(o => `• ${o}`),
      '',
      `🛡️ *Prevention:*`,
      ...result.prevention.map(p => `• ${p}`),
      '',
      `⚠️ _AI-generated diagnosis. Consult a local agricultural expert for confirmation._`,
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-xs" id="leaf-disease-detector-modal">
      <div className="bg-white border border-slate-200 rounded-t-2xl sm:rounded-2xl max-w-lg w-full max-h-[92vh] sm:max-h-[88vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-green-600 via-emerald-600 to-lime-600 text-white flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Leaf Disease Detection</h3>
              <p className="text-[10px] text-green-100">AI-powered plant health diagnosis</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-white/20 transition cursor-pointer"
            id="close-leaf-disease-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Step Indicator */}
          {step !== 'error' && step !== 'not-leaf' && (
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
                id="leaf-upload-dropzone"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <ImageIcon className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-800">Upload a leaf photo</p>
                  <p className="text-xs text-slate-500 mt-1">Get AI-powered disease detection, symptoms analysis, and treatment recommendations</p>
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
                className="w-full py-3 bg-gradient-to-r from-emerald-100 to-lime-100 hover:from-emerald-200 hover:to-lime-200 text-emerald-800 font-semibold text-sm rounded-xl border border-emerald-200 transition flex items-center justify-center gap-2 cursor-pointer"
                id="leaf-camera-capture-btn"
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
                id="leaf-file-upload-input"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
                id="leaf-camera-capture-input"
              />

              {/* Tips */}
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-blue-800 space-y-1">
                    <p className="font-semibold">📸 Tips for best results:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-blue-700">
                      <li>Take a close-up photo of the affected leaf</li>
                      <li>Ensure good natural lighting</li>
                      <li>Include both healthy and affected areas if possible</li>
                      <li>Hold the leaf against a plain background for clarity</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PREVIEW Step */}
          {step === 'preview' && previewUrl && (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <img
                  src={previewUrl}
                  alt="Leaf preview"
                  className="w-full max-h-64 object-contain bg-slate-100"
                  id="leaf-preview-image"
                />
                <div className="absolute bottom-2 left-2 bg-slate-900/70 text-white px-2 py-0.5 rounded text-[10px] font-semibold backdrop-blur-sm">
                  {selectedFile?.name}
                </div>
              </div>

              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-800 space-y-1">
                    <p className="font-semibold">Ready to detect leaf diseases</p>
                    <p className="text-emerald-700">
                      Our AI will analyze the leaf image to identify the plant species,
                      detect diseases, assess severity, and recommend both chemical
                      and organic treatments with application instructions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleRetry}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  id="leaf-change-image-btn"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Change Image
                </button>
                <button
                  onClick={handleAnalyze}
                  className="flex-[2] py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  id="leaf-analyze-btn"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Analyze Leaf
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
                <p className="font-bold text-sm text-slate-800">Analyzing your leaf...</p>
                <p className="text-xs text-slate-500 mt-1">AI is detecting plant species, diseases, and treatments</p>
              </div>
              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Plant Identification
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
                  Disease Detection
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.6s' }} />
                  Treatment Plan
                </span>
              </div>
            </div>
          )}

          {/* NOT A LEAF Step */}
          {step === 'not-leaf' && result && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-800">Not a Leaf Image</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {errorMessage}
                </p>
              </div>
              {result.additionalNotes && (
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 max-w-sm mx-auto text-left">
                  <p className="text-[11px] text-amber-800">{result.additionalNotes}</p>
                </div>
              )}
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 mx-auto cursor-pointer"
                id="leaf-retry-btn-notleaf"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Try Again
              </button>
            </div>
          )}

          {/* RESULTS Step */}
          {step === 'results' && result && (
            <div className="space-y-4" id="leaf-disease-results">
              {/* Plant & Disease Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="font-bold text-lg text-slate-800">{result.plantName}</h4>
                  <p className="text-[11px] text-slate-400 italic">{result.scientificName}</p>
                </div>
                <div className="text-center shrink-0">
                  <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center border ${result.diseaseName.toLowerCase() === 'healthy leaf' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                    <span className={`text-lg font-bold ${result.diseaseName.toLowerCase() === 'healthy leaf' ? 'text-emerald-600' : 'text-rose-600'}`}>{result.confidence}%</span>
                    <span className="text-[8px] text-slate-500 font-semibold">{getConfidenceLabel(result.confidence)}</span>
                  </div>
                </div>
              </div>

              {/* Confidence Bar */}
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${result.confidence >= 80 ? 'bg-emerald-500' : result.confidence >= 60 ? 'bg-blue-500' : result.confidence >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                  style={{ width: `${result.confidence}%` }}
                />
              </div>

              {/* Disease & Severity Cards */}
              <div className="grid grid-cols-2 gap-2">
                <div className={`rounded-xl p-2.5 border ${result.diseaseName.toLowerCase() === 'healthy leaf' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Bug className={`w-3 h-3 ${result.diseaseName.toLowerCase() === 'healthy leaf' ? 'text-emerald-500' : 'text-rose-500'}`} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Disease</span>
                  </div>
                  <p className={`text-xs font-bold ${result.diseaseName.toLowerCase() === 'healthy leaf' ? 'text-emerald-800' : 'text-rose-800'}`}>{result.diseaseName}</p>
                  {result.diseaseNameLocal && (
                    <p className="text-[10px] text-slate-500 mt-0.5">Local: {result.diseaseNameLocal}</p>
                  )}
                </div>
                <div className={`rounded-xl p-2.5 border ${getSeverityBg(result.severity)}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Severity</span>
                  </div>
                  <p className={`text-xs font-bold ${getSeverityColor(result.severity)}`}>{result.severity}</p>
                </div>
              </div>

              {/* Symptoms */}
              <div
                className="bg-white rounded-xl border border-slate-200 p-3 hover:border-amber-200 transition cursor-pointer"
                onClick={() => toggleSection('symptoms')}
                id="leaf-symptoms-section"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-700">Symptoms Observed</span>
                  </div>
                  {expandedSection === 'symptoms' ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                </div>
                {expandedSection === 'symptoms' && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                    {result.symptoms.map((symptom, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-amber-50 rounded-lg p-2 border border-amber-100">
                        <span className="text-amber-600 shrink-0 text-xs mt-0.5">🍂</span>
                        <span className="text-[11px] text-amber-800 leading-relaxed">{symptom}</span>
                      </div>
                    ))}
                  </div>
                )}
                {expandedSection !== 'symptoms' && (
                  <p className="mt-1 text-[10px] text-slate-400 truncate">
                    {result.symptoms.length} symptom(s) — tap to expand
                  </p>
                )}
              </div>

              {/* Causes */}
              <div
                className="bg-white rounded-xl border border-slate-200 p-3 hover:border-orange-200 transition cursor-pointer"
                onClick={() => toggleSection('causes')}
                id="leaf-causes-section"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bug className="w-4 h-4 text-orange-500" />
                    <span className="text-xs font-bold text-slate-700">Causes & Pathogens</span>
                  </div>
                  {expandedSection === 'causes' ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                </div>
                {expandedSection === 'causes' && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                    {result.causes.map((cause, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-orange-50 rounded-lg p-2 border border-orange-100">
                        <span className="text-orange-600 shrink-0 text-xs mt-0.5">🔬</span>
                        <span className="text-[11px] text-orange-800 leading-relaxed">{cause}</span>
                      </div>
                    ))}
                  </div>
                )}
                {expandedSection !== 'causes' && (
                  <p className="mt-1 text-[10px] text-slate-400 truncate">
                    {result.causes.length} cause(s) — tap to expand
                  </p>
                )}
              </div>

              {/* Treatment - Chemical */}
              {result.treatment.chemical.length > 0 && (
                <div
                  className="bg-white rounded-xl border border-slate-200 p-3 hover:border-blue-200 transition cursor-pointer"
                  onClick={() => toggleSection('treatment-chemical')}
                  id="leaf-chemical-section"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SprayCan className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-bold text-slate-700">Chemical Treatment</span>
                    </div>
                    {expandedSection === 'treatment-chemical' ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                  {expandedSection === 'treatment-chemical' && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                      {result.treatment.chemical.map((treatment, idx) => (
                        <div key={idx} className="bg-blue-50 rounded-lg p-2.5 border border-blue-100">
                          <div className="flex items-center gap-2">
                            <Beaker className="w-3 h-3 text-blue-600 shrink-0" />
                            <span className="text-[11px] text-blue-800 leading-relaxed">{treatment}</span>
                          </div>
                        </div>
                      ))}
                      <div className="bg-amber-50 rounded-lg p-2 border border-amber-100">
                        <p className="text-[10px] text-amber-700">
                          ⚠️ <strong>Note:</strong> Observe withholding period before harvest. Follow local regulations.
                        </p>
                      </div>
                    </div>
                  )}
                  {expandedSection !== 'treatment-chemical' && (
                    <p className="mt-1 text-[10px] text-slate-400">
                      {result.treatment.chemical.length} treatment(s) — tap to expand
                    </p>
                  )}
                </div>
              )}

              {/* Treatment - Organic */}
              {result.treatment.organic.length > 0 && (
                <div
                  className="bg-white rounded-xl border border-slate-200 p-3 hover:border-emerald-200 transition cursor-pointer"
                  onClick={() => toggleSection('treatment-organic')}
                  id="leaf-organic-section"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold text-slate-700">Organic / Biological Treatment</span>
                    </div>
                    {expandedSection === 'treatment-organic' ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                  {expandedSection === 'treatment-organic' && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                      {result.treatment.organic.map((treatment, idx) => (
                        <div key={idx} className="bg-emerald-50 rounded-lg p-2.5 border border-emerald-100">
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-600 shrink-0 text-xs">🌿</span>
                            <span className="text-[11px] text-emerald-800 leading-relaxed">{treatment}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {expandedSection !== 'treatment-organic' && (
                    <p className="mt-1 text-[10px] text-slate-400">
                      {result.treatment.organic.length} treatment(s) — tap to expand
                    </p>
                  )}
                </div>
              )}

              {/* Application Instructions */}
              <div
                className="bg-white rounded-xl border border-slate-200 p-3 hover:border-purple-200 transition cursor-pointer"
                onClick={() => toggleSection('instructions')}
                id="leaf-instructions-section"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-bold text-slate-700">Application Instructions</span>
                  </div>
                  {expandedSection === 'instructions' ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                </div>
                {expandedSection === 'instructions' && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                    {result.applicationInstructions.map((instruction, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-purple-50 rounded-lg p-2 border border-purple-100">
                        <span className="w-4 h-4 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-[11px] text-purple-800 leading-relaxed">{instruction}</span>
                      </div>
                    ))}
                  </div>
                )}
                {expandedSection !== 'instructions' && (
                  <p className="mt-1 text-[10px] text-slate-400">
                    {result.applicationInstructions.length} step(s) — tap to expand
                  </p>
                )}
              </div>

              {/* Prevention Tips */}
              <div
                className="bg-white rounded-xl border border-slate-200 p-3 hover:border-teal-200 transition cursor-pointer"
                onClick={() => toggleSection('prevention')}
                id="leaf-prevention-section"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-teal-500" />
                    <span className="text-xs font-bold text-slate-700">Prevention Tips</span>
                  </div>
                  {expandedSection === 'prevention' ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                </div>
                {expandedSection === 'prevention' && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                    {result.prevention.map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-teal-50 rounded-lg p-2 border border-teal-100">
                        <Shield className="w-3 h-3 text-teal-600 shrink-0 mt-0.5" />
                        <span className="text-[11px] text-teal-800 leading-relaxed">{tip}</span>
                      </div>
                    ))}
                  </div>
                )}
                {expandedSection !== 'prevention' && (
                  <p className="mt-1 text-[10px] text-slate-400">
                    {result.prevention.length} tip(s) — tap to expand
                  </p>
                )}
              </div>

              {/* Additional Notes */}
              {result.additionalNotes && (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Additional Notes</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{result.additionalNotes}</p>
                </div>
              )}

              {/* Disclaimer */}
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-700 leading-relaxed">
                    <strong>Disclaimer:</strong> This AI-generated diagnosis is based on visual analysis only.
                    Actual disease identification and treatment should be verified with a local agricultural
                    expert or plant pathologist. Always test treatments on a small area before full application.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleRetry}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  id="leaf-analyze-another-btn"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Analyze Another
                </button>
                <button
                  onClick={handleShareWhatsApp}
                  className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  id="leaf-share-whatsapp-btn"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Share on WhatsApp
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
                <p className="font-bold text-sm text-slate-800">Unable to Analyze Leaf</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">{errorMessage}</p>
              </div>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 mx-auto cursor-pointer"
                id="leaf-retry-btn"
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
