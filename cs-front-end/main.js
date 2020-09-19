const {
  app,
  BrowserWindow
} = require('electron')
const url = require("url");
const path = require("path");
require('update-electron-app')()

let mainWindow
let splash

function createLoadingScreen() {
  splash = new BrowserWindow({
    width: 600,
    height: 300,
    transparent: true,
    frame: false,
    alwaysOnTop: true
  });
  splash.setResizable(false)
  const splashPath = path.join(__dirname, `./dist/splash.html`)
  splash.loadURL(
    url.format({
      pathname: splashPath,
      protocol: "file:",
      slashes: true,
    })
  );

  splash.on('closed', () => splash = null)
}

function createMain() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 960,
  })
 
  mainWindow.maximize()
  mainWindow.hide()


  // process.env['APP_PATH'] = app.getAppPath();
  // const rootPath = process.cwd().concat('/resources/app/src/index.html');
  // const rootPath = path.join(__dirname, `../build/dist/cs-front-end/index.html`)
  const rootPath = path.join(__dirname, `./dist/index.html`)
  console.log(rootPath)
  mainWindow.loadURL(
    url.format({
      pathname: rootPath,
      protocol: "file:",
      slashes: true
    })
  );

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  // mainWindow.once('did-finish-load', () => {
  //   console.log("MAIN LOADED!!!")
  //   /// then close the loading screen window and show the main window
  //   if (splash) {
  //     splash.close();
  //   }
  //   mainWindow.show();
  // });

  mainWindow.webContents.once('dom-ready', () => {
    if (splash)
      setTimeout(()=>{
        mainWindow.show()
        splash.close();
      }, 1000)
      

    // mainWindow.show();
  });

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', function () {
  createLoadingScreen()
  createMain()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})
