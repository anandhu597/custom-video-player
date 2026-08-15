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

let currentVideoURL = null;

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
  playPauseBtn.textContent = "⏸";
});

videoPlayer.addEventListener("pause", () => {
  playPauseBtn.textContent = "▶";
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
  if (videoPlayer.muted || videoPlayer.volume === 0) {
    muteBtn.textContent = "🔇";
  } else {
    muteBtn.textContent = "🔊";
  }
  volumeSlider.value = videoPlayer.volume; // slider always reflects real volume
});

// ===== Time Display + Progress Sync (video → UI) =====
// progressBar.max is set once metadata loads, since duration is NaN
// until then. After that, progressBar.value tracks currentTime directly
// (same unit, seconds) — no percentage math needed.
videoPlayer.addEventListener("loadedmetadata", () => {
  progressBar.max = videoPlayer.duration;
});

videoPlayer.addEventListener("timeupdate", () => {
  progressBar.value = videoPlayer.currentTime;
  timeDisplay.textContent = `${Math.floor(videoPlayer.currentTime)}/${Math.floor(videoPlayer.duration)}`;
});

// ===== Seek (UI → video) =====
// `input` fires continuously while dragging, giving live seeking.
progressBar.addEventListener("input", (e) => {
  videoPlayer.currentTime = parseFloat(e.target.value);
});

// ===== Helpers =====
function createURLAndLoad(file) {
  if (currentVideoURL) {
    URL.revokeObjectURL(currentVideoURL); // avoid memory leak on file switch
  }
  currentVideoURL = URL.createObjectURL(file);
  videoPlayer.src = currentVideoURL;
  videoPlayer.load();

  // Reset state explicitly on new file load, don't rely on browser
  // autoplay behavior or events firing (they may not, if already paused).
  videoPlayer.pause();
  playPauseBtn.textContent = "▶";
}
