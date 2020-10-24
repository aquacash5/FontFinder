import { app, BrowserWindow, Menu, ipcMain } from "electron";
import windowStateKeeper from "electron-window-state";
import getSystemFonts from "get-system-fonts";
import { load } from "opentype.js";
import { handleSquirrelEvent } from "./handleSquirrel";
import { isDev, onMac, onWindows } from "./utils";

Array.prototype.unique = function () {
  return Array.from(new Set(this));
};

async function loadFont(url) {
  return await new Promise((resolve, reject) =>
    load(url, (err, font) => (err ? reject(err) : resolve(font)))
  );
}

async function systemFonts() {
  try {
    const fontsOnComputer = await getSystemFonts({
      extensions: ["ttf", "otf"],
    });

    const fonts = await Promise.all(fontsOnComputer.map(loadFont));
    return fonts.map((f) => f.tables.name.fontFamily.en).unique();
  } catch (err) {}
  return [];
}

function main() {
  // this should be placed at top of main.js to handle setup events quickly
  if (onWindows && handleSquirrelEvent(__dirname)) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
  }

  let mainWindow; // saves a global reference to mainWindow so it doesn't get garbage collected

  app.on("ready", createWindow); // called when electron has initialized

  ipcMain.on("main-page-start", async (event) => {
    event.reply("system-fonts", await systemFonts());
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
      openDevTools: isDev,
      webPreferences: {
        nodeIntegration: true,
        nativeWindowOpen: isDev,
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

    mainWindow.on("closed", function () {
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
