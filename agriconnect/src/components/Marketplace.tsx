import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Mic, 
  MicOff, 
  SlidersHorizontal, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  MessageSquare, 
  CheckCircle2, 
  Sparkles, 
  Package, 
  Leaf,
  Plus
} from 'lucide-react';
import { CropListing, CropCategory, UserRole } from '../types';

export interface MarketplaceProps {
  listings: CropListing[];
  onSelectListing: (listing: CropListing) => void;
  onOpenMessage?: (listing: CropListing) => void;
  onOpenNewListing: () => void;
  onOpenAiAdvisor?: () => void;
  onOpenProduceAnalyzer?: () => void;
  userRole: UserRole;
  onQuickFilterCrop?: string | null;
}

const CATEGORIES: { label: string; value: 'All' | CropCategory; icon: string }[] = [
  { label: 'All Crops', value: 'All', icon: '🌾' },
  { label: 'Grains & Cereals', value: 'Grains', icon: '🍚' },
  { label: 'Pulses & Dal', value: 'Pulses', icon: '🫘' },
  { label: 'Fresh Vegetables', value: 'Vegetables', icon: '🍅' },
  { label: 'Spices & Haldi', value: 'Spices', icon: '🌶️' },
  { label: 'Oilseeds', value: 'Oilseeds', icon: '🌻' },
  { label: 'Fruits', value: 'Fruits', icon: '🥭' },
  { label: 'Cash Crops', value: 'Cash Crops', icon: '🌿' },
];

