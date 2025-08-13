const btnInstall = document.getElementById("btnInstall");
let deferred;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferred = e;
  btnInstall.hidden = false;
});
btnInstall.addEventListener("click", async () => {
  if (!deferred) return;
  deferred.prompt();
  await deferred.userChoice;
  deferred = null;
  btnInstall.hidden = true;
});