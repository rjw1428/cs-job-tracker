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
  const splashPath = path.join(__dirname, `./dist/assets/splash.html`)
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
    // transparent: true,
    maximizable : true,
  })
 
  mainWindow.hide()


  const rootPath = path.join(__dirname, `./dist/index.html`)
  console.log(rootPath)
  mainWindow.loadURL(
    url.format({
      pathname: rootPath,
      protocol: "file:",
      slashes: true
    })
  );

  mainWindow.webContents.once('dom-ready', () => {
    if (splash)
      setTimeout(()=>{
        mainWindow.show()
        splash.close();
      }, 5000)
      
    // mainWindow.maximize()
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
