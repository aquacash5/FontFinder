import * as R from "ramda";
import { Elm } from "./Main.elm";
import "./styles/renderer.scss";

// Reference to the div where we will show our UI
const container = document.createElement("div");
document.body.appendChild(container);

// Style element to store font family
const fontFamiliesContainer = document.createElement("style");
document.head.appendChild(fontFamiliesContainer);

// Start the elm app in the container
// and keep a reference for communicating with the app
const fontfinder = Elm.Main.init({ node: container });

function formatType(path) {
  if (/\.ttf$/i.test(path)) {
    return "truetype";
  } else if (/\.otf$/i.test(path)) {
    return "opentype";
  } else if (/\.woff$/i.test(path)) {
    return "woff";
  } else if (/\.woff2$/i.test(path)) {
    return "woff2";
  }
}

ipc.subscribeElm((_, { port, args }) => {
  switch (port) {
    case "receiveFonts":
      let position = 0;
      const idleCallback = (deadline) => {
        const nodes = [];
        while (deadline.timeRemaining() > 5 && args.length > position) {
          const { name, path } = args[position];
          nodes.push(
            document.createTextNode(
              `@font-face {
                font-family: "${name}";
                src:
                  local("${name}"),
                  url("font-file://${encodeURIComponent(path)}")
                  format("${formatType(path)}");
              }`
            )
          );
          position += 1;
        }
        fontFamiliesContainer.append(...nodes);
        if (args.length > position) {
          window.requestIdleCallback(idleCallback, { timeout: 1000 });
        }
      };
      window.requestIdleCallback(idleCallback, { timeout: 1000 });
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
      ipc.send(k, args);
    });
  });

ipc.send("main-page-start");
