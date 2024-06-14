"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// /mnt/data/main.ts
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const electron_updater_1 = require("electron-updater");
const electron_log_1 = __importDefault(require("electron-log"));
electron_updater_1.autoUpdater.logger = electron_log_1.default;
electron_updater_1.autoUpdater.logger.transports.file.level = 'info';
let downloadPath = electron_1.app.getPath('downloads');
let downloads = [];
function createWindow() {
    const win = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            contextIsolation: true
        }
    });
    win.loadURL('https://chanomhub.xyz/');
    const menu = electron_1.Menu.buildFromTemplate([
        {
            label: 'Menu',
            submenu: [
                { label: 'Downloads', click: () => { win.loadFile('downloads.html'); } },
                { label: 'Profile', click: () => { win.loadURL('https://chanomhub.xyz/setting/'); } },
                { label: 'Home', click: () => { win.loadURL('https://chanomhub.xyz/'); } },
                { label: 'All Game', click: () => { win.loadFile('all-game.html'); } },
                { label: 'Setting', click: () => { win.loadFile('setting.html'); } }
            ]
        }
    ]);
    electron_1.Menu.setApplicationMenu(menu);
    electron_1.ipcMain.handle('get-folders', () => {
        return fs_1.default.readdirSync(downloadPath).filter(file => fs_1.default.statSync(path_1.default.join(downloadPath, file)).isDirectory());
    });
    electron_1.ipcMain.handle('open-folder', (event, folder) => {
        const folderPath = path_1.default.join(downloadPath, folder);
        if (fs_1.default.existsSync(folderPath)) {
            (0, child_process_1.exec)(`"${folderPath}"`, (error) => {
                if (error) {
                    console.error(`Error opening folder: ${error}`);
                }
            });
        }
    });
    electron_1.ipcMain.handle('get-downloads', () => {
        return downloads.map(download => ({
            id: download.id,
            name: download.name,
            progress: download.progress
        }));
    });
    electron_1.ipcMain.handle('pause-download', (event, id) => {
        const download = downloads.find(d => d.id === id);
        if (download) {
            download.item.pause();
        }
    });
    electron_1.ipcMain.handle('resume-download', (event, id) => {
        const download = downloads.find(d => d.id === id);
        if (download) {
            download.item.resume();
        }
    });
    electron_1.ipcMain.handle('cancel-download', (event, id) => {
        const download = downloads.find(d => d.id === id);
        if (download) {
            download.item.cancel();
        }
    });
    electron_1.ipcMain.handle('get-download-path', () => {
        return downloadPath;
    });
    electron_1.ipcMain.handle('set-download-path', (event, newPath) => {
        downloadPath = newPath;
    });
    electron_1.ipcMain.on('install-update', () => {
        electron_updater_1.autoUpdater.quitAndInstall();
    });
    win.webContents.session.on('will-download', (event, item) => {
        item.setSavePath(path_1.default.join(downloadPath, item.getFilename()));
        const download = {
            id: item.getURL(),
            name: item.getFilename(),
            item,
            progress: 0
        };
        downloads.push(download);
        item.on('done', (event, state) => {
            if (state === 'completed') {
                console.log('Download successfully');
            }
            else {
                console.log(`Download failed: ${state}`);
            }
            downloads = downloads.filter(d => d.id !== item.getURL());
            win.webContents.send('download-update', downloads.map(download => ({
                id: download.id,
                name: download.name,
                progress: download.progress
            })));
        });
        item.on('updated', (event, state) => {
            if (state === 'interrupted') {
                console.log('Download is paused');
            }
            else if (state === 'progressing') {
                if (item.isPaused()) {
                    console.log('Download is paused');
                }
                else {
                    console.log(`Received bytes: ${item.getReceivedBytes()}`);
                    const progress = Math.round((item.getReceivedBytes() / item.getTotalBytes()) * 100);
                    download.progress = progress;
                    win.webContents.send('download-update', downloads.map(download => ({
                        id: download.id,
                        name: download.name,
                        progress: download.progress
                    })));
                }
            }
        });
        win.webContents.send('download-update', downloads.map(download => ({
            id: download.id,
            name: download.name,
            progress: download.progress
        })));
    });
}
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_updater_1.autoUpdater.checkForUpdatesAndNotify();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_updater_1.autoUpdater.on('update-available', () => {
    electron_1.BrowserWindow.getAllWindows().forEach(win => win.webContents.send('update-available'));
});
electron_updater_1.autoUpdater.on('update-downloaded', () => {
    electron_1.BrowserWindow.getAllWindows().forEach(win => win.webContents.send('update-downloaded'));
});
