// Modules to control application life and create native browser window
const { app, BrowserWindow, screen, clipboard, dialog } = require("electron");
const shortcut = require("electron-localshortcut");
const path = require("path");
const prompt = require("electron-prompt");
var mainWindow;
let fromlogin =false;

function Init() {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    removeMenu: true,
  });
  mainWindow.on("close", () => {
    mainWindow = null;
    if(!fromlogin){
      app.quit();
    }
  });
  mainWindow.setFullScreen(true);
  mainWindow.loadURL("https://ev.io/");
  mainWindow.webContents.on("did-finish-load", (event) => {
    if (mainWindow.webContents.getURL() == "https://ev.io/user/login") {
      mainWindow.loadURL("https://ev.io/");
      createNewWindow("https://ev.io/user/login", mainWindow);
    }
  });
  function LinkBox() {
    function input() {
      var myPrompt = prompt({
        title: "Join a Private game",
        label: "Please enter your Invite link here",
        value: paste,
        inputAttrs: {
          type: "url",
        },
        type: "input",
      });
      return myPrompt;
    }
  }

  function ispasted(url) {
    mainWindow.loadURL(url);
  }
  let shortcut1 = "F1";
  let shortcut2 = "F2";
  if (process.platform === "darwin"){
    shortcut1="à"
    shortcut2 = "ç";
  }
  shortcut.register(mainWindow, shortcut2, () => {
    LinkBox();
    //check paste for joining private game
    let clipboardText = clipboard.readText();
    if (clipboardText.indexOf("ev.io/?game=") === -1) {
      clipboardText = "https://ev.io/";
    }
    ispasted(clipboardText);
  });

  shortcut.register(mainWindow, shortcut1, () => {
    mainWindow.loadURL("https://ev.io/");
  });

  shortcut.register("ESC", () => {
    mainWindow.webContents.executeJavaScript(`
                document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
                document.exitPointerLock();
  `);
  });
  mainWindow.webContents.on("will-prevent-unload", (event) =>
    event.preventDefault()
  );
  mainWindow.webContents.on("dom-ready", (event) => {
    mainWindow.setTitle(`EvClient V${app.getVersion()}`);
    event.preventDefault();
  });
  shortcut.register(mainWindow, "Alt+F4", () => {
    app.quit();
  });
  shortcut.register(mainWindow, "F11", () => {
    mainWindow.setSimpleFullScreen(!mainWindow.isSimpleFullScreen());
  });
}

function createNewWindow(url, mainWindow) {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  var win = new BrowserWindow({
    width: width *0.8,
    height: height *0.8,
    show: false,
    parent: mainWindow,
    removeMenu: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  win.setSimpleFullScreen(false);
  win.loadURL(url);
  win.webContents.on("dom-ready", (event) => {
    event.preventDefault();
  });
  win.webContents.on("will-prevent-unload", (event) => event.preventDefault());
  shortcut.register(win, "Alt+F4", () => {
    app.quit();
  });
  win.on("ready-to-show", () => {
    setTimeout(() => {
      if (!win.isDestroyed()) {
        win.show();
      }
    }, 500);
  });
  win.webContents.on("did-finish-load", (event) => {
    if (win.webContents.getURL() == "https://ev.io/") {
      win.close();
      setTimeout(() => {
        fromlogin = true;
        mainWindow.close();
        Init()
        fromlogin=false;
      }, 500);
    }
  });
}

const { autoUpdater } = require("electron-updater");
console.log("autoUpdater entered");
autoUpdater.logger = require("electron-log");
autoUpdater.logger.transports.file.level = "info";
autoUpdater.checkForUpdates();
autoUpdater.on("checking-for-update", () => {
  console.log("Checking for updates...");
});
autoUpdater.on("update-available", (info) => {
  const dialogOpts = {
    type: "info",
    buttons: ["Alright!"],
    title: "EvClient Update",
    message: "New Version of EvClient has been released",
    detail:
      "It will be downloaded in the background and notify you when the download is finished.",
  };

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) console.log("Version message seen");
  });
});
autoUpdater.on("update-not-available", () => {
  console.log("Version is up-to-date");
});
autoUpdater.on("download-progress", (progressObj) => {
  console.log(
    `Download Speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.transferred} + '/ ${progressObj.total}`
  );
});
autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: "info",
    buttons: ["Restart", "Later"],
    title: "Application Update",
    message: process.platform === "win32" ? releaseNotes : releaseName,
    detail:
      "A new version has been downloaded. Restart the application to apply the updates.",
  };

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall();
  });
});
autoUpdater.on("error", (error) => {
  console.log(error);
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  Init();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) Init();
  });
});
app.on("browser-window-created", function (e, window) {
  window.setMenu(null);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
