import { ref } from 'vue'
import { getDownloads, updateDownload, removeDownload, saveDownloads } from '../utils/storage'

export function useDownloads() {
  const downloads = ref(getDownloads())
  const downloadSpeedCache = {}
  const downloadAutoHideTimer = ref(null)

  function pauseDownload(item) {
    window.electronAPI?.downloadPause(item.id)
    downloads.value = updateDownload(item.id, { state: 'paused' })
  }

  function resumeDownload(item) {
    window.electronAPI?.downloadResume(item.id)
    downloads.value = updateDownload(item.id, { state: 'downloading' })
  }

  function handleRemoveDownload(id) {
    downloads.value = removeDownload(id)
  }

  function handleOpenDownloadLocation(filePath) {
    if (filePath) window.electronAPI?.showItemInFolder(filePath)
  }

  function handleClearDownloads() {
    downloads.value = []
    saveDownloads([])
  }

  function handleOpenDownloadFolder(downloadPath) {
    if (downloadPath) {
      window.electronAPI?.showItemInFolder(downloadPath)
    }
  }

  return {
    downloads, downloadSpeedCache, downloadAutoHideTimer,
    pauseDownload, resumeDownload, handleRemoveDownload, handleOpenDownloadLocation,
    handleClearDownloads, handleOpenDownloadFolder
  }
}
