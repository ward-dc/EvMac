// Modules to control application life and create native browser window
const { app, BrowserWindow, screen, clipboard } = require("electron");
const shortcut = require("electron-localshortcut");
const path = require("path");
const prompt = require("electron-prompt");
var mainWindow;

function Init() {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  mainWindow.setFullScreen(true);
  mainWindow.removeMenu();
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

  shortcut.register(mainWindow, "F2", () => {
    LinkBox();
    //check paste for joining private game
    let clipboardText = clipboard.readText();
    if (clipboardText.indexOf("ev.io/?game=") === -1) {
      clipboardText = "https://ev.io/";
    }
    ispasted(clipboardText);
  });

  shortcut.register(mainWindow, "F1", () => {
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
    mainWindow.setTitle(`evClient V${app.getVersion()}`);
    event.preventDefault();
  });
  shortcut.register(mainWindow, "Alt+F4", () => {
    app.quit();
  });
  shortcut.register(initWin, "F11", () => {
    initWin.setSimpleFullScreen(!initWin.isSimpleFullScreen());
  });
}

function createNewWindow(url, mainWindow) {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  var win = new BrowserWindow({
    width: width * 0.8,
    height: height * 0.8,
    show: false,
    parent: mainWindow,
  });
  mainWindow.removeMenu();
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
      mainWindow.webContents.reload();
    }
  });
}

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  var win = new BrowserWindow({
    width: width * 0.8,
    height: height * 0.8,
    show: false,
  });
  win.on("ready-to-show", () => {
    setTimeout(() => {
      win.show();
    }, 500);
  });
  win.removeMenu();
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
      mainWindow.webContents.reload();
    }
  });
}
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

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
