import React, { useState, useEffect, useCallback } from 'react';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { useAuth } from './context/AuthContext';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LoginScreen } from './components/LoginScreen';
import { Navbar } from './components/Navbar';
import { PriceTicker } from './components/PriceTicker';
import { Marketplace } from './components/Marketplace';
import { TradingPlanGenerator } from './components/TradingPlanGenerator';
import { FarmerDashboard } from './components/FarmerDashboard';
import { ListingDetailModal } from './components/ListingDetailModal';
import { CreateListingModal } from './components/CreateListingModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { FarmerVerificationModal } from './components/FarmerVerificationModal';
import { ChatDrawer } from './components/ChatDrawer';
import { CollegeDemoGuide } from './components/CollegeDemoGuide';
import { ProduceAnalyzerModal } from './components/ProduceAnalyzerModal';
import { CropAnalyzerModal, CropScanRecord } from './components/CropAnalyzerModal';
import { WeatherAlertPanel } from './components/WeatherAlertPanel';
import { LeafDiseaseDetector } from './components/LeafDiseaseDetector';
import { GovernmentUpdates, getNewUpdatesCount, markGovtUpdatesSeen, notifyNewHighPriorityUpdates, requestNotificationPermission } from './components/GovernmentUpdates';
import { listingsApi, messagesApi, marketApi } from './api/client';
import { CropListing, Conversation, UserRole, ChatMessage } from './types';
import { Sparkles, Bot, ArrowUp } from 'lucide-react';

