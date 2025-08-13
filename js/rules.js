// Colors for up to 6 players
export const COLORS = ["red","blue","green","yellow","purple","orange"];
export const COLOR_HEX = {
  red:"#ef4444", blue:"#3b82f6", green:"#22c55e", yellow:"#f59e0b", purple:"#a855f7", orange:"#f97316"
};

// Build a simple hex/star loop path for 6 colors (72 cells total: 12 per color sector)
export function buildBoardLayout() {
  // 15x15 grid logical coords mapped into a circular path for simplicity.
  const path = [];
  const R = 6; // ring radius in "cells"
  for (let s=0; s<6; s++) {
    for (let i=0; i<12; i++) {
      path.push({ sector:s, idx:i, safe:(i===0 || i===5), x:0, y:0 });
    }
  }
  // positions will be computed by renderer; rules care only about index.
  return { pathLen: path.length, path };
}

export function initialState(opts) {
  const { players=6, tokensPerPlayer=4, seed=12345, variants={} } = opts;
  const playersArr = Array.from({length: players}, (_,i)=>({
    id:i, color: COLORS[i], name: COLORS[i].toUpperCase(), tokens: Array.from({length: tokensPerPlayer},()=>({pos:"home"}))
  }));
  return {
    v: 1,
    seed, turn: 0, rollsLeft: 1, bonusChain: 0,
    players: playersArr,
    options: { tokensPerPlayer, variants },
    log: []
  };
}

// Compute legal moves for a player given a die roll.
// Positions: "home" | integer index along main path | {homeRun:n} | "done"
export function legalMoves(state, playerId, die, layout) {
  const P = state.players[playerId];
  const moves = [];
  const mustSix = state.options.variants.mustSix ?? true;
  const exactHome = state.options.variants.exactHome ?? true;

  P.tokens.forEach((t, ti) => {
    if (t.pos === "done") return;

    if (t.pos === "home") {
      if (!mustSix || die === 6) {
        moves.push({ ti, from:"home", to:entryIndex(playerId, layout), type:"enter" });
      }
      return;
    }
    // main path move
    const fromIdx = t.pos;
    const toIdx = (fromIdx + die) % layout.pathLen;
    // TODO: add home stretch logic (simplified demo keeps looping)
    moves.push({ ti, from: fromIdx, to: toIdx, type:"step" });
  });
  return moves;
}

export function applyMove(state, playerId, move) {
  const S = structuredClone(state);
  const P = S.players[playerId];
  const T = P.tokens[move.ti];
  if (move.from === "home") {
    T.pos = move.to;
  } else {
    T.pos = move.to;
  }
  S.log.push({t:Date.now(), playerId, move});
  return S;
}

export function nextPlayer(state, die, rolledSix, vBonusSix=true) {
  if (vBonusSix && die === 6) return { turn: state.turn, bonusChain: Math.min(2, state.bonusChain+1) };
  return { turn: (state.turn + 1) % state.players.length, bonusChain: 0 };
}

// Where each color enters the track
export function entryIndex(playerId, layout) {
  return playerId * 12; // each sector length
}