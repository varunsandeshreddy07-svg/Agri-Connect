import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  MessageSquare, 
  Phone, 
  Package, 
  Leaf, 
  Droplet, 
  Warehouse, 
  Award, 
  Send,
  FileCheck
} from 'lucide-react';
import { CropListing } from '../types';

interface ListingDetailModalProps {
  listing: CropListing | null;
  onClose: () => void;
  onOpenMessage: (listing: CropListing, initialOffer?: { quantity: number; price: number }) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  onClose,
  onOpenMessage,
}) => {
  if (!listing) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [orderQuantity, setOrderQuantity] = useState<number>(listing.minOrderQuantity || 10);
  const [customOfferPrice, setCustomOfferPrice] = useState<number>(listing.pricePerUnit);
  const [sampleRequested, setSampleRequested] = useState(false);

  const totalDirectCost = orderQuantity * customOfferPrice;

  const handleRequestSample = () => {
    setSampleRequested(true);
  };

  const handleSendOfferFromCalculator = () => {
    onOpenMessage(listing, {
      quantity: orderQuantity,
      price: customOfferPrice,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto" id="listing-detail-modal">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[88vh] overflow-y-auto shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              {listing.category}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">• Lot ID: #{listing.id.toUpperCase()}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            id="close-listing-modal-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 text-xs">
          {/* Top Section: Photo Gallery & Core Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gallery */}
            <div className="space-y-2">
              <div className="relative h-56 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={listing.images[activeImageIndex] || listing.images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                {listing.isOrganic && (
                  <div className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-xs">
                    <Leaf className="w-3 h-3" />
                    Organic Certified
                  </div>
                )}
                <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {listing.grade}
                </div>
                {listing.images[0]?.startsWith('data:') && (
                  <div className="absolute bottom-2.5 left-2.5 bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-xs">
                    📷 AI Crop Scan
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {listing.images.length > 1 && (
                <div className="flex gap-1.5">
                  {listing.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-12 h-12 rounded-lg overflow-hidden border transition cursor-pointer ${
                        activeImageIndex === idx ? 'border-emerald-600 ring-2 ring-emerald-300' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Farmer Trust Snapshot */}
            <div className="space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <h1 className="text-lg font-bold text-slate-800 leading-snug">
                  {listing.title}
                </h1>

                {/* Farmer Card Snapshot */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={listing.farmer.avatar}
                      alt={listing.farmer.name}
                      className="w-9 h-9 rounded-full object-cover border border-emerald-500"
                    />
                    <div>
                      <div className="flex items-center gap-1 font-bold text-slate-800 text-xs">
                        <span>{listing.farmer.name}</span>
                        <span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-1 py-0.2 rounded">
                          ✓ Verified
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-0.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{listing.farmer.village}, {listing.farmer.district}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-amber-600">★ {listing.farmer.rating}</div>
                    <div className="text-[10px] text-slate-400">{listing.farmer.totalSoldQuintals} Qtl Sold</div>
                  </div>
                </div>

                {/* Direct Price vs Mandi Index */}
                <div className="bg-emerald-50/80 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-800">
                      Direct Farm-Gate Rate
                    </div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-bold text-emerald-950">
                        ₹{listing.pricePerUnit.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-emerald-800 font-semibold">
                        /{listing.unit === 'quintals' ? 'Quintal' : listing.unit}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] text-slate-400 line-through">
                      Mandi: ₹{listing.mandiBenchmarkPrice.toLocaleString()}
                    </div>
                    <div className="text-[11px] font-bold text-emerald-700 flex items-center justify-end gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>Direct Grower Deal</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick details pills */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Total Stock</span>
                  <span className="font-bold text-slate-800 text-xs">{listing.quantity} {listing.unit}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Minimum Order (MOQ)</span>
                  <span className="font-bold text-slate-800 text-xs">{listing.minOrderQuantity} {listing.unit}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quality Specifications */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Lab & Quality Specifications</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="flex items-center gap-1 text-slate-500 text-[11px] mb-0.5">
                  <Droplet className="w-3 h-3 text-blue-500" />
                  <span>Moisture Level</span>
                </div>
                <div className="font-bold text-slate-800 text-xs">{listing.moistureContent}% (Optimal)</div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="flex items-center gap-1 text-slate-500 text-[11px] mb-0.5">
                  <Warehouse className="w-3 h-3 text-amber-600" />
                  <span>Storage</span>
                </div>
                <div className="font-bold text-slate-800 text-xs truncate">{listing.storageType}</div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="flex items-center gap-1 text-slate-500 text-[11px] mb-0.5">
                  <Calendar className="w-3 h-3 text-purple-500" />
                  <span>Harvest Date</span>
                </div>
                <div className="font-bold text-slate-800 text-xs">{listing.harvestDate}</div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="flex items-center gap-1 text-slate-500 text-[11px] mb-0.5">
                  <Award className="w-3 h-3 text-emerald-600" />
                  <span>Grade</span>
                </div>
                <div className="font-bold text-slate-800 text-xs">{listing.grade}</div>
              </div>
            </div>

            {/* Organic Certificate Notice if Organic */}
            {listing.isOrganic && listing.organicCertNumber && (
              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="text-[11px] text-emerald-950 font-semibold">
                    APEDA Organic Certificate: <span className="font-mono">{listing.organicCertNumber}</span>
                  </span>
                </div>
                <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white font-bold text-[9px]">
                  Verified
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Lot Description</h3>
            <p className="text-slate-600 text-xs leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              {listing.description}
            </p>
          </div>

          {/* Interactive Procurement & Price Negotiation Calculator */}
          <div className="bg-slate-900 text-white p-3.5 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-amber-400" />
                <span>Procurement & Negotiation Calculator</span>
              </h3>
              <span className="text-[10px] px-1.5 py-0.5 bg-amber-400/20 text-amber-300 rounded font-semibold border border-amber-400/30">
                Direct Deal Mode
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">
                  Quantity ({listing.unit})
                </label>
                <input
                  type="number"
                  min={listing.minOrderQuantity}
                  max={listing.quantity}
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(Number(e.target.value))}
                  className="w-full px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-white outline-none"
                  id="calc-order-quantity-input"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">
                  Proposed Price (₹/{listing.unit === 'quintals' ? 'qtl' : listing.unit})
                </label>
                <input
                  type="number"
                  value={customOfferPrice}
                  onChange={(e) => setCustomOfferPrice(Number(e.target.value))}
                  className="w-full px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-white outline-none"
                  id="calc-offer-price-input"
                />
              </div>

              <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700 flex flex-col justify-between">
                <span className="text-[9px] uppercase font-bold text-slate-400">Total Lot Value</span>
                <span className="text-base font-bold text-amber-400">₹{totalDirectCost.toLocaleString()}</span>
                <span className="text-[9px] text-emerald-400 font-semibold">Zero Middleman Cut</span>
              </div>
            </div>

            {/* Action buttons inside calculator */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={handleSendOfferFromCalculator}
                className="flex-1 py-2 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                id="submit-bid-offer-btn"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Trade Bid ({orderQuantity} {listing.unit} @ ₹{customOfferPrice})</span>
              </button>

              <button
                onClick={handleRequestSample}
                disabled={sampleRequested}
                className={`py-2 px-3 rounded-lg font-semibold text-xs border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  sampleRequested
                    ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200'
                }`}
                id="request-sample-batch-btn"
              >
                <Package className="w-3.5 h-3.5 text-emerald-400" />
                <span>{sampleRequested ? '✓ Sample Booked!' : 'Request 2kg Sample'}</span>
              </button>
            </div>
          </div>

          {/* Farmer Contact & Direct Phone */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Direct Farmer Hotline</div>
                <div className="text-[11px] text-slate-500">{listing.farmer.phone} (Verified Mobile)</div>
              </div>
            </div>

            <button
              onClick={() => onOpenMessage(listing)}
              className="w-full sm:w-auto px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              id="detail-direct-chat-btn"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Direct Chat with {listing.farmer.name}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
