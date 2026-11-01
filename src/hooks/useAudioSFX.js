import { useState, useCallback } from 'react';
import { SFX } from '../services/sfx.js';
import { StorageService } from '../services/storage.js';

export function useAudioSFX() {
  const [isMuted, setIsMuted] = useState(() => SFX.getMuted());

  const toggleMute = useCallback(() => {
    const next = SFX.toggleMute();
    setIsMuted(next);
    const settings = StorageService.getSettings();
    StorageService.saveSettings({ ...settings, sfxMuted: next });
    return next;
  }, []);

  const playClick = useCallback(() => SFX.playClick(), []);
  const playCardFlip = useCallback(() => SFX.playCardFlip(), []);
  const playCorrect = useCallback(() => SFX.playCorrect(), []);
  const playWrong = useCallback(() => SFX.playWrong(), []);
  const playLevelUp = useCallback(() => SFX.playLevelUp(), []);
  const playFanfare = useCallback(() => SFX.playFanfare(), []);

  return {
    isMuted,
    toggleMute,
    playClick,
    playCardFlip,
    playCorrect,
    playWrong,
    playLevelUp,
    playFanfare
  };
}
