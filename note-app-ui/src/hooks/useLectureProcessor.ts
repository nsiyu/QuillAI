import { useState, useCallback, useRef } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { Note } from '../services/notes';

interface ProcessedSegment {
  original: string;
  processed: string;
  timestamp: number;
}

interface UseLectureProcessorProps {
  onProcessedText: (processedText: string) => void;
  selectedNote: Note | null;
}

export function useLectureProcessor({ 
  onProcessedText, 
  selectedNote 
}: UseLectureProcessorProps) {
  const session = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const transcriptBuffer = useRef<string[]>([]);
  const processedSegments = useRef<ProcessedSegment[]>([]);
  const processingTimeout = useRef<NodeJS.Timeout>();

  const processTranscript = useCallback(async () => {
    if (transcriptBuffer.current.length === 0 || !selectedNote) {
      console.log('No text to process or no selected note');
      return;
    }

    const textToProcess = transcriptBuffer.current.join(' ');
    transcriptBuffer.current = [];
    setIsProcessing(true);

    try {
      if (!session?.access_token) {
        throw new Error('No authentication token found');
      }

      console.log('Processing text:', textToProcess);

      const response = await fetch('http://localhost:8000/api/v1/lecture/process', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ text: textToProcess })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
      }

      const { processedText } = await response.json();
      console.log('Received processed text:', processedText); 
      
      processedSegments.current.push({
        original: textToProcess,
        processed: processedText,
        timestamp: Date.now()
      });

      onProcessedText(processedText);

    } catch (error) {
      console.error('Error processing lecture:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [onProcessedText, selectedNote, session]);

  const addTranscript = useCallback((transcript: string) => {
    transcriptBuffer.current.push(transcript);

    if (processingTimeout.current) {
      clearTimeout(processingTimeout.current);
    }

    processingTimeout.current = setTimeout(processTranscript, 5000);
  }, [processTranscript]);

  return {
    isProcessing,
    addTranscript,
    processedSegments: processedSegments.current
  };
}
