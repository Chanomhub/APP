// /mnt/data/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  getFolders: (): Promise<string[]> => ipcRenderer.invoke('get-folders'),
  openFolder: (folder: string): Promise<void> => ipcRenderer.invoke('open-folder', folder),
  getDownloads: (): Promise<any[]> => ipcRenderer.invoke('get-downloads'),
  pauseDownload: (id: string): Promise<void> => ipcRenderer.invoke('pause-download', id),
  resumeDownload: (id: string): Promise<void> => ipcRenderer.invoke('resume-download', id),
  cancelDownload: (id: string): Promise<void> => ipcRenderer.invoke('cancel-download', id),
  onDownloadUpdate: (callback: (downloads: any[]) => void): void => { ipcRenderer.on('download-update', (event, downloads) => callback(downloads)); },
  getDownloadPath: (): Promise<string> => ipcRenderer.invoke('get-download-path'),
  setDownloadPath: (path: string): Promise<void> => ipcRenderer.invoke('set-download-path', path),

  // Auto-updater events
  onUpdateAvailable: (callback: () => void): void => { ipcRenderer.on('update-available', callback); },
  onUpdateDownloaded: (callback: () => void): void => { ipcRenderer.on('update-downloaded', callback); }
});

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector: string, text: string): void => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ['chrome', 'node', 'electron']) {
    const version = process.versions[type as keyof NodeJS.ProcessVersions];
    if (version) {
      replaceText(`${type}-version`, version);
    }
  }
});
