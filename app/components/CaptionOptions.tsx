'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiType, FiZap, FiCheck } from 'react-icons/fi';
import { useCaptionStore, CaptionLength, SpicyLevel, CaptionStyle, CreativeLanguageOptions } from '@/app/store/captionStore';
import CaptionStyleSelector from './CaptionStyleSelector';

export default function CaptionOptions() {
  const { 
    includeHashtags, 
    setIncludeHashtags, 
    includeEmojis, 
    setIncludeEmojis,
    captionLength,
    setCaptionLength,
    spicyLevel,
    setSpicyLevel,
    captionStyle,
    setCaptionStyle,
    creativeLanguageOptions,
    setCreativeLanguageOptions
  } = useCaptionStore();

  const lengthOptions = [
    { value: 'single-word' as CaptionLength, label: 'Single Word', description: 'Just one word' },
    { value: 'micro' as CaptionLength, label: 'Micro', description: '2-3 words' },
    { value: 'short' as CaptionLength, label: 'Short', description: '10-15 words' },
    { value: 'medium' as CaptionLength, label: 'Medium', description: '25-40 words' },
    { value: 'long' as CaptionLength, label: 'Long', description: '50-75 words' },
  ];

  const spicyOptions = [
    { value: 'none' as SpicyLevel, label: 'None', description: 'Keep it clean and neutral' },
    { value: 'mild' as SpicyLevel, label: 'Mild', description: 'Subtle playfulness' },
    { value: 'medium' as SpicyLevel, label: 'Medium', description: 'Moderate flirtatiousness' },
    { value: 'hot' as SpicyLevel, label: 'Hot', description: 'Bold and sensual' },
    { value: 'extra' as SpicyLevel, label: 'Extra', description: 'Provocative and attention-grabbing' },
  ];

  const handleStyleChange = (style: string) => {
    setCaptionStyle(style as CaptionStyle);
  };

  const handleCreativeOptionsChange = (options: CreativeLanguageOptions) => {
    setCreativeLanguageOptions(options);
  };

  return (
    <div className="space-y-8">
      {/* Caption Length Options */}
      <div>
        <div className="flex items-center mb-4">
          <FiType className="w-5 h-5 text-indigo-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Caption Length</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {lengthOptions.map((option) => (
            <motion.button
              key={option.value}
              onClick={() => setCaptionLength(option.value)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`relative p-3 rounded-lg border ${
                captionLength === option.value
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              } transition-all duration-200`}
            >
              <div className="text-center">
                <span className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {option.label}
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  {option.description}
                </span>
              </div>
              {captionLength === option.value && (
                <div className="absolute top-2 right-2 bg-indigo-500 text-white rounded-full p-0.5">
                  <FiCheck className="w-3 h-3" />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Spicy Level Options */}
      <div>
        <div className="flex items-center mb-4">
          <FiZap className="w-5 h-5 text-pink-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Spice Level</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {spicyOptions.map((option) => (
            <motion.button
              key={option.value}
              onClick={() => setSpicyLevel(option.value)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`relative p-3 rounded-lg border ${
                spicyLevel === option.value
                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              } transition-all duration-200`}
            >
              <div className="text-center">
                <span className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {option.label}
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  {option.description}
                </span>
              </div>
              {spicyLevel === option.value && (
                <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full p-0.5">
                  <FiCheck className="w-3 h-3" />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Caption Style Selector */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
        <CaptionStyleSelector 
          onStyleChange={handleStyleChange}
          onCreativeOptionsChange={handleCreativeOptionsChange}
          initialStyle={captionStyle}
          initialOptions={creativeLanguageOptions}
        />
      </div>

      {/* Toggle Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Include Hashtags</span>
          </div>
          <button
            onClick={() => setIncludeHashtags(!includeHashtags)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              includeHashtags ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
            title="Toggle hashtags"
          >
            <span className="sr-only">{includeHashtags ? 'Disable hashtags' : 'Enable hashtags'}</span>
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                includeHashtags ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Include Emojis</span>
          </div>
          <button
            onClick={() => setIncludeEmojis(!includeEmojis)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              includeEmojis ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
            title="Toggle emojis"
          >
            <span className="sr-only">{includeEmojis ? 'Disable emojis' : 'Enable emojis'}</span>
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                includeEmojis ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
} 