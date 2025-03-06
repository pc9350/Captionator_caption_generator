'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiChevronDown } from 'react-icons/fi';
import { lazy } from 'react';
import { Suspense } from 'react';
import { motion } from 'framer-motion';

// Lazily import the FeaturesSection component
const FeaturesSection = lazy(() => import('./components/FeaturesSection'));

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 min-h-screen flex items-center">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 blur-3xl opacity-30"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-32 sm:pt-36 md:pt-32 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left space-y-4 sm:space-y-6 md:space-y-8">
              <div className="hidden sm:inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 rounded-full text-indigo-800 dark:text-indigo-300 font-medium text-xs sm:text-sm mb-2 animate-pulse">
                AI-Powered Caption Generator
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 leading-tight pb-2">
                Perfect Captions for Any Image
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Transform your social media presence with AI-generated captions that perfectly match your content, style, and tone.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link
                  href="/auth"
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base"
                >
                  Get Started Free
                </Link>
                <Link
                  href="#features"
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white rounded-xl font-medium hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 text-center flex items-center justify-center shadow-lg text-sm sm:text-base group"
                >
                  Explore Features
                  <FiChevronDown className="ml-2 group-hover:translate-y-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Interactive Demo */}
            <div className="relative mx-auto max-w-xs sm:max-w-sm lg:max-w-none">
              <div className="relative z-10 flex justify-center">
                {/* Main Social Media Post */}
                <div 
                  className="bg-white dark:bg-gray-800 rounded-2xl mb-8 sm:rounded-3xl shadow-2xl transform hover:rotate-1 transition-transform cursor-pointer max-w-xs sm:max-w-sm mx-auto border border-gray-100 dark:border-gray-700"
                >
                  <div className="p-2 sm:p-3 md:p-5">
                    <div className="flex items-center mb-2 sm:mb-3 md:mb-4">
                      <div className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm md:text-base">T</div>
                      <div className="ml-2 sm:ml-3">
                        <div className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm md:text-base">travel_enthusiast</div>
                        <div className="text-xs md:text-sm text-gray-500">Cappadocia, Turkey</div>
                      </div>
                    </div>
                    <div className="relative pb-[80%] sm:pb-[90%] md:pb-[100%] rounded-lg sm:rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <Image
                        src="/images/hot-air-balloons.jpg"
                        alt="Social media post"
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                    <div className="mt-2 sm:mt-3 md:mt-4">
                      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-1 sm:mb-2 md:mb-3">
                        <button 
                          className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          aria-label="Like post"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                        </button>
                        <button 
                          className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                          aria-label="Comment on post"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                          </svg>
                        </button>
                        <button 
                          className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-colors"
                          aria-label="Share post"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                            <polyline points="16 6 12 2 8 6"></polyline>
                            <line x1="12" y1="2" x2="12" y2="15"></line>
                          </svg>
                        </button>
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white mb-2">1,234 likes</div>
                      <div className="space-y-1">
                        <p className="text-gray-900 dark:text-white">
                          <span className="font-bold">@travel_enthusiast</span> <span className="text-md sm:text-lg">Floating above the world in a kaleidoscope of colors. ✨🎈 #TravelGoals #Cappadocia #BucketList</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Second Post - Positioned Better */}
                <div 
                  className="absolute -bottom-10 -right-5 lg:right-0 transform rotate-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:rotate-3 transition-transform cursor-pointer w-64 border border-gray-100 dark:border-gray-700 hidden md:block"
                >
                  <div className="p-3">
                    <div className="flex items-center mb-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold">P</div>
                      <div className="ml-2">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">pet_lovers</div>
                      </div>
                    </div>
                    <div className="relative pb-[100%] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <Image
                        src="/images/dogs.jpg"
                        alt="Second social media post"
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                    <div className="mt-2 sm:mt-3 md:mt-4">
                      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-1 sm:mb-2 md:mb-3">
                        <button 
                          className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          aria-label="Like post"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                        </button>
                        <button 
                          className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                          aria-label="Comment on post"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                          </svg>
                        </button>
                        <button 
                          className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-colors"
                          aria-label="Share post"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                            <polyline points="16 6 12 2 8 6"></polyline>
                            <line x1="12" y1="2" x2="12" y2="15"></line>
                          </svg>
                        </button>
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-0.5 sm:mb-1">567 likes</div>
                      <div className="text-xs sm:text-sm">
                        <p className="text-gray-900 dark:text-white text-xs sm:text-sm line-clamp-2">
                          <span className="font-semibold">@pet_lovers</span> Double trouble, double the love! 🐾💕 #DogsOfSocialMedia
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Scroll Indicator */}
          <motion.div 
            className="absolute left-0 right-0 mx-auto bottom-8 sm:bottom-10 flex justify-center cursor-pointer"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            style={{ width: 'fit-content' }}
          >
            <Link href="#features">
              <motion.div
                className="flex flex-col items-center"
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <p className="text-gray-600 dark:text-gray-300 mb-0 text-xs font-medium text-center">Scroll Down</p>
                <FiChevronDown className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mx-auto" />
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features">
        <Suspense fallback={
          <div className="py-20 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto">
                <div className="h-10 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
                <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        }>
          <FeaturesSection />
        </Suspense>
      </div>
    </div>
  );
}