function AppContent() {
  const { t } = useLanguage();
  const { user, isLoggedIn, loading: authLoading, logout } = useAuth();

  // Build UserRole from auth user
  const userRole: UserRole = user ? {
    type: user.role as 'farmer' | 'buyer',
    currentUser: {
      id: user.id,
      name: user.name,
      role: user.role as 'farmer' | 'buyer',
      avatar: user.avatar,
      organizationOrFarm: user.organizationOrFarm,
      location: user.location,
      phone: user.phone,
      verificationLevel: user.verificationLevel as any,
    },
  } : {
    type: 'farmer',
    currentUser: {
      id: '', name: '', role: 'farmer', avatar: '',
      organizationOrFarm: '', location: '', phone: '', verificationLevel: 'basic',
    },
  };

  const [showWelcome, setShowWelcome] = useState(() => {
    return isLoggedIn && !localStorage.getItem('agriconnected-entered');
  });

  const [activeTab, setActiveTab] = useState<'marketplace' | 'plan-generator' | 'my-farm' | 'ai-assistant' | 'govt-updates'>('marketplace');

  // Data states
  const [listings, setListings] = useState<CropListing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Modals
  const [selectedListing, setSelectedListing] = useState<CropListing | null>(null);
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false);
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isProduceAnalyzerOpen, setIsProduceAnalyzerOpen] = useState(false);
  const [isCropAnalyzerOpen, setIsCropAnalyzerOpen] = useState(false);
  const [cropScanHistory, setCropScanHistory] = useState<CropScanRecord[]>([]);
  const [scannedImageUrl, setScannedImageUrl] = useState<string | null>(null);
  const [isWeatherOpen, setIsWeatherOpen] = useState(false);
  const [isLeafDiseaseOpen, setIsLeafDiseaseOpen] = useState(false);
  const [showCollegeGuide, setShowCollegeGuide] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [newGovtCount, setNewGovtCount] = useState(() => getNewUpdatesCount());

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fire browser notifications for new high-priority govt updates on load
  useEffect(() => {
    if (isLoggedIn) {
      // Request permission if not yet decided, then notify
      requestNotificationPermission().then((granted) => {
        if (granted) {
          // Small delay so the app renders first
          setTimeout(() => notifyNewHighPriorityUpdates(), 3000);
        }
      });
    }
  }, [isLoggedIn]);

  // Fetch listings from API
  const fetchListings = useCallback(async () => {
    try {
      setListingsLoading(true);
      const data: any = await listingsApi.list({});
      // Transform API response to match CropListing type
      const transformed = (data.listings || []).map((l: any) => ({
        ...l,
        farmerId: l.farmerId,
        farmer: {
          id: l.farmer?.id || l.farmerId,
          name: l.farmer?.name || 'Unknown',
          phone: l.farmer?.phone || '',
          village: l.location?.split(',')[0] || '',
          district: l.location?.split(',')[1] || '',
          state: l.state || '',
          avatar: l.farmer?.avatar || '',
          rating: 4.8,
          totalReviews: 0,
          verificationLevel: l.farmer?.verificationLevel || 'basic',
          verifiedDocs: {},
          memberSince: '2023',
          totalSoldQuintals: 0,
        },
        images: Array.isArray(l.images) ? l.images : [],
        tags: Array.isArray(l.tags) ? l.tags : [],
        minOrderQuantity: l.minOrderQuantity || 1,
        harvestDate: l.harvestDate || '',
        storageType: l.storageType || 'Dry Ventilated Shed',
        createdAt: l.createdAt || new Date().toISOString(),
      }));
      setListings(transformed);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setListingsLoading(false);
    }
  }, []);

  // Fetch conversations from API
  const fetchConversations = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const data: any = await messagesApi.getConversations();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchConversations();
    }
  }, [isLoggedIn, fetchConversations]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogin = (_data: any) => {
    // Auth is handled by AuthContext now
    setShowWelcome(true);
  };

  const handleLogout = () => {
    logout();
    setShowWelcome(false);
    setConversations([]);
  };

  const handleEnterApp = () => {
    localStorage.setItem('agriconnected-entered', 'true');
    setShowWelcome(false);
  };

  const handleToggleRole = () => {
    showToast(t('toast.switchBuyer'));
  };

  const handleAddListing = (newListing: any) => {
    setListings(prev => [newListing, ...prev]);
    showToast(t('toast.listingPublished').replace('{title}', newListing.title));
    setActiveTab('marketplace');
    setScannedImageUrl(null);
  };

  const handleCropScanComplete = (record: CropScanRecord) => {
    const updated = [record, ...cropScanHistory].slice(0, 20);
    setCropScanHistory(updated);
    showToast(`Crop scan saved: ${record.result.cropName} (Score: ${record.result.overallScore}/100)`);
  };

  const handleAttachScanToListing = (imageUrl: string) => {
    setIsCropAnalyzerOpen(false);
    setScannedImageUrl(imageUrl);
    setIsCreateListingOpen(true);
    showToast('Photo attached! Complete your listing details below.');
  };

  const handleOpenMessageForListing = async (listing: CropListing, initialOffer?: { quantity: number; price: number }) => {
    setSelectedListing(null);
    try {
      const farmerId = listing.farmer?.id || listing.farmerId;
      const data: any = await messagesApi.startConversation(farmerId);
      const convId = data.conversationId;

      // Check if conversation already in state
      let existing = conversations.find(c => c.id === convId);
      if (!existing) {
        existing = {
          id: convId,
          otherParty: {
            id: farmerId,
            name: listing.farmer?.name || 'Farmer',
            role: 'farmer',
            avatar: listing.farmer?.avatar || '',
            verificationLevel: listing.farmer?.verificationLevel || 'basic',
            phone: listing.farmer?.phone || '',
            location: `${listing.location}`,
          },
          lastMessage: 'Started inquiry for this lot.',
          lastMessageTime: 'Just now',
          unreadCount: 0,
          messages: [],
        };
        setConversations(prev => [existing!, ...prev]);
      }
      setActiveConversationId(convId);

      if (initialOffer) {
        await messagesApi.send(
          convId,
          `Hello ${listing.farmer?.name}, I am submitting a trade bid of ${initialOffer.quantity} ${listing.unit} at ₹${initialOffer.price}/${listing.unit === 'quintals' ? 'qtl' : listing.unit}.`,
          { cropId: listing.id, cropTitle: listing.title, proposedPrice: initialOffer.price, proposedQuantity: initialOffer.quantity, unit: listing.unit, totalAmount: initialOffer.price * initialOffer.quantity, status: 'pending', notes: '' }
        );
      }
      setIsChatOpen(true);
    } catch (err) {
      console.error('Failed to start conversation:', err);
      showToast('Failed to start conversation. Please try again.');
    }
  };

  const handleSendMessage = async (conversationId: string, text: string, offerDetails?: any) => {
    try {
      const data: any = await messagesApi.send(conversationId, text, offerDetails);
      const newMsg = data.message;

      setConversations(prev => prev.map(c =>
        c.id === conversationId
          ? { ...c, lastMessage: text, lastMessageTime: 'Just now', messages: [...c.messages, newMsg] }
          : c
      ));
    } catch (err) {
      console.error('Failed to send message:', err);
      showToast('Failed to send message.');
    }
  };

  const handleUpdateOfferStatus = async (conversationId: string, messageId: string, newStatus: 'accepted' | 'declined') => {
    try {
      await messagesApi.updateOfferStatus(conversationId, messageId, newStatus);
      setConversations(prev => prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, messages: conv.messages.map(m =>
              m.id === messageId && m.offerDetails
                ? { ...m, offerDetails: { ...m.offerDetails, status: newStatus } }
                : m
            )}
          : conv
      ));
      showToast(newStatus === 'accepted' ? t('toast.tradeAccepted') : t('toast.tradeDeclined'));
    } catch (err) {
      showToast('Failed to update offer status.');
    }
  };

  const handleUpgradeVerification = async () => {
    showToast(t('toast.upgradeGold'));
    // Refresh user data
    window.location.reload();
  };

  const handleTriggerDemoAction = (action: string) => {
    switch (action) {
      case 'test-ai-pest': setIsAiAdvisorOpen(true); break;
      case 'test-plan': setActiveTab('plan-generator'); break;
      case 'test-chat-negotiate': setIsChatOpen(true); break;
      case 'test-verification': setIsVerificationOpen(true); break;
      case 'test-leaf-disease': setIsLeafDiseaseOpen(true); break;
      case 'switch-role': handleToggleRole(); break;
    }
  };

  const totalUnreadMessages = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  // Auth gate
  if (authLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-400/30 animate-pulse">
            <span className="text-3xl">🌾</span>
          </div>
          <p className="text-white text-sm font-bold">Loading AgriConnect...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (showWelcome) {
    return <WelcomeScreen onEnter={handleEnterApp} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-emerald-50/30 text-slate-800 flex flex-col font-sans selection:bg-emerald-200">
      {toastMessage && (
        <div className="fixed top-2 left-3 right-3 sm:left-auto sm:right-4 sm:top-4 sm:w-auto z-50 bg-slate-900 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 text-[11px] sm:text-xs font-bold animate-slide-in-bottom animate-glow-pulse">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
          <span className="line-clamp-2">{toastMessage}</span>
        </div>
      )}

      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'ai-assistant') setIsAiAdvisorOpen(true);
          else setActiveTab(tab as any);
          if (tab === 'govt-updates') {
            markGovtUpdatesSeen();
            setNewGovtCount(0);
          }
        }}
        userRole={userRole}
        onToggleRole={handleToggleRole}
        onOpenNewListing={() => setIsCreateListingOpen(true)}
        onOpenVerification={() => setIsVerificationOpen(true)}
        onOpenMessages={() => setIsChatOpen(true)}
        onOpenWeather={() => setIsWeatherOpen(true)}
        onLogout={handleLogout}
        unreadMessagesCount={totalUnreadMessages}
        newGovtUpdatesCount={newGovtCount}
      />

      <PriceTicker />

      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 pb-20 md:pb-4 space-y-4">
        {showCollegeGuide && (
          <CollegeDemoGuide onTriggerDemoAction={handleTriggerDemoAction} onClose={() => setShowCollegeGuide(false)} />
        )}

        {activeTab === 'marketplace' && (
          <div className="animate-fade-in-up">
            <Marketplace
              listings={listings}
              onSelectListing={(listing) => setSelectedListing(listing)}
              onOpenNewListing={() => setIsCreateListingOpen(true)}
              onOpenAiAdvisor={() => setIsAiAdvisorOpen(true)}
              onOpenProduceAnalyzer={() => setIsProduceAnalyzerOpen(true)}
              userRole={userRole}
            />
          </div>
        )}

        {activeTab === 'plan-generator' && (
          <div className="animate-fade-in-up"><TradingPlanGenerator /></div>
        )}

        {activeTab === 'govt-updates' && (
          <div className="animate-fade-in-up"><GovernmentUpdates /></div>
        )}

        {activeTab === 'my-farm' && (
          <div className="animate-fade-in-up">
            <FarmerDashboard
              listings={listings}
              userRole={userRole}
              onOpenNewListing={() => setIsCreateListingOpen(true)}
              onOpenVerification={() => setIsVerificationOpen(true)}
              onOpenAiAdvisor={() => setIsAiAdvisorOpen(true)}
              onOpenProduceAnalyzer={() => setIsCropAnalyzerOpen(true)}
              onOpenLeafDiseaseDetector={() => setIsLeafDiseaseOpen(true)}
              onSelectListing={(listing) => setSelectedListing(listing)}
              onOpenMessages={() => setIsChatOpen(true)}
              onOpenWeather={() => setIsWeatherOpen(true)}
            />
          </div>
        )}
      </main>

      <div className="fixed bottom-20 md:bottom-5 right-3 sm:right-5 z-40 flex flex-col gap-3 items-end">
        {showScrollTop && (
          <button onClick={scrollToTop} className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white text-slate-600 shadow-lg flex items-center justify-center transition-all transform hover:scale-110 cursor-pointer border border-slate-200 animate-fade-in-up" title="Scroll to top">
            <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
        <button onClick={() => setIsAiAdvisorOpen(true)} className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white shadow-xl shadow-emerald-500/30 flex items-center justify-center transition-all transform hover:scale-110 cursor-pointer animate-glow-pulse" title="Open AI Farming Assistant" id="floating-ai-assistant-btn">
          <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 mt-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 via-transparent to-amber-900/20 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">🌾</div>
            <div className="min-w-0">
              <span className="font-bold text-white text-sm">{t('footer.brand')}</span>
              <span className="text-[11px] text-slate-500 ml-2 hidden sm:inline">{t('footer.subtitle')}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span className="hidden sm:inline">{t('footer.empowering')}</span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <button onClick={() => setShowCollegeGuide(true)} className="text-amber-400 hover:text-amber-300 hover:underline font-semibold cursor-pointer transition">{t('footer.evalGuide')}</button>
          </div>
        </div>
      </footer>

      <ListingDetailModal listing={selectedListing} onClose={() => setSelectedListing(null)} onOpenMessage={handleOpenMessageForListing} />
      <CreateListingModal isOpen={isCreateListingOpen} onClose={() => { setIsCreateListingOpen(false); setScannedImageUrl(null); }} onAddListing={handleAddListing} userRole={userRole} scannedImageUrl={scannedImageUrl} />
      <AiAssistantModal isOpen={isAiAdvisorOpen} onClose={() => setIsAiAdvisorOpen(false)} />
      <FarmerVerificationModal isOpen={isVerificationOpen} onClose={() => setIsVerificationOpen(false)} userRole={userRole} onUpgradeVerification={handleUpgradeVerification} />
      <ProduceAnalyzerModal isOpen={isProduceAnalyzerOpen} onClose={() => setIsProduceAnalyzerOpen(false)} />
      <LeafDiseaseDetector isOpen={isLeafDiseaseOpen} onClose={() => setIsLeafDiseaseOpen(false)} />
      <CropAnalyzerModal
        isOpen={isCropAnalyzerOpen}
        onClose={() => setIsCropAnalyzerOpen(false)}
        onScanComplete={handleCropScanComplete}
        onAttachToListing={handleAttachScanToListing}
        scanHistory={cropScanHistory}
      />
      <WeatherAlertPanel isOpen={isWeatherOpen} onClose={() => setIsWeatherOpen(false)} userLocation={userRole.currentUser.location} />
      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} conversations={conversations} activeConversationId={activeConversationId} setActiveConversationId={(id) => setActiveConversationId(id)} onSendMessage={handleSendMessage} onUpdateOfferStatus={handleUpdateOfferStatus} userRole={userRole} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
