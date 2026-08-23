// ===== Elements =====
const videoPlayer = document.getElementById("videoPlayer");
const playerContainer = document.getElementById("playerContainer");
const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const dropZoneText = document.getElementById("dropZoneText");

const controlsBar = document.getElementById("controlsBar");
const playPauseBtn = document.getElementById("playPauseBtn");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const hoverPreview = document.getElementById("hoverPreview");
const timeDisplay = document.getElementById("timeDisplay");
const muteBtn = document.getElementById("muteBtn");
const volumeSlider = document.getElementById("volumeSlider");
const fullscreenBtn = document.getElementById("fullscreenBtn");

// ===== State =====
let currentVideoURL = null;
let hideControlsTimer = null;

const playerState = {
  isPlaying: false,
  isMuted: false,
  duration: 0,
  currentTime: 0,
  controlsVisible: true,
};

// ===== Render (single source of DOM writes for player state) =====
function renderUI() {
  playPauseBtn.textContent = playerState.isPlaying ? "⏸" : "▶";
  muteBtn.textContent = playerState.isMuted ? "🔇" : "🔊";
  progressBar.max = playerState.duration;
  progressBar.value = playerState.currentTime;
  timeDisplay.textContent = `${formatTime(playerState.currentTime)} / ${formatTime(playerState.duration)}`;

  if (playerState.controlsVisible) {
    controlsBar.classList.remove("hidden");
  } else {
    controlsBar.classList.add("hidden");
  }
}

// ===== Helpers =====
function formatTime(totalSeconds) {
  if (isNaN(totalSeconds) || totalSeconds < 0) return "0:00";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const paddedSeconds = String(seconds).padStart(2, "0");

  if (hours > 0) {
    const paddedMinutes = String(minutes).padStart(2, "0");
    return `${hours}:${paddedMinutes}:${paddedSeconds}`;
  }
  return `${minutes}:${paddedSeconds}`;
}

function hasAudioTrack(video) {
  // 1. Standard HTML5 AudioTracks API (Safari / modern specs)
  if (video.audioTracks && video.audioTracks.length > 0) {
    return true;
  }
  // 2. Firefox non-standard property
  if (typeof video.mozHasAudio !== "undefined") {
    return video.mozHasAudio;
  }
  // 3. Chrome/Blink fallback (after video starts loading/playing)
  if (typeof video.webkitAudioDecodedByteCount !== "undefined") {
    return video.webkitAudioDecodedByteCount > 0;
  }
  // 4. Default to true if browser support is missing (graceful fallback)
  return true;
}

function createURLAndLoad(file) {
  // First-pass hint check — file.type can be unreliable, but it's a cheap filter
  if (file && !file.type.startsWith("video/")) {
    resetPlayerState("Selected file is not a valid video.");
    return;
  }

  if (currentVideoURL) {
    URL.revokeObjectURL(currentVideoURL); // avoid memory leak on file switch
  }
  currentVideoURL = URL.createObjectURL(file);
  videoPlayer.src = currentVideoURL;
  videoPlayer.load();

  // Reset state explicitly on new file load, don't rely on browser
  // autoplay behavior or events firing (they may not, if already paused).
  videoPlayer.pause();
  playerState.isPlaying = false;
  playerState.currentTime = 0;
  renderUI();
}

function resetPlayerState(errorMessage) {
  videoPlayer.pause();

  if (videoPlayer.src) {
    URL.revokeObjectURL(videoPlayer.src);
  }

  videoPlayer.removeAttribute("src");
  videoPlayer.load();

  playerState.isPlaying = false;
  playerState.currentTime = 0;
  playerState.duration = 0;
  playerState.controlsVisible = true;
  renderUI();

  if (dropZoneText) {
    dropZoneText.textContent = errorMessage;
  }
  dropZone.classList.remove("hidden");
}

function toggleFullscreen(container) {
  // Handles standard API + Safari's webkit-prefixed fallback
  const fullscreenElement =
    document.fullscreenElement || document.webkitFullscreenElement;

  if (!fullscreenElement) {
    if (container.requestFullscreen) {
      container.requestFullscreen();
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen(); // Safari
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen(); // Safari
    }
  }
}

