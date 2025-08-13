export class Board2D {
  constructor(canvas, layout){
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.layout = layout;
    this.tokens = []; // {player,ti,pos}
    this._computePositions();
    this.draw();
    // responsive
    new ResizeObserver(()=>{ this._computePositions(); this.draw(); }).observe(canvas);
  }
  _computePositions(){
    const c = this.canvas;
    const w = c.width, h = c.height, cx = w/2, cy = h/2, R = Math.min(w,h)*0.36;
    this.positions = this.layout.path.map((_,i)=>{
      const a = (i / this.layout.len) * Math.PI*2 - Math.PI/2;
      return { x: cx + Math.cos(a)*R, y: cy + Math.sin(a)*R };
    });
  }
  clearTokens(){ this.tokens = []; }
  addToken(player, ti, pos){
    if(pos==='home' || pos==='done') return;
    this.tokens.push({player,ti,pos});
  }
  draw(state){
    const ctx = this.ctx; const c = this.canvas;
    ctx.clearRect(0,0,c.width,c.height);
    // background
    ctx.fillStyle = '#021022'; ctx.fillRect(0,0,c.width,c.height);
    // draw path dots
    ctx.strokeStyle = '#0f3a5f'; ctx.lineWidth = 2;
    for(let i=0;i<this.positions.length;i++){
      const p = this.positions[i];
      ctx.beginPath(); ctx.arc(p.x,p.y,14,0,Math.PI*2); ctx.stroke();
    }
    // draw tokens from state (if provided)
    if(state){
      state.players.forEach((pl,pi)=>{
        pl.tokens.forEach((t,ti)=>{
          if(t.pos==='home' || t.pos==='done') return;
          const pos = this.positions[t.pos];
          ctx.fillStyle = pl.color;
          ctx.beginPath(); ctx.arc(pos.x,pos.y,12,0,Math.PI*2); ctx.fill();
          ctx.strokeStyle = '#021322'; ctx.lineWidth = 2; ctx.stroke();
        });
      });
    }
  }
  hitTestToken(state, x, y){
    for(let pi=0; pi<state.players.length; pi++){
      const pl = state.players[pi];
      for(let ti=0; ti<pl.tokens.length; ti++){
        const t = pl.tokens[ti];
        if(typeof t.pos !== 'number') continue;
        const pos = this.positions[t.pos];
        const dx = x - pos.x, dy = y - pos.y;
        if(dx*dx+dy*dy <= 16*16) return { pi, ti };
      }
    }
    return null;
  }
}
