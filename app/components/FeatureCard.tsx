'use client';

import Lottie from 'lottie-react';
import { useRef, useEffect } from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  animationData: Record<string, unknown>;
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
  const lottieRef = useRef<any>(null);

  // Ensure animation plays on mount
  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.play();
    }
  }, []);

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="flex flex-col items-center text-center">
        <div 
          className={`w-24 h-24 mb-6 rounded-full flex items-center justify-center ${bgColor}`}
        >
          <div className="w-16 h-16">
            <Lottie 
              lottieRef={lottieRef}
              animationData={animationData} 
              loop={true}
              autoplay={true}
              rendererSettings={{
                preserveAspectRatio: 'xMidYMid slice'
              }}
              style={{ width: '100%', height: '100%' }}
              className={`${iconColor}`}
            />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          {description}
        </p>
      </div>
    </div>
  );
} 