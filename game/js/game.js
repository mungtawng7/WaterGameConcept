import {
  COLORS,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GROUND_Y,
  JERRYCAN_MAX,
  STAMINA_MAX,
  SCORE_PER_DROP,
  WATER_PER_DROP,
  LITERS_PER_SCORE_POINT,
} from "./constants.js";
import { Player } from "./player.js";
import { spawnEntity, updateEntity, drawEntity, intersects } from "./entities.js";
import { drawTopBar, drawStatsStrip, drawCommunityFooter } from "./hud.js";
import { loadSave, writeSave } from "./storage.js";

const STATE = {
  TITLE: "title",
  PLAYING: "playing",
  IMPACT: "impact",
};

const SPAWN_POOL = ["WATER", "WATER", "MUD"];

export class Game {
  constructor(ctx) {
    this.ctx = ctx;
    this.save = loadSave();
    this.state = STATE.TITLE;
    this.resetDayState();
    this.spawnTimer = 0;
    this.lastResult = null;

    this._bindInput();
  }

  resetDayState() {
    const facePhoto = this.player?.facePhoto ?? null;
    this.player = new Player();
    this.player.setFacePhoto(facePhoto);
    this.entities = [];
    this.projectiles = [];
    this.score = 0;
    this.jerrycanFill = 0;
    this.stamina = STAMINA_MAX;
    this.spawnTimer = 0.5;
  }

  _bindInput() {
    window.addEventListener("keydown", (e) => {
      if (this.state === STATE.TITLE && (e.code === "Space" || e.code === "Enter")) {
        this.startDay();
        return;
      }
      if (this.state === STATE.IMPACT && (e.code === "Space" || e.code === "Enter")) {
        this.startDay();
        return;
      }
      if (this.state !== STATE.PLAYING) return;
      if (e.code === "ArrowLeft" || e.code === "ArrowRight") {
        e.preventDefault();
        this.player.setMoving(e.code === "ArrowLeft" ? "left" : "right", true);
      } else if (e.code === "Space") {
        e.preventDefault();
        this.player.setFiring(true);
      }
    });
    window.addEventListener("keyup", (e) => {
      if (e.code === "ArrowLeft" || e.code === "ArrowRight") {
        this.player.setMoving(e.code === "ArrowLeft" ? "left" : "right", false);
      }
      if (e.code === "Space") this.player.setFiring(false);
    });

    this.ctx.canvas.addEventListener("pointerdown", () => {
      if (this.state === STATE.TITLE || this.state === STATE.IMPACT) {
        this.startDay();
      } else if (this.state === STATE.PLAYING) {
        this.player.setFiring(true);
      }
    });
    window.addEventListener("pointerup", () => this.player.setFiring(false));
    window.addEventListener("blur", () => this.player.clearInput());
  }

  startDay() {
    this.resetDayState();
    this.state = STATE.PLAYING;
  }

  endDay() {
    const liters = Math.max(0, this.score) * LITERS_PER_SCORE_POINT;
    this.save.communityLiters += liters;
    this.save.bestScore = Math.max(this.save.bestScore, this.score);
    this.save.day += 1;
    this.lastResult = {
      day: this.save.day - 1,
      score: this.score,
      waterFill: this.jerrycanFill,
      success: this.jerrycanFill >= JERRYCAN_MAX,
      liters,
    };
    writeSave(this.save);
    this.state = STATE.IMPACT;
  }

  update(dt) {
    if (this.state !== STATE.PLAYING) return;

    const projectile = this.player.update(dt);
    if (projectile) this.projectiles.push(...projectile);

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      const typeKey = SPAWN_POOL[Math.floor(Math.random() * SPAWN_POOL.length)];
      this.entities.push(spawnEntity(typeKey));
      this.spawnTimer = Math.max(0.42, 0.95 - (this.save.day - 1) * 0.04) + Math.random() * 0.45;
    }

    for (const bullet of this.projectiles) {
      bullet.y -= bullet.speed * dt;
    }

    for (const entity of this.entities) {
      updateEntity(entity, dt);
      if (entity.y + entity.height >= GROUND_Y) {
        entity.missed = true;
        if (entity.typeKey === "MUD") this.stamina -= 1;
      }
    }

    for (const bullet of this.projectiles) {
      if (bullet.spent) continue;
      for (const entity of this.entities) {
        if (entity.hit || entity.missed) continue;
        if (intersects(bullet, entity)) {
          bullet.spent = true;
          entity.hit = true;
          this._resolveHit(entity);
          break;
        }
      }
    }

