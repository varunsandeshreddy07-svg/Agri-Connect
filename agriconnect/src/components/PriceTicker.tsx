import React from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { MarketPriceTickerItem } from '../types';
import { MOCK_TICKER } from '../data/mockData';

interface PriceTickerProps {
  items?: MarketPriceTickerItem[];
  onSelectCrop?: (cropName: string) => void;
}

export const PriceTicker: React.FC<PriceTickerProps> = ({ items = MOCK_TICKER, onSelectCrop }) => {
  const displayItems = items && items.length > 0 ? items : MOCK_TICKER;

  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs py-2 px-4 sm:px-6 overflow-x-auto no-scrollbar" id="mandi-price-ticker">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Label */}
        <div className="flex items-center gap-2 shrink-0 font-bold text-amber-400 text-[11px] uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Mandi vs Direct Farm Index</span>
        </div>

        {/* Scrolling Ticker Items */}
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-0.5">
          {displayItems.map((item) => {
            const gain = Math.round(((item.directPrice - item.mandiPrice) / item.mandiPrice) * 100);
            return (
              <button
                key={item.id}
                onClick={() => onSelectCrop && onSelectCrop(item.crop)}
                className="flex items-center gap-2 shrink-0 bg-slate-800/90 hover:bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 transition cursor-pointer text-left"
                id={`ticker-item-${item.id}`}
              >
                <span className="font-bold text-white text-xs">{item.crop}</span>
                <span className="text-slate-400 text-[11px]">Mandi: ₹{item.mandiPrice.toLocaleString()}</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className="font-bold text-emerald-400 text-xs">Direct: ₹{item.directPrice.toLocaleString()}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  +{gain}% Gain
                </span>
                {item.trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                {item.trend === 'down' && <TrendingDown className="w-3 h-3 text-rose-400" />}
                {item.trend === 'stable' && <Minus className="w-3 h-3 text-slate-400" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
