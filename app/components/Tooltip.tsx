'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  text: string;
  isVisible: boolean;
  anchorElement: HTMLElement | null;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ text, isVisible, anchorElement, position = 'top' }: TooltipProps) {
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (anchorElement && isVisible) {
      const rect = anchorElement.getBoundingClientRect();
      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = rect.top - 10;
          left = rect.left + rect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + 10;
          left = rect.left + rect.width / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2;
          left = rect.left - 10;
          break;
        case 'right':
          top = rect.top + rect.height / 2;
          left = rect.right + 10;
          break;
      }

      setTooltipPosition({ top, left });
    }
  }, [anchorElement, isVisible, position]);

  if (!isMounted || !isVisible || !anchorElement) return null;

  // Determine arrow position class
  const arrowClass = {
    top: 'after:border-t-gray-800 after:border-b-transparent after:border-l-transparent after:border-r-transparent after:bottom-[-8px]',
    bottom: 'after:border-b-gray-800 after:border-t-transparent after:border-l-transparent after:border-r-transparent after:top-[-8px]',
    left: 'after:border-l-gray-800 after:border-r-transparent after:border-t-transparent after:border-b-transparent after:right-[-8px]',
    right: 'after:border-r-gray-800 after:border-l-transparent after:border-t-transparent after:border-b-transparent after:left-[-8px]',
  }[position];

  // Determine transform class
  const transformClass = {
    top: 'transform -translate-x-1/2 -translate-y-full',
    bottom: 'transform -translate-x-1/2',
    left: 'transform -translate-x-full -translate-y-1/2',
    right: 'transform -translate-y-1/2',
  }[position];

  return createPortal(
    <div
      className={`fixed px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap pointer-events-none ${transformClass} after:absolute after:content-[''] after:border-[8px] after:left-1/2 after:-ml-[8px] ${arrowClass}`}
      style={{
        top: `${tooltipPosition.top}px`,
        left: `${tooltipPosition.left}px`,
        zIndex: 10000,
      }}
    >
      {text}
    </div>,
    document.body
  );
} 