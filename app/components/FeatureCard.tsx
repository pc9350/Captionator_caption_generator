import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { ReactNode } from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  animationData: any;
  iconColor: string;
  bgColor: string;
}

export default function FeatureCard({ 
  title, 
  description, 
  animationData,
  iconColor,
  bgColor
}: FeatureCardProps) {
  return (
    <motion.div 
      className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl"
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2 }
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.5 }
      }}
      viewport={{ once: true }}
    >
      <div className={`w-16 h-16 ${bgColor} rounded-2xl flex items-center justify-center mb-6 overflow-hidden`}>
        <div className="w-12 h-12">
          <Lottie 
            animationData={animationData} 
            loop={true}
            className={iconColor}
          />
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </motion.div>
  );
} 