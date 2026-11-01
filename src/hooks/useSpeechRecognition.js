import { useState, useEffect, useRef, useCallback } from 'react';
import { Speech } from '../services/speech.js';

export function useSpeechRecognition() {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const recognizerRef = useRef(null);

  useEffect(() => {
    setIsSupported(Speech.isRecognitionSupported());
  }, []);

  const stopListening = useCallback(() => {
    if (recognizerRef.current) {
      try {
        recognizerRef.current.stop();
      } catch {
        // Ignore
      }
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback((targetLang = 'en-US') => {
    if (!Speech.isRecognitionSupported()) {
      setError('Speech recognition is not supported in this browser. Please use Chrome/Edge or try typing mode.');
      return;
    }

    setError(null);
    setTranscript('');

    try {
      const recognizer = Speech.createRecognizer({
        lang: targetLang,
        onStart: () => {
          setIsListening(true);
        },
        onResult: ({ transcript: text }) => {
          setTranscript(text);
        },
        onError: (evt) => {
          let msg = evt.error || 'Speech recognition encountered an issue';
          if (evt.error === 'not-allowed') {
            msg = 'Microphone permission denied. Please allow microphone access in your browser bar (HTTPS or localhost is required).';
          } else if (evt.error === 'no-speech') {
            msg = 'No speech was detected. Please make sure your mic is unmuted and speak clearly.';
          } else if (evt.error === 'network') {
            msg = 'Network error occurred during speech recognition.';
          }
          setError(msg);
          setIsListening(false);
        },
        onEnd: () => {
          setIsListening(false);
        }
      });

      recognizerRef.current = recognizer;
      recognizer.start();
    } catch (err) {
      console.error('Failed to start speech recognizer:', err);
      setError(err.message || 'Could not start microphone recording');
      setIsListening(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.abort();
        } catch {
          // Ignore
        }
      }
    };
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    setTranscript,
    error,
    startListening,
    stopListening
  };
}
