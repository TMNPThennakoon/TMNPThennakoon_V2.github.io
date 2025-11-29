import React, { useState, useEffect } from 'react';
import { getPortfolioData, exportPortfolioData, importPortfolioData, savePortfolioData } from '../utils/portfolioData';
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
  const [activeTab, setActiveTab] = useState('profile');
  const [saveStatus, setSaveStatus] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [showGitHubSettings, setShowGitHubSettings] = useState(false);
  const [githubToken, setGithubToken] = useState(localStorage.getItem('githubToken') || '');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleSave = async () => {
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
      setSaveStatus('Error: ' + error.message);
      setIsSaving(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
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
      <div className="min-h-screen bg-black">
        <div className="fixed top-0 left-0 right-0 bg-gray-900 p-4 z-50 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Portfolio Preview</h2>
          <button
            onClick={() => setShowPreview(false)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
        <div className="pt-20">
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
              <h2 className="text-base md:text-lg font-semibold text-cyan-400 truncate">
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
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold mb-4">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Name</label>
                  <input
                    type="text"
                    value={portfolioData.profile.name}
                    onChange={(e) => handleInputChange('profile', 'name', e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-2">Title</label>
                  <input
                    type="text"
                    value={portfolioData.profile.title}
                    onChange={(e) => handleInputChange('profile', 'title', e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block mb-2">Description</label>
                  <textarea
                    value={portfolioData.profile.description}
                    onChange={(e) => handleInputChange('profile', 'description', e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg h-24 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block mb-2">Education Text</label>
                  <textarea
                    value={portfolioData.profile.education}
                    onChange={(e) => handleInputChange('profile', 'education', e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg h-24 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-2">Profile Image URL</label>
                  <input
                    type="text"
                    value={portfolioData.profile.profileImage}
                    onChange={(e) => handleInputChange('profile', 'profileImage', e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                    placeholder="/pro.png"
                  />
                </div>
                <div>
                  <label className="block mb-2">GitHub URL</label>
                  <input
                    type="text"
                    value={portfolioData.profile.socialLinks.github}
                    onChange={(e) => handleInputChange('profile', 'socialLinks.github', e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-2">LinkedIn URL</label>
                  <input
                    type="text"
                    value={portfolioData.profile.socialLinks.linkedin}
                    onChange={(e) => handleInputChange('profile', 'socialLinks.linkedin', e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-2">Email</label>
                  <input
                    type="email"
                    value={portfolioData.profile.socialLinks.email}
                    onChange={(e) => handleInputChange('profile', 'socialLinks.email', e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-2">CV URL</label>
                  <input
                    type="text"
                    value={portfolioData.profile.socialLinks.cv}
                    onChange={(e) => handleInputChange('profile', 'socialLinks.cv', e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block mb-2">Typing Words (comma separated)</label>
                  <input
                    type="text"
                    value={portfolioData.profile.typingWords.join(', ')}
                    onChange={(e) => handleInputChange('profile', 'typingWords', e.target.value.split(',').map(w => w.trim()))}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                    placeholder="Engineering Technology Student, Web Developer, ..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold mb-4">About Section</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Title</label>
                  <input
                    type="text"
                    value={portfolioData.about.title}
                    onChange={(e) => handleInputChange('about', 'title', e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-2">Subtitle</label>
                  <input
                    type="text"
                    value={portfolioData.about.subtitle}
                    onChange={(e) => handleInputChange('about', 'subtitle', e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block mb-2">Description</label>
                  <textarea
                    value={portfolioData.about.description}
                    onChange={(e) => handleInputChange('about', 'description', e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg h-32 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block mb-2">About Image URL</label>
                  <input
                    type="text"
                    value={portfolioData.about.image}
                    onChange={(e) => handleInputChange('about', 'image', e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
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
                <h2 className="text-xl md:text-2xl font-bold">Skills</h2>
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
                    <h3 className="text-lg md:text-xl font-semibold">Skill Category {index + 1}</h3>
                    <button
                      onClick={() => removeArrayItem('skills', index)}
                      className="w-full sm:w-auto px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2">Title</label>
                      <input
                        type="text"
                        value={skill.title}
                        onChange={(e) => handleArrayItemChange('skills', index, 'title', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Icon URL</label>
                      <input
                        type="text"
                        value={skill.iconUrl}
                        onChange={(e) => handleArrayItemChange('skills', index, 'iconUrl', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block mb-2">Skills (comma separated)</label>
                      <input
                        type="text"
                        value={skill.skills.join(', ')}
                        onChange={(e) => handleArrayItemChange('skills', index, 'skills', e.target.value.split(',').map(s => s.trim()))}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
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
                <h2 className="text-xl md:text-2xl font-bold">Certifications</h2>
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
                    <h3 className="text-lg md:text-xl font-semibold">Certification {index + 1}</h3>
                    <button
                      onClick={() => removeArrayItem('certifications', index)}
                      className="w-full sm:w-auto px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2">Title</label>
                      <input
                        type="text"
                        value={cert.title}
                        onChange={(e) => handleArrayItemChange('certifications', index, 'title', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Provider</label>
                      <input
                        type="text"
                        value={cert.provider}
                        onChange={(e) => handleArrayItemChange('certifications', index, 'provider', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Credential ID</label>
                      <input
                        type="text"
                        value={cert.credentialId}
                        onChange={(e) => handleArrayItemChange('certifications', index, 'credentialId', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Date</label>
                      <input
                        type="text"
                        value={cert.date}
                        onChange={(e) => handleArrayItemChange('certifications', index, 'date', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                        placeholder="May 2024"
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Logo URL</label>
                      <input
                        type="text"
                        value={cert.logo}
                        onChange={(e) => handleArrayItemChange('certifications', index, 'logo', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                        placeholder="/logo.png"
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Logo Fallback URL</label>
                      <input
                        type="text"
                        value={cert.logoFallback}
                        onChange={(e) => handleArrayItemChange('certifications', index, 'logoFallback', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                        placeholder="Direct image URL (for Wikipedia: use upload.wikimedia.org URL, not wikipedia.org page)"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        For Wikipedia images, use direct Commons URL (upload.wikimedia.org/...) instead of page URL. Code will attempt to auto-convert.
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="block mb-2">Skills (comma separated)</label>
                      <input
                        type="text"
                        value={cert.skills.join(', ')}
                        onChange={(e) => handleArrayItemChange('certifications', index, 'skills', e.target.value.split(',').map(s => s.trim()))}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
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
                <h2 className="text-xl md:text-2xl font-bold">Education</h2>
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
                    <h3 className="text-lg md:text-xl font-semibold">Education {index + 1}</h3>
                    <button
                      onClick={() => removeArrayItem('education', index)}
                      className="w-full sm:w-auto px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2">Institution</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleArrayItemChange('education', index, 'institution', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Period</label>
                      <input
                        type="text"
                        value={edu.period}
                        onChange={(e) => handleArrayItemChange('education', index, 'period', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block mb-2">Degree/Description</label>
                      <textarea
                        value={edu.degree}
                        onChange={(e) => handleArrayItemChange('education', index, 'degree', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg h-20 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block mb-2">Logo URL</label>
                      <input
                        type="text"
                        value={edu.logo}
                        onChange={(e) => handleArrayItemChange('education', index, 'logo', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
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
                <h2 className="text-xl md:text-2xl font-bold">Work Experience</h2>
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
                    <h3 className="text-lg md:text-xl font-semibold">Experience {index + 1}</h3>
                    <button
                      onClick={() => removeArrayItem('experience', index)}
                      className="w-full sm:w-auto px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2">Job Title</label>
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => handleArrayItemChange('experience', index, 'title', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleArrayItemChange('experience', index, 'company', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Duration</label>
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => handleArrayItemChange('experience', index, 'duration', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                        placeholder="2022 - 2023 (1 Year Experience)"
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Company Logo URL</label>
                      <input
                        type="text"
                        value={exp.logo}
                        onChange={(e) => handleArrayItemChange('experience', index, 'logo', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                        placeholder="/logo.png"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block mb-2">Description</label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => handleArrayItemChange('experience', index, 'description', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg h-24 focus:border-cyan-500 focus:outline-none"
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
                <h2 className="text-xl md:text-2xl font-bold">Projects</h2>
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
                    <h3 className="text-lg md:text-xl font-semibold">Project {index + 1}</h3>
                    <button
                      onClick={() => removeArrayItem('projects', index)}
                      className="w-full sm:w-auto px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2">Title</label>
                      <input
                        type="text"
                        value={project.title}
                        onChange={(e) => handleArrayItemChange('projects', index, 'title', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Category</label>
                      <select
                        value={project.category}
                        onChange={(e) => handleArrayItemChange('projects', index, 'category', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
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
                      <label className="block mb-2">Category Label</label>
                      <input
                        type="text"
                        value={project.categoryLabel}
                        onChange={(e) => handleArrayItemChange('projects', index, 'categoryLabel', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Date</label>
                      <input
                        type="text"
                        value={project.date}
                        onChange={(e) => handleArrayItemChange('projects', index, 'date', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                        placeholder="December 2024"
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Project Image URL</label>
                      <input
                        type="text"
                        value={project.image}
                        onChange={(e) => handleArrayItemChange('projects', index, 'image', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                        placeholder="/project-image.png"
                      />
                    </div>
                    <div>
                      <label className="block mb-2">GitHub URL</label>
                      <input
                        type="text"
                        value={project.github}
                        onChange={(e) => handleArrayItemChange('projects', index, 'github', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Live URL</label>
                      <input
                        type="text"
                        value={project.live}
                        onChange={(e) => handleArrayItemChange('projects', index, 'live', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                        placeholder="# or https://..."
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block mb-2">Demo Video URL</label>
                      <input
                        type="text"
                        value={project.video || ''}
                        onChange={(e) => handleArrayItemChange('projects', index, 'video', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                        placeholder="YouTube, Vimeo, or direct video URL (e.g., https://youtube.com/watch?v=...)"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Supports YouTube, Vimeo, or direct video links (mp4, webm, etc.)
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="block mb-2">Description</label>
                      <textarea
                        value={project.description}
                        onChange={(e) => handleArrayItemChange('projects', index, 'description', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg h-24 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block mb-2">Technologies (comma separated)</label>
                      <input
                        type="text"
                        value={project.tech.join(', ')}
                        onChange={(e) => handleArrayItemChange('projects', index, 'tech', e.target.value.split(',').map(t => t.trim()))}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
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
              <h2 className="text-xl md:text-2xl font-bold mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Email</label>
                  <input
                    type="email"
                    value={portfolioData.contact.email}
                    onChange={(e) => handleInputChange('contact', 'email', e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-2">Phone</label>
                  <input
                    type="text"
                    value={portfolioData.contact.phone}
                    onChange={(e) => handleInputChange('contact', 'phone', e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block mb-2">Location</label>
                  <input
                    type="text"
                    value={portfolioData.contact.location}
                    onChange={(e) => handleInputChange('contact', 'location', e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
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
