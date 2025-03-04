import { Switch } from '@headlessui/react';
import { useCaptionStore } from '../store/captionStore';
import { FiHash, FiSmile } from 'react-icons/fi';

export default function CaptionOptions() {
  const { 
    includeHashtags, 
    setIncludeHashtags, 
    includeEmojis, 
    setIncludeEmojis 
  } = useCaptionStore();

  return (
    <div className="w-full max-w-md space-y-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Additional Options
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FiHash className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Include Hashtags
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Add relevant hashtags to increase reach
              </p>
            </div>
          </div>
          <Switch
            checked={includeHashtags}
            onChange={setIncludeHashtags}
            className={`${
              includeHashtags ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            <span
              className={`${
                includeHashtags ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FiSmile className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Include Emojis
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Add relevant emojis to make captions more engaging
              </p>
            </div>
          </div>
          <Switch
            checked={includeEmojis}
            onChange={setIncludeEmojis}
            className={`${
              includeEmojis ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            <span
              className={`${
                includeEmojis ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>
      </div>
    </div>
  );
} 