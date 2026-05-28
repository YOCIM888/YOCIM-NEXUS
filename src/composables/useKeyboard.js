export function useKeyboard(callbacks) {
  const {
    addTab, closeTab, activeTabId, reload, toggleBookmark,
    togglePanel, showFindBar, switchTab, tabs, toggleDevTools,
    takeScreenshot, toggleFullscreen, urlInputRef, goBack, goForward,
    webviewRefs, restoreClosedTab, toggleResponsive
  } = callbacks

  function handleGlobalKeydown(e) {
    const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT'

    if (e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey && e.key === 'l') {
      e.preventDefault()
      urlInputRef.value?.focus()
      urlInputRef.value?.select()
      return
    }

    if (e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey && e.key === 'r') {
      e.preventDefault()
      reload()
      return
    }

    if (e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey && e.key === 't') {
      e.preventDefault()
      addTab()
      return
    }

    if (e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey && e.key === 'T') {
      e.preventDefault()
      callbacks.restoreClosedTab()
      return
    }

    if (e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey && e.key === 'w') {
      e.preventDefault()
      if (activeTabId.value) closeTab(activeTabId.value)
      return
    }

    if (e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey && e.key === 'N') {
      e.preventDefault()
      window.electronAPI?.openIncognito()
      return
    }

    if (e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey && e.key === 'f') {
      e.preventDefault()
      showFindBar.value = true
      return
    }

    if (e.ctrlKey && !e.altKey && !e.metaKey && e.key === 'Tab') {
      e.preventDefault()
      const idx = tabs.value.findIndex(t => t.id === activeTabId.value)
      if (tabs.value.length > 1) {
        const nextIdx = e.shiftKey
          ? (idx - 1 + tabs.value.length) % tabs.value.length
          : (idx + 1) % tabs.value.length
        switchTab(tabs.value[nextIdx].id)
      }
      return
    }

    if (e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey && e.key === 'd') {
      e.preventDefault()
      toggleBookmark()
      return
    }

    if (e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey && e.key === 'h') {
      e.preventDefault()
      togglePanel('history')
      return
    }

    if (e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey && e.key === 'j') {
      e.preventDefault()
      togglePanel('downloads')
      return
    }

    if (e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey && e.key === 'b') {
      e.preventDefault()
      togglePanel('bookmarks')
      return
    }

    if (e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey && e.key >= '1' && e.key <= '8') {
      e.preventDefault()
      const n = parseInt(e.key)
      if (tabs.value.length >= n) switchTab(tabs.value[n - 1].id)
      return
    }

    if (e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey && e.key === '9') {
      e.preventDefault()
      if (tabs.value.length > 0) switchTab(tabs.value[tabs.value.length - 1].id)
      return
    }

    if (e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey && (e.key === '=' || e.key === '+')) {
      e.preventDefault()
      const wv = webviewRefs[activeTabId.value]
      if (wv) {
        const current = wv.getZoomLevel()
        wv.setZoomLevel(Math.min(current + 0.5, 5))
      }
      return
    }

    if (e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey && e.key === '-') {
      e.preventDefault()
      const wv = webviewRefs[activeTabId.value]
      if (wv) {
        const current = wv.getZoomLevel()
        wv.setZoomLevel(Math.max(current - 0.5, -5))
      }
      return
    }

    if (e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey && e.key === '0') {
      e.preventDefault()
      const wv = webviewRefs[activeTabId.value]
      if (wv) wv.setZoomLevel(0)
      return
    }

    if (e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey && e.key === 'I') {
      e.preventDefault()
      toggleDevTools()
      return
    }

    if (e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey && e.key === 'S') {
      e.preventDefault()
      takeScreenshot()
      return
    }

    if (e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey && (e.key === 'D' || e.key === 'd')) {
      e.preventDefault()
      toggleResponsive()
      return
    }

    if (e.key === 'Escape' && !isInput) {
      const wv = webviewRefs[activeTabId.value]
      if (wv) wv.stop()
      return
    }

    if (e.key === 'F5') {
      e.preventDefault()
      reload()
      return
    }

    if (e.key === 'F11') {
      e.preventDefault()
      toggleFullscreen()
      return
    }

    if (e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey && (e.key === 'I' || e.key === 'i')) {
      e.preventDefault()
      toggleDevTools()
      return
    }

    if (e.altKey && !e.ctrlKey && !e.metaKey && e.key === 'ArrowLeft') {
      e.preventDefault()
      goBack()
      return
    }

    if (e.altKey && !e.ctrlKey && !e.metaKey && e.key === 'ArrowRight') {
      e.preventDefault()
      goForward()
      return
    }
  }

  return { handleGlobalKeydown }
}
