import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface TypewriterTextProps {
  text: string;
  speed?: number; // ms per char
  onComplete?: () => void;
  className?: string;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 12,
  onComplete,
  className = '',
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    setIsCompleted(false);

    if (!text) {
      setIsCompleted(true);
      onComplete?.();
      return;
    }

    const interval = setInterval(() => {
      index += 2; // reveal 2 characters at a time for smooth gentle cadence
      if (index >= text.length) {
        setDisplayedText(text);
        setIsCompleted(true);
        clearInterval(interval);
        onComplete?.();
      } else {
        setDisplayedText(text.slice(0, index));
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  const handleFastForward = () => {
    setDisplayedText(text);
    setIsCompleted(true);
    onComplete?.();
  };

  return (
    <div className={`relative group ${className}`} onClick={handleFastForward}>
      <div className="whitespace-pre-wrap leading-relaxed">
        {displayedText}
        {!isCompleted && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="inline-block w-1.5 h-4 ml-1 align-middle bg-[#D9778F] rounded-full"
          />
        )}
      </div>

      {!isCompleted && (
        <button
          type="button"
          onClick={handleFastForward}
          className="mt-2 text-xs font-medium text-[#8A5D43]/60 hover:text-[#8A5D43] transition-colors underline decoration-dotted cursor-pointer"
        >
          Click to reveal full text
        </button>
      )}
    </div>
  );
};
