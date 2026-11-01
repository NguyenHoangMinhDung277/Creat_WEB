import { useState, useEffect, useCallback } from 'react';
import { Speech } from '../services/speech.js';
import { StorageService } from '../services/storage.js';

export function useSpeech() {
  const [accent, setAccent] = useState(() => StorageService.getSettings().voiceAccent || 'en-US');
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState(() => StorageService.getSettings().speechRate || 0.9);
  const [voices, setVoices] = useState(() => Speech.getAvailableVoices());

  useEffect(() => {
    const handleVoices = () => {
      setVoices(Speech.getAvailableVoices());
    };

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.addEventListener('voiceschanged', handleVoices);
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoices);
      }
    };
  }, []);

  const speak = useCallback((text, customAccent = null) => {
    if (!text) return;
    setIsPlaying(true);
    Speech.speak(text, {
      accent: customAccent || accent,
      rate,
      onEnd: () => setIsPlaying(false),
      onError: (err) => {
        console.warn('Speech playback issue:', err);
        setIsPlaying(false);
      }
    });
  }, [accent, rate]);

  const stop = useCallback(() => {
    Speech.stopSpeaking();
    setIsPlaying(false);
  }, []);

  const toggleAccent = useCallback(() => {
    setAccent(prev => {
      const next = prev === 'en-US' ? 'en-GB' : 'en-US';
      const settings = StorageService.getSettings();
      StorageService.saveSettings({ ...settings, voiceAccent: next });
      return next;
    });
  }, []);

  return {
    accent,
    setAccent,
    toggleAccent,
    rate,
    setRate,
    isPlaying,
    speak,
    stop,
    voices
  };
}
