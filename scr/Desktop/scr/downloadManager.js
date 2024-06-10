const downloads = []

function getDownloads() {
  return downloads
}

function addDownload(filePath) {
  downloads.push({
    id: filePath,
    name: path.basename(filePath),
    status: 'completed'  // You can adjust the status according to your download handling
  })
}

function pauseDownload(id) {
  const download = downloads.find(d => d.id === id)
  if (download) {
    download.status = 'paused'
  }
}

function cancelDownload(id) {
  const index = downloads.findIndex(d => d.id === id)
  if (index !== -1) {
    downloads.splice(index, 1)
  }
}

module.exports = {
  getDownloads,
  addDownload,
  pauseDownload,
  cancelDownload
}

