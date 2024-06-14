"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// /mnt/data/preload.ts
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electron', {
    getFolders: () => electron_1.ipcRenderer.invoke('get-folders'),
    openFolder: (folder) => electron_1.ipcRenderer.invoke('open-folder', folder),
    getDownloads: () => electron_1.ipcRenderer.invoke('get-downloads'),
    pauseDownload: (id) => electron_1.ipcRenderer.invoke('pause-download', id),
    resumeDownload: (id) => electron_1.ipcRenderer.invoke('resume-download', id),
    cancelDownload: (id) => electron_1.ipcRenderer.invoke('cancel-download', id),
    onDownloadUpdate: (callback) => { electron_1.ipcRenderer.on('download-update', (event, downloads) => callback(downloads)); },
    getDownloadPath: () => electron_1.ipcRenderer.invoke('get-download-path'),
    setDownloadPath: (path) => electron_1.ipcRenderer.invoke('set-download-path', path),
    // Auto-updater events
    onUpdateAvailable: (callback) => { electron_1.ipcRenderer.on('update-available', callback); },
    onUpdateDownloaded: (callback) => { electron_1.ipcRenderer.on('update-downloaded', callback); }
});
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector);
        if (element)
            element.innerText = text;
    };
    for (const type of ['chrome', 'node', 'electron']) {
        const version = process.versions[type];
        if (version) {
            replaceText(`${type}-version`, version);
        }
    }
});
