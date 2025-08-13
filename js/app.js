import { mulberry32, seededInt, saveJSON, loadJSON } from "./util-seed.js";
import { buildBoardLayout, initialState, legalMoves, applyMove, nextPlayer, COLORS } from "./rules.js";
import { Board2D } from "./board-2d.js";
import { chooseAIMove } from "./ai.js";
import "./net-webrtc.js";
import "./pwa-install.js";

// ---- State ----
const layout = buildBoardLayout();
const canvas = document.getElementById("board");
const boardWrap = document.querySelector(".board-wrap");
const diceEl = document.getElementById("dice");
const turnBanner = document.getElementById("turnBanner");
const rollBanner = document.getElementById("rollBanner");

let rng = mulberry32(12345);
let state = initialState({
  players: 6, tokensPerPlayer: 4, seed: 12345,
  variants: { mustSix: true, bonusSix: true, exactHome: true, safeStars: true }
});

const board = new Board2D(canvas, layout);
board.draw(state);

// UI: seats list
const seatsEl = document.getElementById("seats");
const playerCountEl = document.getElementById("playerCount");
const tokenCountEl = document.getElementById("tokenCount");
const vMustSix = document.getElementById("vMustSix");
const vBonusSix = document.getElementById("vBonusSix");
const vExactHome = document.getElementById("vExactHome");
const vSafeStars = document.getElementById("vSafeStars");

function refreshSeats() {
  seatsEl.innerHTML = "";
  state.players.forEach((p, i)=>{
    const d = document.createElement("div");
    d.className = "seat";
    d.style = `display:flex;align-items:center;gap:.5rem;margin:.25rem 0`;
    d.innerHTML = `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};outline:2px solid rgba(255,255,255,.2)"></span> 
      <strong>${p.name}</strong> 
      <select data-seat="${i}">
        <option value="human" selected>Human</option>
        <option value="ai">AI</option>
      </select>`;
    seatsEl.appendChild(d);
  });
}
refreshSeats();

function updateHUD(lastRoll=null) {
  const p = state.players[state.turn];
  turnBanner.textContent = `Turn: ${p.name}`;
  rollBanner.textContent = `Roll: ${lastRoll ?? "—"}`;
}
updateHUD();

// 3D tilt
document.getElementById("btnToggle3D").addEventListener("click", ()=>{
  boardWrap.classList.toggle("tilt");
});

// Quick Play setup
document.getElementById("btnQuickPlay").addEventListener("click", ()=>{
  const n = parseInt(playerCountEl.value,10);
  const tpc = parseInt(tokenCountEl.value,10);
  state = initialState({
    players: n, tokensPerPlayer: tpc, seed: Date.now() & 0xffffffff,
    variants: {
      mustSix: vMustSix.checked, bonusSix: vBonusSix.checked,
      exactHome: vExactHome.checked, safeStars: vSafeStars.checked
    }
  });
  rng = mulberry32(state.seed);
  refreshSeats();
  board.draw(state);
  updateHUD();
});

// Dice roll animation
function spinCubeToFace(face) {
  const cube = diceEl.querySelector(".cube");
  const randX = 360 * 2 + (face===1?0:60*face);
  const randY = 360 * 3 + (face===6?0:45*face);
  cube.style.transform = `rotateX(${randX}deg) rotateY(${randY}deg)`;
}

// Roll + move
async function doTurn() {
  const die = seededInt(rng, 1, 6);
  spinCubeToFace(die);
  updateHUD(die);

  const moves = legalMoves(state, state.turn, die, layout);
  if (moves.length === 0) {
    const np = nextPlayer(state, die, die===6, state.options.variants.bonusSix);
    state.turn = np.turn; state.bonusChain = np.bonusChain;
    updateHUD();
    return;
  }

  const seatSel = seatsEl.querySelector(`select[data-seat="${state.turn}"]`);
  const isAI = seatSel?.value === "ai";
  let chosen = null;

  if (isAI) {
    chosen = chooseAIMove(state, layout, rng, moves);
    await new Promise(r=>setTimeout(r, 400));
  } else {
    chosen = await waitForTokenClick(moves);
  }

  state = applyMove(state, state.turn, chosen);
  board.draw(state);

  const np = nextPlayer(state, die, die===6, state.options.variants.bonusSix);
  state.turn = np.turn; state.bonusChain = np.bonusChain;
  updateHUD();
}

function waitForTokenClick(moves) {
  return new Promise((resolve)=>{
    function onClick(ev){
      const rect = canvas.getBoundingClientRect();
      const x = (ev.clientX - rect.left) * (canvas.width / rect.width);
      const y = (ev.clientY - rect.top) * (canvas.height / rect.height);
      const hit = board.hitTestToken(state, x, y);
      if (!hit) return;
      const idx = moves.findIndex(m => m.ti === hit.ti);
      if (idx >= 0) {
        canvas.removeEventListener("click", onClick);
        resolve(moves[idx]);
      }
    }
    canvas.addEventListener("click", onClick);
  });
}

diceEl.addEventListener("click", ()=>doTurn());
diceEl.addEventListener("keydown", (e)=>{ if (e.key==="Enter"||e.key===" ") doTurn(); });

// Save/Load
document.getElementById("btnSave").addEventListener("click", ()=>{
  saveJSON("ludo6.save", state);
  alert("Saved!");
});
document.getElementById("btnLoad").addEventListener("click", ()=>{
  const s = loadJSON("ludo6.save");
  if (s) { state = s; rng = mulberry32(state.seed); board.draw(state); updateHUD(); }
  else alert("No save found");
});

// Rules dialog
const dlgRules = document.getElementById("dlgRules");
document.getElementById("btnRules").addEventListener("click", ()=>dlgRules.showModal());
document.getElementById("btnCloseRules").addEventListener("click", ()=>dlgRules.close());

// Mute toggle
const btnMute = document.getElementById("btnMute");
btnMute.addEventListener("click", ()=>{
  const pressed = btnMute.getAttribute("aria-pressed")==="true";
  btnMute.setAttribute("aria-pressed", String(!pressed));
  btnMute.textContent = pressed ? "🔊" : "🔇";
});

// Chat
const chatLog = document.getElementById("chatLog");
document.getElementById("chatForm").addEventListener("submit", (e)=>{
  e.preventDefault();
  const inp = document.getElementById("chatInput");
  if (!inp.value.trim()) return;
  chatLog.innerHTML += `<div><strong>You:</strong> ${inp.value}</div>`;
  inp.value = "";
});
