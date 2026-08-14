import React, { useState, useEffect } from 'react';
import { getPortfolioData, exportPortfolioData, importPortfolioData, savePortfolioData } from '../utils/portfolioData';
import { getStoredSessions, exportAnalyticsCSV } from '../utils/analyticsTracker';
import ThreeCanvas, { THREE_PRESETS } from './ThreeCanvas';
import Profile from './Profile';
import About from './About';
import Skills from './Skills';
import Certifications from './Certifications';
import Experience from './Experience';
import Projects from './Projects';
import Contact from './Contact';
import Education from './Education';

function AdminDashboard() {
  const [portfolioData, setPortfolioData] = useState(null);
  const [activeTab, setActiveTab] = useState('analytics');
  const [saveStatus, setSaveStatus] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [showGitHubSettings, setShowGitHubSettings] = useState(false);
  const [githubToken, setGithubToken] = useState(localStorage.getItem('githubToken') || '');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visitorSessions, setVisitorSessions] = useState(getStoredSessions());
  const [analyticsFilter, setAnalyticsFilter] = useState('all');

  useEffect(() => {
    const handleSessionsUpdate = (e) => {
      if (e.detail) setVisitorSessions(e.detail);
    };
    window.addEventListener('visitorSessionsUpdated', handleSessionsUpdate);
    return () => window.removeEventListener('visitorSessionsUpdated', handleSessionsUpdate);
  }, []);

  const filteredSessions = visitorSessions.filter((s) => {
    if (analyticsFilter === 'today') {
      const todayStr = new Date().toISOString().split('T')[0];
      return s.date === todayStr;
    }
    if (analyticsFilter === 'week') {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return s.timestamp >= sevenDaysAgo;
    }
    if (analyticsFilter === 'month') {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      return s.timestamp >= thirtyDaysAgo;
    }
    return true;
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = visitorSessions.filter((s) => s.date === todayStr).length;
  const mobileCount = filteredSessions.filter((s) => s.device === 'Mobile').length;
  const desktopCount = filteredSessions.filter((s) => s.device === 'Desktop').length;
  const totalCount = filteredSessions.length || 1;
  const mobilePercent = Math.round((mobileCount / totalCount) * 100);
  const desktopPercent = Math.round((desktopCount / totalCount) * 100);

  useEffect(() => {
    const storedAuth = localStorage.getItem('dashboardAuth');
    if (storedAuth === 'true') {
      setIsAuthorized(true);
    }
  }, []);

  useEffect(() => {
    // Load initial data
    const data = getPortfolioData();
    setPortfolioData(data);

    // Listen for portfolio data updates
    const handleUpdate = (event) => {
      setPortfolioData(event.detail);
    };
    window.addEventListener('portfolioDataUpdated', handleUpdate);
    return () => window.removeEventListener('portfolioDataUpdated', handleUpdate);
  }, []);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (
      loginForm.username.trim() === 'NPT1009' &&
      loginForm.password === 'Napi@1009'
    ) {
      setIsAuthorized(true);
      localStorage.setItem('dashboardAuth', 'true');
      setLoginError('');
      setLoginForm({ username: '', password: '' });
    } else {
      setLoginError('Invalid username or password. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dashboardAuth');
    setIsAuthorized(false);
    setLoginForm({ username: '', password: '' });
    setLoginError('');
  };

  const handleInputChange = (section, field, value, index = null) => {
    setPortfolioData(prev => {
      const newData = { ...prev };
      if (index !== null && Array.isArray(newData[section])) {
        newData[section] = [...newData[section]];
        newData[section][index] = { ...newData[section][index], [field]: value };
      } else if (field.includes('.')) {
        const [parent, child] = field.split('.');
        newData[section] = { ...newData[section], [parent]: { ...newData[section][parent], [child]: value } };
      } else {
        newData[section] = { ...newData[section], [field]: value };
      }
      return newData;
    });
  };

  const handleArrayItemChange = (section, index, field, value) => {
    setPortfolioData(prev => {
      const newData = { ...prev };
      newData[section] = [...newData[section]];
      newData[section][index] = { ...newData[section][index], [field]: value };
      return newData;
    });
  };

  const addArrayItem = (section, template) => {
    setPortfolioData(prev => {
      const newData = { ...prev };
      // Add new item at the beginning of the array so it appears at the top
      newData[section] = [{ ...template, id: Date.now() }, ...(newData[section] || [])];
      return newData;
    });
  };

  const removeArrayItem = (section, index) => {
    setPortfolioData(prev => {
      const newData = { ...prev };
      newData[section] = newData[section].filter((_, i) => i !== index);
      return newData;
    });
  };

  const moveArrayItemUp = (section, index) => {
    if (index <= 0) return;
    setPortfolioData(prev => {
      const newData = { ...prev };
      const arr = [...(newData[section] || [])];
      const temp = arr[index];
      arr[index] = arr[index - 1];
      arr[index - 1] = temp;
      newData[section] = arr;
      return newData;
    });
  };

  const moveArrayItemDown = (section, index) => {
    setPortfolioData(prev => {
      const newData = { ...prev };
      const arr = [...(newData[section] || [])];
      if (index >= arr.length - 1) return prev;
      const temp = arr[index];
      arr[index] = arr[index + 1];
      arr[index + 1] = temp;
      newData[section] = arr;
      return newData;
    });
  };

  // Debounce save function to prevent rapid saves
  const [saveTimeout, setSaveTimeout] = useState(null);
  
  const handleSave = async () => {
    // Clear any pending save
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    // Debounce: wait 1 second before actually saving
    const timeout = setTimeout(async () => {
      setIsSaving(true);
      try {
        const result = await savePortfolioData(portfolioData);
        setSaveStatus(result.message);
        if (result.requiresManualUpdate) {
          // Auto-export JSON file if manual update is required
          setTimeout(() => {
            exportPortfolioData(result.data);
            setSaveStatus(result.message + ' JSON file downloaded automatically. Upload it to GitHub.');
          }, 500);
        }
        setTimeout(() => {
          setSaveStatus('');
          setIsSaving(false);
        }, result.requiresManualUpdate ? 5000 : 2000);
      } catch (error) {
        let errorMessage = 'Error: ' + error.message;
        
        // Handle rate limiting errors specifically
        if (error.message && (error.message.includes('429') || error.message.includes('Rate limit'))) {
          errorMessage = '⚠️ Rate limit exceeded. The system will automatically retry. Please wait a few minutes, or export JSON and upload manually.';
        }
        
        setSaveStatus(errorMessage);
        setIsSaving(false);
        setTimeout(() => setSaveStatus(''), 8000);
      }
    }, 1000);
    
    setSaveTimeout(timeout);
    setSaveStatus('⏳ Preparing to save...');
  };

  const handleExport = () => {
    exportPortfolioData(portfolioData);
    setSaveStatus('JSON file exported successfully!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      importPortfolioData(file)
        .then(data => {
          setPortfolioData(data);
          setSaveStatus('JSON file imported successfully!');
          setTimeout(() => setSaveStatus(''), 3000);
        })
        .catch(error => {
          setSaveStatus('Error: ' + error.message);
          setTimeout(() => setSaveStatus(''), 3000);
        });
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-lg border border-cyan-500/30 rounded-2xl p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-400 mb-2">
              Admin Access
            </p>
            <h1 className="text-3xl font-bold text-white">Portfolio Dashboard</h1>
            <p className="text-gray-400 mt-2 text-sm">
              Please enter your credentials to continue.
            </p>
          </div>
          <form className="space-y-5" onSubmit={handleLoginSubmit}>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Username</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-3 bg-black/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                placeholder="Enter username"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 bg-black/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
            </div>
            {loginError && (
              <p className="text-red-400 text-sm">{loginError}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-semibold tracking-wide hover:opacity-90 transition-opacity"
            >
              Sign In
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-6 text-center">
            Authorized access only. All actions are monitored.
          </p>
        </div>
      </div>
    );
  }

  if (!portfolioData) {
    return <div className="p-8 text-white bg-gray-900 min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const menuItems = [
    { id: 'analytics', label: 'Analytics & Traffic', icon: '📊' },
    { id: 'animation', label: '3D Animations & Theme', icon: '🎨' },
    { id: 'navigation', label: 'Navigation & Sections', icon: '🧭' },
    { id: 'profile', label: 'Home', icon: '🏠' },
    { id: 'about', label: 'About', icon: '👤' },
    { id: 'skills', label: 'Skills', icon: '⚙️' },
    { id: 'certifications', label: 'Certifications', icon: '🏆' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'projects', label: 'Portfolio', icon: '📁' },
    { id: 'contact', label: 'Contact', icon: '📧' }
  ];

  // Render preview
  if (showPreview) {
    return (
      <div className="min-h-screen bg-black overflow-x-hidden">
        <div className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md p-4 z-50 flex justify-between items-center border-b border-gray-700 shadow-lg">
          <h2 className="text-xl font-bold text-white">Portfolio Preview</h2>
          <button
            onClick={() => setShowPreview(false)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
        <div className="pt-20">
          {/* Smooth scroll behavior */}
          <style>{`
            html {
              scroll-behavior: smooth;
            }
            #profile, #about, #skills, #certifications, #education, #experience, #projects, #contact {
              scroll-margin-top: 80px;
            }
          `}</style>
          <Profile />
          <About />
          <Skills />
          <Certifications />
          <Education />
          <Experience />
          <Projects />
          <Contact />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex relative">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-gray-800 border-r border-gray-700 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 md:p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg md:text-xl font-bold text-cyan-400">Portfolio Admin Dashboard</h1>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-xs md:text-sm text-gray-400">Signed in as NPT1009</p>
          <button
            onClick={() => setShowGitHubSettings(!showGitHubSettings)}
            className="mt-3 w-full px-4 py-2 text-sm font-semibold rounded-lg bg-gray-900 text-gray-300 border border-gray-700 hover:border-cyan-400 hover:text-white transition-colors"
          >
            {githubToken ? '✓' : '⚙️'} GitHub Sync
          </button>
          <button
            onClick={handleLogout}
            className="mt-2 w-full px-4 py-2 text-sm font-semibold rounded-lg bg-gray-900 text-gray-300 border border-gray-700 hover:border-red-400 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false); // Close mobile menu when item is selected
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all duration-200 text-sm md:text-base ${
                activeTab === item.id
                  ? 'bg-cyan-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full md:w-auto">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-3 md:p-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 text-gray-400 hover:text-white"
              >
                ☰
              </button>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.hash = '';
                  window.location.reload();
                }}
                className="px-3 md:px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs md:text-sm whitespace-nowrap"
              >
                ← Back
              </a>
              <h2 className="text-2xl md:text-lg font-semibold text-cyan-400 truncate">
                {menuItems.find(item => item.id === activeTab)?.label} Editor
              </h2>
            </div>
            <div className="flex gap-2 md:gap-3 flex-wrap">
              <button
                onClick={() => setShowPreview(true)}
                className="px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs md:text-sm font-semibold flex items-center gap-1 md:gap-2"
              >
                <span>👁️</span>
                <span className="hidden sm:inline">Preview</span>
              </button>
              <label className="px-3 md:px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-xs md:text-sm cursor-pointer font-semibold flex items-center gap-1 md:gap-2">
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                <span>📥</span>
                <span className="hidden sm:inline">Import</span>
              </label>
              <button
                onClick={handleExport}
                className="px-3 md:px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg text-xs md:text-sm font-semibold flex items-center gap-1 md:gap-2"
              >
                <span>📤</span>
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {saveStatus && (
          <div className={`p-4 ${saveStatus.includes('Error') || saveStatus.includes('⚠️') ? 'bg-yellow-600' : saveStatus.includes('Error') ? 'bg-red-600' : 'bg-green-600'}`}>
            {saveStatus}
          </div>
        )}

        {/* GitHub Settings Panel */}
        {showGitHubSettings && (
          <div className="bg-gray-800 border-b border-gray-700 p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-cyan-400 mb-4">GitHub API Sync Configuration</h3>
            <p className="text-xs md:text-sm text-gray-400 mb-4">
              Configure GitHub API token to automatically sync changes across all devices. 
              Without a token, you'll need to manually export and upload the JSON file.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs md:text-sm text-gray-300 mb-2">GitHub Personal Access Token</label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full p-2 md:p-3 bg-gray-700 border border-gray-600 rounded-lg text-sm md:text-base text-white focus:border-cyan-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  <a 
                    href="https://github.com/settings/tokens/new?scopes=repo&description=Portfolio%20Admin%20Dashboard" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline"
                  >
                    Create a token here
                  </a> with <code className="bg-gray-900 px-1 rounded">repo</code> scope
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                <button
                  onClick={() => {
                    if (githubToken) {
                      localStorage.setItem('githubToken', githubToken);
                      setSaveStatus('✅ GitHub token saved! Changes will now sync automatically.');
                    } else {
                      localStorage.removeItem('githubToken');
                      setSaveStatus('GitHub token removed.');
                    }
                    setShowGitHubSettings(false);
                    setTimeout(() => setSaveStatus(''), 3000);
                  }}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold"
                >
                  Save Token
                </button>
                <button
                  onClick={() => {
                    setGithubToken('');
                    localStorage.removeItem('githubToken');
                    setShowGitHubSettings(false);
                    setSaveStatus('GitHub token cleared.');
                    setTimeout(() => setSaveStatus(''), 3000);
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-gray-900">
          {/* Analytics & Traffic Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div>
                  <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                    <span>📊</span> Visitor Analytics & Traffic Insights
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Real-time tracking of visitor IPs, locations, devices, browsers, and session timestamps.
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <select
                    value={analyticsFilter}
                    onChange={(e) => setAnalyticsFilter(e.target.value)}
                    className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week (Last 7 Days)</option>
                    <option value="month">This Month (Last 30 Days)</option>
                  </select>
                  <button
                    onClick={() => exportAnalyticsCSV(filteredSessions)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm flex items-center gap-2 transition-colors"
                  >
                    <span>📥</span> Export CSV Report
                  </button>
                </div>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
                  <p className="text-gray-400 text-sm font-medium">Total Visits</p>
                  <h3 className="text-3xl font-extrabold text-white mt-1">{filteredSessions.length}</h3>
                  <p className="text-xs text-cyan-400 mt-2">Sessions recorded</p>
                </div>
                <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
                  <p className="text-gray-400 text-sm font-medium">Today's Visits</p>
                  <h3 className="text-3xl font-extrabold text-cyan-400 mt-1">{todayCount}</h3>
                  <p className="text-xs text-gray-400 mt-2">{new Date().toLocaleDateString()}</p>
                </div>
                <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
                  <p className="text-gray-400 text-sm font-medium">Mobile Traffic</p>
                  <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">{mobilePercent}%</h3>
                  <p className="text-xs text-gray-400 mt-2">{mobileCount} mobile visitors</p>
                </div>
                <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
                  <p className="text-gray-400 text-sm font-medium">Desktop Traffic</p>
                  <h3 className="text-3xl font-extrabold text-blue-400 mt-1">{desktopPercent}%</h3>
                  <p className="text-xs text-gray-400 mt-2">{desktopCount} desktop visitors</p>
                </div>
              </div>

              {/* Visitor Logs Table */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                  <h3 className="font-bold text-lg text-white">Recent Visitor Sessions ({filteredSessions.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-300">
                    <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3">Date & Time</th>
                        <th className="px-4 py-3">IP Address</th>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3">Device</th>
                        <th className="px-4 py-3">Browser / OS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {filteredSessions.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-4 py-6 text-center text-gray-400">
                            No visitor sessions recorded for this filter range yet.
                          </td>
                        </tr>
                      ) : (
                        filteredSessions.slice(0, 50).map((s) => (
                          <tr key={s.id} className="hover:bg-gray-750 transition-colors">
                            <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                              {s.date} <span className="text-gray-400 text-xs ml-1">{s.time}</span>
                            </td>
                            <td className="px-4 py-3 font-mono text-cyan-400 whitespace-nowrap">{s.ip}</td>
                            <td className="px-4 py-3 whitespace-nowrap">📍 {s.location}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.device === 'Mobile' ? 'bg-purple-900/60 text-purple-300' : s.device === 'Tablet' ? 'bg-amber-900/60 text-amber-300' : 'bg-blue-900/60 text-blue-300'}`}>
                                {s.device === 'Mobile' ? '📱 Mobile' : s.device === 'Tablet' ? '📟 Tablet' : '💻 Desktop'}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                              {s.browser} ({s.os})
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3D Animations & Theme Tab */}
          {activeTab === 'animation' && (
            <div className="space-y-6">
              <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                    <span>🎨</span> 3D Background Animations (15 Presets)
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Choose a fixed 3D animation preset or enable Auto-Random rotation to cycle through stunning 3D scenes.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Select 3D Animation Preset (15 Presets)</label>
                    <select
                      value={portfolioData.animationConfig?.preset || 'icosahedron'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPortfolioData(prev => ({
                          ...prev,
                          animationConfig: {
                            ...(prev.animationConfig || {}),
                            preset: val
                          }
                        }));
                      }}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:border-cyan-400 focus:outline-none"
                    >
                      {THREE_PRESETS.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Auto-Random 3D Rotation</label>
                    <div className="flex items-center gap-4 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setPortfolioData(prev => ({
                            ...prev,
                            animationConfig: {
                              ...(prev.animationConfig || {}),
                              autoRandom: !(prev.animationConfig?.autoRandom)
                            }
                          }));
                        }}
                        className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                          portfolioData.animationConfig?.autoRandom
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        {portfolioData.animationConfig?.autoRandom ? '⚡ Auto-Random: Enabled' : '⏸️ Fixed Preset'}
                      </button>

                      {portfolioData.animationConfig?.autoRandom && (
                        <select
                          value={portfolioData.animationConfig?.changeInterval || 20}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setPortfolioData(prev => ({
                              ...prev,
                              animationConfig: {
                                ...(prev.animationConfig || {}),
                                changeInterval: val
                              }
                            }));
                          }}
                          className="p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none"
                        >
                          <option value={10}>Every 10 seconds</option>
                          <option value={20}>Every 20 seconds</option>
                          <option value={30}>Every 30 seconds</option>
                          <option value={60}>Every 1 minute</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Live 3D Preview Window */}
              <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
                <div className="p-4 bg-gray-900 border-b border-gray-700 flex justify-between items-center">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <span>👁️</span> Live 3D Canvas Preview
                  </h3>
                  <span className="text-xs text-cyan-400 font-mono">
                    Active: {THREE_PRESETS.find(p => p.id === (portfolioData.animationConfig?.preset || 'icosahedron'))?.name}
                  </span>
                </div>
                <div className="relative w-full h-80 bg-black overflow-hidden flex items-center justify-center">
                  <ThreeCanvas
                    preset={portfolioData.animationConfig?.preset || 'icosahedron'}
                    autoRandom={portfolioData.animationConfig?.autoRandom || false}
                    changeInterval={portfolioData.animationConfig?.changeInterval || 20}
                    className="absolute inset-0 z-0"
                  />
                  <div className="relative z-10 text-center pointer-events-none p-4 bg-black/40 backdrop-blur-sm rounded-xl border border-white/10">
                    <h4 className="text-xl font-bold text-white">Live 3D Animation Preview</h4>
                    <p className="text-xs text-gray-300 mt-1">This animation will render live behind your portfolio hero section!</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation & Custom Sections Tab */}
          {activeTab === 'navigation' && (
            <div className="space-y-8">
              {/* Section 1: Customize Navbar Labels */}
              <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl space-y-4">
                <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
                  <span>🏷️</span> Rename Navbar Section Labels
                </h2>
                <p className="text-sm text-gray-400">
                  Change how section names appear in the top Navbar menu (on Desktop and Mobile).
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { key: 'profile', label: 'Profile / Home Section', defaultVal: 'Profile' },
                    { key: 'about', label: 'About Section', defaultVal: 'About' },
                    { key: 'skills', label: 'Skills Section', defaultVal: 'Skills' },
                    { key: 'certifications', label: 'Certifications Section', defaultVal: 'Certifications' },
                    { key: 'education', label: 'Education Section', defaultVal: 'Education' },
                    { key: 'experience', label: 'Experience Section', defaultVal: 'Experience' },
                    { key: 'projects', label: 'Portfolio / Projects Section', defaultVal: 'Projects' },
                    { key: 'contact', label: 'Contact Section', defaultVal: 'Contact' },
                  ].map(({ key, label, defaultVal }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">{label}</label>
                      <input
                        type="text"
                        value={portfolioData.navLabels?.[key] ?? defaultVal}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPortfolioData(prev => ({
                            ...prev,
                            navLabels: {
                              ...(prev.navLabels || {}),
                              [key]: val
                            }
                          }));
                        }}
                        className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: Custom Dynamic Sections */}
              <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-700 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
                      <span>➕</span> Add Custom Sections (Mobile Responsive)
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                      Create new custom sections on your website (e.g. Services, Research, Hobbies, Open Source). They will automatically appear in your Navbar and Page!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPortfolioData(prev => {
                        const newCustom = [...(prev.customSections || [])];
                        newCustom.push({
                          id: Date.now(),
                          title: 'New Custom Section',
                          subtitle: '',
                          content: '',
                          enabled: true
                        });
                        return { ...prev, customSections: newCustom };
                      });
                    }}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg text-sm"
                  >
                    + Add New Section
                  </button>
                </div>

                <div className="space-y-6">
                  {(!portfolioData.customSections || portfolioData.customSections.length === 0) ? (
                    <p className="text-sm text-gray-400 italic text-center py-4">
                      No custom sections created yet. Click "+ Add New Section" to create one!
                    </p>
                  ) : (
                    portfolioData.customSections.map((sec, index) => (
                      <div key={sec.id} className="bg-gray-750 border border-gray-700 p-5 rounded-xl space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-white text-lg">Custom Section #{index + 1}</h3>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPortfolioData(prev => {
                                  const newCustom = [...prev.customSections];
                                  newCustom[index].enabled = !newCustom[index].enabled;
                                  return { ...prev, customSections: newCustom };
                                });
                              }}
                              className={`px-3 py-1 rounded text-xs font-bold ${sec.enabled !== false ? 'bg-emerald-600/80 text-emerald-100' : 'bg-gray-600 text-gray-400'}`}
                            >
                              {sec.enabled !== false ? '👁️ Active' : '🙈 Hidden'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPortfolioData(prev => {
                                  const newCustom = prev.customSections.filter((_, i) => i !== index);
                                  return { ...prev, customSections: newCustom };
                                });
                              }}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">Section Title</label>
                            <input
                              type="text"
                              value={sec.title}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPortfolioData(prev => {
                                  const newCustom = [...prev.customSections];
                                  newCustom[index].title = val;
                                  return { ...prev, customSections: newCustom };
                                });
                              }}
                              className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none"
                              placeholder="e.g. Services / Research Projects"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">Subtitle (Optional)</label>
                            <input
                              type="text"
                              value={sec.subtitle || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPortfolioData(prev => {
                                  const newCustom = [...prev.customSections];
                                  newCustom[index].subtitle = val;
                                  return { ...prev, customSections: newCustom };
                                });
                              }}
                              className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none"
                              placeholder="e.g. What I offer to clients"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-300 mb-1">Section Content / Description</label>
                            <textarea
                              value={sec.content}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPortfolioData(prev => {
                                  const newCustom = [...prev.customSections];
                                  newCustom[index].content = val;
                                  return { ...prev, customSections: newCustom };
                                });
                              }}
                              className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white h-28 focus:outline-none"
                              placeholder="Type details about this section..."
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h2 className="text-2xl md:text-2xl font-bold mb-4">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm md:text-base font-medium">Name</label>
                  <input
                    type="text"
                    value={portfolioData.profile.name}
                    onChange={(e) => handleInputChange('profile', 'name', e.target.value)}
                    className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm md:text-base font-medium">Title</label>
                  <input
                    type="text"
                    value={portfolioData.profile.title}
                    onChange={(e) => handleInputChange('profile', 'title', e.target.value)}
                    className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block mb-2 text-sm md:text-base font-medium">Description</label>
                  <textarea
                    value={portfolioData.profile.description}
                    onChange={(e) => handleInputChange('profile', 'description', e.target.value)}
                    className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg h-24 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block mb-2 text-sm md:text-base font-medium">Default Profile Image URL</label>
                  <input
                    type="text"
                    value={portfolioData.profile.profileImage}
                    onChange={(e) => handleInputChange('profile', 'profileImage', e.target.value)}
                    className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                    placeholder="/pro.png or Google Drive link"
                  />
                  <p className="text-xs text-gray-500 mt-1">Supports Google Drive links, local paths, and external image URLs</p>
                </div>

                {/* Multiple Profile Images Manager */}
                <div className="col-span-2 bg-gray-800 border border-gray-700 p-4 rounded-xl space-y-4 my-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-cyan-400">🖼️ Multiple Profile Images (Slideshow / Hide/Unhide)</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        Add multiple images for an auto-switching profile slideshow. Click Active/Hidden to show/hide images.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPortfolioData(prev => {
                          const currentImages = (prev.profile.profileImages || []).length > 0 
                            ? prev.profile.profileImages 
                            : [{ id: 1, url: prev.profile.profileImage || '/pro.png', enabled: true }];
                          const newImages = [...currentImages, { id: Date.now(), url: '', enabled: true }];
                          return {
                            ...prev,
                            profile: {
                              ...prev.profile,
                              profileImages: newImages
                            }
                          };
                        });
                      }}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-xs font-semibold whitespace-nowrap"
                    >
                      + Add Image
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {((portfolioData.profile.profileImages && portfolioData.profile.profileImages.length > 0) 
                      ? portfolioData.profile.profileImages 
                      : [{ id: 1, url: portfolioData.profile.profileImage || '/pro.png', enabled: true }]).map((imgObj, idx) => (
                      <div key={imgObj.id || idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-gray-750 p-2.5 rounded-lg border border-gray-700">
                        <span className="text-xs text-gray-400 font-mono hidden sm:inline">#{idx + 1}</span>
                        <input
                          type="text"
                          value={typeof imgObj === 'string' ? imgObj : imgObj.url}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPortfolioData(prev => {
                              const images = [...(prev.profile.profileImages || [{ id: 1, url: prev.profile.profileImage, enabled: true }])];
                              images[idx] = typeof images[idx] === 'object' ? { ...images[idx], url: val } : { id: Date.now(), url: val, enabled: true };
                              return {
                                ...prev,
                                profile: {
                                  ...prev.profile,
                                  profileImage: idx === 0 ? val : prev.profile.profileImage,
                                  profileImages: images
                                }
                              };
                            });
                          }}
                          className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none"
                          placeholder="/pro.png or Google Drive link"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setPortfolioData(prev => {
                                const images = [...(prev.profile.profileImages || [])];
                                const cur = images[idx];
                                const isEnabled = typeof cur === 'object' ? cur.enabled !== false : true;
                                images[idx] = typeof cur === 'object' ? { ...cur, enabled: !isEnabled } : { id: Date.now(), url: cur, enabled: false };
                                return {
                                  ...prev,
                                  profile: { ...prev.profile, profileImages: images }
                                };
                              });
                            }}
                            className={`px-3 py-1.5 rounded text-xs font-bold ${ (typeof imgObj === 'object' ? imgObj.enabled !== false : true) ? 'bg-emerald-600/80 text-emerald-100' : 'bg-gray-600 text-gray-400'}`}
                            title="Toggle Hide / Unhide"
                          >
                            {(typeof imgObj === 'object' ? imgObj.enabled !== false : true) ? '👁️ Active' : '🙈 Hidden'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPortfolioData(prev => {
                                const images = (prev.profile.profileImages || []).filter((_, i) => i !== idx);
                                return {
                                  ...prev,
                                  profile: { ...prev.profile, profileImages: images }
                                };
                              });
                            }}
                            className="px-2.5 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block mb-2 text-sm md:text-base font-medium">GitHub URL</label>
                  <input
                    type="text"
                    value={portfolioData.profile.socialLinks.github}
                    onChange={(e) => handleInputChange('profile', 'socialLinks.github', e.target.value)}
                    className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm md:text-base font-medium">LinkedIn URL</label>
                  <input
                    type="text"
                    value={portfolioData.profile.socialLinks.linkedin}
                    onChange={(e) => handleInputChange('profile', 'socialLinks.linkedin', e.target.value)}
                    className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm md:text-base font-medium">Email</label>
                  <input
                    type="email"
                    value={portfolioData.profile.socialLinks.email}
                    onChange={(e) => handleInputChange('profile', 'socialLinks.email', e.target.value)}
                    className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm md:text-base font-medium">CV URL</label>
                  <input
                    type="text"
                    value={portfolioData.profile.socialLinks.cv}
                    onChange={(e) => handleInputChange('profile', 'socialLinks.cv', e.target.value)}
                    className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block mb-2 text-sm md:text-base font-medium">Typing Words (comma separated)</label>
                  <input
                    type="text"
                    value={portfolioData.profile.typingWords.join(', ')}
                    onChange={(e) => handleInputChange('profile', 'typingWords', e.target.value.split(',').map(w => w.trim()))}
                    className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                    placeholder="Engineering Technology Student, Web Developer, ..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              <h2 className="text-2xl md:text-2xl font-bold mb-4">About Section</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm md:text-base font-medium">Title</label>
                  <input
                    type="text"
                    value={portfolioData.about.title}
                    onChange={(e) => handleInputChange('about', 'title', e.target.value)}
                    className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm md:text-base font-medium">Subtitle</label>
                  <input
                    type="text"
                    value={portfolioData.about.subtitle}
                    onChange={(e) => handleInputChange('about', 'subtitle', e.target.value)}
                    className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block mb-2 text-sm md:text-base font-medium">Description</label>
                  <textarea
                    value={portfolioData.about.description}
                    onChange={(e) => handleInputChange('about', 'description', e.target.value)}
                    className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg h-32 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block mb-2 text-sm md:text-base font-medium">About Image URL</label>
                  <input
                    type="text"
                    value={portfolioData.about.image}
                    onChange={(e) => handleInputChange('about', 'image', e.target.value)}
                    className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                    placeholder="/pro2.png"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h2 className="text-2xl md:text-2xl font-bold">Skills</h2>
                <button
                  onClick={() => addArrayItem('skills', {
                    id: Date.now(),
                    icon: 'fa-solid fa-code',
                    iconUrl: '',
                    title: 'New Skill Category',
                    skills: []
                  })}
                  className="w-full sm:w-auto px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm md:text-base"
                >
                  Add Skill Category
                </button>
              </div>
              {portfolioData.skills.map((skill, index) => (
                <div key={skill.id} className="border border-gray-700 rounded-lg p-3 md:p-4 bg-gray-800">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                    <h3 className="text-xl md:text-xl font-semibold">Skill Category {index + 1}</h3>
                    <button
                      onClick={() => removeArrayItem('skills', index)}
                      className="w-full sm:w-auto px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-sm md:text-base font-medium">Title</label>
                      <input
                        type="text"
                        value={skill.title}
                        onChange={(e) => handleArrayItemChange('skills', index, 'title', e.target.value)}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm md:text-base font-medium">Icon URL</label>
                      <input
                        type="text"
                        value={skill.iconUrl || ''}
                        onChange={(e) => handleArrayItemChange('skills', index, 'iconUrl', e.target.value)}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                        placeholder="https://cdn.jsdelivr.net/... or Google Drive link"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Supports: Direct image URLs, Google Drive links, CDN links (jsdelivr, etc.), and Wikipedia/Wikimedia Commons URLs.
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="block mb-2 text-sm md:text-base font-medium">Skills (comma separated)</label>
                      <input
                        type="text"
                        value={skill.skills.join(', ')}
                        onChange={(e) => handleArrayItemChange('skills', index, 'skills', e.target.value.split(',').map(s => s.trim()))}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                        placeholder="Python, Java, C, ..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Certifications Tab */}
          {activeTab === 'certifications' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h2 className="text-2xl md:text-2xl font-bold">Certifications</h2>
                <button
                  onClick={() => addArrayItem('certifications', {
                    id: Date.now(),
                    icon: 'fa-solid fa-certificate',
                    logo: '',
                    logoFallback: '',
                    credentialId: '',
                    title: 'New Certification',
                    provider: '',
                    date: '',
                    link: '',
                    credentialUrl: '',
                    skills: []
                  })}
                  className="w-full sm:w-auto px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm md:text-base"
                >
                  Add Certification
                </button>
              </div>
              {portfolioData.certifications.map((cert, index) => (
                <div key={cert.id} className="border border-gray-700 rounded-lg p-3 md:p-4 bg-gray-800">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                    <h3 className="text-xl md:text-xl font-semibold">Certification {index + 1}</h3>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => moveArrayItemUp('certifications', index)}
                        disabled={index === 0}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm font-semibold"
                        title="Move Up"
                      >
                        ⬆️ Up
                      </button>
                      <button
                        onClick={() => moveArrayItemDown('certifications', index)}
                        disabled={index === portfolioData.certifications.length - 1}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm font-semibold"
                        title="Move Down"
                      >
                        ⬇️ Down
                      </button>
                      <button
                        onClick={() => removeArrayItem('certifications', index)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-1">
                      <label className="block mb-2 text-sm md:text-base">Title</label>
                      <input
                        type="text"
                        value={cert.title}
                        onChange={(e) => handleArrayItemChange('certifications', index, 'title', e.target.value)}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block mb-2 text-sm md:text-base">Provider</label>
                      <input
                        type="text"
                        value={cert.provider}
                        onChange={(e) => handleArrayItemChange('certifications', index, 'provider', e.target.value)}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block mb-2 text-sm md:text-base">Credential ID</label>
                      <input
                        type="text"
                        value={cert.credentialId || ''}
                        onChange={(e) => handleArrayItemChange('certifications', index, 'credentialId', e.target.value)}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block mb-2 text-sm md:text-base">Date</label>
                      <input
                        type="text"
                        value={cert.date}
                        onChange={(e) => handleArrayItemChange('certifications', index, 'date', e.target.value)}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                        placeholder="May 2024"
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block mb-2 text-sm md:text-base font-medium">View Credential URL</label>
                      <input
                        type="url"
                        value={cert.link || cert.credentialUrl || ''}
                        onChange={(e) => {
                          // Store in 'link' field (component checks link first, then credentialUrl)
                          handleArrayItemChange('certifications', index, 'link', e.target.value);
                        }}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                        placeholder="https://www.coursera.org/verify/... or https://www.udemy.com/certificate/..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter the full URL where users can view/verify the certificate. This will be used for the "View credential" button. Leave empty if no verification link is available.
                      </p>
                    </div>
                    <div className="md:col-span-1">
                      <label className="block mb-2 text-sm md:text-base">Logo URL</label>
                      <input
                        type="text"
                        value={cert.logo}
                        onChange={(e) => handleArrayItemChange('certifications', index, 'logo', e.target.value)}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                        placeholder="/logo.png"
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block mb-2 text-sm md:text-base font-medium">Logo Fallback URL</label>
                      <input
                        type="text"
                        value={cert.logoFallback}
                        onChange={(e) => handleArrayItemChange('certifications', index, 'logoFallback', e.target.value)}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                        placeholder="Direct image URL"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        For Wikipedia images, use direct Commons URL (upload.wikimedia.org/...) instead of page URL. Code will attempt to auto-convert.
                      </p>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block mb-2 text-sm md:text-base font-medium">Skills (comma separated)</label>
                      <input
                        type="text"
                        value={cert.skills.join(', ')}
                        onChange={(e) => handleArrayItemChange('certifications', index, 'skills', e.target.value.split(',').map(s => s.trim()))}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                        placeholder="HTML, CSS, JavaScript, ..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Education Tab */}
          {activeTab === 'education' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h2 className="text-2xl md:text-2xl font-bold">Education</h2>
                <button
                  onClick={() => addArrayItem('education', {
                    id: Date.now(),
                    institution: '',
                    degree: '',
                    period: '',
                    logo: ''
                  })}
                  className="w-full sm:w-auto px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm md:text-base"
                >
                  Add Education
                </button>
              </div>
              {portfolioData.education.map((edu, index) => (
                <div key={edu.id} className="border border-gray-700 rounded-lg p-3 md:p-4 bg-gray-800">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                    <h3 className="text-xl md:text-xl font-semibold">Education {index + 1}</h3>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => moveArrayItemUp('education', index)}
                        disabled={index === 0}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm font-semibold"
                        title="Move Up"
                      >
                        ⬆️ Up
                      </button>
                      <button
                        onClick={() => moveArrayItemDown('education', index)}
                        disabled={index === portfolioData.education.length - 1}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm font-semibold"
                        title="Move Down"
                      >
                        ⬇️ Down
                      </button>
                      <button
                        onClick={() => removeArrayItem('education', index)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-sm md:text-base font-medium">Institution</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleArrayItemChange('education', index, 'institution', e.target.value)}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm md:text-base font-medium">Period</label>
                      <input
                        type="text"
                        value={edu.period}
                        onChange={(e) => handleArrayItemChange('education', index, 'period', e.target.value)}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block mb-2 text-sm md:text-base font-medium">Degree/Description</label>
                      <textarea
                        value={edu.degree}
                        onChange={(e) => handleArrayItemChange('education', index, 'degree', e.target.value)}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-700 border border-gray-600 rounded-lg h-20 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block mb-2 text-sm md:text-base font-medium">Logo URL</label>
                      <input
                        type="text"
                        value={edu.logo}
                        onChange={(e) => handleArrayItemChange('education', index, 'logo', e.target.value)}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                        placeholder="/logo.png or https://example.com/logo.png"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Supports local paths (/logo.png), external URLs, Google Drive links, and Wikipedia URLs (auto-converted)
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Experience Tab */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h2 className="text-2xl md:text-2xl font-bold">Work Experience</h2>
                <button
                  onClick={() => addArrayItem('experience', {
                    id: Date.now(),
                    title: '',
                    company: '',
                    duration: '',
                    description: '',
                    icon: 'fa-solid fa-briefcase',
                    logo: ''
                  })}
                  className="w-full sm:w-auto px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm md:text-base"
                >
                  Add Experience
                </button>
              </div>
              {portfolioData.experience.map((exp, index) => (
                <div key={exp.id} className="border border-gray-700 rounded-lg p-3 md:p-4 bg-gray-800">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                    <h3 className="text-xl md:text-xl font-semibold">Experience {index + 1}</h3>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => moveArrayItemUp('experience', index)}
                        disabled={index === 0}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm font-semibold"
                        title="Move Up"
                      >
                        ⬆️ Up
                      </button>
                      <button
                        onClick={() => moveArrayItemDown('experience', index)}
                        disabled={index === portfolioData.experience.length - 1}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm font-semibold"
                        title="Move Down"
                      >
                        ⬇️ Down
                      </button>
                      <button
                        onClick={() => removeArrayItem('experience', index)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-sm md:text-base font-medium">Job Title</label>
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => handleArrayItemChange('experience', index, 'title', e.target.value)}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm md:text-base font-medium">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleArrayItemChange('experience', index, 'company', e.target.value)}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm md:text-base font-medium">Duration</label>
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => handleArrayItemChange('experience', index, 'duration', e.target.value)}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                        placeholder="2022 - 2023 (1 Year Experience)"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm md:text-base font-medium">Company Logo URL</label>
                      <input
                        type="text"
                        value={exp.logo}
                        onChange={(e) => handleArrayItemChange('experience', index, 'logo', e.target.value)}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                        placeholder="/logo.png or Google Drive link"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Supports local paths (/logo.png), external URLs, Google Drive links, and Wikipedia URLs (auto-converted)
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="block mb-2 text-sm md:text-base font-medium">Description</label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => handleArrayItemChange('experience', index, 'description', e.target.value)}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-700 border border-gray-600 rounded-lg h-24 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h2 className="text-2xl md:text-2xl font-bold">Projects</h2>
                <button
                  onClick={() => addArrayItem('projects', {
                    id: Date.now(),
                    category: 'web',
                    title: 'New Project',
                    description: '',
                    image: '',
                    tech: [],
                    github: '',
                    live: '#',
                    video: '',
                    date: '',
                    categoryLabel: 'WEB APPLICATION'
                  })}
                  className="w-full sm:w-auto px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm md:text-base"
                >
                  Add Project
                </button>
              </div>
              {portfolioData.projects.map((project, index) => (
                <div key={project.id} className="border border-gray-700 rounded-lg p-3 md:p-4 bg-gray-800">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                    <h3 className="text-xl md:text-xl font-semibold">Project {index + 1}</h3>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => moveArrayItemUp('projects', index)}
                        disabled={index === 0}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm font-semibold"
                        title="Move Up"
                      >
                        ⬆️ Up
                      </button>
                      <button
                        onClick={() => moveArrayItemDown('projects', index)}
                        disabled={index === portfolioData.projects.length - 1}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm font-semibold"
                        title="Move Down"
                      >
                        ⬇️ Down
                      </button>
                      <button
                        onClick={() => removeArrayItem('projects', index)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-sm md:text-base font-medium">Title</label>
                      <input
                        type="text"
                        value={project.title}
                        onChange={(e) => handleArrayItemChange('projects', index, 'title', e.target.value)}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm md:text-base font-medium">Category</label>
                      <select
                        value={project.category}
                        onChange={(e) => handleArrayItemChange('projects', index, 'category', e.target.value)}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="web">Web Development</option>
                        <option value="mobile">Mobile Application</option>
                        <option value="ml">Machine Learning</option>
                        <option value="automation">QA Automation</option>
                        <option value="iot">IoT Systems</option>
                        <option value="desktop">Desktop Application</option>
                        <option value="robotics">Robotics</option>
                        <option value="mechanical">Mechanical Design</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2 text-sm md:text-base font-medium">Category Label</label>
                      <input
                        type="text"
                        value={project.categoryLabel}
                        onChange={(e) => handleArrayItemChange('projects', index, 'categoryLabel', e.target.value)}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm md:text-base font-medium">Date</label>
                      <input
                        type="text"
                        value={project.date}
                        onChange={(e) => handleArrayItemChange('projects', index, 'date', e.target.value)}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                        placeholder="December 2024"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm md:text-base font-medium">Project Image URL</label>
                      <input
                        type="text"
                        value={project.image}
                        onChange={(e) => handleArrayItemChange('projects', index, 'image', e.target.value)}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                        placeholder="/project-image.png or https://example.com/image.png"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Supports local paths (/image.png), external URLs, Google Drive links, and Wikipedia URLs
                      </p>
                    </div>
                    <div>
                      <label className="block mb-2 text-sm md:text-base font-medium">GitHub URL</label>
                      <input
                        type="text"
                        value={project.github}
                        onChange={(e) => handleArrayItemChange('projects', index, 'github', e.target.value)}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm md:text-base font-medium">Live URL</label>
                      <input
                        type="text"
                        value={project.live}
                        onChange={(e) => handleArrayItemChange('projects', index, 'live', e.target.value)}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                        placeholder="# or https://..."
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block mb-2 text-sm md:text-base font-medium">Demo Video URL</label>
                      <input
                        type="text"
                        value={project.video || ''}
                        onChange={(e) => handleArrayItemChange('projects', index, 'video', e.target.value)}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                        placeholder="YouTube, Vimeo, or direct video URL (e.g., https://youtube.com/watch?v=...)"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Supports YouTube, Vimeo, Google Drive videos, or direct video links (mp4, webm, etc.)
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="block mb-2 text-sm md:text-base font-medium">Description</label>
                      <textarea
                        value={project.description}
                        onChange={(e) => handleArrayItemChange('projects', index, 'description', e.target.value)}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-700 border border-gray-600 rounded-lg h-24 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block mb-2 text-sm md:text-base font-medium">Technologies (comma separated)</label>
                      <input
                        type="text"
                        value={project.tech.join(', ')}
                        onChange={(e) => handleArrayItemChange('projects', index, 'tech', e.target.value.split(',').map(t => t.trim()))}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                        placeholder="React, Node.js, MongoDB, ..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <h2 className="text-2xl md:text-2xl font-bold mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm md:text-base font-medium">Email</label>
                  <input
                    type="email"
                    value={portfolioData.contact.email}
                    onChange={(e) => handleInputChange('contact', 'email', e.target.value)}
                    className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm md:text-base font-medium">Phone</label>
                  <input
                    type="text"
                    value={portfolioData.contact.phone}
                    onChange={(e) => handleInputChange('contact', 'phone', e.target.value)}
                    className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block mb-2 text-sm md:text-base font-medium">Location</label>
                  <input
                    type="text"
                    value={portfolioData.contact.location}
                    onChange={(e) => handleInputChange('contact', 'location', e.target.value)}
                    className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-700">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full px-6 md:px-8 py-3 md:py-4 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 rounded-lg text-base md:text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Saving...
                </>
              ) : (
                <>
                  <span>💾</span>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
