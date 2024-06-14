"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// /mnt/data/renderer.ts
const electron_1 = require("electron");
electron_1.ipcRenderer.on('navigate', (event, page) => {
    switch (page) {
        case 'downloads':
            window.location.href = 'downloads.html';
            break;
        case 'all-game':
            window.location.href = 'all-game.html';
            break;
        case 'setting':
            window.location.href = 'setting.html';
            break;
    }
});
// Auto-updater notifications
electron_1.ipcRenderer.on('update-available', () => {
    alert('A new update is available. Downloading now...');
});
electron_1.ipcRenderer.on('update-downloaded', () => {
    const userResponse = confirm('A new update is ready. Quit and install now?');
    if (userResponse) {
        electron_1.ipcRenderer.send('install-update');
    }
});
