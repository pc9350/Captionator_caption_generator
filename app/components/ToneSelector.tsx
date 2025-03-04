'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';

interface ToneSelectorProps {
  selectedTone: string;
  onToneChange: (tone: string) => void;
}

const toneOptions = [
  {
    value: 'casual',
    label: 'Casual',
    description: 'Relaxed, friendly, and conversational',
  },
  {
    value: 'professional',
    label: 'Professional',
    description: 'Polished, formal, and business-like',
  },
  {
    value: 'funny',
    label: 'Funny',
    description: 'Humorous, witty, and entertaining',
  },
  {
    value: 'inspirational',
    label: 'Inspirational',
    description: 'Uplifting, motivational, and positive',
  },
  {
    value: 'storytelling',
    label: 'Storytelling',
    description: 'Narrative, engaging, and descriptive',
  },
];

export default function ToneSelector({ selectedTone, onToneChange }: ToneSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {toneOptions.map((tone) => (
        <motion.div
          key={tone.value}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`p-4 rounded-lg cursor-pointer border-2 transition-colors ${
            selectedTone === tone.value
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
          onClick={() => onToneChange(tone.value)}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{tone.label}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {tone.description}
              </p>
            </div>
            {selectedTone === tone.value && (
              <div className="bg-blue-500 text-white rounded-full p-1">
                <FiCheck className="w-4 h-4" />
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
} 