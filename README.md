# NebulaHand Particles (ASD practical)


A browser-based interactive particle universe powered by Three.js and controlled by MediaPipe hand tracking.

## Features

- Dual-hand controls:
  - Left hand controls universe rotation
  - Right hand pinch/open controls zoom
- Two particle templates:
  - Saturn-style ring + core
  - Spiral galaxy
- Live color customization for particles
- Real-time webcam hand tracking overlay

## Project Structure

- `particles.html`: Main page and UI markup
- `style.css`: Root stylesheet entry
- `script.js`: Root JavaScript entry
- `src/main.js`: App bootstrap and orchestration
- `src/scene.js`: Three.js scene and particles
- `src/handTracking.js`: MediaPipe tracking logic
- `src/dom.js`: UI bindings and status helpers
- `src/config.js`: Shared runtime configuration/state
- `src/styles/`: Split base and component styles

## Run Locally

1. Open the project folder.
2. Start a simple local server.
3. Open `particles.html` in your browser through that server.
4. Allow camera access when prompted.

## Notes

- Three.js and MediaPipe are loaded from CDN.
- Camera and hand tracking require HTTPS or localhost in most browsers.
