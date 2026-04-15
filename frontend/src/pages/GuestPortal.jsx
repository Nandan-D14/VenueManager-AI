import React, { useState, useEffect, useRef } from 'react';

export default function GuestPortal() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Welcome. I am your automated concierge for the Global Tech Summit. How may I assist you?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { sender: 'user', text: input }]);
    setInput('');
    setIsTyping(true);
    
    // Simulate AI response
    setTimeout(() => {
      let reply = "I have logged your request.";
      if (input.toLowerCase().includes('valet')) reply = "Valet is at the South Entrance. Wait time is approx 5 mins.";
      if (input.toLowerCase().includes('bathroom') || input.toLowerCase().includes('restroom')) reply = "Restrooms are down the hall, right of the main stage.";
      if (input.toLowerCase().includes('schedule')) reply = "The keynote address begins in 15 mins at the Main Stage.";
      
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] text-[#111111] font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-sm h-[600px] bg-white rounded-2xl enterprise-shadow overflow-hidden border border-gray-200 flex flex-col">
        
        <header className="px-6 py-5 border-b border-gray-100 bg-[#FAFAFA] text-center">
          <h2 className="text-sm font-semibold tracking-tight text-gray-900">Digital Concierge</h2>
          <p className="text-xs text-gray-400 mt-0.5">Global Tech Summit</p>
        </header>

        <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 scroll-smooth">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`px-4 py-2.5 max-w-[85%] text-sm rounded-lg ${
                  m.sender === 'user' 
                    ? 'bg-[#111111] text-white' 
                    : 'bg-[#F4F4F5] text-gray-800'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isTyping && (
             <div className="flex justify-start">
               <div className="px-4 py-3 bg-[#F4F4F5] rounded-lg flex gap-1 items-center">
                 <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
                 <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse delay-75" />
                 <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse delay-150" />
               </div>
             </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-[#FAFAFA]">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-md py-2.5 pl-4 pr-12 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-shadow transition-colors"
              placeholder="Type your message..."
              disabled={isTyping}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isTyping}
              className="absolute right-2 p-1.5 rounded text-gray-500 hover:text-gray-900 disabled:opacity-30 transition-colors"
            >
              <svg className="w-4 h-4 transform -rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
