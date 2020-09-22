const { app, BrowserWindow, dialog  } = require('electron')
const url = require("url");
const path = require("path");
const { autoUpdater } = require('electron-updater')
const isDev = require('electron-is-dev')

autoUpdater.logger = require('electron-log')
autoUpdater.logger.transports.file.level = 'info'

autoUpdater.on('checking-for-update', ()=>{
  console.log('Checking for updates...')
})

autoUpdater.on('update-available', (info)=>{
  console.log('Update Available!')
  console.log('Version', info.version)
  console.log('Release Date', info.releaseDate)
})

autoUpdater.on('update-not-available', ()=>{
  console.log('Nothing to see here')
})

autoUpdater.on('download-progress', (progress)=>{
  console.log(`Progress ${Math.floor(progress.percent)}`)
})

autoUpdater.on('update-downloaded', (info)=>{
  console.log('Update Downloaded');
  console.log(info)
  const dialogOpts = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: info.releaseNotes ? info.releaseNotes: info.releaseName,
    detail: 'A new version has been downloaded. Restart the application to apply the updates.'
  }

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall()
  })
})

autoUpdater.on('error', (error)=>{
  console.log(error)
})



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
        mainWindow.maximize()
        mainWindow.show()
        splash.close();
      }, 5000)
  });

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', function () {
  if (!isDev) {
    autoUpdater.checkForUpdates()
    setInterval(() => {
      autoUpdater.checkForUpdates()
    }, 60000)
  }
  createLoadingScreen()
  createMain()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})
