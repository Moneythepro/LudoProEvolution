export function chooseAIMove(state, layout, rng, moves){
  if(!moves || moves.length===0) return null;
  // pick random
  return moves[Math.floor((rng ? rng() : Math.random())*moves.length)];
}
