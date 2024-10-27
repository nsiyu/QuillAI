import { useState, useEffect } from 'react';
import { Note } from '../services/notes';
import { useTextAnimation } from '../hooks/useTextAnimation';

interface AnimatedNoteContentProps {
  note: Note;
  onContentChange: (updatedNote: Note) => void;
  onTextSelection: () => void;
  animate: boolean;
}

export function AnimatedNoteContent({
  note,
  onContentChange,
  onTextSelection,
  animate
}: AnimatedNoteContentProps) {
  const [previousContent, setPreviousContent] = useState(note.content);
  
  const displayText = useTextAnimation({
    originalText: previousContent,
    newText: note.content,
    speed: 30,
    onComplete: () => {
      setPreviousContent(note.content);
    }
  });

  // Update previousContent when not animating
  useEffect(() => {
    if (!animate) {
      setPreviousContent(note.content);
    }
  }, [animate, note.content]);

  return (
    <textarea
      value={animate ? displayText : note.content}
      onChange={(e) => {
        const updatedNote = {
          ...note,
          content: e.target.value
        };
        setPreviousContent(e.target.value);
        onContentChange(updatedNote);
      }}
      onMouseUp={onTextSelection}
      onKeyUp={onTextSelection}
      className="w-full h-[calc(100vh-200px)] bg-transparent border-none outline-none text-jet/90 resize-none hide-scrollbar"
      placeholder="Start writing..."
    />
  );
}
