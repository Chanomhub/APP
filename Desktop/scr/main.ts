import { app, BrowserWindow, Menu, ipcMain, session } from 'electron';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import i18next from 'i18next';
import Backend from 'i18next-electron-fs-backend';

interface Download {
  id: string;
  name: string;
  item: Electron.DownloadItem;
  progress: number;
}

autoUpdater.logger = log;
(autoUpdater.logger as any).transports.file.level = 'info';
log.info('App starting...');

let downloadPath = app.getPath('downloads');
let cachePath = path.join(downloadPath, 'cache');
let downloads: Download[] = [];

let win: BrowserWindow; // Declare win globally

i18next.use(Backend).init({
  lng: 'en', // Default language
  fallbackLng: 'en', // Fallback language
  backend: {
    loadPath: path.join(__dirname, 'locales/{{lng}}/translation.json'),
  },
  debug: true, // Set to false in production
}, (err, t) => {
  if (err) {
    log.error('i18next initialization failed', err);
  } else {
    log.info('i18next initialized');
    createWindow();
  }
});

app.on('ready', () => {
  // Create the window once i18next is initialized
  i18next.on('initialized', createWindow);
});

function createWindow(): void {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      partition: 'persist:chanomhub',
      devTools: true // Ensure developer tools are enabled
    },
  });

  win.loadURL('https://chanomhub.xyz/');
  win.webContents.openDevTools(); // Open developer tools

  const menuTemplate = [
    {
      label: i18next.t('menu.advancedSearch'),
      submenu: [
        { label: i18next.t('menu.downloads'), click: () => { win.loadFile('downloads.html'); } },
        { label: i18next.t('menu.profile'), click: () => { win.loadURL('https://chanomhub.xyz/setting/'); } },
        { label: i18next.t('menu.home'), click: () => { win.loadURL('https://chanomhub.xyz/'); } },
        { label: i18next.t('menu.allGame'), click: () => { win.loadFile('all-game.html'); } },
        { label: i18next.t('menu.setting'), click: () => { win.loadFile('setting.html'); } },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  setupIpcHandlers();
  setupDownloadHandler();
}

function setupIpcHandlers() {
  ipcMain.handle('get-folders', (): string[] => {
    return fs.readdirSync(downloadPath).filter(file => fs.statSync(path.join(downloadPath, file)).isDirectory());
  });

  ipcMain.handle('open-folder', (event, folder: string): void => {
    const folderPath = path.join(downloadPath, folder);
    if (fs.existsSync(folderPath)) {
      exec(`"${folderPath}"`, (error) => {
        if (error) {
          console.error(`Error opening folder: ${error}`);
        }
      });
    }
  });

  ipcMain.handle('get-downloads', (): any[] => {
    return downloads.map(download => ({
      id: download.id,
      name: download.name,
      progress: download.progress,
    }));
  });

  ipcMain.handle('pause-download', (event, id: string): void => {
    const download = downloads.find(d => d.id === id);
    if (download) {
      download.item.pause();
    }
    log.info(`Download paused: ${id}`);
  });

  ipcMain.handle('resume-download', (event, id: string): void => {
    const download = downloads.find(d => d.id === id);
    if (download) {
      download.item.resume();
    }
    log.info(`Download resumed: ${id}`);
  });

  ipcMain.handle('cancel-download', (event, id: string): void => {
    const download = downloads.find(d => d.id === id);
    if (download) {
      download.item.cancel();
    }
    log.info(`Download canceled: ${id}`);
  });

  ipcMain.handle('get-download-path', (): string => {
    log.info(`Download path: ${downloadPath}`);
    return downloadPath;
  });

  ipcMain.handle('set-download-path', (event, newPath: string): void => {
    downloadPath = newPath;
    cachePath = path.join(downloadPath, 'cache');
    if (!fs.existsSync(cachePath)) {
      fs.mkdirSync(cachePath);
    }
    log.info(`Download path changed: ${downloadPath}`);
  });

  ipcMain.on('install-update', (): void => {
    autoUpdater.quitAndInstall();
  });
}

function setupDownloadHandler() {
  session.defaultSession.on('will-download', (event, item: Electron.DownloadItem): void => {
    const cacheFilePath = path.join(cachePath, item.getFilename());

    if (fs.existsSync(cacheFilePath)) {
      log.info(`File already in cache: ${item.getFilename()}`);
      win.webContents.send('download-complete', {
        id: item.getURL(),
        name: item.getFilename(),
        path: cacheFilePath,
      });
      return;
    }

    item.setSavePath(cacheFilePath);
    log.info(`Download started: ${item.getFilename()}`);
    const download: Download = {
      id: item.getURL(),
      name: item.getFilename(),
      item,
      progress: 0,
    };
    downloads.push(download);

    item.on('done', (event, state) => {
      if (state === 'completed') {
        log.info(`Download completed: ${item.getFilename()}`);
      } else {
        log.error(`Download failed: ${state}`, item.getFilename());
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
        log.info(`Download paused: ${item.getFilename()}`);
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          log.info(`Download paused: ${item.getFilename()}`);
        } else {
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

app.whenReady().then((): void => {
  createWindow();

  let updateURL = `${app.getAppPath()}/releases/latest`;

  if (process.platform === 'win32') {
    updateURL += `/download/${app.getVersion()}/${app.getName()}-Setup-${app.getVersion()}.exe`;
  } else if (process.platform === 'darwin') {
    updateURL += `/download/${app.getVersion()}/${app.getName()}-${app.getVersion()}-${process.arch}.dmg`;
  } else if (process.platform === 'linux') {
    updateURL += `/download/${app.getVersion()}/${app.getName()}-${app.getVersion()}-${process.arch}.deb`;
  } else {
    log.error('Unsupported platform & Auto-updates not yet configured for this platform.');
  }

  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'chanomhub',
    repo: 'APP',
  });

  autoUpdater.checkForUpdatesAndNotify();
  log.info('Checking for updates at:', updateURL);

  app.on('activate', (): void => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', (): void => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

autoUpdater.on('update-available', (): void => {
  BrowserWindow.getAllWindows().forEach(win => win.webContents.send('update-available'));
});

autoUpdater.on('update-downloaded', (): void => {
  BrowserWindow.getAllWindows().forEach(win => win.webContents.send('update-downloaded'));
  log.info('Update downloaded, quitting now...');
});
log.info('App initialization complete.');

