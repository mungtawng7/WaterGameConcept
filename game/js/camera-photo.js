export class CameraPhoto {
  constructor({ onPhoto, onStatus, onActive }) {
    this.onPhoto = onPhoto;
    this.onStatus = onStatus;
    this.onActive = onActive;
    this.stream = null;
    this.running = false;
    this.hasPhoto = false;
  }

  async open(video) {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Camera access is unavailable in this browser.");
    }

    this.onStatus("Waiting for camera permission...");
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    });

    try {
      video.srcObject = this.stream;
      await video.play();
      this.running = true;
      this.onActive(true);
      this.onStatus("Center your face, then capture your photo.");
    } catch (error) {
      this.stop(video);
      throw error;
    }
  }

  capture(video, part = "face") {
    if (!video.videoWidth || !video.videoHeight) {
      throw new Error("The camera is not ready yet. Try again in a moment.");
    }

    const baseSize = Math.min(video.videoWidth * 0.7, video.videoHeight * 0.72);
    const crop = {
      face: { zoom: 1, centerY: 0.5 },
      eyes: { zoom: 0.55, centerY: 0.35 },
      mouth: { zoom: 0.55, centerY: 0.7 },
    }[part] ?? { zoom: 1, centerY: 0.5 };
    const cropSize = baseSize * crop.zoom;
    const sourceX = (video.videoWidth - cropSize) / 2;
    const sourceY = Math.max(0, Math.min(video.videoHeight - cropSize, video.videoHeight * crop.centerY - cropSize / 2));
    const photo = document.createElement("canvas");
    photo.width = 256;
    photo.height = 256;
    const context = photo.getContext("2d");
    context.translate(photo.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, sourceX, sourceY, cropSize, cropSize, 0, 0, photo.width, photo.height);

    this.hasPhoto = true;
    this.stop(video);
    this.onPhoto(photo, photo.toDataURL("image/png"));
    this.onStatus("Photo added to your shooter. Choose Retake to change it.");
  }

  stop(video) {
    this.running = false;
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    video.srcObject = null;
    this.onActive(false);
  }
}