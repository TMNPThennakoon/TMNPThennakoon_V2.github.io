import React, { useEffect, useRef, useState } from 'react';
import { getPortfolioData } from '../utils/portfolioData';

function Experience() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [portfolioData, setPortfolioData] = useState(getPortfolioData());
  const experiences = portfolioData.experience;

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setIsVisible(true);
        });
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative py-20 sm:py-24 bg-black overflow-hidden"
      style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }}
    >
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="text-center mb-12">
          <h2
            className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-20'
            }`}
            style={{ 
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility',
              backfaceVisibility: 'hidden',
              transform: 'translateZ(0)'
            }}
          >
            <span 
              className="bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent"
              style={{
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'inline-block'
              }}
            >
              Work{' '}
            </span>
            <span 
              className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent"
              style={{
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'inline-block'
              }}
            >
              Experience
            </span>
          </h2>
          <p
            className={`text-lg text-gray-400 mt-2 transition-opacity duration-1000 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            Professional journey and career milestones
          </p>
          <div
            className={`h-1 w-24 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mt-4 transition-opacity duration-1000 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
          ></div>
        </div>

        <div className="max-w-4xl mx-auto">
          {experiences.map((exp, index) => (
            <div
              key={exp.id}
              className={`group relative bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-cyan-500/30 hover:border-cyan-400 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/20 overflow-hidden mb-6 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="p-8 flex flex-col sm:flex-row items-start gap-6">
                {/* Logo/Icon */}
                <div className="flex-shrink-0 relative">
                  {exp.logo ? (
                    <div className="w-16 h-16 rounded-full bg-white p-2 flex items-center justify-center shadow-lg relative">
                      <img
                        src={exp.logo}
                        alt={`${exp.company} logo`}
                        className="w-full h-full object-contain rounded-full"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = e.target.parentElement.querySelector('.icon-fallback');
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="icon-fallback hidden absolute inset-0 items-center justify-center bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full shadow-lg shadow-cyan-500/50">
                        <i className={`${exp.icon} text-2xl text-white`}></i>
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                      <i className={`${exp.icon} text-2xl text-white`}></i>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                    {exp.title}
                  </h3>
                  <h4 className="text-xl font-semibold text-blue-300 mb-2">
                    {exp.company}
                  </h4>
                  <p className="text-gray-400 text-sm mb-4">
                    {exp.duration}
                  </p>
                  <p className="text-blue-100 leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Experience;

