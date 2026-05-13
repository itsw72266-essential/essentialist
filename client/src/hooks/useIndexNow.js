// hooks/useIndexNow.js

import { useState } from 'react';
import axios from 'axios';
import SummaryApi from '../api/SummaryApi';

export default function useIndexNow() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  
  // Submit a single URL
  async function submitUrl(url) {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios({
        method: SummaryApi.indexNowSubmitUrl.method,
        url: baseURL + SummaryApi.indexNowSubmitUrl.url,
        data: { url }
      });
      
      setResult(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }
  
  // Submit multiple URLs
  async function submitUrls(urls) {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios({
        method: SummaryApi.indexNowSubmitUrls.method,
        url: baseURL + SummaryApi.indexNowSubmitUrls.url,
        data: { urls }
      });
      
      setResult(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }
  
  // Notify content change
  async function notifyContentChange(url, type = 'update') {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios({
        method: SummaryApi.indexNowNotifyContentChange.method,
        url: baseURL + SummaryApi.indexNowNotifyContentChange.url,
        data: { url, type }
      });
      
      setResult(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }
  
  return {
    submitUrl,
    submitUrls,
    notifyContentChange,
    loading,
    error,
    result
  };
}