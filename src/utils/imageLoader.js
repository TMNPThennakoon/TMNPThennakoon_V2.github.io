// Image loading utility with rate limiting protection
const imageCache = new Map();
const loadingQueue = [];
let activeLoads = 0;
const MAX_CONCURRENT_LOADS = 5;
const LOAD_DELAY = 100; // Delay between image loads

// Function to load image with rate limiting
export const loadImageWithThrottle = (url, onLoad, onError) => {
  // Check cache first
  if (imageCache.has(url)) {
    const cached = imageCache.get(url);
    if (cached.success) {
      onLoad(cached.url);
      return;
    }
  }
  
  // Add to queue
  loadingQueue.push({ url, onLoad, onError });
  processQueue();
};

// Process loading queue with rate limiting
const processQueue = () => {
  if (activeLoads >= MAX_CONCURRENT_LOADS || loadingQueue.length === 0) {
    return;
  }
  
  const { url, onLoad, onError } = loadingQueue.shift();
  activeLoads++;
  
  // Delay before loading
  setTimeout(() => {
    const img = new Image();
    
    img.onload = () => {
      imageCache.set(url, { success: true, url: img.src });
      activeLoads--;
      onLoad(img.src);
      processQueue(); // Process next in queue
    };
    
    img.onerror = () => {
      imageCache.set(url, { success: false });
      activeLoads--;
      onError();
      processQueue(); // Process next in queue
    };
    
    img.src = url;
  }, LOAD_DELAY);
};

// Clear cache (useful for development)
export const clearImageCache = () => {
  imageCache.clear();
};

