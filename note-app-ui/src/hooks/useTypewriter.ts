import { useState, useEffect } from 'react';

export function useTypewriter(text: string, speed: number = 100) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (isDeleting) {
      if (displayText.length === 0) {
        setIsDeleting(false);
        setIsTyping(true);
        return;
      }

      const timeout = setTimeout(() => {
        setDisplayText(prev => prev.slice(0, -1));
      }, speed / 2);
      return () => clearTimeout(timeout);
    }

    if (!isTyping) {
      const timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 2000); // Wait 2 seconds before starting to delete
      return () => clearTimeout(timeout);
    }

    if (displayText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(text.slice(0, displayText.length + 1));
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
    }
  }, [displayText, text, speed, isTyping, isDeleting]);

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  return `${displayText}${showCursor ? '|' : ''}`;
}
