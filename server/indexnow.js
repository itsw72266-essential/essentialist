// indexnow.js (Express.js route handler)

import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import axios from 'axios';

const router = express.Router();

// Configuration
const INDEX_NOW_KEY_FILE_NAME = process.env.INDEX_NOW_KEY_FILE_NAME || 'indexnow.key';
const INDEX_NOW_KEY = process.env.INDEX_NOW_KEY || generateKey();
const PUBLIC_DIR = process.env.PUBLIC_DIR || path.join(process.cwd(), 'public');
const SITE_HOST = process.env.SITE_HOST || 'www.example.com';
const SEARCH_ENGINES = [
  'https://www.bing.com/indexnow',
  // Add other search engines that support IndexNow
];

// Helper function to generate a key if one doesn't exist
function generateKey() {
  return crypto.randomBytes(16).toString('hex');
}

// Initialize the key file on server startup
async function initKeyFile() {
  try {
    const keyFilePath = path.join(PUBLIC_DIR, INDEX_NOW_KEY_FILE_NAME);
    
    // Check if key file already exists
    try {
      await fs.access(keyFilePath);
      console.log('IndexNow key file already exists.');
    } catch (error) {
      // Create the key file if it doesn't exist
      await fs.writeFile(keyFilePath, INDEX_NOW_KEY, 'utf8');
      console.log(`Created IndexNow key file at ${keyFilePath}`);
    }
    
    // Create the key-named file required by IndexNow
    const keyNamedFilePath = path.join(PUBLIC_DIR, `${INDEX_NOW_KEY}.txt`);
    try {
      await fs.access(keyNamedFilePath);
      console.log('IndexNow key-named file already exists.');
    } catch (error) {
      await fs.writeFile(keyNamedFilePath, INDEX_NOW_KEY, 'utf8');
      console.log(`Created IndexNow key-named file at ${keyNamedFilePath}`);
    }
  } catch (error) {
    console.error('Error initializing IndexNow key files:', error);
  }
}

// Call initialization
initKeyFile().catch(console.error);

// API endpoint to submit a single URL to IndexNow
router.post('/submit-url', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }
    
    // Validate URL belongs to our site
    if (!url.startsWith(`https://${SITE_HOST}`)) {
      return res.status(400).json({ 
        success: false, 
        message: 'URL must belong to your website' 
      });
    }
    
    // Submit to all search engines
    const results = await Promise.allSettled(
      SEARCH_ENGINES.map(engine => 
        axios.get(`${engine}?url=${encodeURIComponent(url)}&key=${INDEX_NOW_KEY}`)
      )
    );
    
    const successfulSubmissions = results.filter(r => r.status === 'fulfilled').length;
    
    return res.json({
      success: true,
      message: `URL submitted to ${successfulSubmissions} of ${SEARCH_ENGINES.length} search engines`,
      details: results.map((r, i) => ({
        searchEngine: SEARCH_ENGINES[i],
        status: r.status === 'fulfilled' ? 'success' : 'failed',
        statusCode: r.status === 'fulfilled' ? r.value.status : null,
        error: r.status === 'rejected' ? r.reason.message : null
      }))
    });
  } catch (error) {
    console.error('Error submitting URL to IndexNow:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to submit URL to IndexNow',
      error: error.message
    });
  }
});

// API endpoint to submit multiple URLs to IndexNow
router.post('/submit-urls', async (req, res) => {
  try {
    const { urls } = req.body;
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'A non-empty array of URLs is required' 
      });
    }
    
    if (urls.length > 10000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Maximum of 10,000 URLs can be submitted at once' 
      });
    }
    
    // Validate all URLs belong to our site
    const invalidUrls = urls.filter(url => !url.startsWith(`https://${SITE_HOST}`));
    if (invalidUrls.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'All URLs must belong to your website', 
        invalidUrls 
      });
    }
    
    // Submit to all search engines
    const payload = {
      host: SITE_HOST,
      key: INDEX_NOW_KEY,
      urlList: urls
    };
    
    const results = await Promise.allSettled(
      SEARCH_ENGINES.map(engine => 
        axios.post(engine, payload, {
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        })
      )
    );
    
    const successfulSubmissions = results.filter(r => r.status === 'fulfilled').length;
    
    return res.json({
      success: true,
      message: `URLs submitted to ${successfulSubmissions} of ${SEARCH_ENGINES.length} search engines`,
      details: results.map((r, i) => ({
        searchEngine: SEARCH_ENGINES[i],
        status: r.status === 'fulfilled' ? 'success' : 'failed',
        statusCode: r.status === 'fulfilled' ? r.value.status : null,
        error: r.status === 'rejected' ? r.reason.message : null
      }))
    });
  } catch (error) {
    console.error('Error submitting URLs to IndexNow:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to submit URLs to IndexNow',
      error: error.message
    });
  }
});

// API endpoint to automatically submit a URL after content changes
// This can be called from your content management system
router.post('/notify-content-change', async (req, res) => {
  try {
    const { url, type } = req.body;
    
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }
    
    // Validate URL belongs to our site
    if (!url.startsWith(`https://${SITE_HOST}`)) {
      return res.status(400).json({ 
        success: false, 
        message: 'URL must belong to your website' 
      });
    }
    
    // Submit to all search engines
    const results = await Promise.allSettled(
      SEARCH_ENGINES.map(engine => 
        axios.get(`${engine}?url=${encodeURIComponent(url)}&key=${INDEX_NOW_KEY}`)
      )
    );
    
    const successfulSubmissions = results.filter(r => r.status === 'fulfilled').length;
    
    return res.json({
      success: true,
      message: `URL change (${type || 'update'}) submitted to ${successfulSubmissions} of ${SEARCH_ENGINES.length} search engines`,
      details: results.map((r, i) => ({
        searchEngine: SEARCH_ENGINES[i],
        status: r.status === 'fulfilled' ? 'success' : 'failed',
        statusCode: r.status === 'fulfilled' ? r.value.status : null,
        error: r.status === 'rejected' ? r.reason.message : null
      }))
    });
  } catch (error) {
    console.error('Error notifying content change to IndexNow:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to notify content change to IndexNow',
      error: error.message
    });
  }
});

// Get current IndexNow key (admin use)
router.get('/key', async (req, res) => {
  // In a real app, you'd add authentication to this endpoint
  return res.json({ key: INDEX_NOW_KEY });
});

// Generate new IndexNow key (admin use)
router.post('/regenerate-key', async (req, res) => {
  try {
    // In a real app, you'd add authentication to this endpoint
    const newKey = generateKey();
    
    // Update the key files
    const keyFilePath = path.join(PUBLIC_DIR, INDEX_NOW_KEY_FILE_NAME);
    const oldKeyNamedFilePath = path.join(PUBLIC_DIR, `${INDEX_NOW_KEY}.txt`);
    const newKeyNamedFilePath = path.join(PUBLIC_DIR, `${newKey}.txt`);
    
    await fs.writeFile(keyFilePath, newKey, 'utf8');
    await fs.writeFile(newKeyNamedFilePath, newKey, 'utf8');
    
    // Remove the old key file
    try {
      await fs.unlink(oldKeyNamedFilePath);
    } catch (error) {
      console.warn('Could not delete old key file:', error);
    }
    
    // Update the in-memory key
    // In a real app, you'd store this in a database
    process.env.INDEX_NOW_KEY = newKey;
    
    return res.json({ 
      success: true, 
      message: 'IndexNow key regenerated successfully', 
      key: newKey 
    });
  } catch (error) {
    console.error('Error regenerating IndexNow key:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to regenerate IndexNow key',
      error: error.message
    });
  }
});

export default router;