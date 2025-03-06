'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12">
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
              Privacy Policy
            </h1>
            <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </motion.div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-12">
            <div className="p-8 sm:p-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Introduction</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    At Insta Caption Generator, we respect your privacy and are committed to protecting your personal data. 
                    This Privacy Policy explains how we collect, use, and safeguard your information when you use our website 
                    and services. This service is developed and maintained by <a href="https://pranavchhabra.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Pranav Chhabra</a>.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Information We Collect</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">We may collect the following types of information:</p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                    <li><strong className="font-semibold">Personal Information:</strong> Name, email address, and other contact details you provide when creating an account or contacting us.</li>
                    <li><strong className="font-semibold">Usage Data:</strong> Information about how you use our website and services, including your interactions with our features.</li>
                    <li><strong className="font-semibold">Images:</strong> Photos you upload for caption generation. These are processed to generate captions but are not shared with third parties without your consent.</li>
                    <li><strong className="font-semibold">Generated Content:</strong> Captions generated based on your inputs and preferences.</li>
                    <li><strong className="font-semibold">Technical Data:</strong> IP address, browser type, device information, and cookies.</li>
                  </ul>
                  
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">How We Use Your Information</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">We use your information for the following purposes:</p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                    <li>To provide and maintain our services</li>
                    <li>To improve and personalize your experience</li>
                    <li>To process your requests and generate captions</li>
                    <li>To communicate with you about our services</li>
                    <li>To detect and prevent fraud or abuse</li>
                    <li>To comply with legal obligations</li>
                  </ul>
                  
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Data Storage and Security</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    We implement appropriate security measures to protect your personal information. Your data is stored 
                    securely using industry-standard encryption and security practices. We use Firebase for authentication 
                    and data storage, which maintains high security standards.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Third-Party Services</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    We use the following third-party services:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                    <li><strong className="font-semibold">Firebase:</strong> For authentication and database services</li>
                    <li><strong className="font-semibold">Clerk:</strong> For user authentication</li>
                    <li><strong className="font-semibold">OpenAI:</strong> For caption generation using AI models</li>
                  </ul>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    Each of these services has their own privacy policies that govern how they handle your data.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Your Rights</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">Depending on your location, you may have the following rights regarding your data:</p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                    <li>Access to your personal information</li>
                    <li>Correction of inaccurate or incomplete data</li>
                    <li>Deletion of your personal information</li>
                    <li>Restriction or objection to processing</li>
                    <li>Data portability</li>
                    <li>Withdrawal of consent</li>
                  </ul>
                  
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Cookies</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    We use cookies to enhance your experience on our website. You can set your browser to refuse all or some 
                    browser cookies, but this may affect certain features of our website.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Children&apos;s Privacy</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    Our services are not intended for children under 13 years of age. We do not knowingly collect personal 
                    information from children under 13.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Changes to This Privacy Policy</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
                    Privacy Policy on this page and updating the &quot;Last updated&quot; date.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Contact Us</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    If you have any questions about this Privacy Policy, please contact us at:
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    <a href="mailto:chhabrapranav2001@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                      chhabrapranav2001@gmail.com
                    </a>
                  </p>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      This service is created by <a href="https://pranavchhabra.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Pranav Chhabra</a>. 
                      Visit my portfolio for more projects and information.
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