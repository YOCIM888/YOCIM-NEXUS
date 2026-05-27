import { ref, computed, nextTick } from 'vue'
import { generateId, getSettings } from '../utils/storage'

export function useTabs(deps) {
  const tabs = ref([])
  const activeTabId = ref(null)
  const activeTab = computed(() => tabs.value.find(t => t.id === activeTabId.value))
  const closedTabs = []
  const dragTabIndex = ref(null)
  const dragOverTabId = ref(null)
  const tabContextMenu = ref({ show: false, x: 0, y: 0, tab: null })

  function createTab() {
    const id = generateId()
    return {
      id,
      title: '',
      url: '',
      favicon: 'icon/app.png',
      isHome: true,
      isAudioPlaying: false,
      isMuted: false,
      isPinned: false,
      splitWith: null,
      lastActiveTime: Date.now(),
      isSuspended: false,
      isLoading: false,
      crashed: false,
      unresponsive: false,
    }
  }

  function addTab() {
    const settings = getSettings()
    const tab = createTab()
    if (settings.newTabPage === 'custom' && settings.newTabUrl) {
      tab.isHome = false
      tab.url = settings.newTabUrl
    }
    tabs.value.push(tab)
    switchTab(tab.id)
  }

  function switchTab(id) {
    activeTabId.value = id
    const tab = tabs.value.find(t => t.id === id)
    if (tab) {
      tab.lastActiveTime = Date.now()
      if (tab.isSuspended) {
        thawTab(id)
      }
      if (tab.url === 'yocim://settings') {
        deps.urlInput.value = ''
      } else {
        deps.urlInput.value = tab.isHome ? '' : tab.url
      }
      deps.updateNavState()
    }
    const wv = deps.webviewRefs[id]
    if (wv && wv.getWebContentsId) {
      window.electronAPI?.setTabBackgroundThrottling(wv.getWebContentsId(), false)
    }
    for (const t of tabs.value) {
      if (t.id !== id && !t.isSuspended) {
        const otherWv = deps.webviewRefs[t.id]
        if (otherWv && otherWv.getWebContentsId) {
          window.electronAPI?.setTabBackgroundThrottling(otherWv.getWebContentsId(), true)
        }
      }
    }
    nextTick(() => deps.setupWebviewListeners(id))
  }

  function closeTab(id) {
    const idx = tabs.value.findIndex(t => t.id === id)
    if (idx === -1) return
    const tab = tabs.value[idx]

    if (!tab.isHome && tab.url) {
      closedTabs.unshift({ title: tab.title, url: tab.url, favicon: tab.favicon })
      if (closedTabs.length > 20) closedTabs.pop()
    }

    if (tab.splitWith) {
      const partner = tabs.value.find(t => t.id === tab.splitWith)
      if (partner) partner.splitWith = null
    }

    tabs.value.splice(idx, 1)
    delete deps.webviewRefs[id]
    delete deps.webviewReady[id]
    delete deps.setupListenersMap[id]
    if (tab.partition) {
      window.electronAPI?.clearPartition(tab.partition)
    }

    if (tabs.value.length === 0) {
      addTab()
      return
    }

    if (activeTabId.value === id) {
      const newIdx = Math.min(idx, tabs.value.length - 1)
      switchTab(tabs.value[newIdx].id)
    }
  }

  function closeOtherTabs(currentId) {
    const idsToClose = tabs.value
      .filter(t => t.id !== currentId && !t.isPinned)
      .map(t => t.id)
    for (const id of idsToClose) {
      closeTab(id)
    }
  }

  function restoreClosedTab() {
    if (closedTabs.length === 0) return
    const prev = closedTabs.shift()
    const newTab = createTab()
    newTab.isHome = false
    newTab.url = prev.url
    newTab.title = prev.title
    newTab.favicon = prev.favicon || ''
    tabs.value.push(newTab)
    switchTab(newTab.id)
    nextTick(() => {
      const wv = deps.webviewRefs[newTab.id]
      if (wv && deps.webviewReady[newTab.id]) wv.loadURL(prev.url)
      deps.setupWebviewListeners(newTab.id)
    })
  }

  function duplicateTab(tab) {
    tabContextMenu.value.show = false
    if (!tab) return
    const newTab = createTab()
    newTab.isHome = tab.isHome
    newTab.url = tab.url
    newTab.title = tab.title
    newTab.favicon = tab.favicon
    newTab.isPinned = tab.isPinned
    const idx = tabs.value.indexOf(tab)
    tabs.value.splice(idx + 1, 0, newTab)
    switchTab(newTab.id)
    if (!tab.isHome && tab.url) {
      nextTick(() => {
        const wv = deps.webviewRefs[newTab.id]
        if (wv && deps.webviewReady[newTab.id]) wv.loadURL(tab.url)
        deps.setupWebviewListeners(newTab.id)
      })
    }
  }

  function pinTab(tab) {
    tabContextMenu.value.show = false
    if (!tab) return
    tab.isPinned = !tab.isPinned
    if (tab.isPinned) {
      const idx = tabs.value.indexOf(tab)
      if (idx > 0) {
        tabs.value.splice(idx, 1)
        let insertIdx = 0
        while (insertIdx < tabs.value.length && tabs.value[insertIdx].isPinned) insertIdx++
        tabs.value.splice(insertIdx, 0, tab)
      }
    }
  }

  function toggleMute(tabId) {
    const tab = tabs.value.find(t => t.id === tabId)
    if (!tab) return
    const wv = deps.webviewRefs[tabId]
    if (wv) {
      wv.setAudioMuted(!tab.isMuted)
      tab.isMuted = !tab.isMuted
    }
  }

  function freezeTab(tabId) {
    const tab = tabs.value.find(t => t.id === tabId)
    if (!tab || tab.isHome || tab.url === 'yocim://settings' || tab.isSuspended) return
    const wv = deps.webviewRefs[tabId]
    if (wv) {
      wv.stop()
      tab.suspendedUrl = tab.url
      tab.isSuspended = true
      wv.loadURL('about:blank')
    }
  }

  function thawTab(tabId) {
    const tab = tabs.value.find(t => t.id === tabId)
    if (!tab || !tab.isSuspended) return
    tab.isSuspended = false
    nextTick(() => {
      const wv = deps.webviewRefs[tabId]
      if (wv) {
        wv.loadURL(tab.suspendedUrl || tab.url)
      }
    })
  }

  function reloadCrashedTab(tabId) {
    const tab = tabs.value.find(t => t.id === tabId)
    if (!tab || !tab.crashed) return
    tab.crashed = false
    nextTick(() => {
      const wv = deps.webviewRefs[tabId]
      if (wv && deps.webviewReady[tabId]) {
        wv.loadURL(tab.url)
      }
    })
  }

  function toggleSplitView(tabId) {
    const tab = tabs.value.find(t => t.id === tabId)
    if (!tab) return
    if (tab.splitWith) {
      const partner = tabs.value.find(t => t.id === tab.splitWith)
      if (partner) partner.splitWith = null
      tab.splitWith = null
    } else {
      const otherTabs = tabs.value.filter(t => t.id !== tabId && !t.splitWith)
      if (otherTabs.length > 0) {
        const partner = otherTabs[0]
        tab.splitWith = partner.id
        partner.splitWith = tab.id
      }
    }
  }

  function handleTabRightClick(e, tab) {
    let x = e.clientX
    let y = e.clientY
    if (deps.tabsPosition.value === 'left') {
      x = Math.min(x, 46)
    }
    tabContextMenu.value = { show: true, x, y, tab }
  }

  function reloadTab(tab) {
    tabContextMenu.value.show = false
    if (!tab || tab.isHome) return
    const wv = deps.webviewRefs[tab.id]
    if (wv && deps.webviewReady[tab.id]) wv.reload()
  }

  function muteTabMenuItem(tab) {
    tabContextMenu.value.show = false
    if (!tab) return
    toggleMute(tab.id)
  }

  function onTabDragStart(e, tabId) {
    const idx = tabs.value.findIndex(t => t.id === tabId)
    dragTabIndex.value = idx
    e.dataTransfer.effectAllowed = 'move'
  }

  function onTabDragOver(tabId) {
    if (dragTabIndex.value === null) return
    const overIdx = tabs.value.findIndex(t => t.id === tabId)
    if (overIdx === dragTabIndex.value) return
    const list = [...tabs.value]
    const item = list.splice(dragTabIndex.value, 1)[0]
    list.splice(overIdx, 0, item)
    tabs.value = list
    dragTabIndex.value = overIdx
  }

  function onTabDrop(tabId) {
    dragTabIndex.value = null
    dragOverTabId.value = null
  }

  function onTabDragEnd() {
    dragTabIndex.value = null
    dragOverTabId.value = null
  }

  function openSettings() {
    const existing = tabs.value.find(t => t.url === 'yocim://settings')
    if (existing) {
      switchTab(existing.id)
    } else {
      const tab = {
        id: generateId(),
        title: deps.t('settings'),
        url: 'yocim://settings',
        isHome: false,
      }
      tabs.value.push(tab)
      switchTab(tab.id)
    }
  }

  function togglePanel(name) {
    deps.activePanel.value = deps.activePanel.value === name ? '' : name
    if (deps.activePanel.value === 'downloads') {
      clearTimeout(deps.downloadAutoHideTimer.value)
    }
  }

  return {
    tabs, activeTabId, activeTab, closedTabs,
    dragTabIndex, dragOverTabId, tabContextMenu,
    createTab, addTab, switchTab, closeTab, closeOtherTabs, restoreClosedTab,
    duplicateTab, pinTab, toggleMute, freezeTab, thawTab, reloadCrashedTab,
    toggleSplitView, handleTabRightClick, reloadTab, muteTabMenuItem,
    onTabDragStart, onTabDragOver, onTabDrop, onTabDragEnd,
    openSettings, togglePanel
  }
}
