import { useCallback, useRef, useState, useEffect } from 'react';
import {
  Hume,
  HumeClient,
  convertBlobToBase64,
  convertBase64ToBlob,
  ensureSingleValidAudioTrack,
  getBrowserSupportedMimeType,
  MimeType,
} from 'hume';

interface UseHumeAIProps {
  onTranscriptReceived?: (transcript: string) => void;
  onAudioReceived?: (audioBlob: Blob) => void;
  onAIResponse?: (response: string) => void;
}

export function useHumeAI({ onTranscriptReceived, onAudioReceived, onAIResponse }: UseHumeAIProps = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMutedRef = useRef(false);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const clientRef = useRef<HumeClient | null>(null);
  const socketRef = useRef<Hume.empathicVoice.chat.ChatSocket | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioQueueRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);
  const chatGroupIdRef = useRef<string | undefined>();
  const isClosingRef = useRef(false);
  const recorderRef = useRef<MediaRecorder | null>(null);

  const cleanup = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    recorderRef.current = null;

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    if (socketRef.current) {
      const socket = socketRef.current;
      socketRef.current = null;
      socket.close();
    }

    isPlayingRef.current = false;
    audioQueueRef.current = [];
    setIsListening(false);
    setIsMuted(false);
    isClosingRef.current = false;
  }, []);

  const playAudio = useCallback(() => {
    if (!audioQueueRef.current.length || isPlayingRef.current) return;

    isPlayingRef.current = true;
    const audioBlob = audioQueueRef.current.shift();
    if (!audioBlob) {
      isPlayingRef.current = false;
      return;
    }
    const audioUrl = URL.createObjectURL(audioBlob);
    currentAudioRef.current = new Audio(audioUrl);
    if (onAudioReceived) {
      onAudioReceived(audioBlob);
    }
    currentAudioRef.current.onended = () => {
      isPlayingRef.current = false;
      if (audioQueueRef.current.length) {
        playAudio();
      }
    };
    currentAudioRef.current.play();
  }, [onAudioReceived]);

  const handleMessage = useCallback(
    (message: Hume.empathicVoice.SubscribeEvent) => {
      console.log('Received message:', message);
      switch (message.type) {
        case 'chat_metadata':
          chatGroupIdRef.current = message.chatGroupId;
          break;
        case 'user_message':
          if (onTranscriptReceived && message.message.content) {
            onTranscriptReceived(message.message.content);
          }
          break;
        case 'assistant_message':
          if (onAIResponse && message.message?.content) {
            console.log('Assistant response:', message.message.content);
            onAIResponse(message.message.content);
          }
          break;
        case 'audio_output':
          const mimeTypeResult = getBrowserSupportedMimeType();
          const mimeType = 'mimeType' in mimeTypeResult ? mimeTypeResult.mimeType : MimeType.WEBM;
          const audioOutput = message.data;
          const blob = convertBase64ToBlob(audioOutput, mimeType);
          audioQueueRef.current.push(blob);
          playAudio();
          break;
        case 'user_interruption':
          if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current = null;
            isPlayingRef.current = false;
            audioQueueRef.current = [];
          }
          break;
        case 'error':
          console.error('Server error:', message);
          setError(`Server error: ${message.message}`);
          cleanup();
          break;
        default:
          console.warn('Unhandled message type:', message.type);
          break;
      }
    },
    [onTranscriptReceived, onAudioReceived, onAIResponse, playAudio, cleanup]
  );

  const startListening = useCallback(async () => {
    try {
      // Only cleanup if we're not already listening
      if (!isListening) {
        cleanup();

        if (!clientRef.current) {
          const apiKey = import.meta.env.VITE_HUME_API_KEY || '';
          if (!apiKey) {
            throw new Error('API Key is missing');
          }
          clientRef.current = new HumeClient({ apiKey });
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;
        ensureSingleValidAudioTrack(audioStreamRef.current);

        const socket = await clientRef.current.empathicVoice.chat.connect({
          configId: import.meta.env.VITE_HUME_CONFIG_ID || '',
          resumedChatGroupId: chatGroupIdRef.current,
        });

        socket.on('open', () => {
          console.log('WebSocket connection opened');

          const mimeTypeResult = getBrowserSupportedMimeType();
          const mimeType = 'mimeType' in mimeTypeResult ? mimeTypeResult.mimeType : MimeType.WEBM;
          try {
            const recorder = new MediaRecorder(
              audioStreamRef.current!,
              { mimeType }
            );
            recorderRef.current = recorder;

            recorder.ondataavailable = async ({ data }) => {
              if (data.size > 0 && socket.readyState === WebSocket.OPEN && !isMutedRef.current) {
                try {
                  const base64Data = await convertBlobToBase64(data);
                  const audioInput = { data: base64Data };
                  socket.sendAudioInput(audioInput);
                } catch (err) {
                  console.error('Error encoding audio data:', err);
                  setError('Error encoding audio data');
                  cleanup();
                }
              }
            };

            recorder.onerror = (event: Event) => {
              const error = (event as any).error;
              console.error('MediaRecorder error:', error);
              setError(`MediaRecorder error: ${error.message}`);
              cleanup();
            };

            recorder.start(100);
            setIsListening(true);
          } catch (err) {
            console.error('MediaRecorder initialization error:', err);
            setError('Failed to initialize MediaRecorder');
            cleanup();
          }
        });

        socket.on('message', handleMessage);
        socket.on('error', (err) => {
          console.error('WebSocket error:', err);
          setError(`WebSocket error: ${err.message || err}`);
          cleanup();
        });

        socket.on('close', (event: any) => {
          console.log(`WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`);
          // Only show error for abnormal closures (not code 1000)
          if (event.code !== 1000) {
            setError(`WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`);
          }
          cleanup();
        });

        socketRef.current = socket;
      } else {
        // Just toggle mute state if we're already listening
        setIsMuted(prev => !prev);
      }
    } catch (err: unknown) {
      console.error('Error starting Hume AI:', err);
      setError(`Failed to start Hume AI: ${err instanceof Error ? err.message : String(err)}`);
      cleanup();
    }
  }, [cleanup, handleMessage, isListening]);

  const stopListening = useCallback(() => {
    cleanup();
  }, [cleanup]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return { isListening, isMuted, error, startListening, stopListening, toggleMute, cleanup };
}
