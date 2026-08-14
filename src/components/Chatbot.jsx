import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaUser, FaMagic } from 'react-icons/fa';
import { getPortfolioData } from '../utils/portfolioData';
import { useTheme } from '../contexts/ThemeContext';

function Chatbot() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [portfolioData, setPortfolioData] = useState(getPortfolioData());
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "👋 Hi! I'm Nayana's AI Assistant. Ask me anything about Nayana's engineering background, Michelin experience, PLC/SCADA, projects, or technical topics!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail) setPortfolioData(e.detail);
    };
    window.addEventListener('portfolioDataUpdated', handleUpdate);
    return () => window.removeEventListener('portfolioDataUpdated', handleUpdate);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickPrompts = [
    "⚡ What are Nayana's top skills?",
    "🏭 Tell me about Michelin experience",
    "🎓 Degree & University details",
    "🚀 Show top projects",
    "📧 How to contact Nayana?"
  ];

  // Universal Multi-API Engine supporting Gemini (Free), Groq (Free), OpenAI, and local fallback
  const fetchAIResponse = async (userQuery) => {
    const rawQuery = userQuery.trim();
    const query = rawQuery.toLowerCase();
    const profile = portfolioData?.profile || {};
    const experiences = portfolioData?.experience || [];
    const education = portfolioData?.education || [];
    const projects = portfolioData?.projects || [];

    const geminiApiKey = (localStorage.getItem('geminiApiKey') || portfolioData?.aiConfig?.geminiApiKey || '').trim();
    const groqApiKey = (localStorage.getItem('groqApiKey') || portfolioData?.aiConfig?.groqApiKey || '').trim();
    const openaiApiKey = (localStorage.getItem('openaiApiKey') || portfolioData?.aiConfig?.openaiApiKey || '').trim();

    // 1. Google Gemini API Call (100% FREE FOREVER)
    if (geminiApiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `You are Nayana Pabasara's friendly AI Assistant and Automation Engineering Specialist. Be warm, enthusiastic, polite, and technical. Answer questions about Nayana's background, Michelin internship, University of Colombo degree, PLC automation, SCADA, Web Dev, and technical engineering topics accurately. User Query: ${rawQuery}`
                    }
                  ]
                }
              ]
            })
          }
        );
        const data = await response.json();
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          return data.candidates[0].content.parts[0].text;
        }
      } catch (err) {
        console.error('Gemini API Exception:', err);
      }
    }

    // 2. Groq Cloud API Call (100% FREE FOREVER - Llama 3.3 70B)
    if (groqApiKey) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqApiKey}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content: `You are Nayana Pabasara's friendly AI Assistant and Automation Engineering Specialist. Be warm, polite, and technical. Answer questions about Nayana's background, Michelin internship, University of Colombo degree, PLC automation, SCADA, Web Dev, and engineering topics accurately.`
              },
              { role: 'user', content: rawQuery }
            ],
            temperature: 0.7
          })
        });
        const data = await response.json();
        if (data.choices && data.choices[0]?.message?.content) {
          return data.choices[0].message.content;
        }
      } catch (err) {
        console.error('Groq API Exception:', err);
      }
    }

    // 3. OpenAI ChatGPT API Call
    if (openaiApiKey && (openaiApiKey.startsWith('sk-') || openaiApiKey.length > 20)) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are Nayana Pabasara's friendly AI Assistant and Automation Engineering Specialist. Answer warmly and technically.`
              },
              { role: 'user', content: rawQuery }
            ],
            temperature: 0.7
          })
        });
        const data = await response.json();
        if (data.choices && data.choices[0]?.message?.content) {
          return data.choices[0].message.content;
        }
      } catch (err) {
        console.error('OpenAI API Exception:', err);
      }
    }

    // 4. Fallback to Local Knowledge Base ONLY if no API Key or API calls fail
    const greetingRegex = /^(hi|hii|hiii|hello|hey|heyy|bro|mchn|machan|ayubowan|good morning|good evening|kohomada|hlo|hola)(\s+.*)?$/i;
    if (greetingRegex.test(query) && query.split(' ').length <= 4) {
      return `Hey there! 👋 Great to meet you! I'm Nayana's AI Assistant.\nHow can I help you today with Nayana's engineering background, Michelin internship, PLC automation, SCADA, or web dev projects?`;
    }

    if (query.includes('contact') || query.includes('email') || query.includes('phone') || query.includes('linkedin') || query.includes('github') || query.includes('reach')) {
      const email = profile.socialLinks?.email || 'nayanapabasara1@gmail.com';
      const linkedin = profile.socialLinks?.linkedin || 'https://www.linkedin.com/in/napi-9046392b3/';
      const github = profile.socialLinks?.github || 'https://github.com/nayanapabasara';
      return `You can reach out to Nayana via:\n• 📧 Email: ${email}\n• 💼 LinkedIn: ${linkedin}\n• 🐙 GitHub: ${github}\n• 📄 You can also download Nayana's CV directly from the Home section!`;
    }

    if (query.includes('experience') || query.includes('work') || query.includes('michelin') || query.includes('ebony') || query.includes('intern')) {
      if (query.includes('michelin')) {
        const michelin = experiences.find(e => e.company?.toLowerCase().includes('michelin')) || experiences[0];
        return `🏭 **Michelin Lanka (Pvt) Ltd** (${michelin?.duration || '2026'}):\n${michelin?.description || 'Worked on PLC programming, Ignition SCADA, breakdown maintenance, MS SQL, Power BI & Power Apps digitalization.'}`;
      }
      const expList = experiences.map(e => `• **${e.title}** at **${e.company}** (${e.duration})`).join('\n');
      return `Nayana's Professional Experience:\n${expList || '1. Intern - Automation Engineer at Michelin Lanka\n2. Training Assistant Manager at Ebony Holdings'}`;
    }

    if (query.includes('education') || query.includes('university') || query.includes('degree') || query.includes('colombo')) {
      const eduList = education.map(e => `🎓 **${e.institution}**: ${e.degree} (${e.period})`).join('\n\n');
      return eduList || `🎓 **University of Colombo**:\nBachelor of Engineering Technology Honours in Instrumentation & Automation Technology (2022 - 2026).`;
    }

    if (query.includes('project') || query.includes('built') || query.includes('app')) {
      const topProjects = projects.slice(0, 5).map(p => `🚀 **${p.title}**: ${p.description}`).join('\n\n');
      return `Here are some of Nayana's key projects:\n\n${topProjects || '1. CleanRobo (Smart Floor Cleaner)\n2. E-Mart E-Commerce Platform\n3. Smart Home Automation\n4. Pneumatic Sorting System'}`;
    }

    if (query.includes('plc') || query.includes('ladder') || query.includes('siemens') || query.includes('scada')) {
      return `⚙️ **PLC & Automation Engineering**:\nNayana works with Siemens S7-1200/1500 PLCs, Ladder Logic (LAD), Function Block Diagrams (FBD), Structured Text (ST), Ignition SCADA, Modbus TCP/IP, and SQL database integration for industrial telemetry and equipment automation.`;
    }

    return `Hey! 👋 I can help you with Nayana's portfolio, PLC automation, SCADA, Web Dev, and any technical engineering questions!`;
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    const botResponseText = await fetchAIResponse(text);

    const botMsg = {
      id: Date.now() + 1,
      sender: 'bot',
      text: botResponseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, botMsg]);
    setIsTyping(false);
  };

  return (
    <>
      {/* Sleek Compact Floating Button with Pulsing Glow Ring */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 group flex items-center justify-center"
        aria-label="Open AI Assistant"
      >
        {/* Pulsing Outer Ring */}
        <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 opacity-75 blur animate-pulse group-hover:opacity-100 transition duration-300"></span>
        
        <div className={`relative w-12 h-12 rounded-full border flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 ${
          isLight ? 'bg-white border-cyan-500 text-cyan-600' : 'bg-gray-900 border-cyan-400/60 text-cyan-400'
        }`}>
          <FaRobot size={22} className={isLight ? 'text-cyan-600' : 'text-cyan-300'} />
          <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-black animate-ping"></span>
        </div>
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className={`fixed bottom-22 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 backdrop-blur-xl border rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isLight ? 'bg-white/95 border-gray-300 text-gray-900' : 'bg-gray-900/95 border-cyan-500/30 text-white'
        }`} style={{ maxHeight: '520px', height: '80vh' }}>
          
          {/* Header */}
          <div className={`p-4 border-b flex justify-between items-center ${
            isLight ? 'bg-gradient-to-r from-gray-100 via-white to-gray-100 border-gray-200' : 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-gray-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl border ${
                isLight ? 'bg-cyan-100 border-cyan-300 text-cyan-700' : 'bg-cyan-500/20 border-cyan-400/40 text-cyan-400'
              }`}>
                <FaRobot size={20} />
              </div>
              <div>
                <h3 className={`font-extrabold text-base flex items-center gap-1.5 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  Nayana AI Assistant <FaMagic className="text-amber-400" size={14} />
                </h3>
                <p className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block"></span> Verified Portfolio AI
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className={`p-2 rounded-lg transition-colors ${
                isLight ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-200' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <FaTimes size={16} />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className={`px-3 py-2 border-b overflow-x-auto flex gap-2 no-scrollbar ${
            isLight ? 'bg-gray-50 border-gray-200' : 'bg-gray-950/60 border-gray-800/80'
          }`}>
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt.replace(/^[^\s]+\s/, ''))}
                className={`px-2.5 py-1 border rounded-full text-xs whitespace-nowrap transition-all ${
                  isLight 
                    ? 'bg-white hover:bg-cyan-50 border-gray-300 hover:border-cyan-400 text-gray-800 hover:text-cyan-700' 
                    : 'bg-white/5 hover:bg-cyan-500/20 border-white/10 hover:border-cyan-400/50 text-gray-300 hover:text-cyan-300'
                }`}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className={`w-7 h-7 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isLight ? 'bg-cyan-100 border-cyan-300 text-cyan-700' : 'bg-cyan-500/20 border-cyan-400/40 text-cyan-400'
                  }`}>
                    <FaRobot size={14} />
                  </div>
                )}
                <div
                  className={`max-w-[82%] p-3 rounded-2xl leading-relaxed whitespace-pre-line text-sm ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-black font-semibold rounded-tr-none shadow-md'
                      : isLight
                      ? 'bg-gray-100 border border-gray-200 text-gray-900 font-medium rounded-tl-none shadow-sm'
                      : 'bg-gray-800 border border-gray-700/80 text-gray-100 rounded-tl-none shadow-md'
                  }`}
                >
                  {msg.text}
                  <span className={`block text-[10px] mt-1 ${
                    msg.sender === 'user' ? 'text-black/70 text-right' : isLight ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {msg.timestamp}
                  </span>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                    <FaUser size={12} />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className={`w-7 h-7 rounded-full border flex items-center justify-center flex-shrink-0 ${
                  isLight ? 'bg-cyan-100 border-cyan-300 text-cyan-700' : 'bg-cyan-500/20 border-cyan-400/40 text-cyan-400'
                }`}>
                  <FaRobot size={14} />
                </div>
                <div className={`px-4 py-2.5 rounded-2xl rounded-tl-none flex items-center gap-1.5 ${
                  isLight ? 'bg-gray-100 border border-gray-200' : 'bg-gray-800 border border-gray-700'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className={`p-3 border-t flex items-center gap-2 ${
              isLight ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-800'
            }`}
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about PLC, Michelin, code, or any topic..."
              className={`flex-1 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ${
                isLight 
                  ? 'bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-500' 
                  : 'bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-cyan-400'
              }`}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2.5 bg-gradient-to-r from-sky-400 to-emerald-400 text-black rounded-xl hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <FaPaperPlane size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default Chatbot;