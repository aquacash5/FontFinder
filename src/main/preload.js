const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ipc", {
  subscribeElm: (fn) => ipcRenderer.on("ELM-EVENT", fn),
  send: (k, args) => ipcRenderer.send(k, args),
});
