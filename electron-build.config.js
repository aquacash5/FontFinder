const dotenv = require("dotenv");
const pjson = require("./package.json");

const isDevelopment = (process.env.NODE_ENV ?? "production") === "development";

if (isDevelopment) {
  dotenv.config();
}

module.exports = {
  appId: pjson.name,
  productName: pjson.productName,
  afterAllArtifactBuild: "./afterAllArtifactBuild.js",
  directories: {
    buildResources: "build",
    output: "dist",
  },
  files: ["build/**/*", "!node_modules"],
  mac: {
    target: [
      {
        target: "dmg",
        arch: "x64",
      },
      {
        target: "dmg",
        arch: "arm64",
      },
    ],
    icon: "src/assets/icons/mac/icon.icns",
    category: "public.app-category.graphics-design",
  },
  win: {
    target: [
      {
        target: "nsis",
        arch: "x64",
      },
      {
        target: "msi",
        arch: "x64",
      },
    ],
    icon: "src/assets/icons/win/icon.ico",
  },
  nsis: {
    allowElevation: true,
    allowToChangeInstallationDirectory: true,
    differentialPackage: false,
    installerIcon: "src/assets/icons/win/icon.ico",
    oneClick: false,
    perMachine: false,
  },
  linux: {
    target: [
      {
        target: "deb",
        arch: "x64",
      },
      {
        target: "rpm",
        arch: "x64",
      },
    ],
    icon: "src/assets/icons/png",
  },
  dmg: {
    gatekeeperAccess: false,
    hardenedRuntime: true,
    writeUpdateInfo: false,
  },
};
