// Web Speech API Integration: SpeechSynthesis (US/UK) & SpeechRecognition

class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.isVoicesLoaded = false;
    this.initVoices();
  }

  initVoices() {
    if (!this.synth) return;

    const loadVoices = () => {
      this.voices = this.synth.getVoices();
      if (this.voices.length > 0) {
        this.isVoicesLoaded = true;
      }
    };

    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  getAvailableVoices() {
    if (!this.synth) return { us: [], uk: [], all: [] };
    const all = this.synth.getVoices() || this.voices;
    const us = all.filter(v => v.lang.replace('_', '-').startsWith('en-US'));
    const uk = all.filter(v => v.lang.replace('_', '-').startsWith('en-GB'));
    return { us, uk, all };
  }

  speak(text, { accent = 'en-US', rate = 0.9, onStart, onEnd, onError } = {}) {
    if (!this.synth) {
      if (onError) onError(new Error('SpeechSynthesis not supported'));
      return;
    }

    // Cancel any ongoing utterance
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.lang = accent === 'en-GB' ? 'en-GB' : 'en-US';

    const { us, uk, all } = this.getAvailableVoices();
    const candidateVoices = accent === 'en-GB' ? uk : us;

    if (candidateVoices.length > 0) {
      // Prefer Google or natural voices if present
      const preferred = candidateVoices.find(v => v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'));
      utterance.voice = preferred || candidateVoices[0];
    } else if (all.length > 0) {
      const anyEn = all.find(v => v.lang.startsWith('en'));
      if (anyEn) utterance.voice = anyEn;
    }

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    if (onError) utterance.onerror = onError;

    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  isRecognitionSupported() {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  createRecognizer({ lang = 'en-US', onResult, onError, onEnd, onStart } = {}) {
    if (!this.isRecognitionSupported()) {
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.maxAlternatives = 1;

    if (onStart) recognition.onstart = onStart;

    recognition.onresult = (event) => {
      let interim = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (onResult) {
        onResult({
          transcript: finalTranscript || interim,
          isFinal: !!finalTranscript
        });
      }
    };

    if (onError) {
      recognition.onerror = (event) => {
        onError(event);
      };
    }

    if (onEnd) {
      recognition.onend = onEnd;
    }

    return recognition;
  }
}

export const Speech = new SpeechService();
