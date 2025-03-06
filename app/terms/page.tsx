'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function TermsOfServicePage() {
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
              Terms of Service
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
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">1. Acceptance of Terms</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    By accessing or using Insta Caption Generator, you agree to be bound by these Terms of Service. If you do not 
                    agree to these terms, please do not use our service. This service is developed and maintained by 
                    <a href="https://pranavchhabra.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">
                      Pranav Chhabra
                    </a>.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">2. Description of Service</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    Insta Caption Generator provides AI-powered caption generation for social media posts, particularly Instagram. 
                    Our service allows users to upload images and receive AI-generated captions based on the content of those images.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">3. User Accounts</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    To access certain features of our service, you may need to create an account. You are responsible for maintaining 
                    the confidentiality of your account information and for all activities that occur under your account. You agree to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                    <li>Provide accurate and complete information when creating your account</li>
                    <li>Update your information to keep it accurate and current</li>
                    <li>Protect your account credentials and not share them with others</li>
                    <li>Notify us immediately of any unauthorized use of your account</li>
                  </ul>
                  
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">4. User Content</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    When you upload images or other content to our service:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                    <li>You retain ownership of your content</li>
                    <li>You grant us a non-exclusive, worldwide, royalty-free license to use, store, and process your content for the purpose of providing our service</li>
                    <li>You are solely responsible for ensuring you have the right to share any content you upload</li>
                    <li>You agree not to upload content that infringes on others&apos; intellectual property rights or violates any laws</li>
                  </ul>
                  
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">5. Acceptable Use</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    You agree not to use our service to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                    <li>Violate any laws or regulations</li>
                    <li>Infringe on the rights of others</li>
                    <li>Upload or generate content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable</li>
                    <li>Attempt to gain unauthorized access to our systems or interfere with the service</li>
                    <li>Engage in any activity that could damage, disable, or impair our service</li>
                  </ul>
                  
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">6. Intellectual Property</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    The service, including all software, design, text, graphics, logos, and other content (excluding user content), 
                    is owned by or licensed to Insta Caption Generator and is protected by copyright, trademark, and other intellectual 
                    property laws.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">7. Generated Captions</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    The captions generated by our service:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                    <li>Are created using AI technology and may not always be perfect or appropriate</li>
                    <li>Are provided for your personal use</li>
                    <li>May be used by you without attribution to our service</li>
                    <li>Should be reviewed by you before posting to ensure they are appropriate for your intended audience</li>
                  </ul>
                  
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">8. Limitation of Liability</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    To the maximum extent permitted by law, Insta Caption Generator shall not be liable for any indirect, incidental, 
                    special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, 
                    or any loss of data, use, goodwill, or other intangible losses resulting from:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                    <li>Your use or inability to use our service</li>
                    <li>Any unauthorized access to or use of our servers or personal information</li>
                    <li>Any interruption or cessation of transmission to or from our service</li>
                    <li>Any bugs, viruses, or other harmful code that may be transmitted through our service</li>
                  </ul>
                  
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">9. Modifications to the Service</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    We reserve the right to modify, suspend, or discontinue our service, temporarily or permanently, at any time without 
                    notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuation of the service.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">10. Changes to Terms</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    We may update these Terms of Service from time to time. We will notify you of any changes by posting the new Terms on 
                    this page and updating the &quot;Last updated&quot; date. Your continued use of the service after such changes constitutes your 
                    acceptance of the new Terms.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">11. Governing Law</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    These Terms shall be governed by and construed in accordance with the laws of India, without regard to 
                    its conflict of law provisions.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">12. Contact Us</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    If you have any questions about these Terms, please contact us at:
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    <a href="mailto:chhabrapranav2001@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                      chhabrapranav2001@gmail.com
                    </a>
                  </p>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      This service is created by <a href="https://pranavchhabra.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Pranav Chhabra</a>. 
                      Visit my <a href="https://pranavchhabra.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">portfolio website</a> for more projects and information.
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