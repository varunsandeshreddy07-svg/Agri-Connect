import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Sparkles, 
  Printer, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Droplet, 
  Sprout, 
  Loader2,
  CheckCircle2,
  Clock,
  CircleDot
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const PRESET_PLANS = [
  {
    title: '🌾 5-Acre Wheat Commercial Plan (Punjab)',
    crop: 'Wheat (Sharbati C-306)',
    landSize: 5,
    unit: 'acres',
    soilType: 'Alluvial Loam',
    irrigation: 'Tube-well + Drip Irrigation',
    season: 'Rabi (Oct - April)',
    budget: '110000',
    location: 'Ludhiana, Punjab',
  },
  {
    title: '🍚 3-Acre Organic Basmati Export Plan (Gujarat)',
    crop: '1121 Traditional Basmati Rice',
    landSize: 3,
    unit: 'acres',
    soilType: 'Black Cotton Soil',
    irrigation: 'Canal + Drip',
    season: 'Kharif (June - Nov)',
    budget: '95000',
    location: 'Bardoli, Surat, Gujarat',
  },
  {
    title: '🍅 2-Acre Hybrid Tomato Drip Plan (Maharashtra)',
    crop: 'Abhinav Hybrid F1 Tomato',
    landSize: 2,
    unit: 'acres',
    soilType: 'Red Sandy Loam',
    irrigation: 'Drip Fertigation',
    season: 'Kharif / Rabi',
    budget: '75000',
    location: 'Nashik, Maharashtra',
  },
  {
    title: '🌶️ 4-Acre Guntur Teja Red Chili Blueprint (Andhra)',
    crop: 'Teja S17 Stemless Red Chili',
    landSize: 4,
    unit: 'acres',
    soilType: 'Deep Black Soil',
    irrigation: 'Borewell + Micro-Sprinklers',
    season: 'Kharif',
    budget: '160000',
    location: 'Guntur Rural, Andhra Pradesh',
  },
];

