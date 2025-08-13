export function mulberry32(seed){
  let t = seed >>> 0;
  return function(){
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
export function seededInt(rng, lo, hi){ return lo + Math.floor(rng()*(hi-lo+1)); }
export function saveJSON(key, data){ localStorage.setItem(key, JSON.stringify(data)); }
export function loadJSON(key){ const s = localStorage.getItem(key); return s ? JSON.parse(s) : null; }
