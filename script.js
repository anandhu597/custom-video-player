// ===== Elements =====
const videoPlayer = document.getElementById("videoPlayer");
const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");

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

// ===== Helpers =====
function createURLAndLoad(file) {
  if (currentVideoURL) {
    URL.revokeObjectURL(currentVideoURL);
  }
  currentVideoURL = URL.createObjectURL(file);
  videoPlayer.src = currentVideoURL;
  videoPlayer.load();
}
