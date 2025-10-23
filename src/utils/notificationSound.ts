/**
 * Utility for playing notification sounds
 */

let audioContext: AudioContext | null = null;

/**
 * Initialize audio context (call this on user interaction to avoid autoplay restrictions)
 */
export const initAudioContext = () => {
  if (!audioContext && typeof window !== 'undefined') {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

/**
 * Play a simple notification beep sound
 * Uses Web Audio API to generate sound without external files
 */
export const playNotificationSound = () => {
  try {
    const ctx = initAudioContext();
    if (!ctx) return;

    // Create oscillator for beep sound
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Configure sound: pleasant notification tone
    oscillator.frequency.value = 800; // Hz
    oscillator.type = 'sine';

    // Fade in/out for smooth sound
    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.2);

    oscillator.start(now);
    oscillator.stop(now + 0.2);
  } catch (error) {
    console.warn('Failed to play notification sound:', error);
  }
};

/**
 * Play a double beep for important notifications
 */
export const playImportantNotificationSound = () => {
  try {
    playNotificationSound();
    setTimeout(() => playNotificationSound(), 150);
  } catch (error) {
    console.warn('Failed to play important notification sound:', error);
  }
};
