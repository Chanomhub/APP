"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const electron_updater_1 = require("electron-updater");
const electron_log_1 = __importDefault(require("electron-log"));
const i18next_1 = __importDefault(require("i18next"));
const i18next_electron_fs_backend_1 = __importDefault(require("i18next-electron-fs-backend"));
electron_updater_1.autoUpdater.logger = electron_log_1.default;
electron_updater_1.autoUpdater.logger.transports.file.level = 'info';
electron_log_1.default.info('App starting...');
let downloadPath = electron_1.app.getPath('downloads');
let cachePath = path_1.default.join(downloadPath, 'cache');
let downloads = [];
let win; // Declare win globally
i18next_1.default.use(i18next_electron_fs_backend_1.default).init({
    lng: 'en', // Default language
    fallbackLng: 'en', // Fallback language
    backend: {
        loadPath: path_1.default.join(__dirname, 'locales/{{lng}}/translation.json'),
    },
    debug: true, // Set to false in production
}, (err, t) => {
    if (err) {
        electron_log_1.default.error('i18next initialization failed', err);
    }
    else {
        electron_log_1.default.info('i18next initialized');
        createWindow();
    }
});
electron_1.app.on('ready', () => {
    // Create the window once i18next is initialized
    i18next_1.default.on('initialized', createWindow);
});
function createWindow() {
    win = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            partition: 'persist:chanomhub',
            devTools: true // Ensure developer tools are enabled
        },
    });
    win.loadURL('https://chanomhub.xyz/');
    win.webContents.openDevTools(); // Open developer tools
    const menuTemplate = [
        {
            label: i18next_1.default.t('menu.advancedSearch'),
            submenu: [
                { label: i18next_1.default.t('menu.downloads'), click: () => { win.loadFile('downloads.html'); } },
                { label: i18next_1.default.t('menu.profile'), click: () => { win.loadURL('https://chanomhub.xyz/setting/'); } },
                { label: i18next_1.default.t('menu.home'), click: () => { win.loadURL('https://chanomhub.xyz/'); } },
                { label: i18next_1.default.t('menu.allGame'), click: () => { win.loadFile('all-game.html'); } },
                { label: i18next_1.default.t('menu.setting'), click: () => { win.loadFile('setting.html'); } },
            ],
        },
    ];
    const menu = electron_1.Menu.buildFromTemplate(menuTemplate);
    electron_1.Menu.setApplicationMenu(menu);
    setupIpcHandlers();
    setupDownloadHandler();
}
function setupIpcHandlers() {
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
            progress: download.progress,
        }));
    });
    electron_1.ipcMain.handle('pause-download', (event, id) => {
        const download = downloads.find(d => d.id === id);
        if (download) {
            download.item.pause();
        }
        electron_log_1.default.info(`Download paused: ${id}`);
    });
    electron_1.ipcMain.handle('resume-download', (event, id) => {
        const download = downloads.find(d => d.id === id);
        if (download) {
            download.item.resume();
        }
        electron_log_1.default.info(`Download resumed: ${id}`);
    });
    electron_1.ipcMain.handle('cancel-download', (event, id) => {
        const download = downloads.find(d => d.id === id);
        if (download) {
            download.item.cancel();
        }
        electron_log_1.default.info(`Download canceled: ${id}`);
    });
    electron_1.ipcMain.handle('get-download-path', () => {
        electron_log_1.default.info(`Download path: ${downloadPath}`);
        return downloadPath;
    });
    electron_1.ipcMain.handle('set-download-path', (event, newPath) => {
        downloadPath = newPath;
        cachePath = path_1.default.join(downloadPath, 'cache');
        if (!fs_1.default.existsSync(cachePath)) {
            fs_1.default.mkdirSync(cachePath);
        }
        electron_log_1.default.info(`Download path changed: ${downloadPath}`);
    });
    electron_1.ipcMain.on('install-update', () => {
        electron_updater_1.autoUpdater.quitAndInstall();
    });
}
function setupDownloadHandler() {
    electron_1.session.defaultSession.on('will-download', (event, item) => {
        const cacheFilePath = path_1.default.join(cachePath, item.getFilename());
        if (fs_1.default.existsSync(cacheFilePath)) {
            electron_log_1.default.info(`File already in cache: ${item.getFilename()}`);
            win.webContents.send('download-complete', {
                id: item.getURL(),
                name: item.getFilename(),
                path: cacheFilePath,
            });
            return;
        }
        item.setSavePath(cacheFilePath);
        electron_log_1.default.info(`Download started: ${item.getFilename()}`);
        const download = {
            id: item.getURL(),
            name: item.getFilename(),
            item,
            progress: 0,
        };
        downloads.push(download);
        item.on('done', (event, state) => {
            if (state === 'completed') {
                electron_log_1.default.info(`Download completed: ${item.getFilename()}`);
            }
            else {
                electron_log_1.default.error(`Download failed: ${state}`, item.getFilename());
            }
            downloads = downloads.filter(d => d.id !== item.getURL());
            win.webContents.send('download-update', downloads.map(download => ({
                id: download.id,
                name: download.name,
                progress: download.progress,
            })));
        });
        item.on('updated', (event, state) => {
            if (state === 'interrupted') {
                electron_log_1.default.info(`Download paused: ${item.getFilename()}`);
            }
            else if (state === 'progressing') {
                if (item.isPaused()) {
                    electron_log_1.default.info(`Download paused: ${item.getFilename()}`);
                }
                else {
                    const progress = Math.round((item.getReceivedBytes() / item.getTotalBytes()) * 100);
                    download.progress = progress;
                    win.webContents.send('download-update', downloads.map(download => ({
                        id: download.id,
                        name: download.name,
                        progress: download.progress,
                    })));
                }
            }
        });
        win.webContents.send('download-update', downloads.map(download => ({
            id: download.id,
            name: download.name,
            progress: download.progress,
        })));
    });
}
electron_1.app.whenReady().then(() => {
    createWindow();
    let updateURL = `${electron_1.app.getAppPath()}/releases/latest`;
    if (process.platform === 'win32') {
        updateURL += `/download/${electron_1.app.getVersion()}/${electron_1.app.getName()}-Setup-${electron_1.app.getVersion()}.exe`;
    }
    else if (process.platform === 'darwin') {
        updateURL += `/download/${electron_1.app.getVersion()}/${electron_1.app.getName()}-${electron_1.app.getVersion()}-${process.arch}.dmg`;
    }
    else if (process.platform === 'linux') {
        updateURL += `/download/${electron_1.app.getVersion()}/${electron_1.app.getName()}-${electron_1.app.getVersion()}-${process.arch}.deb`;
    }
    else {
        electron_log_1.default.error('Unsupported platform & Auto-updates not yet configured for this platform.');
    }
    electron_updater_1.autoUpdater.setFeedURL({
        provider: 'github',
        owner: 'chanomhub',
        repo: 'APP',
    });
    electron_updater_1.autoUpdater.checkForUpdatesAndNotify();
    electron_log_1.default.info('Checking for updates at:', updateURL);
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
    electron_log_1.default.info('Update downloaded, quitting now...');
});
electron_log_1.default.info('App initialization complete.');
