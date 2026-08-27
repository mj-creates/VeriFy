import React, { useState, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';

interface TypewriterTextProps {
  text: string;
  delay?: number; // MS per char
  onComplete?: () => void;
  className?: string;
  cursorColor?: string;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  delay = 80,
  onComplete,
  className = "",
  cursorColor = "bg-white"
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayedText(text);
      if (onComplete) onComplete();
      return;
    }

    setDisplayedText('');
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) {
        clearInterval(intervalId);
        if (onComplete) onComplete();
      }
    }, delay);

    return () => clearInterval(intervalId);
  }, [text, delay, shouldReduceMotion, onComplete]);

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span>{displayedText}</span>
      {!shouldReduceMotion && (
        <span
          className={`inline-block w-[2px] h-[1em] ml-[2px] animate-pulse ${cursorColor}`}
          style={{ animationDuration: '800ms' }}
        />
      )}
    </span>
  );
};
