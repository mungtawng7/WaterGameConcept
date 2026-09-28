import { CANVAS_WIDTH, COLORS, GROUND_Y } from "./constants.js";

export const ENTITY_TYPES = {
  WATER: { width: 30, height: 38, color: COLORS.brandBlue, fallSpeed: 80 },
  MUD: { width: 42, height: 36, color: COLORS.contamination, fallSpeed: 100 },
};

let idCounter = 0;

export function spawnEntity(typeKey) {
  const type = ENTITY_TYPES[typeKey];
  return {
    id: idCounter++,
    typeKey,
    ...type,
    x: 30 + Math.random() * (CANVAS_WIDTH - type.width - 60),
    y: 96 - type.height,
    fallSpeed: type.fallSpeed + Math.random() * 30,
    hit: false,
  };
}

export function updateEntity(entity, dt) {
  entity.y += entity.fallSpeed * dt;
}

export function drawEntity(ctx, entity) {
  ctx.save();
  ctx.fillStyle = entity.color;
  if (entity.typeKey === "WATER") {
    ctx.beginPath();
    ctx.moveTo(entity.x + entity.width / 2, entity.y);
    ctx.quadraticCurveTo(entity.x + entity.width, entity.y + entity.height * 0.68, entity.x + entity.width / 2, entity.y + entity.height);
    ctx.quadraticCurveTo(entity.x, entity.y + entity.height * 0.68, entity.x + entity.width / 2, entity.y);
    ctx.fill();
    ctx.fillStyle = COLORS.white;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.ellipse(entity.x + 11, entity.y + 21, 3, 7, -0.3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.ellipse(entity.x + entity.width / 2, entity.y + entity.height / 2, entity.width / 2, entity.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#B78C67";
    ctx.beginPath();
    ctx.arc(entity.x + 13, entity.y + 12, 5, 0, Math.PI * 2);
    ctx.arc(entity.x + 29, entity.y + 20, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function intersects(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
