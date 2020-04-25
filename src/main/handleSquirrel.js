import { app, BrowserWindow, Menu, shell, ipcMain } from "electron";
import ChildProcess from "child_process";
import path from "path";
import pjson from "../../package.json";

const minimumTimeout = 5000;
let windowStart = new Date().getTime();

const shortcutPath = path.join(
  process.env.APPDATA,
  "Microsoft/Windows/Start Menu/Programs/",
  `${pjson.productName}.lnk`
);

function createInstallWindow(arg) {
  return () => {
    let tempWindow = new BrowserWindow({
      width: 300,
      height: 400,
      frame: false,
      transparent: true,
    });
    const emptyMenu = Menu.buildFromTemplate([]);

    tempWindow.setMenu(emptyMenu);
    tempWindow.setMenu(null);
    tempWindow.loadURL(`file://${__dirname}/installer.html#${arg}`);

    tempWindow.on("closed", () => app.quit());

    windowStart = new Date().getTime();
  };
}

function quitApp() {
  setTimeout(app.quit, minimumTimeout - (new Date().getTime() - windowStart));
}

export const handleSquirrelEvent = () => {
  if (process.argv.length === 1) {
    return false;
  }
  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case "--squirrel-install":
      app.on("ready", createInstallWindow("installing"));
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts

      shell.writeShortcutLink(shortcutPath, { target: process.execPath });

      quitApp();
      return true;

    case "--squirrel-updated":
      app.on("ready", createInstallWindow("updating"));
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts

      quitApp();
      return true;

    case "--squirrel-uninstall":
      app.on("ready", createInstallWindow("uninstalling"));
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      shell.moveItemToTrash(shortcutPath, true);

      quitApp();
      return true;

    case "--squirrel-obsolete":
      app.on("ready", createInstallWindow("updating"));
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit();
      return true;

    case "--squirrel-firstrun":
      app.quit();
      return true;
  }
};
