'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { FiChevronDown, FiHeart, FiMessageSquare, FiShare } from 'react-icons/fi';
import dynamic from 'next/dynamic';

// Dynamically import client components
const AnimatedCaptionShowcase = dynamic(() => import('./AnimatedCaptionShowcase'), {
  ssr: false,
  loading: () => (
    <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
  )
});

const FeaturesSection = dynamic(() => import('./FeaturesSection'), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
  )
});

// Sample captions for display
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

export default function HomeContent() {
  const [mainLikes, setMainLikes] = useState(1234);
  const [smallLikes, setSmallLikes] = useState(567);
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [orientation, setOrientation] = useState(0);

  // Set client-side state and check for mobile view
  useEffect(() => {
    setIsClient(true);
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check on initial load
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Handle like button clicks
  const handleMainLike = () => {
    setMainLikes(prev => prev + 1);
  };

  const handleSmallLike = () => {
    setSmallLikes(prev => prev + 1);
  };

  // Handle post rotation
  const rotatePost = () => {
    setOrientation(prev => (prev + 1) % 2);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left space-y-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
                Create Perfect Instagram Captions with AI
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Transform your Instagram game with AI-powered captions that match your style and tone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/dashboard"
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                >
                  Get Started
                </Link>
                <Link
                  href="#features"
                  className="px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-center flex items-center justify-center"
                >
                  Learn More
                  <FiChevronDown className="ml-2" />
                </Link>
              </div>
            </div>

            {/* Interactive Demo */}
            <div className="relative">
              <div className="relative z-10">
                {/* Main Instagram Post */}
                <div 
                  className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl transform hover:rotate-1 transition-transform cursor-pointer max-w-md mx-auto"
                  onClick={rotatePost}
                >
                  <div className="p-4">
                    <div className="flex items-center mb-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500"></div>
                      <div className="ml-3">
                        <div className="font-semibold text-gray-900 dark:text-white">travel_enthusiast</div>
                        <div className="text-sm text-gray-500">Santorini, Greece</div>
                      </div>
                    </div>
                    <div className="relative pb-[100%] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      {isClient && (
                        <Image
                          src={orientation === 0 ? "/images/hot-air-balloons.jpg" : "/images/dogs.jpg"}
                          alt="Instagram post"
                          fill
                          className="object-cover"
                          priority
                        />
                      )}
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center gap-4 mb-3">
                        <button 
                          className="text-2xl text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMainLike();
                          }}
                          aria-label="Like post"
                        >
                          <FiHeart />
                        </button>
                        <button 
                          className="text-2xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                          aria-label="Comment on post"
                        >
                          <FiMessageSquare />
                        </button>
                        <button 
                          className="text-2xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                          aria-label="Share post"
                        >
                          <FiShare />
                        </button>
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white mb-2">{mainLikes.toLocaleString()} likes</div>
                      <div className="space-y-2">
                        {isClient && <AnimatedCaptionShowcase captions={sampleCaptions} />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Smaller Post */}
                <div 
                  className={`absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:-rotate-3 transition-transform cursor-pointer w-64 ${isMobile ? 'hidden' : 'hidden md:block'}`}
                >
                  <div className="p-3">
                    <div className="flex items-center mb-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500"></div>
                      <div className="ml-2">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">foodie_adventures</div>
                      </div>
                    </div>
                    <div className="relative pb-[100%] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      {isClient && (
                        <Image
                          src="/images/dogs.jpg"
                          alt="Second Instagram post"
                          fill
                          className="object-cover"
                          priority
                        />
                      )}
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center gap-3 mb-2">
                        <button 
                          className="text-xl text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          onClick={handleSmallLike}
                          aria-label="Like post"
                        >
                          <FiHeart />
                        </button>
                        <button 
                          className="text-xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                          aria-label="Comment on post"
                        >
                          <FiMessageSquare />
                        </button>
                      </div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{smallLikes} likes</div>
                      <div className="text-sm">
                        {isClient && (
                          <AnimatedCaptionShowcase 
                            captions={secondaryCaptions}
                            typingSpeed={30}
                            pauseDuration={1500}
                            deletingSpeed={20}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      {isClient && <FeaturesSection />}
    </div>
  );
} 