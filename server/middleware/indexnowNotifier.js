// middleware/indexnowNotifier.js

import axios from 'axios';

export default function indexnowNotifierMiddleware(req, res, next) {
  // Store the original send method
  const originalSend = res.send;
  
  // Replace the send method with our custom implementation
  res.send = function(body) {
    // Call the original method
    originalSend.call(this, body);
    
    // Don't proceed if the response is not successful
    if (this.statusCode !== 200 && this.statusCode !== 201) {
      return;
    }
    
    // Get the base URL
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;
    
    // Check which API was called and notify IndexNow accordingly
    try {
      let parsedBody = body;
      if (typeof body === 'string') {
        try {
          parsedBody = JSON.parse(body);
        } catch (e) {
          // Not JSON, ignore
        }
      }
      
      // Handle product creation
      if (req.path === '/api/product/create' && req.method === 'POST') {
        const productSlug = parsedBody.data?.slug || parsedBody.data?.id;
        if (productSlug) {
          const productUrl = `${baseUrl}/product/${productSlug}`;
          
          axios.post(`${baseUrl}/api/indexnow/notify-content-change`, {
            url: productUrl,
            type: 'add'
          }).catch(err => console.error('Error notifying IndexNow:', err));
        }
      }
      
      // Handle product update
      else if (req.path === '/api/product/update-product-details' && req.method === 'PUT') {
        const productSlug = parsedBody.data?.slug || parsedBody.data?.id || req.body.id;
        if (productSlug) {
          const productUrl = `${baseUrl}/product/${productSlug}`;
          
          axios.post(`${baseUrl}/api/indexnow/notify-content-change`, {
            url: productUrl,
            type: 'update'
          }).catch(err => console.error('Error notifying IndexNow:', err));
        }
      }
      
      // Handle product deletion
      else if (req.path === '/api/product/delete-product' && req.method === 'DELETE') {
        const productId = req.body.id || req.query.id;
        if (productId) {
          const productUrl = `${baseUrl}/product/${productId}`;
          
          axios.post(`${baseUrl}/api/indexnow/notify-content-change`, {
            url: productUrl,
            type: 'delete'
          }).catch(err => console.error('Error notifying IndexNow:', err));
        }
      }
      
      // Add more cases for other content types as needed
      
    } catch (error) {
      console.error('Error in IndexNow notification middleware:', error);
    }
  };
  
  next();
}