import React, { useState } from 'react';
import { 
  X, 
  Leaf, 
  Sparkles, 
  Upload, 
  Check, 
  Loader2 
} from 'lucide-react';
import { CropListing, CropCategory, CropGrade, StorageType, UserRole } from '../types';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddListing: (listing: CropListing) => void;
  userRole: UserRole;
  scannedImageUrl?: string | null;
}

const PRESET_IMAGES = [
  { label: 'Wheat (Sharbati Golden)', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80' },
  { label: 'Basmati Rice (1121 Paddy)', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80' },
  { label: 'Organic Tomatoes', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80' },
  { label: 'Soybean Seeds', url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80' },
  { label: 'Cotton Bales (Shankar-6)', url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80' },
  { label: 'Salem Turmeric (High Curcumin)', url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80' },
  { label: 'Red Onions (Nashik)', url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80' },
  { label: 'Chickpeas / Kabuli Chana', url: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=800&q=80' },
];

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  onAddListing,
  userRole,
  scannedImageUrl,
}) => {
  if (!isOpen) return null;

  const [cropName, setCropName] = useState('Sharbati Wheat');
  const [variety, setVariety] = useState('C-306 Desi Golden');
  const [category, setCategory] = useState<CropCategory>('Grains');
  const [grade, setGrade] = useState<CropGrade>('Grade A+');
  const [quantity, setQuantity] = useState(150);
  const [unit, setUnit] = useState<'quintals' | 'kg' | 'tonnes'>('quintals');
  const [pricePerUnit, setPricePerUnit] = useState(2650);
  const [mandiBenchmarkPrice, setMandiBenchmarkPrice] = useState(2400);
  const [minOrderQuantity, setMinOrderQuantity] = useState(15);
  const [harvestDate, setHarvestDate] = useState('2026-08-16');
  const [location, setLocation] = useState('Bardoli, Surat');
  const [state, setState] = useState('Gujarat');
  const [isOrganic, setIsOrganic] = useState(true);
  const [organicCertNumber, setOrganicCertNumber] = useState('NPOP/2026/GZ-441');
  const [storageType, setStorageType] = useState<StorageType>('Dry Ventilated Shed');
  const [moistureContent, setMoistureContent] = useState(11.0);
  const [selectedImage, setSelectedImage] = useState(scannedImageUrl || PRESET_IMAGES[0].url);
  const [description, setDescription] = useState('Freshly harvested Grade A+ produce. Moisture tested and cleaned with standard bag packing.');
  
  const [isEstimatingPrice, setIsEstimatingPrice] = useState(false);
  const [aiPriceInsight, setAiPriceInsight] = useState<string | null>(null);

  // AI Price Estimation helper
  const handleEstimatePrice = async () => {
    setIsEstimatingPrice(true);
    setAiPriceInsight(null);
    try {
      const res = await fetch('/api/ai/price-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: cropName,
          variety,
          grade,
          location: `${location}, ${state}`,
        }),
      });
      const result = await res.json();
      if (result.data) {
        setMandiBenchmarkPrice(result.data.avgMandiPrice || 2400);
        setPricePerUnit(result.data.recommendedDirectPrice || 2650);
        setAiPriceInsight(
          `AI Benchmark: APMC Mandi Avg is ₹${result.data.avgMandiPrice}/qtl. Recommended Direct Farm Price: ₹${result.data.recommendedDirectPrice}/qtl (${result.data.trendPercentage || '+5%'} gain).`
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEstimatingPrice(false);
    }
  };

  // Handle local file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSelectedImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newListing: CropListing = {
      id: `crop-${Date.now()}`,
      title: `${isOrganic ? 'Organic ' : ''}${variety || cropName} (${grade})`,
      cropName,
      variety,
      category,
      quantity: Number(quantity),
      unit,
      pricePerUnit: Number(pricePerUnit),
      mandiBenchmarkPrice: Number(mandiBenchmarkPrice),
      minOrderQuantity: Number(minOrderQuantity),
      harvestDate,
      location,
      state,
      grade,
      isOrganic,
      organicCertNumber: isOrganic ? organicCertNumber : undefined,
      storageType,
      moistureContent: Number(moistureContent),
      images: [selectedImage],
      description,
      farmerId: userRole.currentUser.id,
      farmer: {
        id: userRole.currentUser.id,
        name: userRole.currentUser.name,
        phone: userRole.currentUser.phone,
        village: location.split(',')[0] || 'Farm Gate',
        district: location.split(',')[1]?.trim() || 'Surat',
        state,
        avatar: userRole.currentUser.avatar,
        rating: 4.9,
        totalReviews: 24,
        verificationLevel: userRole.currentUser.verificationLevel,
        verifiedDocs: {
          kisanId: true,
          landRecord: true,
          soilHealthCard: true,
          organicApeda: isOrganic,
        },
        memberSince: '2023',
        totalSoldQuintals: 420,
      },
      status: 'available',
      createdAt: new Date().toISOString(),
      tags: [grade, isOrganic ? 'Organic Certified' : 'Conventional', storageType, 'Direct Farm Gate'],
    };

    onAddListing(newListing);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto" id="create-listing-modal">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[88vh] overflow-y-auto shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
              🌾
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-800">Post New Crop Harvest Lot</h2>
              <p className="text-[10px] text-slate-500">List directly to verified wholesale & retail buyers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            id="close-create-listing-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs">
          {/* 1. Basic Crop Details */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              1. Crop Identity & Classification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Crop Name *</label>
                <input
                  type="text"
                  required
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  placeholder="e.g. Wheat, Basmati"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  id="create-crop-name-input"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Variety / Strain *</label>
                <input
                  type="text"
                  required
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="e.g. 1121 Extra Long"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  id="create-variety-input"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CropCategory)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none cursor-pointer"
                  id="create-category-select"
                >
                  <option value="Grains">Grains & Cereals</option>
                  <option value="Pulses">Pulses & Dal</option>
                  <option value="Vegetables">Fresh Vegetables</option>
                  <option value="Spices">Spices & Herbs</option>
                  <option value="Oilseeds">Oilseeds</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Cash Crops">Cash Crops</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Grading Standard *</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as CropGrade)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none cursor-pointer"
                  id="create-grade-select"
                >
                  <option value="Grade A+">Grade A+ (Export / Top Premium Quality)</option>
                  <option value="Grade A">Grade A (Commercial Standard Quality)</option>
                  <option value="Grade B">Grade B (Processing / Food Industry Grade)</option>
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                  <input
                    type="checkbox"
                    checked={isOrganic}
                    onChange={(e) => setIsOrganic(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                    id="create-is-organic-checkbox"
                  />
                  <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                    <Leaf className="w-3 h-3 text-emerald-600" />
                    Certified Organic (NPOP / APEDA)
                  </span>
                </label>
              </div>
            </div>

            {isOrganic && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Organic Certificate / Scope ID</label>
                <input
                  type="text"
                  value={organicCertNumber}
                  onChange={(e) => setOrganicCertNumber(e.target.value)}
                  placeholder="e.g. NPOP/NAB/0019/2026"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none"
                  id="create-organic-cert-input"
                />
              </div>
            )}
          </div>

          {/* 2. Quantity & AI Price Discovery */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                2. Quantity & Smart Price Discovery
              </h3>
              <button
                type="button"
                onClick={handleEstimatePrice}
                disabled={isEstimatingPrice}
                className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[10px] font-bold hover:bg-amber-200 transition cursor-pointer shadow-xs"
                id="ai-estimate-price-btn"
              >
                {isEstimatingPrice ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-amber-700" />}
                <span>⚡ AI Price Rec</span>
              </button>
            </div>

            {aiPriceInsight && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-2 rounded-lg text-[11px] leading-relaxed">
                {aiPriceInsight}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none"
                  id="create-quantity-input"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Unit *</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none cursor-pointer"
                  id="create-unit-select"
                >
                  <option value="quintals">Quintals</option>
                  <option value="tonnes">Tonnes</option>
                  <option value="kg">Kilograms</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Rate (₹/{unit === 'quintals' ? 'qtl' : unit}) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={pricePerUnit}
                  onChange={(e) => setPricePerUnit(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none"
                  id="create-price-input"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">MOQ ({unit}) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={quantity}
                  value={minOrderQuantity}
                  onChange={(e) => setMinOrderQuantity(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none"
                  id="create-moq-input"
                />
              </div>
            </div>
          </div>

          {/* 3. Storage, Moisture & Location */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              3. Quality & Location Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Storage *</label>
                <select
                  value={storageType}
                  onChange={(e) => setStorageType(e.target.value as StorageType)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none cursor-pointer"
                  id="create-storage-select"
                >
                  <option value="Dry Ventilated Shed">Dry Ventilated Shed</option>
                  <option value="Cold Storage">Cold Storage</option>
                  <option value="Warehouse">Warehouse</option>
                  <option value="Farm Packhouse">Farm Packhouse</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Moisture (%) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={moistureContent}
                  onChange={(e) => setMoistureContent(Number(e.target.value))}
                  placeholder="e.g. 11.5"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none"
                  id="create-moisture-input"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Harvest Date *</label>
                <input
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none cursor-pointer"
                  id="create-harvest-date-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Location / District *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bardoli, Surat"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none"
                  id="create-location-input"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Gujarat"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none"
                  id="create-state-input"
                />
              </div>
            </div>
          </div>

          {/* 4. Photo Selection */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              4. Crop Photo Selection
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {PRESET_IMAGES.map((img, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setSelectedImage(img.url)}
                  className={`rounded-lg overflow-hidden border p-1 text-left transition cursor-pointer ${
                    selectedImage === img.url ? 'border-emerald-600 ring-2 ring-emerald-300' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-12 object-cover rounded" />
                  <span className="text-[9px] font-semibold text-slate-700 block mt-0.5 truncate">{img.label}</span>
                </button>
              ))}
            </div>

            {scannedImageUrl && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-700">✅ AI Crop Scan photo attached from Smart Crop Camera</span>
              </div>
            )}

            <div className="pt-1">
              <label className="flex items-center gap-1.5 p-2 bg-slate-50 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-100 transition text-[11px] font-semibold text-slate-700">
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>Or Upload Real Photo from Device</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="custom-image-file-input" />
              </label>
            </div>
          </div>

          {/* 5. Description */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="block text-[11px] font-bold text-slate-700">Description & Packaging</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Packaging details (e.g. 50kg bags), lab tests..."
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
              id="create-description-textarea"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
              id="cancel-create-listing-btn"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1 cursor-pointer"
              id="publish-crop-listing-btn"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Publish Crop Lot</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
