import { app, BrowserWindow, Menu, ipcMain, dialog, protocol } from "electron";
import WindowStateKeeper from "electron-window-state";
import SystemFonts from "system-font-families";
import path from "path";
import os from "os";
import { promises as fs } from "fs";
import * as R from "ramda";

const DEFAULT_SAVE_NAME = "Untitled.ffs";

// saves a global reference to mainWindow so it doesn't get garbage collected
let mainWindow;
let mainEvent;

let curretSelection = [];
let unsavedModifications = false;
let savePath = DEFAULT_SAVE_NAME;

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

async function systemFonts() {
  try {
    const sysFonts = await Fonts.getFontsExtended();
    const ttfInfoList = [];
    let count = 0;
    let last = -Infinity;
    for (const temp of sysFonts) {
      const { files, postscriptNames, subFamilies } = temp;
      try {
        count += 1;
        const percent = Math.floor((count * 100) / sysFonts.length);
        if (last !== percent) {
          last = percent;
          mainEvent.reply("ELM-EVENT", {
            port: "receiveProgress",
            args: percent,
          });
        }
        for (const subFamily of subFamilies) {
          ttfInfoList.push({
            path: files[subFamily],
            name: postscriptNames[subFamily],
          });
        }
      } catch {}
    }
    mainEvent.reply("ELM-EVENT", {
      port: "receiveFonts",
      args: R.pipe(
        R.filter(R.compose(R.identity, R.prop("name"))),
        R.filter(R.compose(R.not, R.startsWith("."), R.prop("name"))),
        R.uniqBy(R.prop("name"))
      )(Array.from(ttfInfoList)),
    });
  } catch (err) {
    console.error(err);
    mainEvent.reply("ELM-EVENT", { port: "receiveFonts", args: [] });
  }
}

function calcTitle() {
  const modified = unsavedModifications ? "●" : "";
  const saveFile = path.basename(savePath);
  return `Font Finder | ${saveFile}${modified}`;
}

async function openFile() {
  const autoPath =
    savePath === DEFAULT_SAVE_NAME
      ? app.getPath("documents")
      : path.dirname(savePath);
  const result = await dialog.showOpenDialog(mainWindow, {
    defaultPath: autoPath,
    title: "Open Font Selections",
    properties: ["openFile"],
    filters: [
      { name: "FontFinder Selections", extensions: ["ffs"] },
      { name: "All Files", extensions: ["*"] },
    ],
  });
  if (!result.canceled) {
    savePath = result.filePaths[0];
    const selectedResults = await fs.readFile(savePath);
    curretSelection = JSON.parse(selectedResults.toString());
    unsavedModifications = false;
    mainEvent.reply("ELM-EVENT", {
      port: "receiveSelected",
      args: curretSelection,
    });
    mainWindow.setTitle(calcTitle());
  }
}

async function saveFile() {
  if (savePath === DEFAULT_SAVE_NAME) {
    saveFileAs();
  } else {
    await fs.writeFile(savePath, JSON.stringify(curretSelection));
    unsavedModifications = false;
    mainWindow.setTitle(calcTitle());
  }
}

async function saveFileAs() {
  const autoPath =
    savePath === DEFAULT_SAVE_NAME
      ? app.getPath("documents")
      : path.dirname(savePath);
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: autoPath,
    title: "Save Font Selections",
    filters: [
      { name: "FontFinder Selections", extensions: ["ffs"] },
      { name: "All Files", extensions: ["*"] },
    ],
    properties: ["createDirectory", "showOverwriteConfirmation"],
  });
  if (!result.canceled) {
    savePath = result.filePath;
    await fs.writeFile(savePath, JSON.stringify(curretSelection));
    unsavedModifications = false;
    mainWindow.setTitle(calcTitle());
  }
}

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
    title: calcTitle(),
    devTools: __DEVELOPMENT__,
    webPreferences: {
      nodeIntegration: true,
      nativeWindowOpen: __DEVELOPMENT__,
    },
  });

  mainWindowState.manage(mainWindow);

  const mainMenu = Menu.buildFromTemplate([
    ...(__MACOS__ ? [{ role: "appMenu" }] : []),
    {
      label: "File",
      submenu: [
        {
          label: "Open File...",
          click: async () => openFile(),
          accelerator: "CommandOrControl+O",
        },
        { type: "separator" },
        {
          label: "Save File...",
          click: async () => saveFile(),
          accelerator: "CommandOrControl+S",
        },
        {
          label: "Save File As...",
          click: () => saveFileAs(),
          accelerator: "CommandOrControl+Shift+S",
        },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        ...(__MACOS__
          ? [
              { role: "pasteAndMatchStyle" },
              { role: "delete" },
              { role: "selectAll" },
              { type: "separator" },
              {
                label: "Speech",
                submenu: [{ role: "startSpeaking" }, { role: "stopSpeaking" }],
              },
            ]
          : [{ role: "delete" }, { type: "separator" }, { role: "selectAll" }]),
      ],
    },
  ]);

  Menu.setApplicationMenu(mainMenu);

  // display the index.html file
  // mainWindow.loadFile("index.html");
  if (__PACKAGED__) {
    mainWindow.loadURL(`file://${__dirname}/renderer.html`);
  } else {
    mainWindow.loadURL("http://localhost:9000/renderer.html");
    // open dev tools by default so we can see any console errors
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

function main() {
  app.on("ready", async () => {
    // Name the protocol whatever you want
    const protocolName = "font-file";

    protocol.registerFileProtocol(protocolName, (request, callback) => {
      const url = request.url.replace(`${protocolName}://`, "");
      try {
        return callback(decodeURIComponent(url));
      } catch (error) {
        // Handle the error as needed
        console.error(error);
      }
    });
    createWindow();
  }); // called when electron has initialized

  // when you close all the windows on a non-mac OS it quits the app
  app.on("window-all-closed", () => app.quit());

  // if there is no mainWindow it creates one
  app.on("activate", () => {
    if (mainWindow === null) {
      createWindow();
    }
  });

  ipcMain.on("main-page-start", (event) => {
    mainEvent = event;
    systemFonts();
  });

  ipcMain.on("saveSelected", (event, args) => {
    curretSelection = args;
    if (R.isEmpty(curretSelection)) {
      unsavedModifications = false;
      savePath = DEFAULT_SAVE_NAME;
    } else {
      unsavedModifications = true;
    }
    mainWindow.setTitle(calcTitle());
  });
}

main();
