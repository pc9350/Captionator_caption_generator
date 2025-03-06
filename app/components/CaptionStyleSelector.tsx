'use client';

import { useState, useEffect } from 'react';
import { FiInfo } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Tooltip from './Tooltip';
import { CaptionStyle, CreativeLanguageOptions } from '@/app/store/captionStore';

interface CaptionStyleSelectorProps {
  onStyleChange: (style: string) => void;
  onCreativeOptionsChange: (options: CreativeLanguageOptions) => void;
  initialStyle?: CaptionStyle;
  initialOptions?: CreativeLanguageOptions;
}

export default function CaptionStyleSelector({
  onStyleChange,
  onCreativeOptionsChange,
  initialStyle = 'none',
  initialOptions = { wordInvention: false, alliteration: false, rhyming: false }
}: CaptionStyleSelectorProps) {
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>(initialStyle);
  const [wordInvention, setWordInvention] = useState(initialOptions.wordInvention);
  const [alliteration, setAlliteration] = useState(initialOptions.alliteration);
  const [rhyming, setRhyming] = useState(initialOptions.rhyming);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipAnchor, setTooltipAnchor] = useState<HTMLElement | null>(null);

  // Update state when initialStyle or initialOptions change
  useEffect(() => {
    setCaptionStyle(initialStyle);
  }, [initialStyle]);

  useEffect(() => {
    setWordInvention(initialOptions.wordInvention);
    setAlliteration(initialOptions.alliteration);
    setRhyming(initialOptions.rhyming);
  }, [initialOptions]);

  const handleStyleChange = (style: string) => {
    const newStyle = style as CaptionStyle;
    setCaptionStyle(newStyle);
    onStyleChange(newStyle);
    
    // If word-invention style is selected, automatically enable wordInvention
    if (style === 'word-invention' && !wordInvention) {
      setWordInvention(true);
      onCreativeOptionsChange({
        wordInvention: true,
        alliteration,
        rhyming,
      });
    }
  };

  const handleCreativeOptionChange = (option: 'wordInvention' | 'alliteration' | 'rhyming', value: boolean) => {
    if (option === 'wordInvention') {
      setWordInvention(value);
    } else if (option === 'alliteration') {
      setAlliteration(value);
    } else if (option === 'rhyming') {
      setRhyming(value);
    }

    onCreativeOptionsChange({
      wordInvention: option === 'wordInvention' ? value : wordInvention,
      alliteration: option === 'alliteration' ? value : alliteration,
      rhyming: option === 'rhyming' ? value : rhyming,
    });
  };

  const showTooltip = (content: string, element: HTMLElement) => {
    setTooltipContent(content);
    setTooltipAnchor(element);
    setTooltipVisible(true);
  };

  const styleDescriptions = {
    'none': 'Standard caption style',
    'pattern-interrupt': 'Starts with an unexpected phrase that stops scrolling',
    'mysterious': 'Creates intrigue and curiosity',
    'controversial': 'Takes a mild stance to spark comments',
    'quote-style': 'Formatted like a profound quote from a book or movie',
    'word-invention': 'Creates new, catchy words related to the image'
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center mb-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Caption Style
          </label>
          <button
            className="ml-1 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            onMouseEnter={(e) => showTooltip('Choose a special style for your caption to make it stand out', e.currentTarget)}
            onMouseLeave={() => setTooltipVisible(false)}
            title="Choose a special style for your caption to make it stand out"
            type="button"
            aria-label="Caption style information"
          >
            <FiInfo className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { id: 'none', label: 'Standard' },
            { id: 'pattern-interrupt', label: 'Pattern Interrupt' },
            { id: 'mysterious', label: 'Mysterious' },
            { id: 'controversial', label: 'Controversial' },
            { id: 'quote-style', label: 'Quote Style' },
            { id: 'word-invention', label: 'Word Invention' }
          ].map((option) => (
            <motion.button
              key={option.id}
              type="button"
              onClick={() => handleStyleChange(option.id)}
              className={`px-3 py-2 text-sm rounded-lg transition-all ${
                captionStyle === option.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onMouseEnter={(e) => showTooltip(styleDescriptions[option.id as keyof typeof styleDescriptions], e.currentTarget)}
              onMouseLeave={() => setTooltipVisible(false)}
              aria-pressed={captionStyle === option.id ? "true" : "false"}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center mb-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Creative Language Features
          </label>
          <button
            className="ml-1 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            onMouseEnter={(e) => showTooltip('Add special language features to make your caption more memorable', e.currentTarget)}
            onMouseLeave={() => setTooltipVisible(false)}
            title="Add special language features to make your caption more memorable"
            type="button"
            aria-label="Creative language features information"
          >
            <FiInfo className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              id="wordInvention"
              type="checkbox"
              checked={wordInvention}
              onChange={(e) => handleCreativeOptionChange('wordInvention', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="wordInvention" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Word Invention (create new, catchy words)
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="alliteration"
              type="checkbox"
              checked={alliteration}
              onChange={(e) => handleCreativeOptionChange('alliteration', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="alliteration" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Alliteration (words starting with same sound)
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="rhyming"
              type="checkbox"
              checked={rhyming}
              onChange={(e) => handleCreativeOptionChange('rhyming', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="rhyming" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Rhyming (subtle rhymes for memorability)
            </label>
          </div>
        </div>
      </div>

      <div className="mt-2">
        <button
          type="button"
          onClick={() => {
            // Randomly select style and creative options
            const styles = ['none', 'pattern-interrupt', 'mysterious', 'controversial', 'quote-style', 'word-invention'];
            const randomStyle = styles[Math.floor(Math.random() * styles.length)] as CaptionStyle;
            
            const randomWordInvention = Math.random() > 0.5;
            const randomAlliteration = Math.random() > 0.5;
            const randomRhyming = Math.random() > 0.5;
            
            setCaptionStyle(randomStyle);
            setWordInvention(randomWordInvention);
            setAlliteration(randomAlliteration);
            setRhyming(randomRhyming);
            
            onStyleChange(randomStyle);
            onCreativeOptionsChange({
              wordInvention: randomWordInvention,
              alliteration: randomAlliteration,
              rhyming: randomRhyming,
            });
          }}
          className="w-full px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-200"
          aria-label="Randomly select caption style and creative options"
        >
          Surprise Me! (Random Style)
        </button>
      </div>

      {tooltipVisible && tooltipAnchor && (
        <Tooltip
          text={tooltipContent}
          isVisible={tooltipVisible}
          anchorElement={tooltipAnchor}
          position="top"
        />
      )}
    </div>
  );
}