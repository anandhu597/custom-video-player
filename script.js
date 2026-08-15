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

// ===== File Input =====
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) createURLAndLoad(file);
});

// ===== Drag & Drop =====
dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
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

videoPlayer.addEventListener("play", () => {
  playPauseBtn.textContent = "⏸";
});

videoPlayer.addEventListener("pause", () => {
  playPauseBtn.textContent = "▶";
});

playPauseBtn.addEventListener("click", () => {
  if (videoPlayer.paused) {
    videoPlayer.play();
  } else {
    videoPlayer.pause();
  }
});

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
  volumeSlider.value = videoPlayer.volume; // always reflect real volume, mute or not
});

//Time Display + Progress Sync (video → UI)

videoPlayer.addEventListener("loadedmetadata", () => {
  progressBar.max = videoPlayer.duration;
  console.log("max width set :", videoPlayer.duration);
});

videoPlayer.addEventListener("timeupdate", () => {
  progressBar.value = videoPlayer.currentTime;
  // console.log("slid bar updated :", videoPlayer.currentTime);
  timeDisplay.textContent = `${Math.floor(videoPlayer.currentTime)}/${Math.floor(videoPlayer.duration)}`;
});

progressBar.addEventListener("input", (e) => {
  videoPlayer.currentTime = parseFloat(e.target.value);
});

// ===== Helpers =====
function createURLAndLoad(file) {
  if (currentVideoURL) {
    URL.revokeObjectURL(currentVideoURL);
  }
  currentVideoURL = URL.createObjectURL(file);
  console.log(currentVideoURL);
  videoPlayer.src = currentVideoURL;
  videoPlayer.load();
  videoPlayer.pause(); // ensures consistent state, button resets to
  playPauseBtn.textContent = "▶"; // force it directly, don't rely on event
}