    this.projectiles = this.projectiles.filter((bullet) => !bullet.spent && bullet.y + bullet.height > 88);
    this.entities = this.entities.filter((entity) => !entity.hit && !entity.missed);
    if (this.jerrycanFill >= JERRYCAN_MAX || this.stamina <= 0) this.endDay();
  }

  _resolveHit(entity) {
    if (entity.typeKey === "WATER") {
      this.score += SCORE_PER_DROP;
      this.jerrycanFill = Math.min(JERRYCAN_MAX, this.jerrycanFill + WATER_PER_DROP);
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (this.state === STATE.TITLE) {
      this._drawTitle();
      return;
    }
    if (this.state === STATE.IMPACT) {
      this._drawImpact();
      return;
    }

    ctx.fillStyle = COLORS.sky;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = COLORS.brandYellow;
    ctx.beginPath();
    ctx.arc(850, 145, 34, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    ctx.fillRect(0, 100, CANVAS_WIDTH, 2);
    ctx.fillRect(0, 225, CANVAS_WIDTH, 2);
    ctx.fillRect(0, 350, CANVAS_WIDTH, 2);

    ctx.fillStyle = COLORS.ground;
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
    ctx.fillStyle = COLORS.groundDark;
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 5);

    for (const entity of this.entities) {
      drawEntity(ctx, entity);
    }
    ctx.fillStyle = COLORS.brandBlue;
    for (const bullet of this.projectiles) {
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
    this.player.draw(ctx);

    drawTopBar(ctx, this.save.day);
    drawStatsStrip(ctx, {
      jerrycanFill: this.jerrycanFill,
      score: Math.round(this.score),
      stamina: this.stamina,
    });
    drawCommunityFooter(ctx, this.save.communityLiters);
  }

  _drawTitle() {
    const ctx = this.ctx;
    ctx.fillStyle = COLORS.sky;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = COLORS.brandYellow;
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, 135, 60, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = COLORS.brandBlue;
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 100);
    ctx.quadraticCurveTo(CANVAS_WIDTH / 2 + 27, 137, CANVAS_WIDTH / 2, 163);
    ctx.quadraticCurveTo(CANVAS_WIDTH / 2 - 27, 137, CANVAS_WIDTH / 2, 100);
    ctx.fill();

    ctx.fillStyle = COLORS.text;
    ctx.textAlign = "center";
    ctx.font = "bold 48px Verdana";
    ctx.fillText("WATER DEFENDER", CANVAS_WIDTH / 2, 250);
    ctx.font = "italic 20px Verdana";
    ctx.fillText("Protect every drop from pollution.", CANVAS_WIDTH / 2, 290);
    ctx.font = "bold 16px Verdana";
    ctx.fillText("Move with  ←  →     Shoot with Space", CANVAS_WIDTH / 2, 330);
    ctx.font = "15px Verdana";
    ctx.fillText("Hit water to fill your jerrycan. Stop the mud before it lands.", CANVAS_WIDTH / 2, 356);

    ctx.fillStyle = COLORS.brandYellow;
    ctx.beginPath();
    ctx.roundRect(CANVAS_WIDTH / 2 - 100, 380, 200, 56, 28);
    ctx.fill();
    ctx.fillStyle = COLORS.text;
    ctx.font = "bold 24px Verdana";
    ctx.fillText("PLAY", CANVAS_WIDTH / 2, 416);

    ctx.fillStyle = COLORS.white;
    ctx.font = "16px Verdana";
    ctx.fillText("Press Space or click to start", CANVAS_WIDTH / 2, 470);
    ctx.textAlign = "left";
  }

  _drawImpact() {
    const ctx = this.ctx;
    const r = this.lastResult;
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = COLORS.brandBlue;
    ctx.fillRect(0, 0, CANVAS_WIDTH, 60);
    ctx.fillStyle = COLORS.white;
    ctx.font = "bold 24px Verdana";
    ctx.textAlign = "center";
    ctx.fillText("Round Report", CANVAS_WIDTH / 2, 38);

    ctx.fillStyle = COLORS.text;
    ctx.font = "18px Verdana";
    ctx.fillText(`Day ${r?.day ?? this.save.day} complete`, CANVAS_WIDTH / 2, 100);
    ctx.fillText(r?.success ? "Clean water secured!" : "The mud reached the water supply.", CANVAS_WIDTH / 2, 135);
    ctx.fillText(`Jerrycan filled: ${Math.round(r?.waterFill ?? 0)}%`, CANVAS_WIDTH / 2, 170);
    ctx.fillText(`Score: ${Math.round(r?.score ?? 0)}`, CANVAS_WIDTH / 2, 205);
    ctx.fillText(`Liters delivered: ${r?.liters.toFixed(1) ?? 0} L`, CANVAS_WIDTH / 2, 240);

    // map pin icon
    ctx.fillStyle = COLORS.brandYellow;
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, 285, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2 - 10, 293);
    ctx.lineTo(CANVAS_WIDTH / 2 + 10, 293);
    ctx.lineTo(CANVAS_WIDTH / 2, 315);
    ctx.fill();

    drawCommunityFooter(ctx, this.save.communityLiters);

    ctx.fillStyle = COLORS.text;
    ctx.font = "14px Verdana";
    ctx.fillText("100% of public donations fund water projects — charitywater.org", CANVAS_WIDTH / 2, 460);

    ctx.font = "16px Verdana";
    ctx.fillText("Press Space or click to play again", CANVAS_WIDTH / 2, 490);
    ctx.textAlign = "left";
  }
}
