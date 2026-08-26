import React, { useState } from 'react';
import { 
  GraduationCap, 
  DollarSign, 
  Bot, 
  ShieldCheck, 
  Play
} from 'lucide-react';

interface CollegeDemoGuideProps {
  onTriggerDemoAction: (action: string) => void;
  onClose: () => void;
}

export const CollegeDemoGuide: React.FC<CollegeDemoGuideProps> = ({
  onTriggerDemoAction,
  onClose,
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'tech' | 'viva'>('overview');

  return (
    <div className="bg-white text-slate-800 border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm mb-4" id="college-demo-guide-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-emerald-950 flex items-center justify-center font-black shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-800">AgriConnect • Project Demonstration Dossier</h2>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                Viva Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-500">System architecture, precision agronomy AI & 1-click test scenarios</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveSection('overview')}
            className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
              activeSection === 'overview' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Highlights
          </button>
          <button
            onClick={() => setActiveSection('viva')}
            className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
              activeSection === 'viva' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Viva Q&A
          </button>
          <button
            onClick={() => setActiveSection('tech')}
            className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
              activeSection === 'tech' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tech Stack
          </button>
          <button
            onClick={onClose}
            className="px-2 py-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            title="Minimize Guide"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Section Content */}
      <div className="pt-3">
        {activeSection === 'overview' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Direct Farm-to-Buyer Trading</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Eliminates mandi commission layers, boosting farmer realization by 14–22% while providing wholesale buyers verifiable quality and moisture metrics.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <div className="font-bold text-blue-800 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-blue-600" />
                  <span>Voice-Enabled AI Agronomist</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Voice input (Web Speech API) + Gemini 2.5 Flash providing biological pest remedies, NPK scheduling, and text-to-speech voice narration.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <div className="font-bold text-amber-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Land & KYC Verification</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  3-Tier authentication (Aadhaar KYC, Land registry verification, APEDA organic certificates) solving buyer trust deficit.
                </p>
              </div>
            </div>

            {/* Quick Demo Test Buttons */}
            <div className="pt-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                ⚡ 1-Click Interactive Demonstration Scenarios:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onTriggerDemoAction('test-ai-pest')}
                  className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Play className="w-3 h-3 text-amber-300" />
                  <span>1. Test Voice AI Agronomist</span>
                </button>

                <button
                  onClick={() => onTriggerDemoAction('test-plan')}
                  className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Play className="w-3 h-3 text-amber-300" />
                  <span>2. Generate Precision Farm Plan</span>
                </button>

                <button
                  onClick={() => onTriggerDemoAction('test-chat-negotiate')}
                  className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Play className="w-3 h-3 text-amber-300" />
                  <span>3. Test Direct Negotiation Chat</span>
                </button>

                <button
                  onClick={() => onTriggerDemoAction('test-verification')}
                  className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Play className="w-3 h-3 text-amber-300" />
                  <span>4. View Government Record KYC</span>
                </button>

                <button
                  onClick={() => onTriggerDemoAction('test-leaf-disease')}
                  className="px-3 py-1 bg-lime-700 hover:bg-lime-800 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Play className="w-3 h-3 text-amber-300" />
                  <span>5. Leaf Disease Detection</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'viva' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
              <span className="font-bold text-slate-900 block">Q1: How does the platform solve price asymmetry?</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                By integrating live APMC mandi benchmarks directly against farm gate bids, showing exact percentage gain and historical price trend indicators.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
              <span className="font-bold text-slate-900 block">Q2: How does the AI Assistant assist non-literate farmers?</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Using browser Web Speech recognition for vernacular voice queries and Web SpeechSynthesis for audio answers with bio-remedies.
              </p>
            </div>
          </div>
        )}

        {activeSection === 'tech' && (
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs flex flex-wrap gap-2 text-slate-700">
            <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-semibold">React 19 + TypeScript</span>
            <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-semibold">Tailwind CSS (High Density)</span>
            <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-semibold">Express REST Backend</span>
            <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-semibold">Gemini 2.5 Flash GenAI</span>
            <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-semibold">Web Speech API</span>
          </div>
        )}
      </div>
    </div>
  );
};
