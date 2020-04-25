const electronInstaller = require("electron-winstaller");
const path = require("path");
const pjson = require("./package.json");

async function start() {
  try {
    await electronInstaller.createWindowsInstaller({
      appDirectory: path.join(__dirname, "dist", "win", "fontfinder-win32-x64"),
      outputDirectory: path.join(__dirname, "installers", "win"),
      title: pjson.productName,
      authors: "kylebloom.dev",
      name: pjson.name,
      description: pjson.description,
      exe: "fontfinder.exe",
      iconUrl: path.join(__dirname, "assets", "icons", "windows", "icon.ico"),
      setupIcon: path.join(
        __dirname,
        "assets",
        "icons",
        "windows",
        "installer-icon.ico"
      ),
      setupMsi: "FontFinder-installer.msi",
      setupExe: "FontFinder-installer.exe",
      loadingGif: path.join(__dirname, "src", "assets", "clear.gif"),
    });
    console.log("It worked!");
  } catch (e) {
    console.log(`No dice: ${e.message}`);
  }
}
start();