// ===== File Loading (Input) =====
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) createURLAndLoad(file);
});

// ===== File Loading (Drag & Drop) =====
dropZone.addEventListener("dragover", (event) => {
  event.preventDefault(); // required, or browser blocks the drop
});

dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  if (file) createURLAndLoad(file);
});

// ===== Video Error Handling =====
videoPlayer.addEventListener("error", () => {
  console.log("Video error:", videoPlayer.error);
  resetPlayerState("Failed to load or play video file.");
});

// ===== Play / Pause =====
// Button only triggers play/pause; label is synced via video's own
// play/pause events so it stays correct regardless of what triggered it.
playPauseBtn.addEventListener("click", () => {
  if (videoPlayer.paused) {
    videoPlayer.play();
  } else {
    videoPlayer.pause();
  }
});

videoPlayer.addEventListener("play", () => {
  playerState.isPlaying = true;
  renderUI();
});

videoPlayer.addEventListener("pause", () => {
  playerState.isPlaying = false;
  renderUI();
});

// ===== Mute / Volume =====
// muted and volume are independent video properties.
// muteBtn only toggles `muted`; volumeSlider only sets `volume`.
// The `volumechange` event is the single source of truth for syncing
// both the icon and slider position, no matter which one triggered it.
muteBtn.addEventListener("click", () => {
  videoPlayer.muted = !videoPlayer.muted;
});

volumeSlider.addEventListener("input", (e) => {
  const volVal = parseFloat(e.target.value);
  videoPlayer.volume = volVal;
});

videoPlayer.addEventListener("volumechange", () => {
  playerState.isMuted = videoPlayer.muted || videoPlayer.volume === 0;
  renderUI();
  volumeSlider.value = videoPlayer.volume;
});

// ===== Time Display + Progress Sync (video → UI) =====
// progressBar.max is set once metadata loads, since duration is NaN
// until then. After that, progressBar.value tracks currentTime directly
// (same unit, seconds) — no percentage math needed.
videoPlayer.addEventListener("loadedmetadata", () => {
  if (!hasAudioTrack(videoPlayer)) {
    console.warn("No audio track detected in this video.");
  }

  if (videoPlayer.videoWidth === 0) {
    resetPlayerState("Video format or codec is not supported.");
    return;
  }

  playerState.duration = videoPlayer.duration;
  renderUI();
});

videoPlayer.addEventListener("timeupdate", () => {
  playerState.currentTime = videoPlayer.currentTime;
  renderUI();
});

// ===== Seek (UI → video) =====
// `input` fires continuously while dragging, giving live seeking.
progressBar.addEventListener("input", (e) => {
  videoPlayer.currentTime = parseFloat(e.target.value);
});

// ===== Hover Time Preview =====
progressBar.addEventListener("mouseenter", () => {
  hoverPreview.classList.remove("hidden");
});

progressBar.addEventListener("mousemove", (event) => {
  const previewTime =
    (event.offsetX / progressBar.offsetWidth) * playerState.duration;
  hoverPreview.textContent = formatTime(previewTime);
  hoverPreview.style.left = `${event.offsetX}px`;
});

progressBar.addEventListener("mouseleave", () => {
  hoverPreview.classList.add("hidden");
});

// ===== Auto-hide Controls =====
playerContainer.addEventListener("mousemove", () => {
  playerState.controlsVisible = true;
  renderUI();
  clearTimeout(hideControlsTimer);

  if (!videoPlayer.paused) {
    hideControlsTimer = setTimeout(() => {
      playerState.controlsVisible = false;
      renderUI();
    }, 3000);
  }
});

playerContainer.addEventListener("mouseleave", () => {
  clearTimeout(hideControlsTimer);
  if (!videoPlayer.paused) {
    playerState.controlsVisible = false;
    renderUI();
  }
});

// ===== Fullscreen =====
fullscreenBtn.addEventListener("click", () => {
  toggleFullscreen(playerContainer);
});
