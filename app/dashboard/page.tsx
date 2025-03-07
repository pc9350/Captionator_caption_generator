'use client';

import { useState } from 'react';
import { CaptionTone } from '../types';

// Mark this route as dynamic to prevent static generation
export const dynamicParams = true;
export const dynamic = 'force-dynamic';

export default function Dashboard() {
  const [selectedTone, setSelectedTone] = useState<string>('Casual');

  const handleToneChange = (tone: string) => {
    console.log('Dashboard: handleToneChange called with tone:', tone);
    setSelectedTone(tone);
  };

  // Type guard to check if a string is a valid CaptionTone
  const isCaptionTone = (tone: string): tone is CaptionTone => {
    return [
      'Witty & Sarcastic',
      'Aesthetic & Artsy',
      'Deep & Thoughtful',
      'Trend & Pop Culture-Based',
      'Minimal & Classy',
      'Cool & Attitude'
    ].includes(tone);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Generate Instagram Captions
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Upload Your Media
            </h2>
            <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Caption Options
            </h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Tone
              </label>
              <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
            </div>
            
            <div className="mt-8">
              <button 
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Generate Captions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 