import { app, BrowserWindow, Menu } from "electron";
import windowStateKeeper from "electron-window-state";
import { handleSquirrelEvent } from "./handleSquirrel";
import dotenv from "dotenv";
dotenv.config();

const onMac = /^darwin/.test(process.platform);
const onWindows = /^win/.test(process.platform);

function main() {
  // this should be placed at top of main.js to handle setup events quickly
  if (handleSquirrelEvent(__dirname)) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
  }

  let mainWindow; // saves a global reference to mainWindow so it doesn't get garbage collected

  app.on("ready", createWindow); // called when electron has initialized

  // This will create our app window, no surprise there
  function createWindow() {
    let mainWindowState = windowStateKeeper({
      defaultWidth: 1024,
      defaultHeight: 770,
      fullScreen: false,
    });

    mainWindow = new BrowserWindow({
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      fullscreenable: false,
      webPreferences: {
        nodeIntegration: true,
      },
    });

    mainWindowState.manage(mainWindow);

    const emptyMenu = Menu.buildFromTemplate([]);

    mainWindow.setMenu(emptyMenu);
    mainWindow.setMenu(null);

    // display the index.html file
    // mainWindow.loadFile("index.html");
    if (process.env.NODE_ENV === "development") {
      mainWindow.loadURL("http://localhost:8080/renderer.html");
    } else {
      mainWindow.loadURL(`file://${__dirname}/renderer.html`);
    }

    // open dev tools by default so we can see any console errors
    mainWindow.webContents.openDevTools();

    mainWindow.on("closed", function() {
      mainWindow = null;
    });
  }

  /* Mac Specific things */

  // when you close all the windows on a non-mac OS it quits the app
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  // if there is no mainWindow it creates one (like when you click the dock icon)
  app.on("activate", () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
}

main();
