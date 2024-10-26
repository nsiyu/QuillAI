import { useState, useCallback, useRef, useEffect } from 'react';

interface UseDeepgramProps {
  onTranscriptReceived: (transcript: string, words: any[]) => void;
}

export function useDeepgram({ onTranscriptReceived }: UseDeepgramProps) {
  const [isRecording, setIsRecording] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const closeWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'CloseStream' }));
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      streamRef.current = stream;

      audioContextRef.current = new AudioContext({
        sampleRate: 16000,
        latencyHint: 'interactive'
      });
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      const ws = new WebSocket('wss://api.deepgram.com/v1/listen?encoding=linear16&sample_rate=16000&channels=1', [
        'token',
        import.meta.env.VITE_DEEPGRAM_API_KEY
      ]);

      ws.onopen = () => {
        console.log('WebSocket connection established');
        
        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            
            const pcmData = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              pcmData[i] = Math.max(-32768, Math.min(32767, Math.floor(inputData[i] * 32768)));
            }
            
            ws.send(pcmData.buffer);
          }
        };

        source.connect(processor);
        processor.connect(audioContextRef.current!.destination);
      };

      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          if (response.type === 'Results') {
            const transcript = response.channel?.alternatives?.[0]?.transcript;
            const words = response.channel?.alternatives?.[0]?.words || [];
            if (transcript && transcript.trim()) {
              onTranscriptReceived(transcript, words);
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        stopRecording();
      };

      ws.onclose = (event) => {
        console.log(`WebSocket closed with code: ${event.code}`);
        if (event.code !== 1000) {
          console.error('WebSocket closed abnormally:', event.reason);
        }
        stopRecording();
      };

      wsRef.current = ws;
      setIsRecording(true);

    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }, [onTranscriptReceived]);

  const stopRecording = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    closeWebSocket();
    setIsRecording(false);
  }, [closeWebSocket]);

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  return {
    isRecording,
    startRecording,
    stopRecording
  };
}
