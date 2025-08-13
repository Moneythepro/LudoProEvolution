export const COLORS = ['#ef4444','#22c55e','#3b82f6','#f59e0b','#a855f7','#fb7185'];

export function buildBoardLayout(){
  // simple circular track 72 cells (6 sectors x12)
  const sectors = 6, per = 12;
  const path = [];
  for(let i=0;i<sectors*per;i++){
    path.push({ idx:i, sector: Math.floor(i/per), safe: (i%per===0) });
  }
  return { path, len: path.length };
}

export function initialState(opts = {}){
  const players = opts.players || 6;
  const tokensPerPlayer = opts.tokensPerPlayer || 4;
  const seed = opts.seed ?? Date.now() & 0xffffffff;
  const variants = opts.variants || { mustSix:true, bonusSix:true, exactHome:false, safeStars:true};
  const playersArr = Array.from({length:players}, (_,i)=>({
    id:i, name:`P${i+1}`, color: COLORS[i%COLORS.length], type:'human',
    tokens: Array.from({length:tokensPerPlayer}, ()=>({ pos:'home' }))
  }));
  return { v:1, seed, turn:0, players:playersArr, options:{tokensPerPlayer, variants}, log:[] };
}

// returns legal moves list (very simplified)
export function legalMoves(state, playerId, die, layout){
  const me = state.players[playerId];
  const moves = [];
  const entry = playerId * 12; // start index for each player
  me.tokens.forEach((t,ti)=>{
    if(t.pos==='home'){ if(!state.options.variants?.mustSix || die===6) moves.push({ti, type:'enter', to:entry}); }
    else if(t.pos==='done'){}
    else { moves.push({ti, type:'step', to: (t.pos + die) % layout.len }); }
  });
  return moves;
}

export function applyMove(state, playerId, move){
  const s = JSON.parse(JSON.stringify(state));
  const token = s.players[playerId].tokens[move.ti];
  if(move.type==='enter'){ token.pos = move.to; token.state='track'; }
  else { token.pos = move.to; }
  s.log.push({t:Date.now(), playerId, move});
  // simple capture: send others at same index home (unless safe star)
  s.players.forEach((p,pi)=>{
    if(pi===playerId) return;
    p.tokens.forEach(tok=>{
      if(tok.pos===token.pos && tok.pos!=='home'){
        // if tile safe, skip (use layout)
        tok.pos='home';
      }
    });
  });
  return s;
}

export function nextPlayer(state, die, rolledSix=false){
  if(state.options.variants?.bonusSix && die===6) return state.turn; // keep same
  return (state.turn + 1) % state.players.length;
}
