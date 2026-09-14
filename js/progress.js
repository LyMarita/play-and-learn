// Stars + per-module progress in localStorage. Per device, nothing leaves it.

const KEY = 'pal-progress-v1';

let data = load();

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
  catch { return {}; }
}

function persist() {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function get(path, fallback) {
  return path in data ? data[path] : fallback;
}

export function set(path, value) {
  data[path] = value;
  persist();
}

export function addStars(n = 1) {
  data.stars = (data.stars || 0) + n;
  persist();
  return data.stars;
}

export function totalStars() {
  return data.stars || 0;
}
