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
      text: "👋 Hi! I'm Nayana's AI Assistant. Ask me anything about Nayana's engineering skills, PLC/SCADA experience, projects, or contact info!",
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

  // Natural Language Knowledge Engine
  const generateAIResponse = (userQuery) => {
    const query = userQuery.toLowerCase().trim();
    const profile = portfolioData?.profile || {};
    const experiences = portfolioData?.experience || [];
    const education = portfolioData?.education || [];
    const projects = portfolioData?.projects || [];
    const certifications = portfolioData?.certifications || [];
    const skills = portfolioData?.skills || {};

    // 1. Contact / Social Links
    if (query.includes('contact') || query.includes('email') || query.includes('phone') || query.includes('linkedin') || query.includes('github') || query.includes('reach')) {
      const email = profile.socialLinks?.email || 'nayanapabasara1@gmail.com';
      const linkedin = profile.socialLinks?.linkedin || 'https://www.linkedin.com/in/napi-9046392b3/';
      const github = profile.socialLinks?.github || 'https://github.com/nayanapabasara';
      return `You can contact Nayana via:\n• 📧 Email: ${email}\n• 💼 LinkedIn: ${linkedin}\n• 🐙 GitHub: ${github}\n• 📄 You can also download Nayana's CV directly from the home section!`;
    }

    // 2. Experience / Work (Michelin, Ebony)
    if (query.includes('experience') || query.includes('work') || query.includes('michelin') || query.includes('ebony') || query.includes('intern')) {
      if (query.includes('michelin')) {
        const michelin = experiences.find(e => e.company?.toLowerCase().includes('michelin')) || experiences[0];
        return `🏭 **Michelin Lanka (Pvt) Ltd** (${michelin?.duration || '2026'}):\n${michelin?.description || 'Worked on PLC programming, Ignition SCADA, breakdown maintenance, MS SQL, Power BI & Power Apps digitalization.'}`;
      }
      const expList = experiences.map(e => `• **${e.title}** at **${e.company}** (${e.duration})`).join('\n');
      return `Nayana's Professional Experience:\n${expList || '1. Intern - Automation Engineer at Michelin Lanka\n2. Training Assistant Manager at Ebony Holdings'}`;
    }

    // 3. Technical Knowledge (PLC, SCADA, Arduino, React, Python, etc.)
    if (query.includes('plc') || query.includes('scada') || query.includes('siemens') || query.includes('automation') || query.includes('ladder')) {
      return `⚙️ **PLC & Industrial Automation Knowledge**:\nNayana has extensive hands-on experience in PLC programming (Siemens S7-1200/1500, Ladder Logic, Function Blocks), Ignition SCADA development, MS SQL integration, Modbus TCP, industrial sensors, and pneumatics!`;
    }

    if (query.includes('react') || query.includes('web') || query.includes('javascript') || query.includes('frontend') || query.includes('fullstack') || query.includes('node')) {
      return `💻 **Web Development Stack**:\nNayana specializes in modern Web Development using **React, JavaScript (ES6+), Vite, Tailwind CSS, Node.js, Express, and MySQL/MongoDB** database design.`;
    }

    if (query.includes('iot') || query.includes('arduino') || query.includes('embedded') || query.includes('raspberry pi') || query.includes('hardware')) {
      return `🤖 **IoT & Embedded Systems**:\nNayana works with Arduino microcontrollers, ESP32 Wi-Fi/Bluetooth modules, Raspberry Pi single-board computers, sensor integration, pneumatic actuators, and CAD 3D designing.`;
    }

    // 4. Education & University
    if (query.includes('education') || query.includes('university') || query.includes('degree') || query.includes('colombo') || query.includes('degree')) {
      const eduList = education.map(e => `🎓 **${e.institution}**: ${e.degree} (${e.period})`).join('\n\n');
      return eduList || `🎓 **University of Colombo**:\nBachelor of Engineering Technology Honours in Instrumentation & Automation Technology (2022 - 2026).`;
    }

    // 5. Projects
    if (query.includes('project') || query.includes('portfolio') || query.includes('app') || query.includes('built')) {
      const topProjects = projects.slice(0, 5).map(p => `🚀 **${p.title}**: ${p.description}`).join('\n\n');
      return `Here are some of Nayana's key projects:\n\n${topProjects || '1. CleanRobo (Smart Floor Cleaner)\n2. E-Mart E-Commerce Platform\n3. Smart Home Automation\n4. Pneumatic Sorting System'}`;
    }

    // 6. Certifications
    if (query.includes('certif') || query.includes('course') || query.includes('coursera') || query.includes('udemy')) {
      const certList = certifications.map(c => `🏆 **${c.title}** - ${c.provider} (${c.date})`).join('\n');
      return `Certifications & Qualifications:\n${certList || '• Coursera & Udemy Verified Certifications in PLC, Web Development, and Automation.'}`;
    }

    // 7. General Profile Bio
    if (query.includes('who') || query.includes('nayana') || query.includes('about') || query.includes('hello') || query.includes('hi') || query.includes('hey')) {
      return `👋 Hi there! I'm Nayana Pabasara's AI Assistant.\nNayana is an **Engineering Technology Student** specializing in **Instrumentation & Automation** at the **University of Colombo**.\nHe builds web apps, PLC SCADA systems, IoT devices, and automation tools!`;
    }

    // Fallback response with helpful triggers
    return `I can help you learn more about Nayana! Try asking about:\n• ⚡ "What are his technical skills?"\n• 🏭 "Tell me about Michelin experience"\n• 🎓 "Education details"\n• 🚀 "Projects built"\n• 📧 "Contact information"`;
  };

  const handleSendMessage = (textToSend) => {
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

    setTimeout(() => {
      const botResponseText = generateAIResponse(text);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 text-black rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center gap-2 group"
        aria-label="Open AI Assistant"
      >
        <div className="relative">
          <FaRobot size={24} className="text-black" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black animate-pulse"></span>
        </div>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-bold text-sm text-black whitespace-nowrap pl-1">
          Ask Nayana AI
        </span>
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-fadeIn" style={{ maxHeight: '520px', height: '80vh' }}>
          
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
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span> 100% Verified Portfolio Data
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <FaTimes size={18} />
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
              placeholder="Ask about skills, Michelin, projects..."
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