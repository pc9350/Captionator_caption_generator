'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowLeft, FiMail, FiSend, FiCheck, FiGithub, FiLinkedin, FiGlobe } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }
      
      // console.log('Form submitted:', formData);
      setIsSubmitted(true);
      toast.success('Message sent successfully!');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'There was an error submitting your message. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link 
              href="/"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              <FiArrowLeft className="mr-2" />
              Back to Home
            </Link>
          </div>
          
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Contact Us
            </h1>
            <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Have questions or feedback? I'd love to hear from you!
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden h-full"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Get in Touch
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    I'm here to help and answer any questions you might have. I look forward to hearing from you!
                  </p>
                  
                  <div className="flex items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                      <FiMail className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Email</h3>
                      <a 
                        href="mailto:chhabrapranav2001@gmail.com" 
                        className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                      >
                        chhabrapranav2001@gmail.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                      <FiGlobe className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Website</h3>
                      <a 
                        href="https://pranavchhabra.com" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                      >
                        pranavchhabra.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Connect With Me</h3>
                    <div className="flex space-x-3">
                      <a 
                        href="https://github.com/pc9350" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        aria-label="GitHub"
                      >
                        <FiGithub className="w-4 h-4" />
                      </a>
                      <a 
                        href="https://www.linkedin.com/in/pranavchhabra/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        aria-label="LinkedIn"
                      >
                        <FiLinkedin className="w-4 h-4" />
                      </a>
                      <a 
                        href="https://pranavchhabra.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        aria-label="Portfolio Website"
                      >
                        <FiGlobe className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            <div className="md:col-span-2">
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Send Me a Message
                  </h2>
                  
                  {isSubmitted ? (
                    <motion.div
                      className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FiCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Message Sent Successfully!
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Thank you for reaching out. I'll get back to you as soon as possible.
                      </p>
                      <button
                        onClick={() => setIsSubmitted(false)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        Send Another Message
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-red-700 dark:text-red-300">
                          {error}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Your Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Your Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Subject
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select a subject</option>
                          <option value="General Inquiry">General Inquiry</option>
                          <option value="Feature Request">Feature Request</option>
                          <option value="Bug Report">Bug Report</option>
                          <option value="Business Inquiry">Business Inquiry</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      
                      <div className="mb-6">
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Your Message
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={5}
                          className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="How can I help you?"
                        ></textarea>
                      </div>
                      
                      <div>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className={`w-full px-6 py-3 flex items-center justify-center rounded-lg font-medium text-white ${
                            isSubmitting 
                              ? 'bg-blue-400 dark:bg-blue-600 cursor-not-allowed' 
                              : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                          } transition-colors`}
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Sending...
                            </>
                          ) : (
                            <>
                              <FiSend className="mr-2" />
                              Send Message
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              This service is created by <a href="https://pranavchhabra.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Pranav Chhabra</a>. 
              Visit my <a href="https://pranavchhabra.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">portfolio website</a> for more projects and information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 