import React, { useState, useEffect } from 'react';
import Profile from './components/Profile';
import About from './components/About';
import Skills from './components/Skills';
import Certifications from './components/Certifications';
import Education from './components/Education';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Contact from './components/Contact';
import AdminDashboard from './components/AdminDashboard';
import ProjectDetail from './components/ProjectDetail';
import { FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';
import { getPortfolioData } from './utils/portfolioData';

// Function to generate initials from name
const generateInitials = (name) => {
  if (!name) return 'NP'; // Default fallback
  
  const nameParts = name.trim().split(/\s+/);
  if (nameParts.length >= 2) {
    // First letter of first name + First letter of last name
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  } else if (nameParts.length === 1) {
    // If only one name, use first two letters
    return nameParts[0].substring(0, 2).toUpperCase();
  }
  return 'NP'; // Default fallback
};

function App() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(null);
  const [portfolioData, setPortfolioData] = useState(getPortfolioData());
  const [initials, setInitials] = useState(generateInitials(portfolioData.profile.name));
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [mobileAboutDropdownOpen, setMobileAboutDropdownOpen] = useState(false);

  useEffect(() => {
    // Check current route
    const checkRoute = () => {
      const hash = window.location.hash;
      
      if (hash === '#/dashboard' || window.location.pathname === '/dashboard') {
      setShowDashboard(true);
        setCurrentRoute(null);
      } else if (hash.startsWith('#/project/')) {
        setShowDashboard(false);
        const projectId = hash.replace('#/project/', '');
        setCurrentRoute({ type: 'project', id: projectId });
      } else {
        setShowDashboard(false);
        setCurrentRoute(null);
      }
    };
    
    // Check on mount
    checkRoute();
    
    // Listen for hash changes
    window.addEventListener('hashchange', checkRoute);
    
    return () => {
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);

  useEffect(() => {
    // Always load from JSON file on mount (source of truth)
    const loadData = () => {
      const latest = getPortfolioData();
      setPortfolioData(latest);
      setInitials(generateInitials(latest.profile.name));
    };
    loadData();
    
    // Listen for portfolio data updates (only for real-time preview in current session)
    const handleUpdate = (event) => {
      setPortfolioData(event.detail);
      setInitials(generateInitials(event.detail.profile.name));
    };
    
    window.addEventListener('portfolioDataUpdated', handleUpdate);
    
    return () => {
      window.removeEventListener('portfolioDataUpdated', handleUpdate);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle navigation back from project detail → scroll to Projects section
  const handleBackToProjects = () => {
    // Close detail view
    setCurrentRoute(null);

    // Update hash so URL reflects section
    window.location.hash = '#projects';

    // After main page re-renders, smoothly scroll to the projects section
    setTimeout(() => {
      const projectsSection = document.getElementById('projects');
      if (projectsSection) {
        projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 200);
  };

  // If dashboard is active, show only dashboard
  if (showDashboard || window.location.hash === '#/dashboard') {
    return <AdminDashboard />;
  }

  // If project detail page is active, show project detail with header
  if (currentRoute?.type === 'project') {
    return (
      <div className="bg-black text-white min-h-screen overflow-x-hidden" style={{ fontFamily: "'Inter', 'Space Grotesk', 'Poppins', sans-serif" }}>
        {/* Header */}
        <header
          className={`fixed top-0 w-full z-50 transition-all duration-300 ${
            scrolled
              ? 'bg-black/95 backdrop-blur-md border-b border-gray-800 py-3'
              : 'bg-transparent py-5'
          }`}
        >
          <nav className="container mx-auto px-4 flex justify-between items-center">
            <a href="#projects" onClick={handleBackToProjects}>
              <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity">
                {initials}
              </h1>
            </a>

            {/* Desktop Menu */}
            <ul className="hidden md:flex space-x-8 items-center" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <li>
                <a
                  href="#profile"
                  className="text-white hover:text-gray-300 transition-colors duration-300 font-extrabold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                >
                  Profile
                </a>
              </li>
              <li 
                className="relative"
                onMouseEnter={() => setAboutDropdownOpen(true)}
                onMouseLeave={() => setAboutDropdownOpen(false)}
              >
                <button
                  className="text-white hover:text-gray-300 transition-colors duration-300 font-extrabold flex items-center gap-1"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                >
                  About
                  <FaChevronDown className={`transition-transform duration-300 ${aboutDropdownOpen ? 'rotate-180' : ''}`} size={12} />
                </button>
                {aboutDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-black/95 backdrop-blur-md border border-gray-800 rounded-lg shadow-xl min-w-[180px] py-2 z-50">
                    <a
                      href="#about"
                      className="block px-4 py-2 text-white hover:bg-gray-800 transition-colors duration-300 font-extrabold"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                    >
                      About
                    </a>
                    <a
                      href="#education"
                      className="block px-4 py-2 text-white hover:bg-gray-800 transition-colors duration-300 font-extrabold"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                    >
                      Education
                    </a>
                    <a
                      href="#experience"
                      className="block px-4 py-2 text-white hover:bg-gray-800 transition-colors duration-300 font-extrabold"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                    >
                      Experience
                    </a>
                  </div>
                )}
              </li>
              {['Skills', 'Certifications', 'Projects'].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="text-white hover:text-gray-300 transition-colors duration-300 font-extrabold"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                  >
                    {item}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#contact"
                  className="btn-outline-gradient px-6 py-2 rounded-full font-black transition-all duration-300 transform hover:scale-105"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                >
                  Contact
                </a>
              </li>
            </ul>

            {/* Mobile Hamburger */}
            <div className="md:hidden flex items-center">
              <button onClick={toggleMobileMenu}>
                {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </nav>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <ul className="md:hidden flex flex-col items-center space-y-4 mt-4 pb-4 border-t border-gray-800 bg-black/80 backdrop-blur-md" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <li>
                <a
                  href="#profile"
                  className="text-white hover:text-gray-300 transition-colors duration-300 font-extrabold text-lg"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                >
                  Profile
                </a>
              </li>
              <li className="w-full">
                <button
                  className="text-white hover:text-gray-300 transition-colors duration-300 font-extrabold text-lg flex items-center justify-center gap-2 w-full"
                  onClick={() => setMobileAboutDropdownOpen(!mobileAboutDropdownOpen)}
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                >
                  About
                  <FaChevronDown className={`transition-transform duration-300 ${mobileAboutDropdownOpen ? 'rotate-180' : ''}`} size={14} />
                </button>
                {mobileAboutDropdownOpen && (
                  <div className="mt-2 space-y-2 w-full">
                    <a
                      href="#about"
                      className="block text-white hover:text-gray-300 transition-colors duration-300 font-extrabold text-base pl-4"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                    >
                      About
                    </a>
                    <a
                      href="#education"
                      className="block text-white hover:text-gray-300 transition-colors duration-300 font-extrabold text-base pl-4"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                    >
                      Education
                    </a>
                    <a
                      href="#experience"
                      className="block text-white hover:text-gray-300 transition-colors duration-300 font-extrabold text-base pl-4"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                    >
                      Experience
                    </a>
                  </div>
                )}
              </li>
              {['Skills', 'Certifications', 'Projects'].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="text-white hover:text-gray-300 transition-colors duration-300 font-extrabold text-lg"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                  >
                    {item}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#contact"
                  className="btn-outline-gradient px-6 py-2 rounded-full font-black transition-all duration-300 transform hover:scale-105"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                >
                  Contact
                </a>
              </li>
            </ul>
          )}
        </header>

        <ProjectDetail projectId={currentRoute.id} onBack={handleBackToProjects} />

        {/* Gradient Outline Button Style */}
        <style>{`
          .btn-outline-gradient {
            background: linear-gradient(#000, #000) padding-box,
                        linear-gradient(90deg, #38bdf8, #10b981) border-box;
            border-radius: 9999px;
            border: 2px solid transparent;
            color: white;
            position: relative;
            transition: all 0.4s ease;
          }
          .btn-outline-gradient:hover {
            background: linear-gradient(90deg, #38bdf8, #10b981);
            color: #000;
            box-shadow: 0 0 20px rgba(56, 189, 248, 0.4);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden" style={{ fontFamily: "'Inter', 'Space Grotesk', 'Poppins', sans-serif" }}>
      {/* Header */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-black/95 backdrop-blur-md border-b border-gray-800 py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <nav className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              {initials}
          </h1>

          {/* Desktop Menu */}
          <ul className="hidden md:flex space-x-8 items-center" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <li>
              <a
                href="#profile"
                className="text-white hover:text-gray-300 transition-colors duration-300 font-extrabold"
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
              >
                Profile
              </a>
            </li>
            <li 
              className="relative"
              onMouseEnter={() => setAboutDropdownOpen(true)}
              onMouseLeave={() => setAboutDropdownOpen(false)}
            >
              <button
                className="text-white hover:text-gray-300 transition-colors duration-300 font-extrabold flex items-center gap-1"
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
              >
                About
                <FaChevronDown className={`transition-transform duration-300 ${aboutDropdownOpen ? 'rotate-180' : ''}`} size={12} />
              </button>
              {aboutDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 bg-black/95 backdrop-blur-md border border-gray-800 rounded-lg shadow-xl min-w-[180px] py-2 z-50">
                  <a
                    href="#about"
                    className="block px-4 py-2 text-white hover:bg-gray-800 transition-colors duration-300 font-extrabold"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                  >
                    About
                  </a>
                  <a
                    href="#education"
                    className="block px-4 py-2 text-white hover:bg-gray-800 transition-colors duration-300 font-extrabold"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                  >
                    Education
                  </a>
                  <a
                    href="#experience"
                    className="block px-4 py-2 text-white hover:bg-gray-800 transition-colors duration-300 font-extrabold"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                  >
                    Experience
                  </a>
                </div>
              )}
            </li>
            {['Skills', 'Certifications', 'Projects'].map((item) => (
              <li key={item}>
                <a
                  href={`#${item.toLowerCase()}`}
                  className="text-white hover:text-gray-300 transition-colors duration-300 font-extrabold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                >
                  {item}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#contact"
                className="btn-outline-gradient px-6 py-2 rounded-full font-black transition-all duration-300 transform hover:scale-105"
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
              >
                Contact
              </a>
            </li>
          </ul>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleMobileMenu}>
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <ul className="md:hidden flex flex-col items-center space-y-4 mt-4 pb-4 border-t border-gray-800 bg-black/80 backdrop-blur-md" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <li>
              <a
                href="#profile"
                className="text-white hover:text-gray-300 transition-colors duration-300 font-extrabold text-lg"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
              >
                Profile
              </a>
            </li>
            <li className="w-full">
              <button
                className="text-white hover:text-gray-300 transition-colors duration-300 font-extrabold text-lg flex items-center justify-center gap-2 w-full"
                onClick={() => setMobileAboutDropdownOpen(!mobileAboutDropdownOpen)}
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
              >
                About
                <FaChevronDown className={`transition-transform duration-300 ${mobileAboutDropdownOpen ? 'rotate-180' : ''}`} size={14} />
              </button>
              {mobileAboutDropdownOpen && (
                <div className="mt-2 space-y-2 w-full">
                  <a
                    href="#about"
                    className="block text-white hover:text-gray-300 transition-colors duration-300 font-extrabold text-base pl-4"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                  >
                    About
                  </a>
                  <a
                    href="#education"
                    className="block text-white hover:text-gray-300 transition-colors duration-300 font-extrabold text-base pl-4"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                  >
                    Education
                  </a>
                  <a
                    href="#experience"
                    className="block text-white hover:text-gray-300 transition-colors duration-300 font-extrabold text-base pl-4"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                  >
                    Experience
                  </a>
                </div>
              )}
            </li>
            {['Skills', 'Certifications', 'Projects'].map((item) => (
              <li key={item}>
                <a
                  href={`#${item.toLowerCase()}`}
                  className="text-white hover:text-gray-300 transition-colors duration-300 font-extrabold text-lg"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                >
                  {item}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#contact"
                className="btn-outline-gradient px-6 py-2 rounded-full font-black transition-all duration-300 transform hover:scale-105"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
              >
                Contact
              </a>
            </li>
          </ul>
        )}
      </header>

      {/* Main Content */}
      <main>
        <Profile />
        <About />
        <Skills />
        <Certifications />
        <Education />
        <Experience />
        <Projects />
        <Contact />
      </main>

      {/* Footer */}
      <footer className="relative bg-gradient-to-t from-gray-900 to-black text-center py-12 border-t border-gray-800 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '30px 30px',
            }}
          ></div>
        </div>
        <div className="relative z-10 space-y-4">
          <p className="text-gray-400 font-extrabold">&copy; 2025 Nayana Pabasara. All rights reserved.</p>
        </div>
      </footer>

      {/* Gradient Outline Button Style */}
      <style>{`
        .btn-outline-gradient {
          background: linear-gradient(#000, #000) padding-box,
                      linear-gradient(90deg, #38bdf8, #10b981) border-box;
          border-radius: 9999px;
          border: 2px solid transparent;
          color: white;
          position: relative;
          transition: all 0.4s ease;
        }
        .btn-outline-gradient:hover {
          background: linear-gradient(90deg, #38bdf8, #10b981);
          color: #000;
          box-shadow: 0 0 20px rgba(56, 189, 248, 0.4);
        }
      `}</style>
    </div>
  );
}

export default App;
