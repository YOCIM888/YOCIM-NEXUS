import { ipcRenderer } from 'electron'

// 在 webview 内部页面直接拦截 F5/F11，发回宿主
window.addEventListener('keydown', (e) => {
  if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
    if (e.key === 'F5' || e.key === 'F11') {
      ipcRenderer.sendToHost('global-keydown', { key: e.key })
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()
    }
  }
}, true)