export const Marketplace: React.FC<MarketplaceProps> = ({
  listings,
  onSelectListing,
  onOpenMessage,
  onOpenNewListing,
  onOpenAiAdvisor,
  userRole,
  onQuickFilterCrop,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | CropCategory>('All');
  const [searchQuery, setSearchQuery] = useState(onQuickFilterCrop || '');
  const [isListening, setIsListening] = useState(false);
  const [selectedState, setSelectedState] = useState<string>('All');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [gradeFilter, setGradeFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'quantity_high' | 'rating'>('newest');
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Synchronize when onQuickFilterCrop changes
  React.useEffect(() => {
    if (onQuickFilterCrop) {
      setSearchQuery(onQuickFilterCrop);
    }
  }, [onQuickFilterCrop]);

  // Voice Search with Web Speech API
  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or modern Chromium browsers.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // Distinct states from listings
  const availableStates = useMemo(() => {
    const states = new Set<string>();
    listings.forEach(l => {
      if (l.state) states.add(l.state);
    });
    return Array.from(states);
  }, [listings]);

  // Filtered and sorted listings
  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      // Organic filter
      if (organicOnly && !item.isOrganic) {
        return false;
      }
      // Verified only
      if (verifiedOnly && item.farmer.verificationLevel === 'basic') {
        return false;
      }
      // Grade filter
      if (gradeFilter !== 'All' && item.grade !== gradeFilter) {
        return false;
      }
      // State filter
      if (selectedState !== 'All' && item.state !== selectedState) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchCrop = item.cropName.toLowerCase().includes(q);
        const matchVariety = item.variety.toLowerCase().includes(q);
        const matchFarmer = item.farmer.name.toLowerCase().includes(q);
        const matchLocation = item.location.toLowerCase().includes(q) || item.state.toLowerCase().includes(q);
        const matchTags = item.tags.some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchCrop && !matchVariety && !matchFarmer && !matchLocation && !matchTags) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_low') return a.pricePerUnit - b.pricePerUnit;
      if (sortBy === 'price_high') return b.pricePerUnit - a.pricePerUnit;
      if (sortBy === 'quantity_high') return b.quantity - a.quantity;
      if (sortBy === 'rating') return b.farmer.rating - a.farmer.rating;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [listings, selectedCategory, organicOnly, verifiedOnly, gradeFilter, selectedState, searchQuery, sortBy]);

  // Stats calculation
  const totalQuintals = useMemo(() => listings.reduce((acc, curr) => acc + curr.quantity, 0), [listings]);

  return (
    <div className="space-y-5" id="marketplace-container">
      {/* High Density Overview & Metrics Banner */}
      <div className="bg-emerald-900 text-emerald-50 rounded-2xl p-5 sm:p-6 shadow-sm border border-emerald-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-emerald-800 text-emerald-300 text-xs font-semibold border border-emerald-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Direct Farm-Gate Marketplace</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-white">
              Verified Farmer Produce & Wholesale Trading
            </h1>
            <p className="text-emerald-200 text-xs sm:text-sm leading-relaxed">
              Eliminate middlemen commission, access direct farm gate lots with authenticated land records, certified moisture data, and digital trade contracts.
            </p>
          </div>

          {/* Action Button for Farmers */}
          <div className="flex items-center gap-3 shrink-0">
            {userRole.type === 'farmer' && (
              <button
                onClick={onOpenNewListing}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 text-sm font-bold rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
                id="hero-post-crop-btn"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Listing</span>
              </button>
            )}
            {onOpenAiAdvisor && (
              <button
                onClick={onOpenAiAdvisor}
                className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg border border-emerald-700 transition flex items-center gap-1.5 cursor-pointer"
                id="hero-ai-advisor-btn"
              >
                <span>🤖 AI Agronomist</span>
              </button>
            )}
          </div>
        </div>

        {/* High Density Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-emerald-800/80">
          <div className="bg-emerald-800/50 p-2.5 sm:p-3 rounded-xl border border-emerald-700/60">
            <p className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider mb-0.5">Active Lots</p>
            <p className="text-lg sm:text-xl font-bold text-white">{listings.length} Lots</p>
          </div>
          <div className="bg-emerald-800/50 p-2.5 sm:p-3 rounded-xl border border-emerald-700/60">
            <p className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider mb-0.5">Produce Volume</p>
            <p className="text-lg sm:text-xl font-bold text-amber-300">{totalQuintals.toLocaleString()} Qtl</p>
          </div>
          <div className="bg-emerald-800/50 p-2.5 sm:p-3 rounded-xl border border-emerald-700/60">
            <p className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider mb-0.5">Avg. Price Gain</p>
            <p className="text-lg sm:text-xl font-bold text-emerald-300">+14.2% Direct</p>
          </div>
          <div className="bg-emerald-800/50 p-2.5 sm:p-3 rounded-xl border border-emerald-700/60">
            <p className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider mb-0.5">Verification</p>
            <p className="text-lg sm:text-xl font-bold text-white">100% KYC & RoR</p>
          </div>
        </div>
      </div>

      {/* Search, Filter & Categories Panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        {/* Search Bar with Voice Input */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for wheat, basmati, organic fertilizers, or bulk buyers..."
              className="w-full pl-10 pr-12 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              id="marketplace-search-input"
            />
            {/* Voice Search Button */}
            <button
              type="button"
              onClick={handleVoiceSearch}
              className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full border transition cursor-pointer ${
                isListening 
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Voice Search (Click and speak)"
              id="marketplace-voice-search-btn"
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <span>🎤</span>}
            </button>
          </div>

          {/* Controls: Sort and Filter */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              id="sort-by-select"
            >
              <option value="newest">Newest Lots</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="quantity_high">Highest Volume</option>
              <option value="rating">Top Rated Growers</option>
            </select>

            <button
              onClick={() => setShowFiltersModal(!showFiltersModal)}
              className={`px-3 py-2 rounded-lg border flex items-center gap-1.5 text-xs font-semibold transition cursor-pointer ${
                organicOnly || verifiedOnly || gradeFilter !== 'All' || selectedState !== 'All'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              id="filters-toggle-btn"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {(organicOnly || verifiedOnly || gradeFilter !== 'All' || selectedState !== 'All') && (
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
              )}
            </button>
          </div>
        </div>

        {/* Category Horizontal Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition cursor-pointer ${
                selectedCategory === cat.value
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }`}
              id={`category-pill-${cat.value.toLowerCase()}`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Expanded Filters Drawer */}
        {showFiltersModal && (
          <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 animate-in fade-in">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                State / Location
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                id="filter-state-select"
              >
                <option value="All">All States across India</option>
                {availableStates.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Quality Grade
              </label>
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                id="filter-grade-select"
              >
                <option value="All">All Grades (A+, A, B)</option>
                <option value="Grade A+">Grade A+ (Export Quality)</option>
                <option value="Grade A">Grade A (Commercial Standard)</option>
                <option value="Grade B">Grade B (Processing Grade)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-3 sm:pt-5">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={organicOnly}
                  onChange={(e) => setOrganicOnly(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                  id="filter-organic-checkbox"
                />
                <span className="flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                  Organic Only
                </span>
              </label>
            </div>

            <div className="flex items-center gap-2 pt-3 sm:pt-5">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                  id="filter-verified-checkbox"
                />
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Land Verified
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Trending Crops / Available Harvest Lots */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">Trending Crops & Harvest Lots</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {filteredListings.length} Available
            </span>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-emerald-600 hover:underline font-medium cursor-pointer"
              id="clear-search-btn"
            >
              Clear Search "{searchQuery}"
            </button>
          )}
        </div>

        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-200 space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No crop lots matched your criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms or clearing active category filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setOrganicOnly(false);
                setVerifiedOnly(false);
                setSelectedState('All');
                setGradeFilter('All');
              }}
              className="bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-emerald-700 transition cursor-pointer"
              id="reset-all-filters-btn"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="crop-listings-grid">
            {filteredListings.map((listing) => {
              const mandiDiff = listing.pricePerUnit - listing.mandiBenchmarkPrice;
              const mandiPercent = Math.round((mandiDiff / listing.mandiBenchmarkPrice) * 100);

              return (
                <div
                  key={listing.id}
                  className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between group"
                  id={`crop-card-${listing.id}`}
                >
                  <div>
                    {/* Visual Media Container */}
                    <div 
                      className="aspect-video bg-slate-100 rounded-lg mb-3 overflow-hidden relative cursor-pointer group"
                      onClick={() => onSelectListing(listing)}
                    >
                      <img
                        src={listing.images[0] || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80'}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Top Overlay Badges */}
                      <div className="absolute top-2 left-2 flex gap-1">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white">
                          {listing.grade}
                        </span>
                        {listing.isOrganic && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-0.5">
                            <Leaf className="w-2.5 h-2.5" />
                            Organic
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-1.5 right-1.5 bg-slate-900/80 text-white px-2 py-0.5 rounded text-[10px] font-semibold">
                        {listing.quantity} {listing.unit}
                      </div>
                    </div>

                    {/* Header Details */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h3 
                          onClick={() => onSelectListing(listing)}
                          className="font-bold text-sm text-slate-800 hover:text-emerald-600 transition-colors line-clamp-1 cursor-pointer"
                        >
                          {listing.title}
                        </h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {listing.location}, {listing.state} • {listing.quantity} {listing.unit}
                        </p>
                      </div>

                      <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0">
                        ✓ Verified
                      </span>
                    </div>

                    {/* Farmer snapshot */}
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 truncate">
                        <img
                          src={listing.farmer.avatar}
                          alt={listing.farmer.name}
                          className="w-4 h-4 rounded-full object-cover border border-emerald-400"
                        />
                        <span className="text-[11px] font-medium text-slate-700 truncate">{listing.farmer.name}</span>
                      </div>
                      <div className="text-[10px] font-bold text-amber-600">
                        ★ {listing.farmer.rating}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom / Price and Actions */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-emerald-700 font-bold text-sm">
                        ₹{listing.pricePerUnit.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400">/{listing.unit === 'quintals' ? 'qtl' : listing.unit}</span>
                      <span className="text-[10px] font-bold text-emerald-600 ml-1.5">
                        +{mandiPercent}% gain
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSelectListing(listing)}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                        id={`view-details-btn-${listing.id}`}
                      >
                        View Details
                      </button>
                      {onOpenMessage && (
                        <button
                          onClick={() => onOpenMessage(listing)}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition cursor-pointer"
                          title="Chat & Submit Bid"
                          id={`chat-btn-${listing.id}`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
