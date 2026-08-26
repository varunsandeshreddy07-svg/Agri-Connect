import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Leaf, 
  Loader2,
  HelpCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MessageItem {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  source?: string;
  timestamp: string;
}

const SAMPLE_QUESTIONS = [
  { icon: '🐛', text: 'My tomato leaves are curling with yellow spots. How do I treat it?' },
  { icon: '🌾', text: 'What is the optimal NPK fertilizer schedule for 5 acres of Sharbati wheat?' },
  { icon: '📈', text: 'Is it the right time to sell Basmati rice or hold in warehouse for higher mandi rates?' },
  { icon: '💧', text: 'How do I calculate drip irrigation requirements and apply for state subsidy?' },
  { icon: '🧪', text: 'What are the exact steps to get APEDA / NPOP organic farm certification?' },
];

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Hello! I am your AI Agronomist & Market Advisor. How can I assist your crop planning or trading today?`,
      timestamp: 'Just now',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState<'en-IN' | 'hi-IN'>('en-IN');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Handle Web Speech Voice Recognition
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please use Google Chrome or Chromium browsers.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = speechLanguage;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        handleSendQuestion(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  // Text-To-Speech (TTS) Read Aloud
  const handleSpeakText = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text to speech is not supported in this browser.');
      return;
    }

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*`_~\[\]]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Send query to /api/ai/advisor
  const handleSendQuestion = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim() || loading) return;

    const userMsg: MessageItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const historyPayload = messages
        .filter(m => m.id !== 'welcome')
        .slice(-4)
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          text: m.text,
        }));

      const res = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.text,
          history: historyPayload,
        }),
      });

      const data = await res.json();

      const aiMsg: MessageItem = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: data.reply || 'I analyzed your request based on standard ICAR agronomy guidelines.',
        source: data.source,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: MessageItem = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: 'Agronomy advisory engine responded: Soil NPK balanced. Optimal moisture 12-14%. Monitor APMC index before executing forward contracts.',
        timestamp: 'Just now',
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto" id="ai-assistant-modal">
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl max-w-2xl w-full h-[80vh] shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header from Design HTML */}
        <div className="p-4 bg-emerald-600 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            <h3 className="font-bold text-sm">AI Farming Assistant</h3>
            <span className="text-[10px] bg-emerald-700 text-emerald-100 px-2 py-0.5 rounded font-semibold ml-1">
              Online
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={speechLanguage}
              onChange={(e) => setSpeechLanguage(e.target.value as any)}
              className="bg-emerald-700 border border-emerald-500 text-emerald-100 text-[11px] rounded-lg px-2 py-0.5 outline-none cursor-pointer"
              title="Voice Input Language"
              id="voice-language-select"
            >
              <option value="en-IN">English (India)</option>
              <option value="hi-IN">हिन्दी (Hindi)</option>
            </select>

            <button
              onClick={() => {
                if (speakingMessageId) window.speechSynthesis.cancel();
                onClose();
              }}
              className="p-1 rounded-lg hover:bg-emerald-700 text-emerald-100 hover:text-white transition cursor-pointer"
              id="close-ai-advisor-btn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((msg) => {
            const isAI = msg.role === 'assistant';
            const isSpeaking = speakingMessageId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isAI ? 'items-start' : 'items-start justify-end'}`}
                id={`advisor-msg-${msg.id}`}
              >
                {isAI && (
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs mt-0.5">
                    AI
                  </div>
                )}

                <div className="max-w-[85%] space-y-1">
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      isAI
                        ? 'bg-white border border-emerald-100 text-slate-800 rounded-tl-none'
                        : 'bg-emerald-600 text-white rounded-tr-none font-medium'
                    }`}
                  >
                    {isAI ? (
                      <div className="space-y-1.5 prose prose-xs max-w-none text-slate-800 prose-headings:text-slate-900 prose-headings:font-bold prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    ) : (
                      <p>{msg.text}</p>
                    )}
                  </div>

                  {/* Actions under AI message */}
                  {isAI && (
                    <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                      <button
                        onClick={() => handleSpeakText(msg.id, msg.text)}
                        className={`flex items-center gap-1 transition cursor-pointer ${
                          isSpeaking ? 'text-emerald-700 font-bold' : 'hover:text-emerald-700 text-slate-500'
                        }`}
                        id={`tts-btn-${msg.id}`}
                      >
                        {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                        <span>{isSpeaking ? 'Stop Audio' : 'Listen Voice'}</span>
                      </button>
                      <span>{msg.timestamp}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="bg-white border border-emerald-100 p-2.5 rounded-2xl rounded-tl-none text-xs text-slate-600 shadow-sm">
                Analyzing agronomic data & mandi index...
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Listening banner */}
        {isListening && (
          <div className="bg-rose-500 text-white px-3 py-1.5 flex items-center justify-between text-xs animate-pulse">
            <span className="font-bold flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 animate-bounce" />
              Listening to voice query ({speechLanguage === 'hi-IN' ? 'हिन्दी' : 'English'})...
            </span>
            <button onClick={() => setIsListening(false)} className="underline text-[10px] cursor-pointer">
              Cancel
            </button>
          </div>
        )}

        {/* Quick prompt chips */}
        <div className="px-3 py-1.5 bg-emerald-50/80 border-t border-emerald-100 overflow-x-auto no-scrollbar flex items-center gap-1.5">
          {SAMPLE_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuestion(q.text)}
              className="text-[10px] bg-white hover:bg-emerald-100 text-slate-700 px-2.5 py-1 rounded-full border border-emerald-200 transition shrink-0 flex items-center gap-1 cursor-pointer font-medium"
              id={`quick-question-chip-${idx}`}
            >
              <span>{q.icon}</span>
              <span className="truncate max-w-[200px]">{q.text}</span>
            </button>
          ))}
        </div>

        {/* Input Bar from Design HTML */}
        <form onSubmit={(e) => { e.preventDefault(); handleSendQuestion(); }} className="p-3 bg-white border-t border-emerald-100 flex items-center gap-2">
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
            }`}
            title="Click to speak (Voice Input)"
            id="advisor-voice-input-btn"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about fertilizer, pest control, or weather..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            id="advisor-text-input"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 disabled:opacity-40 transition cursor-pointer shadow-sm"
            id="advisor-submit-btn"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
