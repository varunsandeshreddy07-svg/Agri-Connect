import React, { useState } from 'react';
import { 
  Store, 
  PlusCircle, 
  MessageSquare, 
  Bot, 
  FileSpreadsheet, 
  ShieldCheck, 
  Mic, 
  GraduationCap, 
  ChevronDown,
  Sprout,
  Landmark
} from 'lucide-react';
import { UserRole } from '../types';

export interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  onToggleRole?: () => void;
  setUserRole?: (role: UserRole) => void;
  unreadCount?: number;
  unreadMessagesCount?: number;
  onOpenVoiceAssistant?: () => void;
  onOpenNewListing: () => void;
  onOpenVerification: () => void;
  onOpenMessages?: () => void;
  onOpenWeather?: () => void;
  onLogout?: () => void;
  newGovtUpdatesCount?: number;
  showCollegeDemo?: boolean;
  setShowCollegeDemo?: (show: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  onToggleRole,
  setUserRole,
  unreadCount = 0,
  unreadMessagesCount,
  onOpenVoiceAssistant,
  onOpenNewListing,
  onOpenVerification,
  onOpenMessages,
  onOpenWeather,
  onLogout,
  newGovtUpdatesCount = 0,
  showCollegeDemo = false,
  setShowCollegeDemo,
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const effectiveUnread = unreadMessagesCount ?? unreadCount;

  const handleRoleToggle = (targetType: 'buyer' | 'farmer') => {
    if (onToggleRole && userRole.type !== targetType) {
      onToggleRole();
    } else if (setUserRole) {
      if (targetType === 'farmer') {
        setUserRole({
          type: 'farmer',
          currentUser: {
            id: 'farmer-1',
            name: 'Rajesh Kumar',
            role: 'farmer',
            avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
            organizationOrFarm: 'Kumar Organic Agri Farms',
            location: 'Ratnagiri, MH',
            phone: '+91 98254 11209',
            verificationLevel: 'gold_certified',
          },
        });
      } else {
        setUserRole({
          type: 'buyer',
          currentUser: {
            id: 'buyer-user',
            name: 'Apex Agro Processors',
            role: 'buyer',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
            organizationOrFarm: 'Apex Foods & Agro Exports',
            location: 'Mumbai & Delhi Mandis',
            phone: '+91 98110 33412',
            verificationLevel: 'gold_certified',
          },
        });
      }
    }
    setRoleDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-emerald-900 text-emerald-50 border-b border-emerald-800 shadow-sm" id="app-header">
      {/* Top micro bar for college demo toggle & status */}
      <div className="bg-emerald-950/80 text-emerald-300 px-4 sm:px-6 py-1.5 text-xs flex justify-between items-center border-b border-emerald-900">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-emerald-950">
            HIGH DENSITY PORTAL
          </span>
          <span className="text-[11px] text-emerald-300 hidden sm:inline">
            Direct Farmer-to-Buyer Agricultural Trade & Precision Agronomy
          </span>
        </div>
        {setShowCollegeDemo && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCollegeDemo(!showCollegeDemo)}
              className="flex items-center gap-1.5 bg-emerald-800/80 hover:bg-emerald-800 text-amber-300 px-2.5 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer border border-emerald-700/60"
              id="college-demo-guide-toggle"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{showCollegeDemo ? 'Hide Guide' : 'Project Viva Guide'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-15">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('marketplace')} 
              className="flex items-center gap-2.5 text-left group cursor-pointer"
              id="brand-logo-btn"
            >
              <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center text-emerald-900 font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
                A
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">AgriConnect</span>
                <span className="bg-emerald-800 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded font-bold border border-emerald-700">
                  Verified ✓
                </span>
              </div>
            </button>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'marketplace'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-200 hover:bg-emerald-800/70 hover:text-white'
              }`}
              id="nav-marketplace-btn"
            >
              <span className="text-sm">🌾</span>
              <span>Crop Listings</span>
            </button>

            {userRole.type === 'farmer' && (
              <button
                onClick={() => setActiveTab('my-farm')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'my-farm'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-emerald-200 hover:bg-emerald-800/70 hover:text-white'
                }`}
                id="nav-farmer-portal-btn"
              >
                <span className="text-sm">👨‍🌾</span>
                <span>My Farm Produce</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('plan-generator')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'plan-generator'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-200 hover:bg-emerald-800/70 hover:text-white'
              }`}
              id="nav-plan-generator-btn"
            >
              <span className="text-sm">📈</span>
              <span>Trading Plan</span>
            </button>

            <button
              onClick={() => {
                if (onOpenVoiceAssistant) onOpenVoiceAssistant();
                else setActiveTab('ai-assistant');
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'ai-assistant'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-200 hover:bg-emerald-800/70 hover:text-white'
              }`}
              id="nav-ai-advisor-btn"
            >
              <span className="text-sm">🤖</span>
              <span>AI Assistant</span>
            </button>

            <button
              onClick={() => setActiveTab('govt-updates')}
              className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'govt-updates'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-200 hover:bg-emerald-800/70 hover:text-white'
              }`}
              id="nav-govt-updates-btn"
            >
              <Landmark className="w-3.5 h-3.5 text-blue-300" />
              <span>Govt Updates</span>
              {newGovtUpdatesCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none animate-pulse">
                  {newGovtUpdatesCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenVerification}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-200 hover:bg-emerald-800/70 hover:text-white transition-colors cursor-pointer"
              id="nav-verification-btn"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Verification</span>
            </button>

            <button
              onClick={onOpenWeather}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-200 hover:bg-emerald-800/70 hover:text-white transition-colors cursor-pointer"
              id="nav-weather-btn"
            >
              <span className="text-sm">🌤️</span>
              <span>Weather</span>
            </button>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Voice Assistant Trigger */}
            <button
              onClick={() => {
                if (onOpenVoiceAssistant) onOpenVoiceAssistant();
                else setActiveTab('ai-assistant');
              }}
              className="w-8 h-8 flex items-center justify-center bg-emerald-800/80 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/60 rounded-full transition cursor-pointer"
              title="Voice Search & Assistant"
              id="header-voice-assistant-btn"
            >
              <Mic className="w-4 h-4 text-amber-300" />
            </button>

            {/* Direct Messages Toggle */}
            <button
              onClick={() => {
                if (onOpenMessages) onOpenMessages();
                else setActiveTab('messages');
              }}
              className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-emerald-100 hover:bg-emerald-800 transition cursor-pointer text-xs font-semibold"
              title="Messages & Contract Bids"
              id="header-messages-btn"
            >
              <span className="text-sm">💬</span>
              <span className="hidden sm:inline">Messages</span>
              {effectiveUnread > 0 && (
                <span className="bg-amber-500 text-emerald-950 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {effectiveUnread}
                </span>
              )}
            </button>

            {/* Create Listing Button */}
            <button
              onClick={onOpenNewListing}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              id="header-post-listing-btn"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Create Listing</span>
            </button>

            {/* Persona Switcher Badge */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2.5 bg-emerald-800/60 hover:bg-emerald-800 p-1.5 sm:px-2.5 sm:py-1 rounded-xl border border-emerald-700/80 transition cursor-pointer text-left"
                id="role-switcher-btn"
              >
                <div className="w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center text-sm">
                  {userRole.type === 'farmer' ? '👨‍🌾' : '🏢'}
                </div>
                <div className="hidden lg:block text-xs">
                  <p className="font-semibold text-white leading-none">{userRole.currentUser.name}</p>
                  <p className="text-[10px] text-emerald-300 mt-0.5">
                    {userRole.type === 'farmer' ? 'Farmer • Verified ✓' : 'Buyer • Verified ✓'}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Switch Persona</p>
                    <p className="text-xs text-slate-600">Simulate both roles in the marketplace</p>
                  </div>

                  <button
                    onClick={() => handleRoleToggle('farmer')}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-slate-50 transition cursor-pointer ${
                      userRole.type === 'farmer' ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-slate-700'
                    }`}
                    id="switch-to-farmer-role-btn"
                  >
                    <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-sm">
                      👨‍🌾
                    </div>
                    <div>
                      <div className="text-xs font-bold">Rajesh Kumar (Farmer)</div>
                      <div className="text-[10px] text-slate-500">Post harvest lots, view AI trading plans</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleToggle('buyer')}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-slate-50 transition cursor-pointer ${
                      userRole.type === 'buyer' ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-slate-700'
                    }`}
                    id="switch-to-buyer-role-btn"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-sm">
                      🏢
                    </div>
                    <div>
                      <div className="text-xs font-bold">Apex Agro (Bulk Buyer)</div>
                      <div className="text-[10px] text-slate-500">Browse verified crops, negotiate contracts</div>
                    </div>
                  </button>

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={() => { setRoleDropdownOpen(false); onLogout?.(); }}
                      className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                      id="logout-btn"
                    >
                      <span className="text-sm">🚪</span>
                      <div>
                        <div className="text-xs font-bold">Logout</div>
                        <div className="text-[10px] text-rose-400">Sign out of your account</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-emerald-800 bg-emerald-950 px-2 py-1.5 text-xs text-emerald-200">
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg cursor-pointer ${
            activeTab === 'marketplace' ? 'text-amber-400 font-bold' : 'text-emerald-200'
          }`}
          id="mobile-nav-market-btn"
        >
          <Store className="w-4 h-4" />
          <span className="text-[10px]">Crops</span>
        </button>

        {userRole.type === 'farmer' && (
          <button
            onClick={() => setActiveTab('my-farm')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg cursor-pointer ${
              activeTab === 'my-farm' ? 'text-amber-400 font-bold' : 'text-emerald-200'
            }`}
            id="mobile-nav-farm-btn"
          >
            <Sprout className="w-4 h-4" />
            <span className="text-[10px]">My Farm</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('plan-generator')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg cursor-pointer ${
            activeTab === 'plan-generator' ? 'text-amber-400 font-bold' : 'text-emerald-200'
          }`}
          id="mobile-nav-plan-btn"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span className="text-[10px]">Trading Plan</span>
        </button>

        <button
          onClick={() => setActiveTab('govt-updates')}
          className={`relative flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg cursor-pointer ${
            activeTab === 'govt-updates' ? 'text-amber-400 font-bold' : 'text-emerald-200'
          }`}
          id="mobile-nav-govt-btn"
        >
          <Landmark className="w-4 h-4" />
          <span className="text-[10px]">Govt</span>
          {newGovtUpdatesCount > 0 && (
            <span className="absolute -top-0.5 right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
              {newGovtUpdatesCount > 9 ? '9+' : newGovtUpdatesCount}
            </span>
          )}
        </button>

        <button
          onClick={onOpenWeather}
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg cursor-pointer text-emerald-200"
          id="mobile-nav-weather-btn"
        >
          <span className="text-sm">🌤️</span>
          <span className="text-[10px]">Weather</span>
        </button>

        <button
          onClick={() => {
            if (onOpenVoiceAssistant) onOpenVoiceAssistant();
            else setActiveTab('ai-assistant');
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg cursor-pointer ${
            activeTab === 'ai-assistant' ? 'text-amber-400 font-bold' : 'text-emerald-200'
          }`}
          id="mobile-nav-ai-btn"
        >
          <Bot className="w-4 h-4 text-amber-300" />
          <span className="text-[10px]">AI Assistant</span>
        </button>

        <button
          onClick={() => {
            if (onOpenMessages) onOpenMessages();
            else setActiveTab('messages');
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg relative cursor-pointer ${
            activeTab === 'messages' ? 'text-amber-400 font-bold' : 'text-emerald-200'
          }`}
          id="mobile-nav-chat-btn"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-[10px]">Messages</span>
          {effectiveUnread > 0 && (
            <span className="absolute top-0 right-2 w-2 h-2 bg-amber-400 rounded-full" />
          )}
        </button>
      </div>
    </header>
  );
};
