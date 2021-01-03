import { app, BrowserWindow, Menu, ipcMain } from "electron";
import WindowStateKeeper from "electron-window-state";
import SystemFonts from "system-font-families";
import TtfInfo from "ttfinfo";
import path from "path";
import os from "os";
import * as R from "ramda";
import { handleSquirrelEvent } from "./handleSquirrel";

const Fonts = new SystemFonts({
  customDirs: __WINDOWS__
    ? [
        path.join(
          os.homedir(),
          "AppData",
          "Local",
          "Microsoft",
          "Windows",
          "Fonts"
        ),
      ]
    : [],
});

Array.prototype.unique = function () {
  return Array.from(new Set(this));
};

function getSystemInfo(e) {
  if (__WINDOWS__) {
    if (!R.isEmpty(e.microsoft)) {
      return e.microsoft;
    } else if (!R.isEmpty(e.unicode)) {
      return e.unicode;
    } else {
      return e.macintosh;
    }
  } else if (__MACOS__) {
    if (!R.isEmpty(e.macintosh)) {
      return e.macintosh;
    } else if (!R.isEmpty(e.unicode)) {
      return e.unicode;
    } else {
      return e.microsoft;
    }
  } else {
    if (!R.isEmpty(e.unicode)) {
      return e.unicode;
    } else if (!R.isEmpty(e.microsoft)) {
      return e.microsoft;
    } else {
      return e.macintosh;
    }
  }
}

function getTtfInfo(pathOrData) {
  return new Promise((resolve, reject) => {
    TtfInfo.get(pathOrData, (err, data) => {
      err ? reject(err) : resolve(data);
    });
  });
}

const getUniqueFonts = R.pipe(
  R.map(R.prop("files")),
  R.map(R.values),
  R.flatten,
  R.uniq
);

async function systemFonts(event) {
  try {
    const sysFonts = await Fonts.getFontsExtended();
    const uniqueFontPaths = getUniqueFonts(sysFonts);
    const ttfInfoList = new Set();
    let count = 0;
    let last = -Infinity;
    for (const fontPath of uniqueFontPaths) {
      try {
        count += 1;
        const percent = Math.floor((count * 100) / uniqueFontPaths.length);
        if (last !== percent) {
          last = percent;
          event.reply("ELM-EVENT", { port: "receiveProgress", args: percent });
        }
        ttfInfoList.add(
          getSystemInfo((await getTtfInfo(fontPath)).tables.name).family
        );
      } catch {}
    }
    event.reply("ELM-EVENT", {
      port: "receiveFonts",
      args: Array.from(ttfInfoList),
    });
  } catch (err) {
    console.error(err);
    event.reply("ELM-EVENT", { port: "receiveFonts", args: [] });
  }
}

function main() {
  // this should be placed at top of main.js to handle setup events quickly
  if (__WINDOWS__ && handleSquirrelEvent(__dirname)) {
    // squirrel event handled and app will exit in 1000ms,
    // so don't do anything else
    return;
  }

  // saves a global reference to mainWindow so it doesn't get garbage collected
  let mainWindow;

  app.on("ready", createWindow); // called when electron has initialized

  ipcMain.on("main-page-start", async (event) => {
    systemFonts(event);
  });

  // This will create our app window, no surprise there
  function createWindow() {
    let mainWindowState = WindowStateKeeper({
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
      devTools: __DEVELOPMENT__,
      webPreferences: {
        nodeIntegration: true,
        nativeWindowOpen: __DEVELOPMENT__,
      },
    });

    mainWindowState.manage(mainWindow);

    const emptyMenu = Menu.buildFromTemplate([]);

    mainWindow.setMenu(emptyMenu);
    mainWindow.setMenu(null);

    // display the index.html file
    // mainWindow.loadFile("index.html");
    if (__DEVELOPMENT__) {
      mainWindow.loadURL("http://localhost:8080/renderer.html");
      // open dev tools by default so we can see any console errors
      mainWindow.webContents.openDevTools({ mode: "detach" });
    } else {
      mainWindow.loadURL(`file://${__dirname}/renderer.html`);
    }

    mainWindow.on("closed", function () {
      mainWindow = null;
    });
  }

  /* Mac Specific things */

  // when you close all the windows on a non-mac OS it quits the app
  app.on("window-all-closed", () => {
    if (!__MACOS__) {
      app.quit();
    }
  });

  // if there is no mainWindow it creates one
  app.on("activate", () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
}

main();
