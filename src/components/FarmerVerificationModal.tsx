import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  FileCheck, 
  Sparkles, 
  Loader2
} from 'lucide-react';
import { UserRole } from '../types';

interface FarmerVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  onUpgradeVerification: () => void;
}

export const FarmerVerificationModal: React.FC<FarmerVerificationModalProps> = ({
  isOpen,
  onClose,
  userRole,
  onUpgradeVerification,
}) => {
  if (!isOpen) return null;

  const [simulating, setSimulating] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [docType, setDocType] = useState('land_passbook');
  const [docNumber, setDocNumber] = useState('GUJ/SUR/2026/LND-88392');

  const handleSimulateVerification = () => {
    setSimulating(true);
    setTimeout(() => {
      setSimulating(false);
      setVerificationSuccess(true);
      onUpgradeVerification();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto" id="farmer-verification-modal">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[88vh] overflow-y-auto shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-400 text-emerald-950 flex items-center justify-center font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-800">Trust & Verification Hub</h2>
              <p className="text-[10px] text-slate-500">Government Record Verification & Agristack KYC</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            id="close-verification-modal-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs">
          {/* Current Status Card */}
          <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <img
                src={userRole.currentUser.avatar}
                alt={userRole.currentUser.name}
                className="w-10 h-10 rounded-lg object-cover border border-amber-400"
              />
              <div>
                <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                  <span>{userRole.currentUser.name}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-400 text-slate-950 font-bold">
                    Gold Verified
                  </span>
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5">{userRole.currentUser.organizationOrFarm}</div>
              </div>
            </div>

            <div className="text-right bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700">
              <span className="text-[9px] uppercase font-bold text-emerald-400 block">Trust Rating</span>
              <span className="text-base font-bold text-white">99.4%</span>
            </div>
          </div>

          {/* 3 Tier Architecture Showcase */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              3-Level Verification Hierarchy
            </h3>

            <div className="space-y-2">
              {/* Level 1 */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-emerald-300 flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <span>Tier 1: Mobile & Aadhaar KYC</span>
                    <span className="text-[9px] px-1 py-0.2 bg-emerald-100 text-emerald-800 rounded font-semibold">Active</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Phone OTP and identity validated against Kisan Portal.
                  </p>
                </div>
              </div>

              {/* Level 2 */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-emerald-300 flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <span>Tier 2: Land Records & RoR Validation</span>
                    <span className="text-[9px] px-1 py-0.2 bg-emerald-100 text-emerald-800 rounded font-semibold">Active</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Cross-referenced with State Bhulekh (Khasra 14/2).
                  </p>
                </div>
              </div>

              {/* Level 3 */}
              <div className="bg-amber-50/60 p-2.5 rounded-lg border border-amber-300 flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  ★
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <span>Tier 3: Gold Certification (APEDA Organic & Soil Card)</span>
                    <span className="text-[9px] px-1 py-0.2 bg-amber-100 text-amber-900 rounded font-semibold">Verified</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    NPOP/APEDA organic inspection verified with lab tests.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Document Verification Simulator */}
          <div className="bg-slate-900 text-white p-3.5 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Verification Simulator</span>
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Document Category</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white outline-none cursor-pointer"
                  id="verification-doc-type-select"
                >
                  <option value="land_passbook">Pattadar Passbook / Khasra</option>
                  <option value="apeda_organic">APEDA Organic Scope Certificate</option>
                  <option value="soil_card">National Soil Health Card</option>
                  <option value="kisan_credit">Kisan Credit Card (KCC)</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Document / ID Number</label>
                <input
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white outline-none"
                  id="verification-doc-number-input"
                />
              </div>
            </div>

            {verificationSuccess && (
              <div className="bg-emerald-950 border border-emerald-600 text-emerald-200 p-2 rounded-lg text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Verification Verified! Record matches State Agristack Registry.</span>
              </div>
            )}

            <button
              onClick={handleSimulateVerification}
              disabled={simulating}
              className="w-full py-2 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              id="simulate-ocr-verification-btn"
            >
              {simulating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Validating Land Record with State API...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Simulate Document Verification</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
