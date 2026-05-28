import { ref, nextTick } from 'vue'
import { getSettings, addHistoryEntry, SEARCH_ENGINES } from '../utils/storage'

export function useWebview(deps) {
  const webviewRefs = {}
  const webviewReady = {}
  const setupListenersMap = {}
  const canGoBack = ref(false)
  const canGoForward = ref(false)
  const hasVideo = ref(false)
  const webviewPreloadPath = ref('')

  // 获取 preload 路径
  window.electronAPI?.getWebviewPreloadPath().then(path => {
    webviewPreloadPath.value = path || ''
  })
  const findBarRef = ref(null)
  const showFindBar = ref(false)

  function setWebviewRef(tabId, el) {
    if (el) {
      webviewRefs[tabId] = el
      if (!el.src) {
        const tab = deps.tabs.value.find(t => t.id === tabId)
        if (tab && tab.url) el.src = tab.url
      }
    } else {
      delete webviewRefs[tabId]
      delete webviewReady[tabId]
    }
  }

  function setupWebviewListeners(tabId) {
    const wv = webviewRefs[tabId]
    if (!wv) return
    if (setupListenersMap[tabId]) return
    setupListenersMap[tabId] = true

    wv.addEventListener('dom-ready', () => {
      webviewReady[tabId] = true
      const zoom = getSettings().pageZoom || 1.0
      if (zoom !== 1.0) {
        const zoomLevel = Math.log(zoom) / Math.log(1.2)
        wv.setZoomLevel(zoomLevel)
      }
    })

    wv.addEventListener('did-start-loading', () => {
      const tab = deps.tabs.value.find(t => t.id === tabId)
      if (tab) tab.isLoading = true
    })

    wv.addEventListener('did-stop-loading', () => {
      const tab = deps.tabs.value.find(t => t.id === tabId)
      if (tab) tab.isLoading = false
      if (deps.activeTabId.value === tabId) {
        updateNavState()
      }
      if (deps.activeTabId.value === tabId) detectVideo()
    })

    wv.addEventListener('page-favicon-updated', (e) => {
      const tab = deps.tabs.value.find(t => t.id === tabId)
      if (tab && e.favicons && e.favicons.length > 0) {
        tab.favicon = e.favicons[0]
      }
    })

    wv.addEventListener('did-navigate', (e) => {
      const tab = deps.tabs.value.find(t => t.id === tabId)
      if (tab && tab.url !== e.url) {
        tab.url = e.url
        if (deps.activeTabId.value === tabId) deps.urlInput.value = e.url
      }
      if (deps.activeTabId.value === tabId) updateNavState()
    })

    wv.addEventListener('did-navigate-in-page', (e) => {
      const tab = deps.tabs.value.find(t => t.id === tabId)
      if (tab && tab.url !== e.url) {
        tab.url = e.url
        if (deps.activeTabId.value === tabId) deps.urlInput.value = e.url
      }
    })

    wv.addEventListener('page-title-updated', (e) => {
      const tab = deps.tabs.value.find(t => t.id === tabId)
      if (tab) tab.title = e.title
      addHistoryEntry({ title: e.title, url: tab?.url })
    })

    wv.addEventListener('media-started-playing', () => {
      const tab = deps.tabs.value.find(t => t.id === tabId)
      if (tab) tab.isAudioPlaying = true
    })

    wv.addEventListener('media-paused', () => {
      const tab = deps.tabs.value.find(t => t.id === tabId)
      if (tab) tab.isAudioPlaying = false
    })

    wv.addEventListener('found-in-page', (e) => {
      if (deps.activeTabId.value === tabId && findBarRef.value) {
        findBarRef.value.handleFoundInPage(e.result)
      }
    })

    wv.addEventListener('ipc-message', (e) => {
      if (e.channel === 'global-keydown') {
        const args = e.args[0]
        if (args.key === 'F5') {
          deps.reload()
        } else if (args.key === 'F11') {
          deps.toggleFullscreen()
        }
      }
    })

    wv.addEventListener('crashed', () => {
      const tab = deps.tabs.value.find(t => t.id === tabId)
      if (tab) tab.crashed = true
    })

    wv.addEventListener('unresponsive', () => {
      const tab = deps.tabs.value.find(t => t.id === tabId)
      if (tab) tab.unresponsive = true
    })

    wv.addEventListener('responsive', () => {
      const tab = deps.tabs.value.find(t => t.id === tabId)
      if (tab) tab.unresponsive = false
    })
  }

  function updateNavState() {
    const wv = webviewRefs[deps.activeTabId.value]
    if (wv) {
      canGoBack.value = wv.canGoBack()
      canGoForward.value = wv.canGoForward()
    } else {
      canGoBack.value = false
      canGoForward.value = false
    }
  }

  function goBack() {
    const wv = webviewRefs[deps.activeTabId.value]
    wv?.goBack()
  }

  function goForward() {
    const wv = webviewRefs[deps.activeTabId.value]
    wv?.goForward()
  }

  function reload() {
    const wv = webviewRefs[deps.activeTabId.value]
    wv?.reload()
  }

  function navigate() {
    let input = deps.urlInput.value.trim()
    if (!input) return
    if (!/^(https?|file):\/\//i.test(input)) {
      if (/^[\w-]+(\.[\w-]+)+/.test(input)) {
        input = 'https://' + input
      } else {
        const engine = getSettings().searchEngine || 'bing'
        const searchUrl = SEARCH_ENGINES[engine]?.searchUrl || SEARCH_ENGINES.bing.searchUrl
        input = searchUrl + encodeURIComponent(input)
      }
    }
    deps.urlInput.value = input
    loadInTab(input)
  }

  function loadInTab(url) {
    const tab = deps.activeTab.value
    if (!tab) return
    tab.isHome = false
    tab.url = url
    tab.title = url
    deps.urlInput.value = url
    nextTick(() => {
      const wv = webviewRefs[tab.id]
      if (wv && webviewReady[tab.id]) {
        wv.loadURL(url)
      }
      setupWebviewListeners(tab.id)
    })
  }

  function openUrlInNewTab(url) {
    const newTab = deps.createTab()
    newTab.isHome = false
    newTab.url = url
    newTab.title = url
    deps.tabs.value.push(newTab)
    deps.switchTab(newTab.id)
    nextTick(() => {
      const wv = webviewRefs[newTab.id]
      if (wv && webviewReady[newTab.id]) wv.loadURL(url)
      setupWebviewListeners(newTab.id)
    })
  }

  function openUrlInNewWindow(url) {
    window.open(url, '_blank', 'width=1200,height=800')
  }

  function openUrlInSplitView(url) {
    const newTab = deps.createTab()
    newTab.isHome = false
    newTab.url = url
    newTab.title = url
    deps.tabs.value.push(newTab)
    deps.switchTab(newTab.id)
    nextTick(() => {
      const wv = webviewRefs[newTab.id]
      if (wv && webviewReady[newTab.id]) wv.loadURL(url)
      setupWebviewListeners(newTab.id)
      deps.toggleSplitView(newTab.id)
    })
  }

  async function detectVideo() {
    const wv = webviewRefs[deps.activeTabId.value]
    if (!wv) { hasVideo.value = false; return }
    try {
      const result = await wv.executeJavaScript(
        'document.querySelectorAll("video").length > 0'
      )
      hasVideo.value = !!result
    } catch (e) {
      hasVideo.value = false
    }
  }

  async function enterPip() {
    const wv = webviewRefs[deps.activeTabId.value]
    if (!wv) return
    try {
      const videoSrc = await wv.executeJavaScript(
        'const v = document.querySelector("video"); v ? (v.src || v.querySelector("source")?.src || "") : ""'
      )
      if (videoSrc) {
        await window.electronAPI?.openPip(videoSrc)
      }
    } catch (e) {
      console.error('PiP failed:', e)
    }
  }

  let isToggling = false
  let toggleTimer = null

  function openWebviewDevTools() {
    if (isToggling) return
    isToggling = true

    const contentArea = document.querySelector('.content-area')
    if (!contentArea) {
      window.electronAPI?.toggleEmbeddedDevTools()
      isToggling = false
      return
    }
    const rect = contentArea.getBoundingClientRect()
    const bounds = {
      x: Math.round(rect.right - 450),
      y: Math.round(rect.top),
      width: 450,
      height: Math.round(rect.height),
    }
    if (bounds.x < 0) bounds.x = 0

    window.electronAPI?.toggleEmbeddedDevTools(bounds).finally(() => {
      // 解锁延迟：防止 DevTools 关闭/打开事件还在路上时就再次触发
      clearTimeout(toggleTimer)
      toggleTimer = setTimeout(() => { isToggling = false }, 500)
    })
  }

  function toggleDevTools() {
    // 防抖：忽略 300ms 内的重复调用
    clearTimeout(toggleTimer)
    toggleTimer = setTimeout(() => openWebviewDevTools(), isToggling ? 300 : 0)
  }

  function printCurrentPage() {
    const wv = webviewRefs[deps.activeTabId.value]
    if (wv) {
      wv.print({ silent: true, printBackground: true })
    }
  }

  async function takeScreenshot() {
    try {
      const dataUrl = await window.electronAPI?.capturePage()
      if (!dataUrl) return
      const settings = getSettings()
      const dir = settings.downloadPath || (await window.electronAPI?.selectDirectory())
      if (!dir) return
      const fileName = `screenshot-${new Date().toISOString().replace(/[:.]/g, '-')}.png`
      const filePath = dir + '\\' + fileName
      await window.electronAPI?.saveScreenshot(dataUrl, filePath)
    } catch (e) {
      console.error('Screenshot failed:', e)
    }
  }

  return {
    webviewRefs, webviewReady, setupListenersMap,
    canGoBack, canGoForward, hasVideo, findBarRef, showFindBar,
    setWebviewRef, setupWebviewListeners, updateNavState,
    webviewPreloadPath,
    goBack, goForward, reload, navigate, loadInTab,
    openUrlInNewTab, openUrlInNewWindow, openUrlInSplitView,
    detectVideo, enterPip, openWebviewDevTools, printCurrentPage,
    takeScreenshot, toggleDevTools
  }
}
