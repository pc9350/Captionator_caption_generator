'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowLeft, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';

export default function AboutPage() {
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
              About Insta Caption Generator
            </h1>
            <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Crafting the perfect Instagram caption, powered by AI.
            </p>
          </motion.div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-12">
            <div className="p-8 sm:p-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  The Story Behind Insta Caption Generator
                </h2>
                
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    Insta Caption Generator was born out of a common frustration: spending too much time thinking of the perfect caption for Instagram posts. As a developer and social media enthusiast, I wanted to create a tool that would make this process effortless and fun.
                  </p>
                  
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    This application leverages the power of artificial intelligence to analyze your images and generate creative, engaging captions tailored to your content. Whether you're looking for something funny, inspirational, or trendy, Insta Caption Generator has got you covered.
                  </p>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                    About the Developer
                  </h3>
                  
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    Hi! I'm <a href="https://pranavchhabra.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Pranav Chhabra</a>, a passionate developer with a love for creating useful applications that solve real-world problems. I specialize in web development using modern technologies like React, Next.js, and various AI integrations.
                  </p>
                  
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    When I'm not coding, you can find me exploring new technologies, contributing to open-source projects, or perfecting my own Instagram feed with the help of this very tool! Check out my <a href="https://pranavchhabra.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">portfolio website</a> to see more of my work.
                  </p>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                    Technologies Used
                  </h3>
                  
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                    <li>Next.js for the frontend and API routes</li>
                    <li>Tailwind CSS for styling</li>
                    <li>Firebase for authentication and database</li>
                    <li>OpenAI's GPT models for caption generation</li>
                    <li>Clerk for user authentication</li>
                    <li>Framer Motion for animations</li>
                  </ul>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                    Connect With Me
                  </h3>
                  
                  <div className="flex flex-wrap gap-4 mt-6">
                    <a 
                      href="https://github.com/pc9350" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <FiGithub className="mr-2" />
                      GitHub
                    </a>
                    <a 
                      href="https://www.linkedin.com/in/pranavchhabra/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <FiLinkedin className="mr-2" />
                      LinkedIn
                    </a>
                    <a 
                      href="mailto:chhabrapranav2001@gmail.com" 
                      className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <FiMail className="mr-2" />
                      Email
                    </a>
                    <a 
                      href="https://pranavchhabra.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      Portfolio Website
                    </a>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      If you have any questions, feedback, or feature requests, please don't hesitate to reach out. I'm always looking to improve this tool and make it more useful for everyone.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 