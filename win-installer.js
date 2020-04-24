const { MSICreator } = require("electron-wix-msi");
const path = require("path");
const pjson = require("./package.json");

async function start() {
  // Step 1: Instantiate the MSICreator
  const msiCreator = new MSICreator({
    appDirectory: path.join(__dirname, "dist", "win", "fontfinder-win32-x64"),
    description: pjson.description,
    exe: "fontfinder.exe",
    name: "Font Finder",
    manufacturer: "kylebloom.dev",
    version: pjson.version,
    outputDirectory: path.join(__dirname, "installers", "win"),
    ui: {
      enable: true,
      chooseDirectory: true,
      images: {
        background: path.join(
          __dirname,
          "assets",
          "icons",
          "windows",
          "installer-background.png"
        ),
        banner: path.join(
          __dirname,
          "assets",
          "icons",
          "windows",
          "installer-banner.png"
        ),
      },
    },
  });

  // Step 2: Create a .wxs template file
  await msiCreator.create();

  // Step 3: Compile the template to a .msi file
  await msiCreator.compile();
}
start();
