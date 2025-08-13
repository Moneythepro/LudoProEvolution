import { seededInt } from "./util-seed.js";

export function chooseAIMove(state, layout, rng, moves) {
  // Simple heuristic: prefer captures (TODO: detect captures), else furthest move.
  // For now, random among legal moves to keep it compact.
  if (!moves.length) return null;
  const i = seededInt(rng, 0, moves.length-1);
  return moves[i];
}