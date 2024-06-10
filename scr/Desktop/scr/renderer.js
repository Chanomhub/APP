const { ipcRenderer } = require('electron')

ipcRenderer.on('navigate', (event, page) => {
  switch (page) {
    case 'downloads':
      window.location.href = 'downloads.html'
      break
    case 'all-game':
      window.location.href = 'all-game.html'
      break
    case 'setting':
      window.location.href = 'setting.html'
      break
  }
})

// Auto-updater notifications
ipcRenderer.on('update-available', () => {
  alert('A new update is available. Downloading now...')
})

ipcRenderer.on('update-downloaded', () => {
  const userResponse = confirm('A new update is ready. Quit and install now?')
  if (userResponse) {
    ipcRenderer.send('install-update')
  }
})

