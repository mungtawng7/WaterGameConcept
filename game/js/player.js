import {
  COLORS,
  CANVAS_WIDTH,
  GROUND_Y,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  PLAYER_WIDTH,
  PROJECTILE_SPEED,
  SHOT_COOLDOWN,
} from "./constants.js";

export class Player {
  constructor() {
    this.x = (CANVAS_WIDTH - PLAYER_WIDTH) / 2;
    this.y = GROUND_Y - PLAYER_HEIGHT;
    this.width = PLAYER_WIDTH;
    this.height = PLAYER_HEIGHT;
    this.movingLeft = false;
    this.movingRight = false;
    this.isFiring = false;
    this.facePhoto = null;
    this.shotCooldown = 0;
    this.hitFlashTimer = 0;
  }

  setMoving(direction, moving) {
    if (direction === "left") this.movingLeft = moving;
    if (direction === "right") this.movingRight = moving;
  }

  setFiring(firing) {
    this.isFiring = firing;
  }

  setFacePhoto(photo) {
    this.facePhoto = photo;
  }

  clearInput() {
    this.movingLeft = false;
    this.movingRight = false;
    this.isFiring = false;
  }

  flashHit() {
    this.hitFlashTimer = 0.4;
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  update(dt) {
    if (this.hitFlashTimer > 0) this.hitFlashTimer = Math.max(0, this.hitFlashTimer - dt);
    this.shotCooldown = Math.max(0, this.shotCooldown - dt);
    const direction = Number(this.movingRight) - Number(this.movingLeft);
    this.x = Math.max(0, Math.min(CANVAS_WIDTH - this.width, this.x + direction * PLAYER_SPEED * dt));

    if (!this.isFiring || this.shotCooldown > 0) return null;
    this.shotCooldown = SHOT_COOLDOWN;
    return [this.x + 5, this.x + this.width - 13].map((x) => ({
      x,
      y: this.y - 4,
      width: 8,
      height: 22,
      speed: PROJECTILE_SPEED,
      spent: false,
    }));
  }

  draw(ctx) {
    ctx.save();
    if (this.hitFlashTimer > 0 && Math.floor(this.hitFlashTimer * 20) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }
    ctx.fillStyle = COLORS.brandBlue;
    ctx.fillRect(this.x + 10, this.y + 33, this.width - 20, this.height - 33);

    for (const gunX of [this.x + 1, this.x + this.width - 13]) {
      ctx.fillStyle = "#176EB1";
      ctx.fillRect(gunX, this.y + 13, 12, 28);
      ctx.fillStyle = COLORS.brandYellow;
      ctx.fillRect(gunX + 2, this.y + 4, 8, 15);
      ctx.fillStyle = "#1B1B1B";
      ctx.fillRect(gunX + 3, this.y + 2, 6, 4);
      ctx.fillStyle = COLORS.brandBlue;
      ctx.fillRect(gunX + 3, this.y + 34, 6, 10);
    }

    const faceX = this.x + this.width / 2;
    const faceY = this.y + 25;
    ctx.save();
    ctx.beginPath();
    ctx.arc(faceX, faceY, 13, 0, Math.PI * 2);
    ctx.clip();
    if (this.facePhoto) {
      ctx.drawImage(this.facePhoto, faceX - 13, faceY - 13, 26, 26);
    } else {
      ctx.fillStyle = COLORS.skin;
      ctx.fillRect(faceX - 13, faceY - 13, 26, 26);
      ctx.fillStyle = COLORS.text;
      ctx.fillRect(faceX - 6, faceY - 2, 2, 2);
      ctx.fillRect(faceX + 4, faceY - 2, 2, 2);
      ctx.fillRect(faceX - 3, faceY + 6, 6, 2);
    }
    ctx.restore();
    ctx.strokeStyle = COLORS.white;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(faceX, faceY, 13, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}
