'use strict'

const electron = require('electron')
const app = electron.app
const globalShortcut = electron.globalShortcut
const os = require('os')
const path = require('path')
const config = require(path.join(__dirname, 'package.json'))
const model = require(path.join(__dirname, 'app', 'model.js'))
const BrowserWindow = electron.BrowserWindow
const ipcMain = electron.ipcMain

const { dialog } = require('electron')

/**
 * used for interprocess communication
 * a variable will be requested
 */
var mainProcessVars = {
  dbpath: "C:\example.db",
  anothervar: 33
}

app.setName(config.productName)
var mainWindow = null
app.on('ready', function () {
  mainWindow = new BrowserWindow({
    backgroundColor: 'lightgray',
    title: config.productName,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      defaultEncoding: 'UTF-8',
      enableRemoteModule: true
    }
  })

  mainWindow.loadURL(`file://${__dirname}/app/html/index.html`)

  // Enable keyboard shortcuts for Developer Tools on various platforms.
  let platform = os.platform()
  if (platform === 'darwin') {
    globalShortcut.register('Command+Option+I', () => {
      mainWindow.webContents.openDevTools()
    })
  } else if (platform === 'linux' || platform === 'win32') {
    globalShortcut.register('Control+Shift+I', () => {
      mainWindow.webContents.openDevTools()
    })
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.setMenu(null)
    mainWindow.show()
    console.log("Looking for the database in " + mainProcessVars["dbpath"])
    
    dialog.showOpenDialog(mainWindow, 
            { title:"Select a new database",
              properties:["openFile"],
              filters:
              [{name:"database",extension:['db']}]
            }
            )    
    .then(result => {
      console.log("Open database dialog result.canceled " + result.canceled)
      console.log("Open database dialog result.filepath " + result.filePaths)
      // fileNames is an array that contains all the selected
      if(result.filePaths === undefined){
          console.log("No file selected");
          return;
      }
      mainProcessVars["dbpath"] = result.filePaths[0]
      console.log("New path for the database is " + mainProcessVars["dbpath"])
      mainWindow.send("variable-reply", mainProcessVars["dbpath"]);
      
      });
  })

  mainWindow.onbeforeunload = (e) => {
    // Prevent Command-R from unloading the window contents.
    e.returnValue = false
  }

  mainWindow.on('closed', function () {
    mainWindow = null
  })

  /** passing variables to renderer process
   * https://stackoverflow.com/a/54359763
  */
  ipcMain.on('variable-request', function (event, arg) {
    event.sender.send('variable-reply', event, mainProcessVars[arg[0]]);
  });
})

app.on('window-all-closed', () => { app.quit() })
