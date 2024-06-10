const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const { exec } = require('child_process')
const { autoUpdater } = require('electron-updater')
const log = require('electron-log')

autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'

let downloadPath = app.getPath('downloads')
let downloads = []

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false
    }
  })

  win.loadURL('https://chanomhub.xyz/')

  const menu = Menu.buildFromTemplate([
    {
      label: 'Menu',
      submenu: [
        { label: 'Downloads', click: () => { win.loadFile('downloads.html') } },
        { label: 'Profile', click: () => { win.loadURL('https://chanomhub.xyz/setting/') } },
        { label: 'Home', click: () => { win.loadURL('https://chanomhub.xyz/') } },
        { label: 'All Game', click: () => { win.loadFile('all-game.html') } },
        { label: 'Setting', click: () => { win.loadFile('setting.html') } }
      ]
    }
  ])

  Menu.setApplicationMenu(menu)

  ipcMain.handle('get-folders', () => {
    return fs.readdirSync(downloadPath).filter(file => fs.statSync(path.join(downloadPath, file)).isDirectory())
  })

  ipcMain.handle('open-folder', (event, folder) => {
    const folderPath = path.join(downloadPath, folder)
    if (fs.existsSync(folderPath)) {
      exec(`"${folderPath}"`, (error) => {
        if (error) {
          console.error(`Error opening folder: ${error}`)
        }
      })
    }
  })

  ipcMain.handle('get-downloads', () => {
    return downloads.map(download => ({
      id: download.id,
      name: download.name,
      progress: download.progress
    }))
  })

  ipcMain.handle('pause-download', (event, id) => {
    const download = downloads.find(d => d.id === id)
    if (download) {
      download.item.pause()
    }
  })

  ipcMain.handle('resume-download', (event, id) => {
    const download = downloads.find(d => d.id === id)
    if (download) {
      download.item.resume()
    }
  })

  ipcMain.handle('cancel-download', (event, id) => {
    const download = downloads.find(d => d.id === id)
    if (download) {
      download.item.cancel()
    }
  })

  ipcMain.handle('get-download-path', () => {
    return downloadPath
  })

  ipcMain.handle('set-download-path', (event, newPath) => {
    downloadPath = newPath
  })

  ipcMain.on('install-update', () => {
    autoUpdater.quitAndInstall()
  })

  win.webContents.session.on('will-download', (event, item) => {
    item.setSavePath(path.join(downloadPath, item.getFilename()))

    const download = {
      id: item.getURL(),
      name: item.getFilename(),
      item,
      progress: 0
    }
    downloads.push(download)

    item.on('done', (event, state) => {
      if (state === 'completed') {
        console.log('Download successfully')
      } else {
        console.log(`Download failed: ${state}`)
      }
      downloads = downloads.filter(d => d.id !== item.getURL())
      win.webContents.send('download-update', downloads.map(download => ({
        id: download.id,
        name: download.name,
        progress: download.progress
      })))
    })

    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        console.log('Download is paused')
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          console.log('Download is paused')
        } else {
          console.log(`Received bytes: ${item.getReceivedBytes()}`)
          const progress = Math.round((item.getReceivedBytes() / item.getTotalBytes()) * 100)
          download.progress = progress
          win.webContents.send('download-update', downloads.map(download => ({
            id: download.id,
            name: download.name,
            progress: download.progress
          })))
        }
      }
    })

    win.webContents.send('download-update', downloads.map(download => ({
      id: download.id,
      name: download.name,
      progress: download.progress
    })))
  })
}

app.whenReady().then(() => {
  createWindow()

  autoUpdater.checkForUpdatesAndNotify()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

autoUpdater.on('update-available', () => {
  BrowserWindow.getAllWindows().forEach(win => win.webContents.send('update-available'))
})

autoUpdater.on('update-downloaded', () => {
  BrowserWindow.getAllWindows().forEach(win => win.webContents.send('update-downloaded'))
})

