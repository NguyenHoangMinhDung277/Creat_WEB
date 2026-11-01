import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Mic,
  MicOff,
  Keyboard,
  RotateCcw,
  Info,
  Check,
  ShieldAlert,
  Play,
  Square,
  Activity
} from 'lucide-react';
import Button from '../../components/common/Button';
import WordScorerView from './WordScorerView';
import { useSpeech } from '../../hooks/useSpeech';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { scorePronunciation } from '../../utils/scoring';
import { StorageService } from '../../services/storage';
import { SFX } from '../../services/sfx';

export default function PronunciationTrainer({
  targetItem,
  onAttemptCompleted,
  t
}) {
  const targetText = targetItem?.exampleEn || targetItem?.english || '';
  const { speak, isPlaying, accent, toggleAccent } = useSpeech();
  const {
    isSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    error: recognitionError
  } = useSpeechRecognition();

  const [scoreResult, setScoreResult] = useState(null);
  const [typingMode, setTypingMode] = useState(false);
  const [typedInput, setTypedInput] = useState('');

  // Audio Playback of User Recording (MediaRecorder)
  const [userAudioUrl, setUserAudioUrl] = useState(null);
  const [isPlayingUserAudio, setIsPlayingUserAudio] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const userAudioPlayerRef = useRef(null);

  // Audio Visualizer Canvas
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Reset state when target changes
  useEffect(() => {
    setScoreResult(null);
    setTypedInput('');
    setUserAudioUrl(null);
    stopListening();
  }, [targetItem?.english, stopListening]);

  // Start MediaRecorder and Audio Visualizer when recording starts
  const startRecordingMedia = async () => {
    audioChunksRef.current = [];
    setUserAudioUrl(null);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        // Visualizer setup
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          analyserRef.current = analyser;

          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          const canvas = canvasRef.current;
          if (canvas) {
            const canvasCtx = canvas.getContext('2d');
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const drawWave = () => {
              if (!analyserRef.current) return;
              analyserRef.current.getByteFrequencyData(dataArray);

              canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
              const barWidth = (canvas.width / bufferLength) * 1.8;
              let x = 0;

              for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;
                canvasCtx.fillStyle = '#00f2fe';
                canvasCtx.fillRect(x, (canvas.height - barHeight) / 2, barWidth - 2, barHeight);
                x += barWidth;
              }

              animationFrameRef.current = requestAnimationFrame(drawWave);
            };

            drawWave();
          }
        }

        // MediaRecorder setup
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          if (audioBlob.size > 0) {
            const url = URL.createObjectURL(audioBlob);
            setUserAudioUrl(url);
          }
          // Stop stream tracks
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(t => t.stop());
          }
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
          if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            try {
              audioContextRef.current.close();
            } catch {
              // Ignore
            }
          }
        };

        recorder.start();
      }
    } catch (err) {
      console.warn('Microphone stream for audio recording / visualizer unavailable:', err);
    }
  };

  const stopRecordingMedia = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Ignore
      }
    }
  };

  // Handle Speech Recognition Result
  useEffect(() => {
    if (transcript && !isListening) {
      stopRecordingMedia();
      const result = scorePronunciation(targetText, transcript);
      setScoreResult(result);

      if (result.score >= 80) {
        SFX.playCorrect();
      } else {
        SFX.playWrong();
      }

      if (targetItem) {
        StorageService.recordWordAttempt(targetItem, result.score);
        if (onAttemptCompleted) onAttemptCompleted(result.score);
      }
    }
  }, [transcript, isListening, targetText, targetItem, onAttemptCompleted]);

  // Handle Typing Mode Submission
  const handleTypingCheck = (e) => {
    e?.preventDefault();
    if (!typedInput.trim()) return;

    const result = scorePronunciation(targetText, typedInput);
    setScoreResult(result);

    if (result.score >= 85) {
      SFX.playCorrect();
    } else {
      SFX.playWrong();
    }

    if (targetItem) {
      StorageService.recordWordAttempt(targetItem, result.score);
      if (onAttemptCompleted) onAttemptCompleted(result.score);
    }
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
      stopRecordingMedia();
    } else {
      setScoreResult(null);
      startRecordingMedia();
      startListening('en-US');
    }
  };

  const playUserRecording = () => {
    if (!userAudioUrl) return;
    if (isPlayingUserAudio) {
      userAudioPlayerRef.current?.pause();
      setIsPlayingUserAudio(false);
    } else {
      const audio = new Audio(userAudioUrl);
      userAudioPlayerRef.current = audio;
      audio.onended = () => setIsPlayingUserAudio(false);
      audio.onerror = () => setIsPlayingUserAudio(false);
      setIsPlayingUserAudio(true);
      audio.play();
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-5 rounded-2xl glass-panel-subtle border border-cyan-500/20 shadow-lg">
      {/* Pronunciation Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Audio Listen Button (Native Accent) */}
          <Button
            variant="glass"
            size="sm"
            onClick={() => speak(targetText)}
            disabled={isPlaying}
            icon={Volume2}
            className={isPlaying ? 'text-cyan-400 border-cyan-400/50 animate-pulse' : ''}
          >
            {t.listen} (Bản ngữ)
          </Button>

          {/* Accent Switcher (US / UK) */}
          <button
            type="button"
            onClick={toggleAccent}
            className="px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors"
            title="Toggle US / UK English Accent"
          >
            {accent === 'en-US' ? '🇺🇸 ' + t.pronounceUS : '🇬🇧 ' + t.pronounceUK}
          </button>

          {/* Play User's Own Recorded Audio Button */}
          {userAudioUrl && (
            <button
              type="button"
              onClick={playUserRecording}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                isPlayingUserAudio
                  ? 'bg-purple-500/30 text-purple-200 border-purple-400 animate-pulse'
                  : 'bg-cyan-950/40 text-cyan-300 border-cyan-500/40 hover:bg-cyan-900/50'
              }`}
            >
              {isPlayingUserAudio ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-cyan-400" />}
              <span>{isPlayingUserAudio ? 'Đang phát...' : 'Nghe lại giọng bạn'}</span>
            </button>
          )}
        </div>

        {/* Mode Switch (Mic vs Typing) */}
        <button
          type="button"
          onClick={() => setTypingMode(prev => !prev)}
          className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 underline font-medium"
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span>{typingMode ? 'Chuyển sang Micro' : t.typingFallback}</span>
        </button>
      </div>

      {/* Target Phrase Box */}
      <div className="p-4 rounded-xl bg-ocean-950/70 border border-cyan-500/20">
        <div className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">
          Câu mẫu cần luyện tập:
        </div>
        <div className="text-base sm:text-lg font-extrabold text-slate-100 leading-snug">
          {targetText}
        </div>
        {targetItem?.ipa && (
          <div className="text-xs font-mono text-cyan-300 mt-1">
            {targetItem.ipa}
          </div>
        )}
        {targetItem?.exampleVi && (
          <div className="text-xs text-slate-300 mt-1.5 italic">
            ↳ {targetItem.exampleVi}
          </div>
        )}
      </div>

      {/* Speech Recognition Mode */}
      {!typingMode && (
        <div className="flex flex-col gap-3">
          {/* Unsupported notice */}
          {!isSupported && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-bold">{t.micUnavailable}</span>
                <span className="text-[11px] text-amber-200/80">
                  Chrome, Edge, và Safari hỗ trợ tốt nhất nhận diện micro. Vui lòng đảm bảo bạn đang chạy trên HTTPS hoặc localhost.
                </span>
                <button
                  type="button"
                  onClick={() => setTypingMode(true)}
                  className="mt-1 font-bold underline text-amber-300 text-left"
                >
                  Chuyển sang chế độ gõ phím &rarr;
                </button>
              </div>
            </div>
          )}

          {/* Active Error Notice */}
          {recognitionError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{recognitionError}</span>
            </div>
          )}

          {/* Mic Button & Waveform Visualizer */}
          {isSupported && (
            <div className="flex flex-col items-center justify-center py-2 gap-3">
              {/* Waveform Canvas when recording */}
              {isListening && (
                <div className="w-48 h-10 flex items-center justify-center overflow-hidden">
                  <canvas ref={canvasRef} width="192" height="40" className="w-full h-full" />
                </div>
              )}

              <button
                type="button"
                onClick={handleMicToggle}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl focus:outline-none focus:ring-4 focus:ring-cyan-400/30 cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/50 scale-110'
                    : 'bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 text-slate-950 hover:scale-105 shadow-neon-cyan'
                }`}
                aria-label={isListening ? 'Stop listening' : 'Start speaking'}
              >
                {isListening ? (
                  <MicOff className="w-7 h-7" />
                ) : (
                  <Mic className="w-7 h-7" />
                )}
                {isListening && (
                  <span className="absolute -inset-2 rounded-full border-2 border-rose-400 animate-ping" />
                )}
              </button>

              <span className="text-xs text-slate-300 font-medium">
                {isListening ? 'Đang lắng nghe... Hãy đọc to câu mẫu!' : 'Nhấn nút Micro và đọc to câu mẫu vào mic'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Typing Fallback Mode */}
      {typingMode && (
        <form onSubmit={handleTypingCheck} className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder={t.typingPlaceholder}
              className="glass-input flex-1 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
            />
            <Button variant="neon" size="md" type="submit" icon={Check}>
              {t.typingCheck}
            </Button>
          </div>
          <span className="text-[11px] text-slate-400">
            Gõ lại chính xác câu tiếng Anh ở trên để kiểm tra chính tả, ngữ pháp và phân tích ký tự.
          </span>
        </form>
      )}

      {/* Results View with Character Analysis */}
      {scoreResult && (
        <WordScorerView scoreResult={scoreResult} targetPhrase={targetText} />
      )}
    </div>
  );
}
