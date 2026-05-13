// services/indexnow.js
export const notifyIndexNow = async (url) => {
  try {
    const response = await fetch('/api/indexnow/submit-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error notifying IndexNow:', error);
    return { success: false, error: error.message };
  }
};