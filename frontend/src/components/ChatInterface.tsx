import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { MessageTrace } from '../store/useAppStore';
import { Send, Shield, ShieldCheck, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInterfaceProps {
  onSendMessage: (text: string) => void;
  onInspectMessage: (trace: MessageTrace) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSendMessage, onInspectMessage }) => {
  const { messages, users, userId, handshakeStatus } = useAppStore();
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && handshakeStatus === 'complete') {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const getUsername = (id: string) => {
    return users.find(u => u.id === id)?.username || 'Unknown';
  };

  return (
    <div className="flex flex-col h-[80vh] w-full max-w-4xl mx-auto bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
        <div className="flex items-center space-x-3">
          <div className="flex -space-x-2">
            {users.map((user) => (
              <div key={user.id} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-cyan-400">
                {user.username[0].toUpperCase()}
              </div>
            ))}
          </div>
          <span className="text-sm font-medium text-slate-300">
            {users.length} {users.length === 1 ? 'user' : 'users'} in room
          </span>
        </div>
        
        <div className="flex items-center space-x-2 text-xs">
          {handshakeStatus === 'complete' ? (
            <span className="flex items-center text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 mr-1" /> E2EE Active
            </span>
          ) : (
            <span className="flex items-center text-amber-400 font-medium animate-pulse">
              <Shield className="w-4 h-4 mr-1" /> Handshaking...
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isMe = msg.senderId === userId;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}
              >
                <div className={`relative max-w-[75%] rounded-2xl px-4 py-2 ${
                  isMe 
                    ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-tr-none' 
                    : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'
                }`}>
                  {!isMe && (
                    <div className="text-[10px] font-bold text-cyan-400 mb-1 uppercase tracking-wider">
                      {getUsername(msg.senderId)}
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <div className={`flex items-center justify-between text-[10px] mt-1 ${isMe ? 'text-cyan-200' : 'text-slate-500'}`}>
                    <button 
                      onClick={() => msg.trace && onInspectMessage(msg.trace)}
                      className={`mr-2 p-1 rounded-md hover:bg-white/10 transition-colors ${msg.trace ? 'opacity-100' : 'opacity-0'}`}
                      title="Inspect Encryption"
                    >
                      <Search className="w-3 h-3" />
                    </button>
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
            <Shield className="w-12 h-12 opacity-20" />
            <p className="text-sm">Secure connection established. No messages yet.</p>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center space-x-4">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={handshakeStatus !== 'complete'}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder={handshakeStatus === 'complete' ? "Type a quantum-secure message..." : "Waiting for secure handshake..."}
        />
        <button
          type="submit"
          disabled={handshakeStatus !== 'complete' || !inputText.trim()}
          className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-slate-900 p-3 rounded-xl shadow-lg shadow-cyan-500/20 transform active:scale-95 transition-all"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
