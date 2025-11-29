import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { getPortfolioData } from '../utils/portfolioData';
import { useState, useEffect } from 'react';

export default function Skills() {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const [portfolioData, setPortfolioData] = useState(getPortfolioData());
  const skillCategories = portfolioData.skills || [];
  
  const isInView = useInView(containerRef, { once: false, amount: 0.2, margin: '-10% 0px -10% 0px' });
  const isTitleInView = useInView(titleRef, { once: false, amount: 0.2 });

  useEffect(() => {
    const handleUpdate = (event) => {
      setPortfolioData(event.detail);
    };
    
    window.addEventListener('portfolioDataUpdated', handleUpdate);
    
    const handleStorage = (e) => {
      if (e.key === 'portfolioData' && e.newValue) {
        try {
          setPortfolioData(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Error parsing stored data:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    
    const handleCustomStorage = (e) => {
      if (e.detail && e.detail.key === 'portfolioData' && e.detail.newValue) {
        try {
          setPortfolioData(JSON.parse(e.detail.newValue));
        } catch (err) {
          console.error('Error parsing stored data:', err);
        }
      }
    };
    window.addEventListener('portfolioStorageUpdate', handleCustomStorage);
    
    const checkForUpdates = () => {
      const latest = getPortfolioData();
      setPortfolioData(latest);
    };
    checkForUpdates();
    
    return () => {
      window.removeEventListener('portfolioDataUpdated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('portfolioStorageUpdate', handleCustomStorage);
    };
  }, []);

  // Flatten skills from categories for display
  const allSkills = skillCategories.flatMap(category => 
    category.skills?.map(skill => ({
      name: skill,
      category: category.title,
      iconUrl: category.iconUrl,
      icon: category.icon
    })) || []
  );

  return (
    <section
      id="skills"
      className="relative py-24 bg-black text-white overflow-hidden flex flex-col items-center justify-center"
    >
      {/* Background gradient lights */}
        <div
        className="absolute inset-0 z-0 opacity-80 animate-bgShift"
          style={{
          background:
            'radial-gradient(1000px 600px at 10% 10%, rgba(56,189,248,0.07), transparent 60%), radial-gradient(800px 400px at 90% 90%, rgba(16,185,129,0.07), transparent 60%)',
        }}
      />

      {/* Section Title with scroll animation */}
      <div
        ref={titleRef}
        className={`relative z-10 text-center mb-12 transition-all duration-600 ease-out ${
          isTitleInView
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-6 scale-90'
            }`}
          >
        <h2 className="text-5xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent pb-3">
          Skills & Technologies
          </h2>
        <div className="h-1 w-84 bg-gradient-to-r from-sky-400 to-emerald-400 mx-auto mt-4" />
        <p className="text-gray-400 mt-4 text-lg max-w-2xl mx-auto pt-8">
          A modern stack that merges creativity and performance.
          </p>
        </div>

      {/* Skill Cards - Display categories */}
            <div
        ref={containerRef}
        className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto px-6"
      >
        {skillCategories.map((category, idx) => (
          <motion.div
              key={category.id}
            className="skill-card group relative rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-white/10 bg-white/5 backdrop-blur-sm"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 24, scale: 0.98 }}
            whileHover={{ scale: 1.05 }}
            transition={{
              duration: 0.85,
              delay: idx * 0.04,
              ease: [0.22, 1, 0.36, 1],
            }}
                style={{
              willChange: 'transform',
              transformOrigin: 'center',
                }}
          >
            {/* Glow aura */}
            <div className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-sky-400/30 to-emerald-400/30 blur-xl"></div>

            <div className="text-5xl mb-4 z-10 transition-transform duration-700 group-hover:scale-125 group-hover:rotate-6">
              {category.iconUrl ? (
                    <img
                      src={category.iconUrl}
                      alt={category.title}
                  className="w-12 h-12 object-contain mx-auto"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = e.target.parentElement.querySelector('.icon-fallback');
                    if (fallback) fallback.style.display = 'flex';
                      }}
                    />
              ) : null}
              <div className={`icon-fallback ${category.iconUrl ? 'hidden' : 'flex'} items-center justify-center text-sky-400`}>
                <i className={`${category.icon || 'fa-solid fa-code'} text-4xl`}></i>
              </div>
            </div>
            <p className="font-semibold text-gray-300 group-hover:text-white transition-colors duration-500 z-10">
              {category.title}
            </p>
            {category.skills && category.skills.length > 0 && (
              <p className="text-xs text-gray-500 mt-2 z-10">
                {category.skills.length} skills
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Background animation keyframes */}
      <style>{`
        @keyframes bgShift {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }
        .animate-bgShift {
          background-size: 200% 200%;
          animation: bgShift 20s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
