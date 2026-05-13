// utils/indexnow.js

import axios from 'axios';

// Function to notify IndexNow when content changes
export async function notifyContentChange(url, type = 'update') {
  try {
    const response = await axios.post('/api/indexnow/notify-content-change', {
      url,
      type // 'add', 'update', or 'delete'
    });
    
    console.log('IndexNow notification sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to notify IndexNow:', error);
    throw error;
  }
}

// Function to submit multiple URLs to IndexNow
export async function submitUrlsToIndexNow(urls) {
  try {
    const response = await axios.post('/api/indexnow/submit-urls', { urls });
    console.log('Multiple URLs submitted to IndexNow:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to submit URLs to IndexNow:', error);
    throw error;
  }
}