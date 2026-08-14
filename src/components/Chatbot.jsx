import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaUser, FaMagic } from 'react-icons/fa';
import { getPortfolioData } from '../utils/portfolioData';

function Chatbot() {
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

  // API-FIRST AI Engine supporting OpenAI ChatGPT, Gemini, and local fallback
  const fetchAIResponse = async (userQuery) => {
    const rawQuery = userQuery.trim();
    const query = rawQuery.toLowerCase();
    const profile = portfolioData?.profile || {};
    const experiences = portfolioData?.experience || [];
    const education = portfolioData?.education || [];
    const projects = portfolioData?.projects || [];

    const openaiApiKey = (localStorage.getItem('openaiApiKey') || portfolioData?.aiConfig?.openaiApiKey || '').trim();
    const geminiApiKey = (localStorage.getItem('geminiApiKey') || portfolioData?.aiConfig?.geminiApiKey || '').trim();

    // 1. OpenAI ChatGPT API Call (API FIRST!)
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
                content: `You are Nayana Pabasara's friendly AI Assistant and Automation Engineering Specialist.
Be warm, polite, and conversational like a helpful friend.
Answer questions about Nayana Pabasara's background, Michelin internship, University of Colombo degree, skills, and projects accurately.
Answer ANY technical engineering, PLC, SCADA, Ladder Logic, coding, physics, electronics, or web development question with high precision.
If asked non-technical off-topic questions (e.g. movies, gossip, food recipes), politely decline and state that you are specialized strictly in Engineering and Portfolio topics.`
              },
              { role: 'user', content: rawQuery }
            ],
            temperature: 0.7
          })
        });
        const data = await response.json();
        if (data.choices && data.choices[0]?.message?.content) {
          return data.choices[0].message.content;
        } else if (data.error) {
          console.error('OpenAI API Error details:', data.error);
        }
      } catch (err) {
        console.error('OpenAI API Exception:', err);
      }
    }

    // 2. Google Gemini API Call (API SECOND!)
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
                      text: `You are Nayana Pabasara's friendly AI Assistant and Automation Engineering Specialist. Answer warmly and technically. User Query: ${rawQuery}`
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
        console.error('Gemini API Error:', err);
      }
    }

    // 3. Fallback to Local Knowledge Base ONLY if no API Key or API call fails!
    const greetingRegex = /^(hi|hii|hiii|hello|hey|heyy|bro|mchn|machan|ayubowan|good morning|good evening|kohomada|hlo|hola)(\s+.*)?$/i;
    if (greetingRegex.test(query) && query.split(' ').length <= 4) {
      return `Hey there! 👋 Great to meet you! I'm Nayana's AI Assistant.\nHow can I help you today with Nayana's engineering background, Michelin internship, PLC automation, SCADA, or web dev projects?`;
    }

    const offTopicRegex = /(movie|film|actress|actor|cricket|song|music|recipe|food|cooking|gossip|politics|election|president)/i;
    if (offTopicRegex.test(query)) {
      return `I am specialized as Nayana's Engineering & Portfolio Assistant! 😊\nI can help you with questions about Nayana's background, PLC programming, SCADA, Web Development, Electronics, or technical topics. Feel free to ask any technical question!`;
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

    if (query.includes('fpga') || query.includes('verilog') || query.includes('vhdl')) {
      return `🔬 **FPGA & Digital Logic**:\nNayana designs hardware digital logic circuits using Verilog/VHDL, Xilinx Vivado, state machines, logic gates, and hardware description languages.`;
    }

    if (query.includes('react') || query.includes('web') || query.includes('javascript') || query.includes('node') || query.includes('frontend')) {
      return `💻 **Full-Stack Development**:\nNayana builds responsive web apps using React 19, JavaScript ES6+, Vite, Tailwind CSS, Node.js, Express, and MySQL/MongoDB databases.`;
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
        
        <div className="relative w-12 h-12 rounded-full bg-gray-900 border border-cyan-400/60 text-cyan-400 flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300">
          <FaRobot size={22} className="text-cyan-300" />
          <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-black animate-ping"></span>
        </div>
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-22 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300" style={{ maxHeight: '520px', height: '80vh' }}>
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-400">
                <FaRobot size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base flex items-center gap-1.5">
                  Nayana AI Assistant <FaMagic className="text-amber-400" size={14} />
                </h3>
                <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span> Verified Portfolio AI
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <FaTimes size={16} />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-gray-950/60 border-b border-gray-800/80 overflow-x-auto flex gap-2 no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt.replace(/^[^\s]+\s/, ''))}
                className="px-2.5 py-1 bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/50 rounded-full text-xs text-gray-300 hover:text-cyan-300 whitespace-nowrap transition-all"
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
                  <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-0.5">
                    <FaRobot size={14} />
                  </div>
                )}
                <div
                  className={`max-w-[82%] p-3 rounded-2xl leading-relaxed whitespace-pre-line text-sm ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-black font-medium rounded-tr-none shadow-md'
                      : 'bg-gray-800 border border-gray-700/80 text-gray-200 rounded-tl-none shadow-md'
                  }`}
                >
                  {msg.text}
                  <span className={`block text-[10px] mt-1 ${msg.sender === 'user' ? 'text-black/70 text-right' : 'text-gray-400'}`}>
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
                <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 flex-shrink-0">
                  <FaRobot size={14} />
                </div>
                <div className="bg-gray-800 border border-gray-700 px-4 py-2.5 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></span>
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
            className="p-3 bg-gray-900 border-t border-gray-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about PLC, Michelin, code, or any topic..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
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