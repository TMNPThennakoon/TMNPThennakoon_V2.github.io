import portfolioData from '../data/portfolio.json';

// Global state for portfolio data (for real-time updates)
let currentPortfolioData = portfolioData;

// Function to get portfolio data
// ALWAYS use JSON file as source of truth - localStorage is device-specific and causes sync issues
export const getPortfolioData = () => {
  // Always use the JSON file data as the source of truth
  // This ensures all users see the same data regardless of device
  currentPortfolioData = portfolioData;
  return currentPortfolioData;
};

// Function to update portfolio data (for dashboard)
export const updatePortfolioData = (newData) => {
  currentPortfolioData = newData;
  // Trigger a custom event to notify components of the update
  window.dispatchEvent(new CustomEvent('portfolioDataUpdated', { detail: newData }));
  return newData;
};

// Function to save portfolio data
// This will update the portfolio.json file via GitHub API to sync across all devices
export const savePortfolioData = async (data) => {
  try {
    // Update the global state for immediate UI updates
    currentPortfolioData = data;
    
    // Trigger update event (this will update all listening components in current session)
    window.dispatchEvent(new CustomEvent('portfolioDataUpdated', { detail: data }));
    
    // Try to save via GitHub API if credentials are available
    const githubToken = localStorage.getItem('githubToken');
    if (githubToken) {
      try {
        const result = await updatePortfolioJsonOnGitHub(data, githubToken);
        if (result.success) {
          return { 
            success: true, 
            message: '✅ Portfolio data saved to GitHub! Changes will be live in 1-2 minutes after deployment.' 
          };
        }
      } catch (error) {
        console.error('GitHub API error:', error);
        // Fall through to export/download option
      }
    }
    
    // If no GitHub token, provide download option
    return { 
      success: true, 
      message: '⚠️ Changes saved locally. Please export JSON and manually update portfolio.json in GitHub, or set up GitHub API token for automatic sync.',
      requiresManualUpdate: true,
      data: data
    };
  } catch (error) {
    return { success: false, message: 'Error saving portfolio data: ' + error.message };
  }
};

// Function to update portfolio.json on GitHub via API
async function updatePortfolioJsonOnGitHub(data, token) {
  const owner = 'TMNPThennakoon';
  const repo = 'TMNP.Thennakoon_V2.github.io';
  const path = 'src/data/portfolio.json';
  const branch = 'main';
  
  try {
    // Get current file SHA
    const getFileResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    
    if (!getFileResponse.ok && getFileResponse.status !== 404) {
      throw new Error('Failed to fetch current file');
    }
    
    const currentFile = await getFileResponse.json();
    const sha = currentFile?.sha;
    
    // Prepare file content
    const jsonString = JSON.stringify(data, null, 2);
    const content = btoa(unescape(encodeURIComponent(jsonString)));
    
    // Update file
    const updateResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Update portfolio data - ${new Date().toISOString()}`,
          content: content,
          branch: branch,
          ...(sha && { sha: sha })
        })
      }
    );
    
    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      throw new Error(error.message || 'Failed to update file');
    }
    
    return { success: true };
  } catch (error) {
    throw error;
  }
}

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
