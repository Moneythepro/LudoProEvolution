import { mulberry32, seededInt, saveJSON, loadJSON } from './util-seed.js';
import { buildBoardLayout, initialState, legalMoves, applyMove, nextPlayer } from './rules.js';
import { Board2D } from './board-2d.js';
import { chooseAIMove } from './ai.js';

const canvas = document.getElementById('board');
const layout = buildBoardLayout();
const board = new Board2D(canvas, layout);

// UI elements
const turnBanner = document.getElementById('turnBanner');
const rollBanner = document.getElementById('rollBanner');
const btnRoll = document.getElementById('btnRoll');
const btnSave = document.getElementById('btnSave');
const btnLoad = document.getElementById('btnLoad');
const chatForm = document.getElementById('chatForm');
const chatLog = document.getElementById('chatLog');

// state
let rng = mulberry32(12345);
let state = initialState({ players:6, tokensPerPlayer:4, seed: Date.now() & 0xffffffff });
let lastRoll = null;

// render initial
board.draw(state);
updateHUD();

// helpers
function updateHUD(){
  const p = state.players[state.turn];
  turnBanner.textContent = `Turn: ${p.name}`;
  rollBanner.textContent = `Roll: ${lastRoll ?? '—'}`;
}

// roll
btnRoll?.addEventListener('click', ()=>{
  const die = seededInt(rng, 1, 6);
  lastRoll = die;
  rollBanner.textContent = `Roll: ${die}`;
  const moves = legalMoves(state, state.turn, die, layout);
  if(moves.length===0){
    // pass
    state.turn = nextPlayer(state, die);
    updateHUD();
    board.draw(state);
    return;
  }
  // if human choose - we automatically pick first move (for simple flow)
  const chosen = moves[0];
  state = applyMove(state, state.turn, chosen);
  // advance turn (simple rules)
  state.turn = nextPlayer(state, die);
  board.draw(state);
  updateHUD();
});

// save/load
btnSave?.addEventListener('click', ()=>{ saveJSON('ludo-save', state); alert('Saved'); });
btnLoad?.addEventListener('click', ()=>{
  const s = loadJSON('ludo-save');
  if(s){ state = s; board.draw(state); updateHUD(); alert('Loaded'); } else alert('No save');
});

// simple chat
chatForm?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const inp = document.getElementById('chatInput');
  if(!inp.value) return;
  const div = document.createElement('div'); div.textContent = 'You: ' + inp.value;
  chatLog.appendChild(div); inp.value='';
  chatLog.scrollTop = chatLog.scrollHeight;
});
