import React, { useEffect, useRef, useState } from 'react';
import { getPortfolioData } from '../utils/portfolioData';
import { useTheme } from '../contexts/ThemeContext';

// Function to convert Wikipedia URLs to direct image URLs
const convertWikipediaUrl = (url) => {
  if (!url) return url;
  if (!url.includes('wikipedia.org')) return url;
  if (url.includes('upload.wikimedia.org')) return url;
  
  const mediaMatch = url.match(/[#\/]media\/File:([^\/?#]+)/i);
  if (mediaMatch) {
    const filename = decodeURIComponent(mediaMatch[1]);
    const firstChar = filename.charAt(0).toUpperCase();
    const firstTwoChars = filename.substring(0, 2).replace(/\s/g, '_');
    return `https://upload.wikimedia.org/wikipedia/commons/thumb/${firstChar}/${firstTwoChars}/${filename}/500px-${filename}`;
  }
  return url;
};

// Function to convert Google Drive links to direct image URLs
const convertGoogleDriveLink = (url) => {
  if (!url) return url;
  
  if (url.includes('wikipedia.org')) {
    return convertWikipediaUrl(url);
  }
  
  let fileId = null;
  const driveMatch1 = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch1) {
    fileId = driveMatch1[1];
  }
  
  const driveMatch2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveMatch2 && !fileId) {
    fileId = driveMatch2[1];
  }
  
  const driveMatch3 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch3 && !fileId) {
    fileId = driveMatch3[1];
  }
  
  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }
  
  if (url.includes('uc?export=view') || url.includes('thumbnail?id=')) {
    return url;
  }
  
  // If local relative path without leading slash, add slash
  if (!url.startsWith('/') && !url.startsWith('http://') && !url.startsWith('https://')) {
    return `/${url}`;
  }
  
  return url;
};

function Experience() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [portfolioData, setPortfolioData] = useState(getPortfolioData());
  const experiences = portfolioData?.experience || [];

  useEffect(() => {
    const handleUpdate = (event) => {
      if (event.detail) setPortfolioData(event.detail);
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
      if (latest) setPortfolioData(latest);
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
      className={`relative py-20 sm:py-24 overflow-hidden transition-colors duration-500 ${
        isLight ? 'bg-slate-50 text-gray-900' : 'bg-black text-white'
      }`}
      style={{
        backgroundImage: isLight 
          ? 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.05) 1px, transparent 0)'
          : 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)',
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
              className={`bg-gradient-to-r ${isLight ? 'from-gray-900 via-sky-800 to-blue-700' : 'from-white to-blue-300'} bg-clip-text text-transparent`}
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
              className="bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent"
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
            className={`text-lg mt-2 transition-opacity duration-1000 ${
              isLight ? 'text-gray-600 font-medium' : 'text-gray-400'
            } ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          >
            Professional journey and career milestones
          </p>
          <div
            className={`h-1 w-24 bg-gradient-to-r from-sky-400 to-emerald-400 mx-auto mt-4 transition-opacity duration-1000 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
          ></div>
        </div>

        <div className="max-w-4xl mx-auto">
          {experiences.map((exp, index) => (
            <div
              key={exp.id || index}
              className={`group relative rounded-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden mb-6 ${
                isLight 
                  ? 'bg-white/90 border border-gray-200 shadow-md hover:shadow-xl hover:border-cyan-500' 
                  : 'bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 hover:border-cyan-400 hover:shadow-2xl hover:shadow-cyan-500/20'
              } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="p-8 flex flex-col sm:flex-row items-start gap-6">
                {/* Logo/Icon without hard outer border + rounded corners + smooth animation */}
                <div className="flex-shrink-0 relative">
                  {exp.logo ? (
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center p-2 shadow-sm hover:shadow-md hover:scale-110 group-hover:rotate-2 transition-all duration-300 ${
                      isLight ? 'bg-gray-100' : 'bg-gray-800/80'
                    }`}>
                      <img
                        src={convertGoogleDriveLink(exp.logo)}
                        alt={`${exp.company || 'Company'} logo`}
                        className="w-full h-full object-contain rounded-xl transition-all duration-300"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const imgElement = e.target;
                          let attemptCount = parseInt(imgElement.dataset.attemptCount || '0');
                          attemptCount++;
                          imgElement.dataset.attemptCount = attemptCount.toString();
                          
                          if (exp.logo && exp.logo.includes('drive.google.com') && attemptCount <= 3) {
                            const fileIdMatch = exp.logo.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                              exp.logo.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                              exp.logo.match(/\/d\/([a-zA-Z0-9_-]+)/);
                            if (fileIdMatch) {
                              const fileId = fileIdMatch[1];
                              if (attemptCount === 1) {
                                imgElement.src = `https://drive.google.com/uc?export=view&id=${fileId}`;
                                return;
                              } else if (attemptCount === 2) {
                                imgElement.src = `https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&refresh=2592000&url=${encodeURIComponent(exp.logo)}`;
                                return;
                              }
                            }
                          }
                          imgElement.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm hover:scale-110 transition-all duration-300 ${
                      isLight ? 'bg-cyan-100 text-cyan-700' : 'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {exp.company ? exp.company.substring(0, 2).toUpperCase() : 'EXP'}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <h3 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      {exp.title}
                    </h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full w-fit ${
                      isLight ? 'bg-cyan-100 text-cyan-800' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    }`}>
                      {exp.duration}
                    </span>
                  </div>
                  
                  <h4 className={`text-base font-semibold mb-4 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
                    {exp.company}
                  </h4>
                  
                  <p className={`text-sm leading-relaxed ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
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
