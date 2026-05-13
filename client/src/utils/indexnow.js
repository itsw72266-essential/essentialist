// utils/indexnow.js

import axios from 'axios';
import SummaryApi from '../api/SummaryApi';
import { baseURL } from '../api/SummaryApi';

/**
 * Notify IndexNow about a content change
 * @param {string} url - The URL that was added, updated, or deleted
 * @param {string} type - The type of change: 'add', 'update', or 'delete'
 */
export async function notifyContentChange(url, type = 'update') {
  try {
    const response = await axios({
      method: SummaryApi.indexNowNotifyContentChange.method,
      url: baseURL + SummaryApi.indexNowNotifyContentChange.url,
      data: { url, type }
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to notify IndexNow about content change:', error);
    throw error;
  }
}

/**
 * Submit multiple URLs to IndexNow
 * @param {string[]} urls - Array of URLs to submit (max 10,000)
 */
export async function submitUrlsToIndexNow(urls) {
  try {
    const response = await axios({
      method: SummaryApi.indexNowSubmitUrls.method,
      url: baseURL + SummaryApi.indexNowSubmitUrls.url,
      data: { urls }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to submit URLs to IndexNow:', error);
    throw error;
  }
}

/**
 * Submit a single URL to IndexNow
 * @param {string} url - The URL to submit
 */
export async function submitUrlToIndexNow(url) {
  try {
    const response = await axios({
      method: SummaryApi.indexNowSubmitUrl.method,
      url: baseURL + SummaryApi.indexNowSubmitUrl.url,
      data: { url }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to submit URL to IndexNow:', error);
    throw error;
  }
}

/**
 * Get the current IndexNow key
 */
export async function getIndexNowKey() {
  try {
    const response = await axios({
      method: SummaryApi.indexNowGetKey.method,
      url: baseURL + SummaryApi.indexNowGetKey.url
    });
    return response.data.key;
  } catch (error) {
    console.error('Failed to get IndexNow key:', error);
    throw error;
  }
}

/**
 * Regenerate the IndexNow key
 */
export async function regenerateIndexNowKey() {
  try {
    const response = await axios({
      method: SummaryApi.indexNowRegenerateKey.method,
      url: baseURL + SummaryApi.indexNowRegenerateKey.url
    });
    return response.data;
  } catch (error) {
    console.error('Failed to regenerate IndexNow key:', error);
    throw error;
  }
}