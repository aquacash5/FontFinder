"use strict";

import { Elm } from "./Main.elm";
import { ipcRenderer } from "electron";
import "./styles/renderer.scss";

// get a reference to the div where we will show our UI
let container = document.createElement("div");
document.body.appendChild(container);

// start the elm app in the container
// and keep a reference for communicating with the app
let fontfinder = Elm.Main.init({ node: container });

ipcRenderer.on("ELM-EVENT", (event, { port, args }) => {
  fontfinder.ports[port].send(args);
});

Object.entries(fontfinder.ports)
  .filter(([_, v]) => v.hasOwnProperty("subscribe"))
  .forEach(([k, { subscribe }]) => {
    subscribe((args) => {
      ipcRenderer.send(k, args);
    });
  });

ipcRenderer.send("main-page-start");
