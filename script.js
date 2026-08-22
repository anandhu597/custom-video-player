// ===== Elements =====
const videoPlayer = document.getElementById("videoPlayer");
const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const playPauseBtn = document.getElementById("playPauseBtn");
const progressBar = document.getElementById("progressBar");
const timeDisplay = document.getElementById("timeDisplay");
const muteBtn = document.getElementById("muteBtn");
const volumeSlider = document.getElementById("volumeSlider");
const fullscreenBtn = document.getElementById("fullscreenBtn");

const controlsBar = document.getElementById("controlsBar");
// const playerContainer = document.getElementById("playerContainer");
let currentVideoURL = null;

const playerState = {
  isPlaying: false,
  isMuted: false,
  duration: 0,
  currentTime: 0,
  controlsVisible: true, // New state property
};

function renderUI() {
  playPauseBtn.textContent = playerState.isPlaying ? "⏸" : "▶";
  muteBtn.textContent = playerState.isMuted ? "🔇" : "🔊";
  progressBar.max = playerState.duration;
  progressBar.value = playerState.currentTime;
  timeDisplay.textContent = `${formatTime(playerState.currentTime)} / ${formatTime(playerState.duration)}`;

  // Controls visibility render
  if (playerState.controlsVisible) {
    controlsBar.classList.remove("hidden");
  } else {
    controlsBar.classList.add("hidden");
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

// ===== Helpers =====
function createURLAndLoad(file) {
  if (currentVideoURL) {
    URL.revokeObjectURL(currentVideoURL);
  }
  currentVideoURL = URL.createObjectURL(file);
  videoPlayer.src = currentVideoURL;
  videoPlayer.load();

  videoPlayer.pause();
  playerState.isPlaying = false;
  playerState.currentTime = 0;
  renderUI(); // instead of playPauseBtn.textContent = "▶"
}

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

const playerContainer = document.getElementById("playerContainer");
let hideControlsTimer = null;

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
