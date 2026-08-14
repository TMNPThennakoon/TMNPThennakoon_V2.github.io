import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { getPortfolioData } from '../utils/portfolioData';
import {
  SiHtml5,
  SiCss3,
  SiJavascript,
  SiReact,
  SiNodedotjs,
  SiMysql,
  SiArduino,
  SiRaspberrypi,
  SiFlutter,
  SiGit,
  SiGithub,
  SiPhp,
  SiPython,
  SiDocker,
} from 'react-icons/si';
import { FaJava, FaCode, FaCogs, FaDatabase, FaServer, FaMicrochip, FaRobot } from 'react-icons/fa';

// Icon mapping helper with original brand colors matching user's screenshot design
const getBrandIcon = (title = '', categoryIcon = '') => {
  const name = title.toLowerCase();

  if (name.includes('java') && !name.includes('script')) return <FaJava className="text-5xl text-amber-500" />;
  if (name.includes('javascript') || name.includes('js')) return <SiJavascript className="text-5xl text-yellow-400 bg-black rounded p-0.5" />;
  if (name.includes('php')) return <SiPhp className="text-5xl text-indigo-400" />;
  if (name.includes('c#') || name.includes('csharp')) return <div className="text-5xl font-black text-purple-400 font-mono">C#</div>;
  if (name.includes('html')) return <SiHtml5 className="text-5xl text-orange-500" />;
  if (name.includes('css')) return <SiCss3 className="text-5xl text-blue-500" />;
  if (name.includes('react')) return <SiReact className="text-5xl text-cyan-400" />;
  if (name.includes('flutter')) return <SiFlutter className="text-5xl text-sky-400" />;
  if (name.includes('vs code') || name.includes('vscode') || name.includes('visual studio')) return <FaCode className="text-5xl text-blue-400" />;
  if (name.includes('git') && !name.includes('hub')) return <SiGit className="text-5xl text-orange-600" />;
  if (name.includes('github')) return <SiGithub className="text-5xl text-white" />;
  if (name.includes('mysql')) return <SiMysql className="text-5xl text-sky-500" />;
  if (name.includes('python')) return <SiPython className="text-5xl text-yellow-300" />;
  if (name.includes('node')) return <SiNodedotjs className="text-5xl text-emerald-500" />;
  if (name.includes('arduino')) return <SiArduino className="text-5xl text-teal-400" />;
  if (name.includes('raspberry')) return <SiRaspberrypi className="text-5xl text-rose-500" />;
  if (name.includes('docker')) return <SiDocker className="text-5xl text-blue-400" />;
  if (name.includes('plc') || name.includes('automation') || name.includes('siemens')) return <FaCogs className="text-5xl text-cyan-400" />;
  if (name.includes('iot') || name.includes('embedded') || name.includes('sensor')) return <FaMicrochip className="text-5xl text-rose-400" />;
  if (name.includes('scada') || name.includes('database') || name.includes('sql')) return <FaDatabase className="text-5xl text-teal-400" />;

  // Default fallback
  return <FaCode className="text-5xl text-cyan-400" />;
};

export default function Skills() {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const [portfolioData, setPortfolioData] = useState(getPortfolioData());
  const skillCategories = portfolioData.skills || [];

  const isInView = useInView(containerRef, { once: false, amount: 0.1 });
  const isTitleInView = useInView(titleRef, { once: false, amount: 0.2 });

  useEffect(() => {
    const handleUpdate = (event) => {
      if (event.detail) setPortfolioData(event.detail);
    };
    window.addEventListener('portfolioDataUpdated', handleUpdate);
    return () => window.removeEventListener('portfolioDataUpdated', handleUpdate);
  }, []);

  return (
    <section
      id="skills"
      className="relative py-24 bg-black text-white overflow-hidden flex flex-col items-center justify-center"
    >
      {/* Background glow ambient lights */}
      <div
        className="absolute inset-0 z-0 opacity-80"
        style={{
          background:
            'radial-gradient(1000px 600px at 10% 10%, rgba(56,189,248,0.08), transparent 60%), radial-gradient(800px 400px at 90% 90%, rgba(16,185,129,0.08), transparent 60%)',
        }}
      />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Section Title */}
        <div
          ref={titleRef}
          className={`text-center mb-16 transition-all duration-700 ease-out ${
            isTitleInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent mb-3">
            Skills & Technologies
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-cyan-400 to-emerald-400 mx-auto mt-4 rounded-full" />
          <p className="text-gray-400 mt-4 text-base sm:text-lg max-w-2xl mx-auto font-medium">
            A modern engineering stack that merges creativity, performance, and industrial automation.
          </p>
        </div>

        {/* Skill Cards Grid - Matching attached screenshot */}
        <div
          ref={containerRef}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
        >
          {skillCategories.map((category, idx) => (
            <motion.div
              key={category.id || idx}
              className="group relative rounded-2xl p-6 bg-gray-900/90 border border-gray-800/80 hover:border-cyan-500/60 transition-all duration-300 flex flex-col items-center justify-center gap-3 text-center shadow-xl hover:-translate-y-1.5 hover:shadow-cyan-500/10 cursor-pointer overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: idx * 0.03 }}
            >
              {/* Subtle hover glow aura */}
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Icon Container */}
              <div className="relative z-10 transition-transform duration-300 group-hover:scale-110 flex items-center justify-center h-16 w-16">
                {category.iconUrl ? (
                  <img
                    src={category.iconUrl}
                    alt={category.title}
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.parentElement.querySelector('.brand-fallback');
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`brand-fallback ${category.iconUrl ? 'hidden' : 'flex'} items-center justify-center`}>
                  {getBrandIcon(category.title, category.icon)}
                </div>
              </div>

              {/* Title Label */}
              <h3 className="relative z-10 font-extrabold text-sm sm:text-base text-gray-200 group-hover:text-white transition-colors">
                {category.title}
              </h3>

              {/* Skills count / sub-details if any */}
              {category.skills && category.skills.length > 0 && (
                <p className="relative z-10 text-[11px] text-gray-500 group-hover:text-gray-400 font-medium transition-colors">
                  {category.skills.join(', ')}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
