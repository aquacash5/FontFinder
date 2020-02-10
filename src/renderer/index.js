"use strict";

import { Elm } from "./Main.elm";
import SystemFonts from "system-font-families";
import "./scss/renderer.scss";

const systemFonts = new SystemFonts();

// get a reference to the div where we will show our UI
let container = document.createElement("div");
document.body.appendChild(container);

// start the elm app in the container
// and keep a reference for communicating with the app
let fontfinder = Elm.Main.init({ node: container });

systemFonts.getFonts().then(
  fonts => {
    fontfinder.ports.receiveFonts.send(fonts);
  },
  err => {
    fontfinder.ports.receiveFonts.send([]);
  } // handle the error
);
