"use strict";

import { Elm } from "./Main.elm";
import { ipcRenderer } from "electron";
import { SYSTEM_FONTS_EVENTS, LOADING_FONT_PROGRESS } from "../constants";
import "./styles/renderer.scss";

// get a reference to the div where we will show our UI
let container = document.createElement("div");
document.body.appendChild(container);

// start the elm app in the container
// and keep a reference for communicating with the app
let fontfinder = Elm.Main.init({ node: container });

ipcRenderer.on(SYSTEM_FONTS_EVENTS, (event, args) => {
  fontfinder.ports.receiveFonts.send(args);
});

ipcRenderer.on(LOADING_FONT_PROGRESS, (event, args) => {
  fontfinder.ports.receiveProgress.send(args);
});

ipcRenderer.send("main-page-start");
