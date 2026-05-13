"use client"
import React, { useState } from 'react';
import Head from 'next/head';
import { FaTiktok } from 'react-icons/fa';

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTimeout(() => {
      setFormStatus({
        submitted: true,
        success: true,
        message: 'Thank you for contacting us! We will get back to you shortly.'
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-pink-50 to-white pb-16">
      {/* SEO Meta */}
      <Head>
        <title>
          Contact Essentialist Makeup Store | Customer Service in Cameroon | Beauty Expert Help
        </title>
        <meta
          name="description"
          content="Contact Essentialist Makeup Store for beauty advice, product inquiries, and order support in Cameroon. Reach our makeup experts by phone, email or visit our store in Douala for personalized assistance with cosmetics and beauty products."
        />
        <meta
          name="keywords"
          content="makeup store contact, beauty customer service Cameroon, cosmetics help Douala, Essentialist Makeup Store contact, beauty product questions, makeup order support, cosmetics advice Cameroon, NYX product inquiries, LA Girl customer service, beauty store location Douala"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.esmakeupstore.com/contact" />
        <meta property="og:title" content="Contact Essentialist Makeup Store | Customer Service in Cameroon" />
        <meta property="og:description" content="Get in touch with Essentialist Makeup Store for all your beauty needs in Cameroon. Our makeup experts are ready to help with product advice, orders, and support." />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Essentialist Makeup Store" />
        <meta property="og:url" content="https://www.esmakeupstore.com/contact" />
        <meta property="og:image" content="https://www.esmakeupstore.com/assets/store-front.jpg" />
        <meta property="og:image:alt" content="Essentialist Makeup Store Contact" />
        <meta name="twitter:title" content="Contact Essentialist Makeup Store | Customer Service in Cameroon" />
        <meta name="twitter:description" content="Reach out to Essentialist Makeup Store for beauty advice, product inquiries, and order support in Cameroon." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://www.esmakeupstore.com/assets/store-front.jpg" />
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: `
          {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact Essentialist Makeup Store",
            "url": "https://www.esmakeupstore.com/contact",
            "description": "Contact our beauty experts for product advice, order support, and customer service in Cameroon.",
            "publisher": {
              "@type": "Organization",
              "name": "Essentialist Makeup Store",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "EssentialisMakeupStore Carrefour Macon, Bonamoussadi",
                "addressLocality": "Douala",
                "addressRegion": "Littoral",
                "addressCountry": "Cameroon"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+237 655 22 55 69",
                "contactType": "customer service",
                "email": "esssmakeup@gmail.com",
                "availableLanguage": ["English", "French"]
              }
            }
          }
          `
          }}
        />
      </Head>

      {/* Page Header */}
      <div className="container mx-auto px-4 py-10 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-pink-700 tracking-tight mb-4">
          Contact Us
        </h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
          Have questions about makeup products, need beauty advice, or want to place an order? Our team of beauty experts is here to help you!
        </p>
      </div>

      <div className="container mx-auto px-4 md:px-0 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Contact Information */}
          {/* ...no changes, keep your contact info as before... */}
          {/* -- paste your JSX for the contact info here (unchanged) -- */}
          <div className="w-full md:w-2/5 bg-gradient-to-br from-pink-100 via-pink-50 to-pink-100 rounded-xl p-6 md:p-8 shadow-lg">
            {/* ... all contact info blocks ... */}
            {/* (see your original JSX above) */}
            {/* Social icons as in your code */}
            <div className="mt-10">
              <h3 className="font-semibold text-pink-800 mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                {/* ...other socials... */}
                <a href="https://www.tiktok.com/@essentialistmakeupstore" className="bg-pink-400 p-3 rounded-full hover:bg-pink-300 transition-colors" aria-label="Tiktok">
                  <FaTiktok size={22} color="white" />
                </a>
                {/* ... */}
              </div>
            </div>
          </div>
          {/* Contact Form */}
          <div className="w-full md:w-3/5 bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-pink-800 mb-6 border-b border-gray-200 pb-3">
              Send Us a Message
            </h2>
            {formStatus.submitted && formStatus.success ? (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p>{formStatus.message}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name <span className="text-pink-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-pink-600">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+237 6XX XXX XXX"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject <span className="text-pink-600">*</span>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    >
                      <option value="">Select a subject</option>
                      <option value="Product Inquiry">Product Inquiry</option>
                      <option value="Order Status">Order Status</option>
                      <option value="Return or Exchange">Return or Exchange</option>
                      <option value="Beauty Advice">Beauty Advice</option>
                      <option value="Website Feedback">Website Feedback</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Message <span className="text-pink-600">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Please provide details about your inquiry..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  ></textarea>
                </div>
                <div className="flex items-center">
                  <input
                    id="privacy"
                    name="privacy"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                  />
                  <label htmlFor="privacy" className="ml-2 block text-sm text-gray-700">
                    I agree to the <a href="/privacy-policy" className="text-pink-600 hover:text-pink-500">Privacy Policy</a> and consent to being contacted regarding my inquiry.
                  </label>
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full bg-pink-600 text-white py-3 px-6 rounded-md font-medium hover:bg-pink-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Google Map Embed */}
      <div className="container mx-auto mt-16 px-4 md:px-0 max-w-6xl">
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-pink-800 mb-4 text-center">
            Find Our Store
          </h2>
          <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127518.51120646335!2d9.6658639!3d4.0510564!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x106131821b7e8a97%3A0x3add96414a4188e8!2sDouala%2C%20Cameroon!5e0!3m2!1sen!2sus!4v1653050751411!5m2!1sen!2sus" 
              width="100%" 
              height="450" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Essentialist Makeup Store Location"
            ></iframe>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      {/* FAQ Section */}
      <div className="container mx-auto mt-16 px-4 md:px-0 max-w-4xl">
        <h2 className="text-3xl font-bold text-pink-800 mb-8 text-center">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <details className="group">
              <summary className="flex justify-between items-center p-6 cursor-pointer font-semibold">
                <span>How can I track my order?</span>
                <span className="transition group-open:rotate-180">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="p-6 pt-0 text-gray-700">
                <p>
                  Once your order is shipped, you will receive a tracking number via email or SMS. You can use this number to track your package on our website under "Order Tracking" or contact our customer service team for assistance.
                </p>
              </div>
            </details>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <details className="group">
              <summary className="flex justify-between items-center p-6 cursor-pointer font-semibold">
                <span>What is your return policy?</span>
                <span className="transition group-open:rotate-180">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="p-6 pt-0 text-gray-700">
                <p>
                  We accept returns within 14 days of purchase for unused and unopened products in their original packaging. For hygiene reasons, we cannot accept returns on opened cosmetics or beauty products that have been used. Please contact our customer service team to initiate a return.
                </p>
              </div>
            </details>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <details className="group">
              <summary className="flex justify-between items-center p-6 cursor-pointer font-semibold">
                <span>Do you offer makeup consultations?</span>
                <span className="transition group-open:rotate-180">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="p-6 pt-0 text-gray-700">
                <p>
                  Yes, we offer free makeup consultations at our store in Douala. Our beauty experts can help you find the right products for your skin type and tone, demonstrate application techniques, and provide personalized beauty advice. You can book a consultation by phone or email.
                </p>
              </div>
            </details>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <details className="group">
              <summary className="flex justify-between items-center p-6 cursor-pointer font-semibold">
                <span>Are your products authentic?</span>
                <span className="transition group-open:rotate-180">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="p-6 pt-0 text-gray-700">
                <p>
                  Absolutely! We guarantee that all products sold at Essentialist Makeup Store are 100% authentic. We source our products directly from authorized distributors and brand representatives to ensure you receive genuine items. We never sell counterfeit or imitation products.
                </p>
              </div>
            </details>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <details className="group">
              <summary className="flex justify-between items-center p-6 cursor-pointer font-semibold">
                <span>Do you ship internationally?</span>
                <span className="transition group-open:rotate-180">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="p-6 pt-0 text-gray-700">
                <p>
                  Currently, we primarily serve customers in Cameroon with fast delivery options. We offer limited international shipping to select countries in Central and West Africa. Please contact our customer service team for more information about international shipping options and rates.
                </p>
              </div>
            </details>
          </div>
        </div>
    </div>
    </div>
  );
};

export default ContactUsPage;