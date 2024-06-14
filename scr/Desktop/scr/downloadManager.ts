// /mnt/data/downloadManager.ts
import path from 'path';

interface Download {
  id: string;
  name: string;
  status: 'completed' | 'paused';
}

const downloads: Download[] = [];

function getDownloads(): Download[] {
  return downloads;
}

function addDownload(filePath: string): void {
  downloads.push({
    id: filePath,
    name: path.basename(filePath),
    status: 'completed'
  });
}

function pauseDownload(id: string): void {
  const download = downloads.find(d => d.id === id);
  if (download) {
    download.status = 'paused';
  }
}

function cancelDownload(id: string): void {
  const index = downloads.findIndex(d => d.id === id);
  if (index !== -1) {
    downloads.splice(index, 1);
  }
}

export {
  getDownloads,
  addDownload,
  pauseDownload,
  cancelDownload
};
