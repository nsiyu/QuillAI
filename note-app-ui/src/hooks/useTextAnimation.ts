import { useState, useEffect, useCallback } from 'react';

interface UseTextAnimationProps {
  originalText: string;
  newText: string;
  onComplete?: () => void;
  speed?: number;
}

export function useTextAnimation({
  originalText,
  newText,
  onComplete,
  speed = 50
}: UseTextAnimationProps) {
  const [displayText, setDisplayText] = useState(originalText);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const animate = useCallback(() => {
    if (originalText === newText) {
      setIsAnimating(false);
      return;
    }

    if (isDeleting) {
      if (displayText === '') {
        setIsDeleting(false);
        setCurrentIndex(0);
        return;
      }
      setDisplayText(prev => prev.slice(0, -1));
    } else {
      if (currentIndex >= newText.length) {
        setIsAnimating(false);
        onComplete?.();
        return;
      }
      setDisplayText(prev => prev + newText[currentIndex]);
      setCurrentIndex(prev => prev + 1);
    }
  }, [isDeleting, displayText, currentIndex, newText, originalText, onComplete]);

  useEffect(() => {
    if (originalText === newText) {
      setDisplayText(newText);
      return;
    }

    setIsAnimating(true);
    
    // Only start deleting if we have original text and it's different
    if (originalText && originalText !== newText && !isDeleting && currentIndex === 0) {
      setIsDeleting(true);
    }

    const timeout = setTimeout(animate, speed);
    return () => clearTimeout(timeout);
  }, [originalText, newText, isDeleting, animate, speed, currentIndex]);

  return displayText;
}
