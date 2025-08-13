// minimal manual signaling WebRTC scaffold used from Lobby page
const signalBox = document.getElementById?.('signalLocal');
const log = (m)=>{ if(signalBox) signalBox.value = (signalBox.value ? signalBox.value + '\n' : '') + m; };
let pc=null, dc=null;

export async function makeOfferToBox(){
  pc = new RTCPeerConnection({iceServers:[]});
  dc = pc.createDataChannel('ludo');
  dc.onopen = ()=>log('DC open');
  dc.onmessage = e=>log('Peer: '+e.data);
  pc.onicecandidate = ()=>{ if(pc.localDescription) log(btoa(JSON.stringify(pc.localDescription))); };
  await pc.setLocalDescription(await pc.createOffer());
}

export async function acceptRemoteBox(encoded){
  if(!pc) pc = new RTCPeerConnection({iceServers:[]});
  const remote = JSON.parse(atob(encoded));
  await pc.setRemoteDescription(remote);
  if(remote.type==='offer'){
    await pc.setLocalDescription(await pc.createAnswer());
    log(btoa(JSON.stringify(pc.localDescription)));
  }
}
