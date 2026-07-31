import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChatMessage } from '../types';
import { Bot, Send, User, Sparkles, X, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AICopilotProps {
  isDrawer?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export const AICopilotView: React.FC<AICopilotProps> = ({
  isDrawer = false,
  isOpen = true,
  onClose,
}) => {
  const { user, activeStudent, allStudents } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-init',
      sender: 'assistant',
      text: `Hello! I am EduSense AI Copilot powered by Gemini. ${
        activeStudent
          ? `I have loaded real-time performance factors for **${activeStudent.name}** (${activeStudent.attendance}% attendance, Math: ${activeStudent.examScores.Math}%).`
          : 'I have access to the full class roster and Kaggle dataset.'
      } How can I assist you with learning analytics, concepts, or predictions today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (isDrawer && !isOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          studentId: activeStudent?.studentId,
          role: user?.role || 'teacher',
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        const aiMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(data.error || 'Failed to get AI response');
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `e-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ I encountered an error: ${err.message}. Please check GEMINI_API_KEY settings or try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    activeStudent ? `What are ${activeStudent.name}'s weaknesses?` : 'Which students need support?',
    activeStudent ? `Predict ${activeStudent.name}'s Math score` : 'Show class attendance summary',
    'Explain quadratic equations',
    'How does sleep improve scores?',
  ];

  const contentMarkup = (
    <div className="flex flex-col h-full bg-[#F3F6FB] dark:bg-slate-900 border border-white dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-white/50 backdrop-blur-md dark:bg-slate-800/80 flex items-center justify-between shrink-0 border-b border-white/50 dark:border-slate-700 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base leading-tight text-slate-800 dark:text-white">EduSense AI Copilot</h3>
              <span className="accent-pill">
                Gemini RAG
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Context: {activeStudent ? `${activeStudent.name} (${activeStudent.attendance}% Att)` : 'Class Dataset'}
            </p>
          </div>
        </div>

        {isDrawer && onClose && (
          <button onClick={onClose} className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-6 relative z-0">
        <AnimatePresence>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`flex items-end gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white text-indigo-500'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-indigo-500 text-white font-medium rounded-3xl rounded-br-sm shadow-[0_8px_16px_-4px_rgba(99,102,241,0.4),inset_0_2px_4px_rgba(255,255,255,0.2)]'
                    : 'clay-card rounded-3xl rounded-bl-sm font-medium text-slate-700 dark:text-slate-200 whitespace-pre-wrap'
                }`}
              >
                {m.text}
                <div
                  className={`text-[10px] mt-1.5 font-bold ${
                    m.sender === 'user' ? 'text-indigo-200 text-right' : 'text-slate-400 text-left'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
            className="flex items-center gap-2 text-xs font-bold text-slate-500 p-2"
          >
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="ml-2">Gemini is thinking...</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Suggestion Chips */}
      <div className="p-3 bg-[#F3F6FB] dark:bg-slate-900 border-t border-white/50 dark:border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => handleSend(s)}
            className="text-[11px] font-bold bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl whitespace-nowrap transition-all border border-indigo-100 dark:border-slate-700 hover:border-indigo-300 hover:shadow-md focus-ring cursor-pointer"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <div className="p-4 bg-white dark:bg-slate-900 shrink-0 z-10 rounded-b-3xl">
        <div className="flex items-center gap-3 bg-[#F3F6FB] dark:bg-slate-800 rounded-2xl p-2 shadow-inner border border-slate-100 dark:border-slate-700">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI Copilot..."
            className="flex-1 bg-transparent text-slate-800 dark:text-white text-sm px-3 py-2 focus:outline-none font-medium placeholder-slate-400"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="clay-btn p-3 rounded-xl disabled:opacity-50 disabled:scale-100 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  if (isDrawer) {
    return (
      <div
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-slate-900/40 backdrop-blur-sm flex justify-end animate-in slide-in-from-right"
        onClick={onClose}
      >
        <div
          className="w-full h-full p-2 sm:p-4"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-label="AI Copilot Assistant"
        >
          {contentMarkup}
        </div>
      </div>
    );
  }

  return <div className="h-[calc(100vh-140px)] min-h-[500px] p-2">{contentMarkup}</div>;
};
