import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  protocol,
  shell,
} from "electron";
import About from "electron-about";
import WindowStateKeeper from "electron-window-state";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import * as R from "ramda";
import SystemFonts from "system-font-families";
import Icon64 from "../assets/icons/png/64x64.png";
import axios from "axios";
import { serializeError } from "serialize-error";
import compareVersions from "compare-version";
import marked from "marked";

const DEFAULT_SAVE_NAME = "Untitled.ffs";

// saves a global reference to mainWindow so it doesn't get garbage collected
let mainWindow;
let updateWindow;

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

function centerChildInParent(parent, child) {
  const parentRect = parent.getBounds();
  const childRect = child.getBounds();
  const diffH = parentRect.height - childRect.height;
  const diffW = parentRect.width - childRect.width;
  const x = Math.floor(parentRect.x + diffH / 2);
  const y = Math.floor(parentRect.y + diffW / 2);
  child.setBounds({ x, y });
}

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
          mainWindow.webContents.send("ELM-EVENT", {
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
    mainWindow.webContents.send("ELM-EVENT", {
      port: "receiveFonts",
      args: R.pipe(
        R.filter(R.compose(R.identity, R.prop("name"))),
        R.filter(R.compose(R.not, R.startsWith("."), R.prop("name"))),
        R.uniqBy(R.prop("name"))
      )(Array.from(ttfInfoList)),
    });
  } catch (err) {
    console.error(err);
    mainWindow.webContents.send("ELM-EVENT", {
      port: "receiveFonts",
      args: [],
    });
  }
}

function calcTitle(filePath, modified) {
  const modifiedStr = modified ? "●" : "";
  const saveFile = path.basename(filePath);
  return `Font Finder | ${saveFile}${modifiedStr}`;
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
    mainWindow.webContents.send("ELM-EVENT", {
      port: "receiveSelected",
      args: curretSelection,
    });
    mainWindow.setTitle(calcTitle(savePath, unsavedModifications));
  }
}

async function saveFile() {
  if (savePath === DEFAULT_SAVE_NAME) {
    saveFileAs();
  } else {
    await fs.writeFile(savePath, JSON.stringify(curretSelection));
    unsavedModifications = false;
    mainWindow.setTitle(calcTitle(savePath, unsavedModifications));
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
    mainWindow.setTitle(calcTitle(savePath, unsavedModifications));
  }
}

async function checkForUpdate() {
  try {
    const response = await axios.get(
      "https://api.github.com/repos/aquacash5/FontFinder/releases",
      {
        params: {
          per_page: 5,
          page: 1,
        },
      }
    );
    const latest = R.pipe(
      R.filter(R.pathEq(["prerelease"], __BETA__)),
      R.head
    )(response.data);
    if (compareVersions(latest.tag_name, __VERSION__)) {
      const html = `
<html>
  <head>
    <title>Update Available!</title>
    <style>
      body { margin: 0px; }
      .container {
        height: 100vh;
        width: 100vw;
        margin: 0px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
      }
      h1, h2, h3, ul {
        margin: 5px;
      }
      a:link, a:visited {
        text-decoration: none;
        display: inline-block;
        font-weight: 400;
        color: white;
        text-align: center;
        vertical-align: middle;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        background-color: #17a2b8;
        border-color: #17a2b8;
        border: 1px solid transparent;
        padding: 0.375rem 0.75rem;
        font-size: 1rem;
        line-height: 1.5;
        border-radius: 0.25rem;

        transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
      }
      a:hover, a:active {
        background-color: #138496;
        border-color: #117a8b;
      }
    </style>
  </head>
  <body>
    <div class="container">
      ${marked(latest.body)}
      <a href="https://aquacash5.github.io/FontFinder${
        __BETA__ ? "/prerelease" : ""
      }">Download Now</a>
    </div>
  </body>
</html>`;
      updateWindow = new BrowserWindow({
        parent: mainWindow,
        modal: true,
        width: 300,
        height: 250,
        show: false,
        skipTaskbar: true,
        resizable: false,
      });
      updateWindow.setMenu(null);
      centerChildInParent(mainWindow, updateWindow);
      updateWindow.loadURL(
        "data:text/html;base64," + Buffer.from(html).toString("base64")
      );
      updateWindow.webContents.on("will-navigate", (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
      });
      if (!__PACKAGED__) {
        updateWindow.webContents.openDevTools({ mode: "detach" });
      }
      updateWindow.show();
    }
  } catch (err) {
    console.error(serializeError(err));
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
    title: calcTitle(savePath, unsavedModifications),
    devTools: __DEVELOPMENT__,
    webPreferences: {
      nodeIntegration: true,
      nativeWindowOpen: __DEVELOPMENT__,
      contextIsolation: false,
    },
  });

  mainWindowState.manage(mainWindow);

  const mainMenu = Menu.buildFromTemplate([
    ...(__MACOS__
      ? [
          {
            label: "FontFinder",
            submenu: [
              About.makeMenuItem("FontFinder", {
                icon: Icon64,
                appName: "FontFinder",
                version: "Version " + __VERSION__,
                copyright: "© 2020-2021 Kyle Bloom All Rights Reserved",
              }),
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideothers" },
              { role: "unhide" },
              { type: "separator" },
              { role: "quit" },
            ],
          },
        ]
      : []),
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
    ...(__MACOS__
      ? []
      : [
          {
            label: "Help",
            submenu: [
              About.makeMenuItem("FontFinder", {
                icon: Icon64,
                appName: "FontFinder",
                version: "Version " + __VERSION__,
                copyright: "© 2020-2021 Kyle Bloom All Rights Reserved",
              }),
            ],
          },
        ]),
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
    mainWindow.setTitle(calcTitle(savePath, unsavedModifications));
  });
  checkForUpdate();
}

main();
