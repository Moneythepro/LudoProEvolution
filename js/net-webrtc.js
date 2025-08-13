// Minimal offline WebRTC DataChannel using manual signaling via textarea.
const btnHost = document.getElementById("btnHost");
const btnJoin = document.getElementById("btnJoin");
const signalBox = document.getElementById("signalLocal");
const btnMakeOffer = document.getElementById("btnMakeOffer");
const btnAcceptOffer = document.getElementById("btnAcceptOffer");
const chatLog = document.getElementById("chatLog");

let pc = null, dc = null;

function log(msg) { chatLog.innerHTML += `<div style="opacity:.8">${msg}</div>`; chatLog.scrollTop = chatLog.scrollHeight; }

function newPC() {
  pc = new RTCPeerConnection({
    // Intentionally no STUN/TURN to keep fully offline; will only connect on local network with manual exchange.
    iceServers: []
  });
  pc.onicecandidate = (e) => {
    if (e.candidate) return;
    // When gathering done, show local description to copy
    signalBox.value = btoa(JSON.stringify(pc.localDescription));
  };
  pc.ondatachannel = (e)=> {
    dc = e.channel;
    wireDC();
  };
}

function wireDC() {
  dc.onopen = ()=>log("<em>DataChannel open</em>");
  dc.onmessage = (e)=>log(`<strong>Peer:</strong> ${e.data}`);
}

btnHost.addEventListener("click", async ()=>{
  newPC();
  dc = pc.createDataChannel("ludo");
  wireDC();
  await pc.setLocalDescription(await pc.createOffer());
  log("<em>Offer created. Copy & send it to peer.</em>");
});

btnJoin.addEventListener("click", ()=>{
  newPC();
  log("<em>Paste host offer and click Accept Offer.</em>");
});

btnMakeOffer.addEventListener("click", async ()=>{
  if (!pc) { newPC(); }
  await pc.setLocalDescription(await pc.createOffer());
  log("<em>Offer created. Copy & send it to peer.</em>");
});

btnAcceptOffer.addEventListener("click", async ()=>{
  if (!pc) newPC();
  const remote = JSON.parse(atob(signalBox.value.trim()));
  await pc.setRemoteDescription(remote);
  if (remote.type === "offer") {
    await pc.setLocalDescription(await pc.createAnswer());
    signalBox.value = btoa(JSON.stringify(pc.localDescription));
    log("<em>Answer created. Send this back to host.</em>");
  } else {
    log("<em>Remote answer set. Connecting…</em>");
  }
});