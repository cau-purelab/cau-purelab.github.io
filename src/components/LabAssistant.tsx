import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Sparkles } from 'lucide-react';
import { generateResponse } from '../services/geminiService';
import { MEMBERS, RESEARCH_AREAS, PUBLICATIONS, LAB_NAME } from '../constants';

const LabAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([
    { role: 'assistant', text: `Hello! I am the AI assistant for ${LAB_NAME}. Ask me anything about our research, members, or publications.` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    // Context for the AI
    const context = `
      You are an AI assistant for the ${LAB_NAME}.
      Here is the lab data:
      Members: ${JSON.stringify(MEMBERS)}
      Research Areas: ${JSON.stringify(RESEARCH_AREAS)}
      Publications: ${JSON.stringify(PUBLICATIONS)}
      
      Please answer the user's question based on this information.
      Keep answers concise, professional, and helpful.
    `;

    const prompt = `${context}\n\nUser Question: ${userMessage}`;
    const response = await generateResponse(prompt);

    setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-900 text-white p-4 rounded-full shadow-lg hover:bg-blue-800 transition-all duration-300 hover:scale-105 flex items-center justify-center group"
        >
          <Sparkles className="h-6 w-6 group-hover:animate-pulse" />
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col h-[500px] border border-gray-200 overflow-hidden animate-fade-in-up">
          <div className="bg-blue-900 p-4 flex justify-between items-center text-white">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold">SVIL AI Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-blue-200">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-grow p-4 overflow-y-auto bg-gray-50 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user'
                    ? 'bg-blue-900 text-white rounded-br-none'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                  }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-2 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-900" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about our research..."
                className="flex-grow px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-2 bg-blue-900 text-white rounded-full hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabAssistant;