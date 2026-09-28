import { COLORS, CANVAS_WIDTH, JERRYCAN_MAX, STAMINA_MAX, WELL_FUND_GOAL_LITERS } from "./constants.js";

export function drawTopBar(ctx, day) {
  ctx.fillStyle = COLORS.brandBlue;
  ctx.fillRect(0, 0, CANVAS_WIDTH, 48);
  ctx.fillStyle = COLORS.white;
  ctx.font = "bold 20px Verdana";
  ctx.fillText("charity: water", 16, 30);
  ctx.font = "18px Verdana";
  ctx.fillText(`Day ${day}`, CANVAS_WIDTH / 2 - 24, 30);
}

export function drawStatsStrip(ctx, { jerrycanFill, score, stamina }) {
  ctx.fillStyle = COLORS.white;
  ctx.fillRect(0, 48, CANVAS_WIDTH, 40);

  // jerrycan icon
  ctx.fillStyle = COLORS.brandYellow;
  ctx.fillRect(20, 58, 18, 6);
  ctx.strokeStyle = "#E0A800";
  ctx.fillRect(18, 64, 22, 18);
  ctx.strokeRect(18, 64, 22, 18);

  ctx.fillStyle = COLORS.text;
  ctx.font = "16px Verdana";
  ctx.fillText(`Clean water: ${Math.round(jerrycanFill)}%`, 48, 75);
  ctx.fillStyle = "#E0E0E0";
  ctx.fillRect(218, 62, 150, 14);
  ctx.fillStyle = COLORS.brandBlue;
  ctx.fillRect(218, 62, 150 * Math.min(1, jerrycanFill / JERRYCAN_MAX), 14);
  ctx.fillStyle = COLORS.text;
  ctx.fillText(`Score: ${score}`, 410, 75);
  ctx.fillText(`Hearts: ${"♥".repeat(Math.max(0, stamina))}${"♡".repeat(Math.max(0, STAMINA_MAX - stamina))}`, 620, 75);
}

export function drawCommunityFooter(ctx, communityLiters) {
  const pct = Math.min(1, communityLiters / WELL_FUND_GOAL_LITERS);
  ctx.fillStyle = COLORS.white;
  ctx.fillRect(0, 500, CANVAS_WIDTH, 40);
  ctx.fillStyle = COLORS.text;
  ctx.font = "16px Verdana";
  ctx.fillText("Community Well Progress:", 16, 524);

  const barX = 230;
  const barW = 500;
  ctx.fillStyle = "#E0E0E0";
  ctx.fillRect(barX, 512, barW, 16);
  ctx.fillStyle = COLORS.brandYellow;
  ctx.fillRect(barX, 512, barW * pct, 16);
  ctx.fillStyle = COLORS.text;
  ctx.fillText(`${Math.round(pct * 100)}%`, barX + barW + 15, 524);
}
