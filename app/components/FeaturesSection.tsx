'use client';

import FeatureCard from './FeatureCard';

// Import animation data
import toneAnimation from '../animations/tone-animation.json';
import hashtagAnimation from '../animations/hashtag-animation.json';
import emojiAnimation from '../animations/emoji-animation.json';
import imageAnalysisAnimation from '../animations/image-analysis-animation.json';
import captionAnimation from '../animations/caption-animation.json';
import clickAnimation from '../animations/click-animation.json';

const features = [
  {
    title: 'AI-Powered Generation',
    description: 'Advanced AI algorithms create captions tailored to your image content and selected tone.',
    animation: captionAnimation,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/30'
  },
  {
    title: 'Multiple Tone Options',
    description: 'Choose from various tones to match your personal style and brand voice.',
    animation: toneAnimation,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/30'
  },
  {
    title: 'Hashtag Generation',
    description: 'Automatically generate relevant hashtags to increase your post\'s visibility.',
    animation: hashtagAnimation,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/30'
  },
  {
    title: 'Emoji Suggestions',
    description: 'Get emoji suggestions that match the mood and content of your image.',
    animation: emojiAnimation,
    iconColor: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/30'
  },
  {
    title: 'Image Analysis',
    description: 'Our AI analyzes your images to create contextually relevant captions.',
    animation: imageAnalysisAnimation,
    iconColor: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/30'
  },
  {
    title: 'User-Friendly Interface',
    description: 'Simple and intuitive interface for a seamless caption generation experience.',
    animation: clickAnimation,
    iconColor: 'text-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/30'
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/20 dark:to-indigo-900/20 blur-3xl opacity-70"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-purple-100 to-pink-200 dark:from-purple-900/20 dark:to-pink-900/20 blur-3xl opacity-70"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 rounded-full text-indigo-800 dark:text-indigo-300 font-medium text-sm mb-4">
            Powerful Features
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-6">
            Everything You Need for Perfect Captions
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Our AI-powered platform helps you create engaging captions that resonate with your audience across all social media platforms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              animationData={feature.animation}
              iconColor={feature.iconColor}
              bgColor={feature.bgColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 