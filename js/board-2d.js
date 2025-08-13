import { COLORS, COLOR_HEX } from "./rules.js";

export class Board2D {
  constructor(canvas, layout) {
    this.c = canvas;
    this.ctx = canvas.getContext("2d");
    this.layout = layout;
    this.cellPositions = this.computePositions();
    this.tokenRadius = 16;
  }

  computePositions() {
    const N = this.layout.pathLen;
    const w = this.c.width, h = this.c.height;
    const cx = w/2, cy = h/2;
    const R = Math.min(w,h)*0.35;
    const positions = [];
    for (let i=0;i<N;i++) {
      const a = (i / N) * Math.PI * 2;
      positions.push({ x: cx + Math.cos(a)*R, y: cy + Math.sin(a)*R });
    }
    return positions;
  }

  draw(state) {
    const ctx = this.ctx;
    ctx.clearRect(0,0,this.c.width,this.c.height);

    // Board ring
    ctx.save();
    ctx.translate(0.5,0.5);
    ctx.strokeStyle = "#1f3a74";
    ctx.lineWidth = 4;
    for (let i=0;i<this.cellPositions.length;i++) {
      const p = this.cellPositions[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, 22, 0, Math.PI*2);
      ctx.stroke();
    }
    ctx.restore();

    // Safe stars (sector starts + midpoints)
    ctx.fillStyle = "#123a7a";
    for (let s=0;s<6;s++){
      const idxA = s*12;
      const idxB = s*12 + 5;
      [idxA, idxB].forEach(idx=>{
        const p = this.cellPositions[idx];
        ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI*2); ctx.fill();
      });
    }

    // Tokens
    state.players.forEach((pl)=>{
      ctx.fillStyle = COLOR_HEX[pl.color];
      pl.tokens.forEach((t)=>{
        if (t.pos === "home") return; // TODO: draw home yards
        if (t.pos === "done") return;
        const p = this.cellPositions[t.pos];
        ctx.beginPath();
        ctx.arc(p.x, p.y, this.tokenRadius, 0, Math.PI*2);
        ctx.fill();
        // outline
        ctx.strokeStyle = "#0b1020";
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    });
  }

  hitTestToken(state, x, y) {
    for (let pid=0; pid<state.players.length; pid++) {
      const pl = state.players[pid];
      for (let ti=0; ti<pl.tokens.length; ti++) {
        const t = pl.tokens[ti];
        if (typeof t.pos !== "number") continue;
        const p = this.cellPositions[t.pos];
        const dx = x - p.x, dy = y - p.y;
        if (dx*dx+dy*dy <= this.tokenRadius*this.tokenRadius) {
          return { pid, ti };
        }
      }
    }
    return null;
  }
}