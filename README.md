🎬 Custom Video Player
A fully custom HTML5 video player built from scratch with HTML, CSS, and vanilla JavaScript — no libraries, no native `controls` attribute.
This project was built to practice the HTML5 Media API in depth: file loading, custom playback controls, state management, and handling real-world edge cases like unsupported codecs and cross-browser fullscreen quirks.

🔗 Live Demo
https://anandhu597.github.io/custom-video-player/

✨ Features

- Load videos via file picker or drag-and-drop
- Custom play/pause, mute/volume, and seek controls (native `controls` fully replaced)
- Progress bar synced live to playback, with click-and-drag seeking
- Hover preview on the progress bar showing the time at cursor position
- Time display formatted as `m:ss` (or `h:mm:ss` for longer videos)
- Centralized player state (`playerState` object) driving a single `renderUI()` function, so every control always reflects the true video state
- Auto-hiding controls after 3 seconds of inactivity during playback, with a smooth fade
- Fullscreen toggle with cross-browser fallback (Safari's `webkit`-prefixed API)
- Keyboard shortcuts: `Space`/`K` (play/pause), `←`/`→` (seek ±5s), `↑`/`↓` (volume ±10%), `M` (mute)
- Graceful error handling for invalid file drops and unsupported video formats/codecs
- Memory-safe object URL handling — old blob URLs are revoked before new ones are created, preventing memory leaks across file switches
- Responsive, portfolio-ready layout

🛠️ Technologies

- HTML5 (`<video>` element, Media API)
- CSS3 (Flexbox, transitions, `:fullscreen` pseudo-class)
- JavaScript (vanilla, no frameworks or libraries)

📚 What I Practiced
While building this project, I practiced:

- The HTML5 `<video>` element and its Media API (`play()`, `pause()`, `currentTime`, `duration`, `volume`, `muted`)
- Working with `URL.createObjectURL()` / `URL.revokeObjectURL()` and the memory implications of blob URLs
- File handling via `<input type="file">` and the native Drag and Drop API (`dragover`, `dragleave`, `drop`)
- Syncing custom UI to native media events (`play`, `pause`, `volumechange`, `loadedmetadata`, `timeupdate`)
- Centralized state management — a single state object and one render function as the source of truth, instead of scattered direct DOM writes
- Debouncing/driving UI updates off the right event (`input` vs `change` vs `seeking`) to avoid jank
- Mapping mouse position to a value (pixel offset → time) for the hover preview
- Handling real browser quirks: `NaN` duration before metadata loads, autoplay restrictions, vendor-prefixed Fullscreen APIs, and codec limitations that can't be fixed client-side
- Keyboard event handling (`keydown`) with sensible guards against interfering with focused inputs
- Debugging using DevTools (Elements/Computed panels, console logging) to trace down CSS specificity and flex-sizing bugs

🎯 Main JavaScript Concepts
The player's logic is organized into a few key building blocks:

- `playerState` — a single object holding `isPlaying`, `isMuted`, `duration`, `currentTime`, and `controlsVisible`
- `renderUI()` — the only function that writes to the DOM; every event listener updates state and then calls this, so the UI can never drift out of sync with the real video
- `createURLAndLoad()` — handles loading a new file, revoking the previous object URL, and resetting state
- `resetPlayerState()` — clears the player and shows a user-facing error message for invalid or unsupported files
- `formatTime()` — converts raw seconds into a readable `m:ss` / `h:mm:ss` string
- `hasAudioTrack()` — best-effort, cross-browser check for whether a loaded video has an audio track
- `toggleFullscreen()` — requests/exits fullscreen with a fallback for Safari's prefixed API

📁 Project Structure

```
custom-video-player/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

🚀 How to Run
No installation or external dependencies are required. Simply open `index.html` in a browser, or serve it with any static file server (e.g. VS Code's Live Server).

⚠️ Known Limitations

- Some container formats (e.g. certain `.mkv` files with H.265/HEVC video) will play audio but show no picture. This is a browser codec limitation, not a bug — browsers can only decode codecs they've licensed/implemented, and no client-side JavaScript can work around that. The player detects this case (`videoWidth` stays `0`) and shows an error instead of failing silently.
- Audio-track detection (`hasAudioTrack()`) relies on non-standard, inconsistently-supported browser APIs, so it's best-effort rather than fully reliable across all browsers.

🔮 Future Improvements
Possible future improvements:

- Playback speed selector (0.5×–2×)
- Playlist support with auto-advance
- Custom SVG icon set instead of emoji controls
- Picture-in-picture support

👩‍💻 Author
Built as a JavaScript/Media API practice project.
