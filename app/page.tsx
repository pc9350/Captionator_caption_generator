'use client'

import Link from 'next/link';
import { FiCamera, FiHash, FiSmile, FiSliders, FiShare2, FiChevronDown, FiHeart, FiMessageSquare, FiShare } from 'react-icons/fi';
import AnimatedCaptionShowcase from './components/AnimatedCaptionShowcase';
import Image from 'next/image';
import { useState, useEffect } from 'react';

// Sample captions for the animation
const sampleCaptions = [
  "Living my best life one adventure at a time ✨",
  "Chasing sunsets and good vibes only 🌅",
  "Coffee in one hand, confidence in the other ☕",
  "Making memories that will last a lifetime 📸",
  "Finding beauty in the everyday moments 🌿"
];

// Second set of captions - shorter for the smaller polaroid
const secondaryCaptions = [
  "Puppy love 🐾",
  "Weekend vibes 🌈",
  "Best friends 🐶",
  "Happy days ✨"
];

export default function Home() {
  const [mainLiked, setMainLiked] = useState(false);
  const [smallLiked, setSmallLiked] = useState(false);
  const [mainLikes, setMainLikes] = useState(124);
  const [smallLikes, setSmallLikes] = useState(89);
  const [mainStraight, setMainStraight] = useState(false);
  const [smallStraight, setSmallStraight] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleMainLike = () => {
    if (mainLiked) {
      setMainLikes(mainLikes - 1);
    } else {
      setMainLikes(mainLikes + 1);
    }
    setMainLiked(!mainLiked);
  };

  const handleSmallLike = () => {
    if (smallLiked) {
      setSmallLikes(smallLikes - 1);
    } else {
      setSmallLikes(smallLikes + 1);
    }
    setSmallLiked(!smallLiked);
  };

  const toggleMainStraight = () => {
    // Only toggle if on mobile
    if (isMobile) {
      setMainStraight(!mainStraight);
    }
  };

  const toggleSmallStraight = () => {
    // Only toggle if on mobile
    if (isMobile) {
      setSmallStraight(!smallStraight);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section - Full height */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800"></div>
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.03] bg-[center_top_-1px]"></div>
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 flex-grow flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
                <span className="block">AI-Powered</span>
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  Instagram Caption Generator
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
                Generate engaging, context-aware captions for your Instagram posts with our advanced AI. Upload your image and get the perfect caption in seconds.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:from-blue-700 hover:to-purple-700"
                >
                  Get Started
                </Link>
                <Link
                  href="#features"
                  className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-[350px] sm:h-[400px] md:h-[500px] bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-grid-slate-900/[0.02] dark:bg-grid-slate-100/[0.03]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Main polaroid with caption */}
                  <div 
                    className={`w-48 sm:w-56 md:w-72 h-[300px] sm:h-[340px] md:h-[420px] bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 sm:p-3 md:p-4 cursor-pointer transition-all duration-300 ${
                      mainStraight ? 'rotate-0' : 'rotate-3 md:hover:rotate-0'
                    }`}
                    onClick={toggleMainStraight}
                  >
                    <div className="w-full h-40 sm:h-48 md:h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-1 sm:mb-2 md:mb-3 overflow-hidden">
                      {/* Using the hot-air-balloons.jpg image */}
                      <Image 
                        src="/images/hot-air-balloons.jpg" 
                        alt="Hot air balloons in the sky" 
                        width={500} 
                        height={500} 
                        className="w-full h-full object-cover"
                        priority
                      />
                    </div>
                    <div className="space-y-1 mb-1 sm:mb-2 md:mb-3 text-xs sm:text-sm">
                      <AnimatedCaptionShowcase captions={sampleCaptions} />
                    </div>
                    
                    {/* Social media interaction buttons */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-1 sm:pt-2 md:pt-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMainLike();
                            }}
                            className="flex items-center space-x-1 group"
                            aria-label={mainLiked ? "Unlike post" : "Like post"}
                          >
                            <FiHeart 
                              className={`w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5 ${mainLiked ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400'} transition-colors`} 
                            />
                            <span className="text-xs text-gray-600 dark:text-gray-400">{mainLikes}</span>
                          </button>
                          <button 
                            className="flex items-center space-x-1" 
                            aria-label="View comments"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FiMessageSquare className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5 text-gray-600 dark:text-gray-400" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">24</span>
                          </button>
                        </div>
                        <button 
                          className="flex items-center" 
                          aria-label="Share post"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FiShare className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Small polaroid on the side with caption - positioned to avoid overlap */}
              <div 
                className={`absolute -bottom-6 -right-6 w-32 sm:w-36 md:w-48 h-[220px] sm:h-[260px] md:h-[320px] bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 sm:p-3 md:p-4 cursor-pointer transition-all duration-300 ${
                  smallStraight ? 'rotate-0' : '-rotate-6 md:hover:rotate-0'
                }`}
                onClick={toggleSmallStraight}
              >
                <div className="w-full h-20 sm:h-24 md:h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-1 sm:mb-2 md:mb-3 overflow-hidden">
                  {/* Using the dogs.jpg image */}
                  <Image 
                    src="/images/dogs.jpg" 
                    alt="Cute dogs" 
                    width={500} 
                    height={500} 
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
                <div className="space-y-1 mb-1 sm:mb-2 md:mb-3 text-[10px] sm:text-xs md:text-sm">
                  <AnimatedCaptionShowcase 
                    captions={secondaryCaptions} 
                    typingSpeed={70}
                    pauseDuration={1800}
                  />
                </div>
                
                {/* Social media interaction buttons */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-1 sm:pt-2 md:pt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSmallLike();
                        }}
                        className="flex items-center space-x-1 group"
                        aria-label={smallLiked ? "Unlike post" : "Like post"}
                      >
                        <FiHeart 
                          className={`w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5 ${smallLiked ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400'} transition-colors`} 
                        />
                        <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">{smallLikes}</span>
                      </button>
                      <button 
                        className="flex items-center space-x-1" 
                        aria-label="View comments"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FiMessageSquare className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5 text-gray-600 dark:text-gray-400" />
                        <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">18</span>
                      </button>
                    </div>
                    <button 
                      className="flex items-center" 
                      aria-label="Share post"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FiShare className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll down arrow */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
          <span className="text-gray-600 dark:text-gray-300 text-sm mb-2">Scroll Down</span>
          <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <FiChevronDown className="w-6 h-6" />
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to create engaging Instagram captions that drive engagement and growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 transition-transform hover:-translate-y-1 duration-300">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
                <FiCamera className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                AI Image Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our AI analyzes your images to detect objects, scenes, emotions, and themes to generate contextually relevant captions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 transition-transform hover:-translate-y-1 duration-300">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-6">
                <FiHash className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Hashtag Suggestions
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get relevant hashtag suggestions to increase your post's reach and engagement on Instagram.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 transition-transform hover:-translate-y-1 duration-300">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                <FiSmile className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Emoji Suggestions
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Add personality to your captions with AI-suggested emojis that match the mood and content of your image.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 transition-transform hover:-translate-y-1 duration-300">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                <FiSliders className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Tone Customization
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose from multiple caption tones including Witty, Aesthetic, Deep, Trendy, and Minimal to match your personal style.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 transition-transform hover:-translate-y-1 duration-300">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-6">
                <FiShare2 className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                One-Click Sharing
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Copy your generated caption with a single click or share directly to Instagram and other social platforms.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 transition-transform hover:-translate-y-1 duration-300">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Caption Templates
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Access templates for special occasions like birthdays, travel, food, fitness, and more to quickly generate themed captions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-12 sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Ready to create engaging captions?
                </h2>
                <p className="mt-4 text-lg text-blue-100">
                  Start generating AI-powered Instagram captions today and watch your engagement grow.
                </p>
              </div>
              <div className="mt-8 lg:mt-0 lg:ml-8">
                <Link
                  href="/dashboard"
                  className="block w-full sm:w-auto px-6 py-3 bg-white text-blue-600 font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-center"
                >
                  Get Started for Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
