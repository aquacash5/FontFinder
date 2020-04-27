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

ipcRenderer.on("system-fonts", (event, args) => {
  fontfinder.ports.receiveFonts.send(args);
});

ipcRenderer.send("main-page-start");
