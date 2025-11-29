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

// Rate limiting protection - track last API call time
let lastApiCallTime = 0;
const API_CALL_COOLDOWN = 10000; // 10 seconds between API calls (increased to prevent rate limiting)
let isRequestInProgress = false;
let requestQueue = [];

// Function to update portfolio.json on GitHub via API
async function updatePortfolioJsonOnGitHub(data, token) {
  const owner = 'TMNPThennakoon';
  const repo = 'TMNP.Thennakoon_V2.github.io';
  const path = 'src/data/portfolio.json';
  const branch = 'main';
  
  // Queue system to prevent concurrent requests
  return new Promise((resolve, reject) => {
    const executeRequest = async () => {
      // Wait if another request is in progress
      while (isRequestInProgress) {
        await new Promise(r => setTimeout(r, 1000));
      }
      
      isRequestInProgress = true;
      
      try {
        // Rate limiting protection - increased cooldown
        const now = Date.now();
        const timeSinceLastCall = now - lastApiCallTime;
        if (timeSinceLastCall < API_CALL_COOLDOWN) {
          const waitTime = API_CALL_COOLDOWN - timeSinceLastCall;
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        lastApiCallTime = Date.now();
    
        // Get current file SHA with retry logic
        let getFileResponse;
        let retries = 3;
        while (retries > 0) {
          getFileResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
            {
              headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
              }
            }
          );
          
          // Handle rate limiting (429) with automatic retry
          if (getFileResponse.status === 429) {
            const retryAfter = parseInt(getFileResponse.headers.get('Retry-After') || '60', 10);
            const rateLimitReset = getFileResponse.headers.get('X-RateLimit-Reset');
            
            // If we have a reset time, wait until then
            if (rateLimitReset) {
              const resetTime = parseInt(rateLimitReset, 10) * 1000;
              const waitTime = Math.max(0, resetTime - Date.now()) + 5000; // Add 5 seconds buffer
              console.warn(`Rate limit exceeded. Waiting ${Math.ceil(waitTime / 1000)} seconds...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              // Reset lastApiCallTime after waiting
              lastApiCallTime = Date.now();
              continue; // Retry the request
            } else {
              // Fallback: wait the retryAfter time
              console.warn(`Rate limit exceeded. Waiting ${retryAfter} seconds...`);
              await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
              lastApiCallTime = Date.now();
              continue; // Retry the request
            }
          }
          
          if (getFileResponse.ok || getFileResponse.status === 404) {
            break;
          }
          
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 2000 * (4 - retries))); // Increased exponential backoff
          }
        }
    
        if (!getFileResponse.ok && getFileResponse.status !== 404) {
          throw new Error('Failed to fetch current file');
        }
        
        const currentFile = getFileResponse.status === 404 ? null : await getFileResponse.json();
        const sha = currentFile?.sha;
        
        // Prepare file content
        const jsonString = JSON.stringify(data, null, 2);
        const content = btoa(unescape(encodeURIComponent(jsonString)));
        
        // Wait before update call (increased delay to prevent rate limiting)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update file with retry logic
        retries = 3;
        let updateResponse;
        while (retries > 0) {
          updateResponse = await fetch(
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
          
          // Handle rate limiting (429) with automatic retry
          if (updateResponse.status === 429) {
            const retryAfter = parseInt(updateResponse.headers.get('Retry-After') || '60', 10);
            const rateLimitReset = updateResponse.headers.get('X-RateLimit-Reset');
            
            // If we have a reset time, wait until then
            if (rateLimitReset) {
              const resetTime = parseInt(rateLimitReset, 10) * 1000;
              const waitTime = Math.max(0, resetTime - Date.now()) + 5000; // Add 5 seconds buffer
              console.warn(`Rate limit exceeded. Waiting ${Math.ceil(waitTime / 1000)} seconds...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              lastApiCallTime = Date.now();
              continue; // Retry the request
            } else {
              // Fallback: wait the retryAfter time
              console.warn(`Rate limit exceeded. Waiting ${retryAfter} seconds...`);
              await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
              lastApiCallTime = Date.now();
              continue; // Retry the request
            }
          }
          
          if (updateResponse.ok) {
            break;
          }
          
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 2000 * (4 - retries))); // Increased exponential backoff
          }
        }
        
        if (!updateResponse.ok) {
          const errorData = await updateResponse.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to update file');
        }
        
        isRequestInProgress = false;
        // Process next request in queue
        if (requestQueue.length > 0) {
          const nextRequest = requestQueue.shift();
          nextRequest();
        }
        
        return { success: true };
      } catch (error) {
        isRequestInProgress = false;
        // Process next request in queue
        if (requestQueue.length > 0) {
          const nextRequest = requestQueue.shift();
          nextRequest();
        }
        throw error;
      }
    };
    
    // If a request is in progress, queue this one
    if (isRequestInProgress) {
      requestQueue.push(() => executeRequest().then(resolve).catch(reject));
    } else {
      executeRequest().then(resolve).catch(reject);
    }
  });
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
