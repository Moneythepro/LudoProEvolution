export function mulberry32(seed) {
  let t = seed >>> 0;
  return function() {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ t >>> 15, 1 | t);
    r ^= r + Math.imul(r ^ r >>> 7, 61 | r);
    return ((r ^ r >>> 14) >>> 0) / 4294967296;
  };
}

export function seededInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function saveJSON(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
export function loadJSON(key, fallback = null) {
  const s = localStorage.getItem(key);
  return s ? JSON.parse(s) : fallback;
}
export function uid(prefix="id") { return `${prefix}_${Math.random().toString(36).slice(2,9)}`; }