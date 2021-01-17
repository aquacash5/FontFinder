"use strict";

import { Elm } from "./Main.elm";
import { ipcRenderer } from "electron";
import * as R from "ramda";
import "./styles/renderer.scss";

// get a reference to the div where we will show our UI
const container = document.createElement("div");
document.body.appendChild(container);

// Style element to store font family
const fontFamiliesContainer = document.createElement("style");
document.head.appendChild(fontFamiliesContainer);

// start the elm app in the container
// and keep a reference for communicating with the app
const fontfinder = Elm.Main.init({ node: container });

ipcRenderer.on("ELM-EVENT", (event, { port, args }) => {
  switch (port) {
    case "receiveFonts":
      fontFamiliesContainer.append(
        ...R.map(
          ({ name, path }) =>
            document.createTextNode(`
              @font-face {
                font-family: "${name}";
                src: url("font-file://${path}");
              }`),
          args
        )
      );
      const families = R.map(R.prop("name"), args);
      fontfinder.ports["receiveFonts"].send(families);
      break;
    default:
      fontfinder.ports[port].send(args);
  }
});

Object.entries(fontfinder.ports)
  .filter(([_, v]) => v.hasOwnProperty("subscribe"))
  .forEach(([k, { subscribe }]) => {
    subscribe((args) => {
      ipcRenderer.send(k, args);
    });
  });

ipcRenderer.send("main-page-start");
