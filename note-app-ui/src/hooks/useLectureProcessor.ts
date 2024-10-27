import { useState, useCallback, useRef } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { Note } from "../services/notes";
import { getApiUrl } from "../config/api";

interface ProcessedSegment {
  original: string;
  processed: string;
  timestamp: number;
}

interface UseLectureProcessorProps {
  onProcessedText: (processedText: string, animate?: boolean) => void;
  selectedNote: Note | null;
}

export function useLectureProcessor({
  onProcessedText,
  selectedNote,
}: UseLectureProcessorProps) {
  const session = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const transcriptBuffer = useRef<string[]>([]);
  const processedSegments = useRef<ProcessedSegment[]>([]);
  const processingTimeout = useRef<NodeJS.Timeout>();

  const processTranscript = useCallback(async () => {
    if (transcriptBuffer.current.length === 0 || !selectedNote) {
      return;
    }

    setIsProcessing(true);
    const textToProcess = transcriptBuffer.current.join(" ");
    transcriptBuffer.current = [];

    try {
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${getApiUrl()}/api/v1/lecture/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ text: textToProcess }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.detail || `HTTP error! status: ${response.status}`
        );
      }

      const { processedText } = await response.json();
      processedSegments.current.push({
        original: textToProcess,
        processed: processedText,
        timestamp: Date.now(),
      });

      onProcessedText(processedText);

      // Add a small delay before setting isProcessing to false
      setTimeout(() => {
        setIsProcessing(false);
      }, 1000); // Adjust this delay as needed
    } catch (error) {
      console.error("Error processing lecture:", error);
      setIsProcessing(false);
    }
  }, [onProcessedText, selectedNote, session]);

  const submitEdit = useCallback(
    async (partToModify: string, suggestion: string) => {
      if (!selectedNote || !session?.access_token) {
        console.error("No selected note or authentication token.");
        return;
      }

      setIsProcessing(true);

      try {
        const response = await fetch(`${getApiUrl()}/api/v1/lecture/edit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            wholeLecture: selectedNote.content,
            partToModify,
            suggestion,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(
            error.detail || `HTTP error! status: ${response.status}`
          );
        }

        const { modifiedText } = await response.json();
        processedSegments.current.push({
          original: selectedNote.content,
          processed: modifiedText,
          timestamp: Date.now(),
        });

        onProcessedText(modifiedText, true); // Assuming you want to animate the changes
      } catch (error) {
        console.error("Error submitting edit:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [selectedNote, session, onProcessedText]
  );

  return {
    isProcessing,
    addTranscript: useCallback(
      (transcript: string) => {
        transcriptBuffer.current.push(transcript);
        if (processingTimeout.current) {
          clearTimeout(processingTimeout.current);
        }
        processingTimeout.current = setTimeout(processTranscript, 5000);
      },
      [processTranscript]
    ),
    submitEdit,
    processedSegments: processedSegments.current,
  };
}
