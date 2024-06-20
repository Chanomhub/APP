// /mnt/data/renderer.ts
import { ipcRenderer } from 'electron';

ipcRenderer.on('navigate', (event, page: string) => {
  switch (page) {
    case 'Advanced Search':
	    window.location.href = 'advanced-search.html';
      break;
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
ipcRenderer.on('update-available', (): void => {
  alert('A new update is available. Downloading now...');
});

ipcRenderer.on('update-downloaded', (): void => {
  const userResponse = confirm('A new update is ready. Quit and install now?');
  if (userResponse) {
    ipcRenderer.send('install-update');
  }
});
