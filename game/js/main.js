import { Game } from "./game.js";
import { CameraPhoto } from "./camera-photo.js";

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const game = new Game(ctx);
const captureButton = document.getElementById("face-capture");
const cameraStatus = document.getElementById("camera-status");
const cameraPreview = document.getElementById("camera-preview");
const facePhotoPreview = document.getElementById("face-photo-preview");
const facePartPicker = document.querySelector(".face-part-picker");
const camera = new CameraPhoto({
  onPhoto: (photo, imageUrl) => {
    game.player.setFacePhoto(photo);
    facePhotoPreview.src = imageUrl;
    facePhotoPreview.hidden = false;
  },
  onStatus: (status) => { cameraStatus.textContent = status; },
  onActive: (active) => {
    captureButton.textContent = active ? "Capture face" : camera.hasPhoto ? "Retake face" : "Take face photo";
    cameraPreview.hidden = !active;
    facePhotoPreview.hidden = active || !camera.hasPhoto;
  },
});

captureButton.addEventListener("click", async () => {
  captureButton.disabled = true;
  try {
    if (camera.running) {
      const selectedPart = facePartPicker.querySelector("input:checked").value;
      camera.capture(cameraPreview, selectedPart);
    } else {
      await camera.open(cameraPreview);
    }
  } catch (error) {
    cameraStatus.textContent = error.name === "NotAllowedError"
      ? "Camera permission was blocked. You can still play without a photo."
      : error.message || "Camera could not start. Check the camera permission.";
  } finally {
    captureButton.disabled = false;
  }
});

window.addEventListener("beforeunload", () => {
  if (camera.running) camera.stop(cameraPreview);
});

let lastTime = performance.now();

function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000); // clamp to avoid big jumps on tab refocus
  lastTime = now;

  game.update(dt);
  game.draw();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
