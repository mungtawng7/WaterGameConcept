// Brand palette & tunable game constants
export const COLORS = {
  brandBlue: "#2E9DF7",
  brandYellow: "#FFC907",
  sky: "#EAF6FF",
  ground: "#C8A165",
  groundDark: "#8C6A3F",
  contamination: "#8C6A3F",
  white: "#FFFFFF",
  text: "#1B1B1B",
  rock: "#9A9A9A",
  thorn: "#5B8C4A",
  skin: "#F4B183",
};

export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;
export const GROUND_Y = 460;

export const GRAVITY = 2200;
export const JUMP_VELOCITY = -820;
export const PLAYER_X = 120;
export const PLAYER_WIDTH = 58;
export const PLAYER_HEIGHT = 58;
export const DUCK_HEIGHT = 26;
export const PLAYER_SPEED = 440;
export const PROJECTILE_SPEED = 680;
export const SHOT_COOLDOWN = 0.22;

export const BASE_SCROLL_SPEED = 260;
export const SPEED_PER_DAY = 25;

export const JERRYCAN_MAX = 100;
export const STAMINA_MAX = 3; // number of contamination hits allowed before the day ends
export const DISTANCE_GOAL_METERS = 500; // distance to walk "home" each day

export const SCORE_PER_DROP = 10;
export const WATER_PER_DROP = 10;
export const SCORE_PENALTY_CONTAMINATION = -15;
export const DISTANCE_SCORE_RATE = 1; // points per meter walked cleanly
export const MAX_STREAK_MULTIPLIER = 3;

export const LITERS_PER_SCORE_POINT = 0.1; // score / 10 = liters delivered
export const WELL_FUND_GOAL_LITERS = 5000; // liters needed to fully fund a well

export const STORAGE_KEY = "wellwalk-save-v1";
