import { motion } from 'framer-motion';
import FeatureCard from './FeatureCard';
import aiAnalysisAnimation from '../../public/animations/image-analysis-animation.json';
import hashtagAnimation from '../../public/animations/hashtag-animation.json';
import emojiAnimation from '../../public/animations/emoji-animation.json';
import toneAnimation from '../../public/animations/tone-animation.json';
import sharingAnimation from '../../public/animations/click-animation.json';
import templateAnimation from '../../public/animations/caption-animation.json';

// Import your Lottie animation files here
// You'll need to download and add these animations to your project
// Example: import aiAnalysisAnimation from '../animations/ai-analysis.json';

const features = [
  {
    title: 'AI Image Analysis',
    description: 'Our AI analyzes your images to detect objects, scenes, emotions, and themes to generate contextually relevant captions.',
    animationData: aiAnalysisAnimation,
    iconColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30'
  },
  {
    title: 'Hashtag Suggestions',
    description: "Get relevant hashtag suggestions to increase your post's reach and engagement on Instagram.",
    animationData: hashtagAnimation,
    iconColor: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30'
  },
  {
    title: 'Emoji Suggestions',
    description: 'Add personality to your captions with AI-suggested emojis that match the mood and content of your image.',
    animationData: emojiAnimation,
    iconColor: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30'
  },
  {
    title: 'Tone Customization',
    description: 'Choose from multiple caption tones including Witty, Aesthetic, Deep, Trendy, and Minimal to match your personal style.',
    animationData: toneAnimation,
    iconColor: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30'
  },
  {
    title: 'One-Click Sharing',
    description: 'Copy your generated caption with a single click or share directly to Instagram and other social platforms.',
    animationData: sharingAnimation,
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
  },
  {
    title: 'Caption Templates',
    description: 'Access templates for special occasions like birthdays, travel, food, fitness, and more to quickly generate themed captions.',
    animationData: templateAnimation,
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30'
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need to create engaging Instagram captions that drive engagement and growth.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              {...feature}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 