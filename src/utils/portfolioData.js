import portfolioData from '../data/portfolio.json';

// Global state for portfolio data (for real-time updates)
let currentPortfolioData = portfolioData;

// Load from localStorage if available
const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem('portfolioData');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load from localStorage:', e);
  }
  return portfolioData;
};

// Initialize from localStorage or default
currentPortfolioData = loadFromStorage();

// Function to get portfolio data
export const getPortfolioData = () => {
  // Always check localStorage first for latest data
  const stored = loadFromStorage();
  if (stored) {
    currentPortfolioData = stored;
    // Always use education data from JSON file as source of truth
    // This ensures direct JSON edits are reflected even if localStorage has old data
    if (portfolioData.education && Array.isArray(portfolioData.education)) {
      currentPortfolioData.education = portfolioData.education;
    }
  } else {
    currentPortfolioData = portfolioData;
  }
  return currentPortfolioData;
};

// Function to update portfolio data (for dashboard)
export const updatePortfolioData = (newData) => {
  currentPortfolioData = newData;
  // Trigger a custom event to notify components of the update
  window.dispatchEvent(new CustomEvent('portfolioDataUpdated', { detail: newData }));
  return newData;
};

// Function to save portfolio data to JSON file (client-side only - would need backend for actual file write)
export const savePortfolioData = async (data) => {
  try {
    // Update the global state
    currentPortfolioData = data;
    
    // Save to localStorage for persistence
    localStorage.setItem('portfolioData', JSON.stringify(data));
    
    // Trigger update event (this will update all listening components)
    window.dispatchEvent(new CustomEvent('portfolioDataUpdated', { detail: data }));
    
    // Trigger a custom storage-like event for same-tab updates
    // (native storage events only fire in other tabs/windows)
    window.dispatchEvent(new CustomEvent('portfolioStorageUpdate', { 
      detail: { key: 'portfolioData', newValue: JSON.stringify(data) }
    }));
    
    // In a real app, you'd send this to a backend API
    // For now, we'll just update the in-memory data and localStorage
    return { success: true, message: 'Portfolio data updated successfully! Main page will update automatically.' };
  } catch (error) {
    return { success: false, message: 'Error saving portfolio data: ' + error.message };
  }
};

// Export function to download JSON
export const exportPortfolioData = (data) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'portfolio.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Import function to load JSON
export const importPortfolioData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        currentPortfolioData = data;
        window.dispatchEvent(new CustomEvent('portfolioDataUpdated', { detail: data }));
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};
