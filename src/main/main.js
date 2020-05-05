import { app, BrowserWindow, Menu, ipcMain } from "electron";
import windowStateKeeper from "electron-window-state";
import SystemFonts from "system-font-families";
import { handleSquirrelEvent } from "./handleSquirrel";
import ttfinfo from "ttfinfo";
import path from "path";
import os from "os";
import dotenv from "dotenv";
dotenv.config();

const onMac = /^darwin/.test(process.platform);
const onWindows = /^win/.test(process.platform);

Array.prototype.unique = function() {
  return Array.from(new Set(this));
};

function getSystemInfo(e) {
  if (onWindows) {
    if (e.microsoft) {
      return e.microsoft;
    } else if (e.unicode) {
      return e.unicode;
    } else {
      return e.macintosh;
    }
  } else if (onMac) {
    if (e.macintosh) {
      return e.macintosh;
    } else if (e.unicode) {
      return e.unicode;
    } else {
      return e.microsoft;
    }
  } else {
    if (e.unicode) {
      return e.unicode;
    } else if (e.microsoft) {
      return e.microsoft;
    } else {
      return e.macintosh;
    }
  }
}

const systemFonts = new Promise((resolve) => {
  resolve(
    new SystemFonts({
      customDirs: [
        path.join(
          os.homedir(),
          "AppData",
          "Local",
          "Microsoft",
          "Windows",
          "Fonts"
        ),
      ],
    })
      .getFontsExtendedSync()
      .map((e) => Object.values(e.files))
      .flat()
      .unique()
      .map(ttfinfo.getSync)
      .map((e) => e.tables.name)
      .map(getSystemInfo)
      .map((e) => e.family)
      .unique()
  );
});

function main() {
  // this should be placed at top of main.js to handle setup events quickly
  if (handleSquirrelEvent(__dirname)) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
  }

  let mainWindow; // saves a global reference to mainWindow so it doesn't get garbage collected

  app.on("ready", createWindow); // called when electron has initialized

  ipcMain.on("main-page-start", async (event) => {
    event.reply("system-fonts", await systemFonts);
  });

  // This will create our app window, no surprise there
  function createWindow() {
    let mainWindowState = windowStateKeeper({
      defaultWidth: 1024,
      defaultHeight: 700,
      fullScreen: false,
    });

    mainWindow = new BrowserWindow({
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      minWidth: 900,
      minHeight: 600,
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
      // open dev tools by default so we can see any console errors
      mainWindow.webContents.openDevTools();
    } else {
      mainWindow.loadURL(`file://${__dirname}/renderer.html`);
    }

    mainWindow.on("closed", function() {
      mainWindow = null;
    });
  }

  /* Mac Specific things */

  // when you close all the windows on a non-mac OS it quits the app
  app.on("window-all-closed", () => {
    if (!onMac) {
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
