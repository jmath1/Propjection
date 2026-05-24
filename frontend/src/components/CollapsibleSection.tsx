import { ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps {
  id: string;
  label: string;
  expanded: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}

import React, { useRef, useEffect, useState } from 'react';

export default function CollapsibleSection({
  id,
  label,
  expanded,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState('0px');
  const [isVisible, setIsVisible] = useState(expanded);

  useEffect(() => {
    if (expanded) {
      setIsVisible(true);
      // Wait for next tick to allow transition
      setTimeout(() => {
        if (contentRef.current) {
          setMaxHeight(contentRef.current.scrollHeight + 'px');
        }
      }, 10);
    } else {
      if (contentRef.current) {
        setMaxHeight(contentRef.current.scrollHeight + 'px');
        // Allow transition before hiding
        setTimeout(() => setMaxHeight('0px'), 10);
        // Hide after transition
        setTimeout(() => setIsVisible(false), 300);
      } else {
        setIsVisible(false);
      }
    }
  }, [expanded]);

  useEffect(() => {
    // If expanded and content changes, update maxHeight
    if (expanded && contentRef.current) {
      setMaxHeight(contentRef.current.scrollHeight + 'px');
    }
  }, [children, expanded]);

  return (
    <div className="border-b border-gray-200 dark:border-slate-700">
      <button
        onClick={() => onToggle(id)}
        className="w-full px-4 py-3.5 font-semibold text-sm flex justify-between items-center hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-gray-900 dark:text-gray-100"
        aria-expanded={expanded}
        aria-controls={`section-content-${id}`}
      >
        <span>{label}</span>
        <ChevronDown
          size={20}
          className={`transform transition-transform duration-200 text-gray-600 dark:text-gray-400 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        id={`section-content-${id}`}
        ref={contentRef}
        style={{
          maxHeight: expanded ? maxHeight : '0px',
          opacity: expanded ? 1 : 0,
          transition: 'max-height 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.25s',
          overflow: 'hidden',
          visibility: isVisible ? 'visible' : 'hidden',
        }}
        className="space-y-3 pb-4 px-4 bg-gray-50 dark:bg-slate-700/30"
        aria-hidden={!expanded}
      >
        {children}
      </div>
    </div>
  );
}
