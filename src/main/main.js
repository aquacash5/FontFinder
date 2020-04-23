"use strict";
import { app, BrowserWindow } from "electron";

var onMac = /^darwin/.test(process.platform);
var onWindows = /^win/.test(process.platform);

let mainWindow; // saves a global reference to mainWindow so it doesn't get garbage collected

app.on("ready", createWindow); // called when electron has initialized

// This will create our app window, no surprise there
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // display the index.html file
  // mainWindow.loadFile("index.html");
  if (process.env.NODE_ENV === "production") {
    mainWindow.loadURL(`file://${__dirname}/index.html`);
  } else {
    mainWindow.loadURL(`http://localhost:8080/`);
  }

  // open dev tools by default so we can see any console errors
  // mainWindow.webContents.openDevTools();

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