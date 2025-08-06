const bgAudio = new Audio("/audio/bgm.mp3");
bgAudio.loop = true;
bgAudio.volume = 0.5;

export function playBackgroundMusic() {
  if (bgAudio.paused) {
    bgAudio.play().catch((err) => console.error("Autoplay blocked:", err));
  } else {
    bgAudio.currentTime = 0; // Reset to start if already playing
  }
}

export function stopBackgroundMusic() {
  bgAudio.pause();
  bgAudio.currentTime = 0;
}
