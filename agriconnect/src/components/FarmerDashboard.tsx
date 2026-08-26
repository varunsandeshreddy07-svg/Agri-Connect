import React, { useState } from 'react';
import { 
  Sprout, 
  Plus, 
  TrendingUp, 
  ShieldCheck, 
  MessageSquare, 
  Package, 
  Calendar, 
  MapPin, 
  Eye, 
  Camera,
  CloudSun,
  Clock,
  ChevronDown,
  ChevronUp,
  Leaf
} from 'lucide-react';
import { CropListing, UserRole } from '../types';
import { CropScanRecord } from './CropAnalyzerModal';

interface FarmerDashboardProps {
  listings: CropListing[];
  userRole: UserRole;
  scanHistory?: CropScanRecord[];
  onOpenNewListing: () => void;
  onOpenVerification: () => void;
  onOpenAiAdvisor: () => void;
  onOpenProduceAnalyzer: () => void;
  onOpenLeafDiseaseDetector?: () => void;
  onSelectListing: (listing: CropListing) => void;
  onOpenMessages: () => void;
  onOpenWeather?: () => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  listings,
  userRole,
  scanHistory = [],
  onOpenNewListing,
  onOpenVerification,
  onOpenAiAdvisor,
  onOpenProduceAnalyzer,
  onOpenLeafDiseaseDetector,
  onSelectListing,
  onOpenMessages,
  onOpenWeather,
}) => {
  const [showScanHistory, setShowScanHistory] = useState(false);
  // Filter farmer's own listings or show curated list
  const myListings = listings.filter(l => l.farmerId === userRole.currentUser.id || l.farmerId === 'farmer-1');

  return (
    <div className="space-y-5" id="farmer-dashboard-container">
      {/* Profile & KPI Header in High Density Style */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <img
              src={userRole.currentUser.avatar}
              alt={userRole.currentUser.name}
              className="w-12 h-12 rounded-xl object-cover border border-emerald-500 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-800">{userRole.currentUser.name}</h1>
                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  ✓ Verified Grower
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {userRole.currentUser.organizationOrFarm} • {userRole.currentUser.location}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={onOpenNewListing}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              id="farmer-portal-post-btn"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Create Listing</span>
            </button>
              <button
                onClick={onOpenProduceAnalyzer}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                id="farmer-scan-crop-btn"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>📷 Scan Crop</span>
              </button>
              {onOpenLeafDiseaseDetector && (
                <button
                  onClick={onOpenLeafDiseaseDetector}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-lime-500 to-green-600 hover:from-lime-600 hover:to-green-700 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  id="farmer-leaf-disease-btn"
                >
                  <Leaf className="w-3.5 h-3.5" />
                  <span>🍃 Leaf Disease</span>
                </button>
              )}
            {onOpenWeather && (
              <button
                onClick={onOpenWeather}
                className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold transition flex items-center gap-1 cursor-pointer border border-sky-200"
                id="farmer-weather-btn"
              >
                <CloudSun className="w-3.5 h-3.5" />
                <span>Weather</span>
              </button>
            )}
            <button
              onClick={onOpenVerification}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1 cursor-pointer border border-slate-200"
              id="farmer-portal-verification-btn"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>KYC & RoR Badges</span>
            </button>
          </div>
        </div>

        {/* 4 High-Density KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Total Realized</p>
            <p className="text-lg font-bold text-slate-800">₹31,45,000</p>
            <p className="text-[10px] text-emerald-600 font-bold mt-0.5">+18.4% vs APMC Mandi</p>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Dispatched Volume</p>
            <p className="text-lg font-bold text-slate-800">840 Quintals</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Basmati & Sharbati lots</p>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Active Harvest Lots</p>
            <p className="text-lg font-bold text-emerald-700">{myListings.length} Live</p>
            <p className="text-[10px] text-emerald-600 mt-0.5">Visible to bulk buyers</p>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Trust Score</p>
            <p className="text-lg font-bold text-amber-600">★ 4.9 / 5.0</p>
            <p className="text-[10px] text-slate-400 mt-0.5">48 Verified Bids</p>
          </div>
        </div>
      </div>

      {/* Active Listings in High-Density Cards */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Your Active Harvest Lots</h2>
            <p className="text-xs text-slate-500">Live prices, moisture scores, and buyer negotiation bids</p>
          </div>
          <button
            onClick={onOpenNewListing}
            className="text-xs text-emerald-600 font-bold hover:underline cursor-pointer"
          >
            + Post Harvest Lot
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {myListings.map((listing) => (
            <div
              key={listing.id}
              className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50 flex gap-3 transition"
              id={`farmer-lot-${listing.id}`}
            >
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-20 h-20 rounded-lg object-cover shrink-0 border border-slate-200"
              />

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="text-xs font-bold text-slate-800 truncate">{listing.title}</h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
                      {listing.grade}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Qty: {listing.quantity} {listing.unit} • Moisture: {listing.moistureContent}%
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 mt-2">
                  <div className="text-xs font-bold text-emerald-700">
                    ₹{listing.pricePerUnit.toLocaleString()}
                    <span className="text-[10px] text-slate-400 font-normal">/{listing.unit === 'quintals' ? 'qtl' : listing.unit}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectListing(listing)}
                      className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={onOpenMessages}
                      className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Bids</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Crop Scan History */}
      {scanHistory.length > 0 && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <div>
                <h2 className="text-base font-bold text-slate-800">Crop Scan History</h2>
                <p className="text-xs text-slate-500">AI-powered crop health analyses</p>
              </div>
            </div>
            <button
              onClick={() => setShowScanHistory(!showScanHistory)}
              className="text-xs text-emerald-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
              id="toggle-scan-history-btn"
            >
              {showScanHistory ? 'Hide' : `View All (${scanHistory.length})`}
              {showScanHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {!showScanHistory ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {scanHistory.slice(0, 4).map((record) => (
                <div
                  key={record.id}
                  className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50 flex gap-3 transition"
                >
                  <img
                    src={record.previewUrl}
                    alt={record.result.cropName}
                    className="w-16 h-16 rounded-lg object-cover shrink-0 border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="text-xs font-bold text-slate-800 truncate">{record.result.cropName}</h3>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${record.result.overallScore >= 70 ? 'bg-emerald-100 text-emerald-800' : record.result.overallScore >= 40 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>
                        Score: {record.result.overallScore}/100
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {record.result.growthStage} • {record.result.cropCondition}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      {new Date(record.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {scanHistory.map((record) => (
                <div
                  key={record.id}
                  className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50 flex gap-3 transition"
                >
                  <img
                    src={record.previewUrl}
                    alt={record.result.cropName}
                    className="w-16 h-16 rounded-lg object-cover shrink-0 border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="text-xs font-bold text-slate-800 truncate">{record.result.cropName}</h3>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${record.result.overallScore >= 70 ? 'bg-emerald-100 text-emerald-800' : record.result.overallScore >= 40 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>
                        Score: {record.result.overallScore}/100
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {record.result.growthStage} • {record.result.cropCondition} • {record.result.quality}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Harvest: {record.result.harvestDaysEstimate}
                    </p>
                    {record.result.possibleDiseases.length > 0 && record.result.possibleDiseases[0].toLowerCase() !== 'none' && (
                      <p className="text-[10px] text-rose-600 mt-0.5 font-semibold">
                        ⚠️ {record.result.possibleDiseases.length} issue(s) detected
                      </p>
                    )}
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      {new Date(record.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
