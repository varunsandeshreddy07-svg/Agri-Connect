import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Mic, 
  MicOff, 
  DollarSign, 
  FileCheck2,
  PackageCheck,
  Check
} from 'lucide-react';
import { Conversation, UserRole, TradeOffer } from '../types';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string) => void;
  onSendMessage: (conversationId: string, text: string, offerDetails?: TradeOffer) => void;
  onUpdateOfferStatus: (conversationId: string, messageId: string, newStatus: 'accepted' | 'declined') => void;
  userRole: UserRole;
}

const QUICK_PROMPTS = [
  'Is moisture testing certified below 12%?',
  'Can you arrange door-to-door transport?',
  'What is the best price for 50+ quintals bulk order?',
  'Please dispatch 2kg sample batch.',
  'We accept your terms. Ready to lock contract.',
];

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  setActiveConversationId,
  onSendMessage,
  onUpdateOfferStatus,
  userRole,
}) => {
  if (!isOpen) return null;

  const [messageInput, setMessageInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerPrice, setOfferPrice] = useState<number>(3650);
  const [offerQty, setOfferQty] = useState<number>(30);
  const [offerNotes, setOfferNotes] = useState('Payment: 20% advance upon contract lock, 80% on gate weighbridge delivery.');

  const activeConv = conversations.find(c => c.id === activeConversationId) || conversations[0];

  // Voice Input for Chat with Web Speech API
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
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
        setMessageInput(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error(event.error);
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

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !activeConv) return;

    onSendMessage(activeConv.id, messageInput.trim());
    setMessageInput('');
  };

  const handleSendCustomOffer = () => {
    if (!activeConv) return;
    const newOffer: TradeOffer = {
      id: `offer-${Date.now()}`,
      cropId: activeConv.cropContext?.id || 'crop-generic',
      cropTitle: activeConv.cropContext?.title || 'Crop Lot Order',
      proposedPrice: Number(offerPrice),
      proposedQuantity: Number(offerQty),
      unit: activeConv.cropContext?.unit || 'quintals',
      totalAmount: Number(offerPrice) * Number(offerQty),
      status: 'pending',
      notes: offerNotes,
      createdAt: 'Just now',
    };

    onSendMessage(
      activeConv.id,
      `Submitted formal trade proposal: ${offerQty} ${activeConv.cropContext?.unit || 'quintals'} @ ₹${offerPrice}/unit (Total: ₹${(offerPrice * offerQty).toLocaleString()})`,
      newOffer
    );

    setShowOfferForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs" id="chat-drawer-container">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-3.5 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
              💬
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-800">Direct Farmer-Buyer Messaging</h2>
              <p className="text-[10px] text-slate-500">Live negotiation with digital escrow contracts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
            id="close-chat-drawer-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main 2-Pane or Active Chat Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Conversation Switcher Sidebar (Desktop) */}
          <div className="hidden md:block w-60 border-r border-slate-200 overflow-y-auto bg-slate-50">
            <div className="p-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Conversations
            </div>
            <div className="space-y-1 p-1.5">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`w-full text-left p-2 rounded-lg flex items-center gap-2 transition cursor-pointer ${
                    activeConv?.id === conv.id
                      ? 'bg-emerald-100/80 border border-emerald-300 text-slate-900 font-semibold'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                  id={`conv-item-${conv.id}`}
                >
                  <img
                    src={conv.otherParty.avatar}
                    alt={conv.otherParty.name}
                    className="w-7 h-7 rounded-full object-cover border border-emerald-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate">{conv.otherParty.name}</span>
                      {conv.unreadCount > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{conv.lastMessage}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Chat Conversation Area */}
          {activeConv ? (
            <div className="flex-1 flex flex-col bg-slate-50/40 overflow-hidden">
              {/* Other party snapshot bar */}
              <div className="p-2.5 bg-white border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={activeConv.otherParty.avatar}
                    alt={activeConv.otherParty.name}
                    className="w-8 h-8 rounded-full object-cover border border-emerald-500"
                  />
                  <div>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                      <span>{activeConv.otherParty.name}</span>
                      <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1 py-0.2 rounded">
                        {activeConv.otherParty.role === 'farmer' ? '✓ Grower' : '🏢 Buyer'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">{activeConv.otherParty.location}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowOfferForm(!showOfferForm)}
                    className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                    id="open-formal-offer-btn"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Send Bid</span>
                  </button>
                </div>
              </div>

              {/* Crop Context Bar if available */}
              {activeConv.cropContext && (
                <div className="bg-emerald-50 px-3 py-1.5 border-b border-emerald-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <img src={activeConv.cropContext.image} alt="crop" className="w-5 h-5 rounded object-cover" />
                    <span className="font-bold text-emerald-950 text-[11px] truncate">{activeConv.cropContext.title}</span>
                  </div>
                  <span className="font-bold text-emerald-800 text-[11px] shrink-0">
                    ₹{activeConv.cropContext.price}/{activeConv.cropContext.unit}
                  </span>
                </div>
              )}

              {/* Formal Offer Form Popup Overlay */}
              {showOfferForm && (
                <div className="p-3 bg-slate-900 text-white border-b border-slate-800 space-y-2.5 animate-in slide-in-from-top text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-amber-400 text-xs flex items-center gap-1">
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Formal Trade Contract Bid</span>
                    </h4>
                    <button onClick={() => setShowOfferForm(false)} className="text-slate-400 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">
                        Offered Rate (₹/{activeConv.cropContext?.unit || 'qtl'})
                      </label>
                      <input
                        type="number"
                        value={offerPrice}
                        onChange={(e) => setOfferPrice(Number(e.target.value))}
                        className="w-full px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-white outline-none"
                        id="chat-offer-price-input"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">
                        Quantity ({activeConv.cropContext?.unit || 'quintals'})
                      </label>
                      <input
                        type="number"
                        value={offerQty}
                        onChange={(e) => setOfferQty(Number(e.target.value))}
                        className="w-full px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-white outline-none"
                        id="chat-offer-qty-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Payment & Delivery Terms</label>
                    <input
                      type="text"
                      value={offerNotes}
                      onChange={(e) => setOfferNotes(e.target.value)}
                      className="w-full px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[11px] text-white outline-none"
                      id="chat-offer-notes-input"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-amber-300">
                      Total: ₹{(offerPrice * offerQty).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={handleSendCustomOffer}
                      className="px-3 py-1 rounded-lg bg-amber-400 text-slate-950 text-xs font-bold hover:bg-amber-300 transition cursor-pointer"
                      id="send-formal-offer-submit-btn"
                    >
                      Post Bid in Chat
                    </button>
                  </div>
                </div>
              )}

              {/* Messages Feed */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
                {activeConv.messages.map((msg) => {
                  const isMe = msg.senderId === userRole.currentUser.id || (userRole.type === 'buyer' && msg.senderRole === 'buyer') || (userRole.type === 'farmer' && msg.senderRole === 'farmer');

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      id={`chat-msg-${msg.id}`}
                    >
                      <div className="text-[10px] text-slate-400 mb-0.5 px-1 flex items-center gap-1">
                        <span className="font-semibold text-slate-600">{msg.senderName}</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      {/* Bubble */}
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed space-y-2 ${
                          isMe
                            ? 'bg-emerald-600 text-white rounded-tr-none shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                        }`}
                      >
                        <p>{msg.text}</p>

                        {/* If formal offer details attached */}
                        {msg.offerDetails && (
                          <div className={`p-2.5 rounded-xl space-y-1.5 ${isMe ? 'bg-emerald-700 text-white border border-emerald-500' : 'bg-slate-900 text-white'}`}>
                            <div className="flex items-center justify-between border-b border-white/10 pb-1">
                              <span className="font-bold text-amber-400 text-[11px] flex items-center gap-1">
                                <PackageCheck className="w-3 h-3" />
                                <span>Trade Contract Offer</span>
                              </span>
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                msg.offerDetails.status === 'accepted'
                                  ? 'bg-emerald-500 text-white'
                                  : msg.offerDetails.status === 'declined'
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-amber-400 text-slate-950'
                              }`}>
                                {msg.offerDetails.status.toUpperCase()}
                              </span>
                            </div>

                            <div className="text-[10px] space-y-0.5">
                              <div><span className="text-slate-400">Crop:</span> <span className="font-semibold">{msg.offerDetails.cropTitle}</span></div>
                              <div><span className="text-slate-400">Quantity:</span> <span className="font-semibold">{msg.offerDetails.proposedQuantity} {msg.offerDetails.unit}</span></div>
                              <div><span className="text-slate-400">Rate:</span> <span className="font-semibold">₹{msg.offerDetails.proposedPrice.toLocaleString()}</span></div>
                              <div className="text-amber-300 font-bold text-xs pt-0.5">
                                Total: ₹{msg.offerDetails.totalAmount.toLocaleString()}
                              </div>
                            </div>

                            {/* Offer Accept/Decline action buttons */}
                            {msg.offerDetails.status === 'pending' && !isMe && (
                              <div className="flex items-center gap-2 pt-1.5">
                                <button
                                  onClick={() => onUpdateOfferStatus(activeConv.id, msg.id, 'accepted')}
                                  className="flex-1 py-1 px-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                  id={`accept-offer-btn-${msg.id}`}
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Accept & Lock Deal</span>
                                </button>
                                <button
                                  onClick={() => onUpdateOfferStatus(activeConv.id, msg.id, 'declined')}
                                  className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition cursor-pointer"
                                  id={`decline-offer-btn-${msg.id}`}
                                >
                                  Decline
                                </button>
                              </div>
                            )}

                            {msg.offerDetails.status === 'accepted' && (
                              <div className="bg-emerald-950/80 p-1.5 rounded text-emerald-300 text-[10px] font-bold flex items-center justify-between border border-emerald-600/50">
                                <span>✓ Escrow Contract Activated</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Negotiation Prompt Pills */}
              <div className="px-3 py-1 bg-white border-t border-slate-200 overflow-x-auto no-scrollbar flex items-center gap-1.5">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMessageInput(prompt)}
                    className="text-[10px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 px-2 py-0.5 rounded-full whitespace-nowrap border border-slate-200 transition shrink-0 cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Message Input Bar */}
              <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`p-2 rounded-lg transition cursor-pointer ${
                    isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-500 hover:text-emerald-700 hover:bg-slate-100'
                  }`}
                  title="Voice Input (Speech-to-Text)"
                  id="chat-voice-input-btn"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type message or counter-offer..."
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  id="chat-text-input"
                />

                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg transition cursor-pointer shadow-xs"
                  id="chat-send-btn"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400 text-xs">
              Select a conversation to start direct negotiation
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
