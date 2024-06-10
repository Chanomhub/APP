const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  getFolders: () => ipcRenderer.invoke('get-folders'),
  openFolder: (folder) => ipcRenderer.invoke('open-folder', folder),
  getDownloads: () => ipcRenderer.invoke('get-downloads'),
  pauseDownload: (id) => ipcRenderer.invoke('pause-download', id),
  resumeDownload: (id) => ipcRenderer.invoke('resume-download', id),
  cancelDownload: (id) => ipcRenderer.invoke('cancel-download', id),
  onDownloadUpdate: (callback) => ipcRenderer.on('download-update', (event, downloads) => callback(downloads)),
  getDownloadPath: () => ipcRenderer.invoke('get-download-path'),
  setDownloadPath: (path) => ipcRenderer.invoke('set-download-path', path),
  
  // Auto-updater events
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback)
})

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})

