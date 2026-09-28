import { STORAGE_KEY } from "./constants.js";

const DEFAULT_SAVE = {
  day: 1,
  communityLiters: 0,
  bestScore: 0,
};

export function loadSave() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SAVE };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SAVE, ...parsed };
  } catch (err) {
    console.warn("Could not load save data, starting fresh.", err);
    return { ...DEFAULT_SAVE };
  }
}

export function writeSave(save) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  } catch (err) {
    console.warn("Could not persist save data.", err);
  }
}