export const TradingPlanGenerator: React.FC = () => {
  const [crop, setCrop] = useState('Sharbati Wheat (C-306)');
  const [landSize, setLandSize] = useState(5);
  const [unit, setUnit] = useState<'acres' | 'hectares'>('acres');
  const [soilType, setSoilType] = useState('Alluvial Loam');
  const [irrigation, setIrrigation] = useState('Tube-well + Drip Irrigation');
  const [season, setSeason] = useState('Rabi (Winter)');
  const [budget, setBudget] = useState('110000');
  const [location, setLocation] = useState('Ludhiana, Punjab');
  
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);

  const applyPreset = (preset: typeof PRESET_PLANS[0]) => {
    setCrop(preset.crop);
    setLandSize(preset.landSize);
    setUnit(preset.unit as any);
    setSoilType(preset.soilType);
    setIrrigation(preset.irrigation);
    setSeason(preset.season);
    setBudget(preset.budget);
    setLocation(preset.location);
  };

  const handleGeneratePlan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop,
          landSize,
          unit,
          soilType,
          irrigation,
          season,
          budget,
          location,
        }),
      });

      const data = await res.json();
      if (data.plan) {
        setGeneratedPlan(data.plan);
      }
    } catch (err) {
      console.error(err);
      // Fallback blueprint if backend is in offline preview mode
      setGeneratedPlan(`### 🌾 Precision Trading Plan: ${landSize} ${unit} of ${crop}
**Agro-Climatic Region:** ${location} | **Soil Profile:** ${soilType}
**Irrigation Protocol:** ${irrigation} | **Season:** ${season}

---

#### 1. Input Cost Breakdown & Working Capital
- **Certified Foundation Seed (C-306 / Certified):** ₹14,500 (45 kg/acre)
- **Soil Conditioning & Bio-Enriched Compost:** ₹18,000 (FYM + Trichoderma)
- **Fertigation Schedule (Basal DAP + Urea Split):** ₹24,000
- **Drip Line Maintenance & Pumping Energy:** ₹12,500
- **Labor, Weeding & Harvesting Mechanization:** ₹28,000
- **Total Estimated Cultivation Cost:** **₹97,000** (Within budgeted ₹${budget})

---

#### 2. Expected Yield & Mandi vs Direct Comparison
- **Estimated Crop Yield:** 24.5 Quintals per acre (**Total: ${(landSize * 24.5).toFixed(1)} Quintals**)
- **Local APMC Mandi Benchmark:** ₹2,420 / Quintal → Gross Mandi: ₹${Math.round(landSize * 24.5 * 2420).toLocaleString()}
- **AgriConnect Direct Farm-Gate Bid:** ₹2,680 / Quintal → Gross Direct: **₹${Math.round(landSize * 24.5 * 2680).toLocaleString()}**
- **Net Farmer Revenue Realization:** **+₹${Math.round(landSize * 24.5 * (2680 - 2420)).toLocaleString()} (+10.7% Pure Gain)**

---

#### 3. Harvest & Direct Monetization Roadmap
1. **Week 1-3:** Land preparation, zero-tillage seed drilling with seed treatment.
2. **Week 8-12:** First top dressing & micro-nutrient foliar spray (Zinc Sulfate + Boron).
3. **Week 16:** Moisture checks, publish preliminary harvest lot on AgriConnect.
4. **Week 20 (Harvest):** Mechanical combine harvesting, direct weighbridge verification & instant escrow settlement.`);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5" id="trading-plan-container">
      {/* High Density Header & Real-time Trading Metrics */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Your Trading Plan: Q3 Harvest</h2>
            <p className="text-xs text-slate-500">Live operational economics, harvest readiness & activity tracking</p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            Active Season: Rabi 2026
          </span>
        </div>

        {/* 4 High-Density Metrics from Design HTML */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Target Revenue</p>
            <p className="text-lg font-bold text-slate-800">₹3,28,400</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Contract Status</p>
            <p className="text-lg font-bold text-emerald-600">65% Filled</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Logistics Partner</p>
            <p className="text-sm font-bold text-slate-800">FastTrack Agro Reefer</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Days to Harvest</p>
            <p className="text-lg font-bold text-amber-600">14 Days</p>
          </div>
        </div>

        {/* High Density Dashed Activity Roadmap from Design HTML */}
        <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Activity Roadmap</span>
            <span className="text-[10px] text-slate-400">Updated 2h ago</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></div>
              <p className="text-xs text-slate-700">
                <span className="font-bold text-slate-900">Completed:</span> Soil moisture and NPK optimization for Zone B.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></div>
              <p className="text-xs text-slate-700">
                <span className="font-bold text-slate-900">In Progress:</span> Connecting with 3 high-volume wheat buyers in Delhi hub.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0"></div>
              <p className="text-xs text-slate-700">
                <span className="font-bold text-slate-900">Upcoming:</span> Schedule combine harvester & weighbridge inspection for Oct 12th.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Blueprint Generation Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        {/* Presets Row */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              ⚡ Quick Case Study Presets (1-Click Fill):
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_PLANS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition cursor-pointer font-medium"
                id={`preset-plan-btn-${idx}`}
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs & Output Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
          {/* Left Form: Parameter Inputs */}
          <form onSubmit={handleGeneratePlan} className="lg:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-200">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>Configure Crop Blueprint</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Crop *</label>
              <input
                type="text"
                required
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                placeholder="e.g. Wheat, Basmati Rice, Tomato"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                id="plan-crop-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Land Area *</label>
                <input
                  type="number"
                  required
                  min={0.5}
                  step={0.5}
                  value={landSize}
                  onChange={(e) => setLandSize(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  id="plan-land-size-input"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  id="plan-unit-select"
                >
                  <option value="acres">Acres</option>
                  <option value="hectares">Hectares</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Soil Type</label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  id="plan-soil-select"
                >
                  <option value="Alluvial Loam">Alluvial Loam</option>
                  <option value="Black Cotton Soil">Black Cotton</option>
                  <option value="Red Sandy Loam">Red Sandy Loam</option>
                  <option value="Clay Loam">Clay Loam</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Irrigation</label>
                <select
                  value={irrigation}
                  onChange={(e) => setIrrigation(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  id="plan-irrigation-select"
                >
                  <option value="Tube-well + Drip Irrigation">Tube-well + Drip</option>
                  <option value="Canal Gravity Flow">Canal Gravity</option>
                  <option value="Micro-Sprinkler System">Micro-Sprinkler</option>
                  <option value="Rainfed / Monsoon Only">Rainfed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Season</label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  id="plan-season-select"
                >
                  <option value="Rabi (Winter / Spring)">Rabi (Winter)</option>
                  <option value="Kharif (Monsoon)">Kharif (Monsoon)</option>
                  <option value="Zaid (Summer)">Zaid (Summer)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Budget (₹)</label>
                <input
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  id="plan-budget-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                id="plan-location-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm mt-2"
              id="generate-plan-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Economics & Yield...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Generate AI Blueprint & Economics</span>
                </>
              )}
            </button>
          </form>

          {/* Right Output: Blueprint Report Sheet */}
          <div className="lg:col-span-7">
            {generatedPlan ? (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4 shadow-sm animate-in fade-in" id="printable-dossier">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Precision Agronomic & Trading Blueprint
                    </span>
                  </div>

                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
                    id="print-plan-btn"
                  >
                    <Printer className="w-3 h-3" />
                    <span>Print Dossier</span>
                  </button>
                </div>

                {/* Rendered Markdown */}
                <div className="prose prose-xs max-w-none text-slate-800 prose-headings:text-slate-900 prose-headings:font-bold prose-h3:text-sm prose-h4:text-xs prose-p:text-xs prose-p:leading-relaxed prose-table:text-xs prose-th:bg-slate-200 prose-th:p-1.5 prose-td:p-1.5 prose-td:border-b prose-td:border-slate-200">
                  <ReactMarkdown>{generatedPlan}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-8 text-center flex flex-col items-center justify-center min-h-[340px] space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div className="max-w-xs space-y-1">
                  <h3 className="text-sm font-bold text-slate-800">No Blueprint Generated Yet</h3>
                  <p className="text-xs text-slate-500">
                    Click any case study preset or enter your custom land parameters to generate precision agronomy and monetization roadmap.
                  </p>
                </div>
                <button
                  onClick={() => handleGeneratePlan()}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                  id="quick-demo-plan-trigger-btn"
                >
                  ⚡ Generate 5-Acre Wheat Case Study
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
