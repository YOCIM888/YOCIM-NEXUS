<template>
  <LangDialog :show="showLangDialog" @selectLanguage="selectLanguage" />

  <div :class="['browser', { dark: isDark, 'tabs-left': tabsPosition === 'left', 'sidebar-collapsed': tabsPosition === 'left' && sidebarCollapsed }]">
    <VerticalTitleBar
      v-if="tabsPosition === 'left' && !isFullscreen"
      :activeTab="activeTab"
      :sidebarCollapsed="sidebarCollapsed"
      :isMaximized="isMaximized"
      @toggleSidebar="toggleSidebar"
      @minimize="handleMinimize"
      @maximize="handleMaximize"
      @close="handleClose"
    />

    <TabBar
      v-if="!isFullscreen"
      :tabs="tabs"
      :activeTabId="activeTabId"
      :sidebarCollapsed="sidebarCollapsed"
      :tabsPosition="tabsPosition"
      :isMaximized="isMaximized"
      :dragTabIndex="dragTabIndex"
      @switchTab="switchTab"
      @closeTab="closeTab"
      @addTab="addTab"
      @toggleSplitView="toggleSplitView"
      @contextmenu="handleTabRightClick"
      @dragstart="onTabDragStart"
      @dragover="onTabDragOver"
      @drop="onTabDrop"
      @dragend="onTabDragEnd"
      @toggleMute="toggleMute"
      @freezeTab="freezeTab"
      @thawTab="thawTab"
      @minimize="handleMinimize"
      @maximize="handleMaximize"
      @close="handleClose"
    />

    <TabContextMenu
      :show="tabContextMenu.show"
      :x="tabContextMenu.x"
      :y="tabContextMenu.y"
      :tab="tabContextMenu.tab"
      :tabsPosition="tabsPosition"
      @close="tabContextMenu.show = false"
      @reload="reloadTab"
      @duplicate="duplicateTab"
      @pin="pinTab"
      @mute="muteTabMenuItem"
      @togglePosition="tabsPosition = tabsPosition === 'left' ? 'top' : 'left'"
      @closeOther="(tab) => closeOtherTabs(tab.id)"
      @closeTab="(tab) => closeTab(tab.id)"
    />

    <NavBar
      v-if="!isFullscreen"
      ref="navBarRef"
      :canGoBack="canGoBack"
      :canGoForward="canGoForward"
      :urlInput="urlInput"
      :isCurrentBookmarked="isCurrentBookmarkedComputed"
      :showUrlSuggestions="showUrlSuggestions"
      :urlSuggestions="urlSuggestions"
      :hasVideo="hasVideo"
      @back="goBack"
      @forward="goForward"
      @reload="reload"
      @navigate="navigate"
      @input="onUrlInput"
      @blur="hideUrlSuggestions"
      @update:urlInput="urlInput = $event"
      @selectSuggestion="selectUrlSuggestion"
      @toggleBookmark="toggleBookmark"
      @addToReadingList="addToReadingListCurrent"
      @togglePanel="togglePanel"
      @toggleReadingList="showReadingList = !showReadingList"
      @toggleNotes="showNotes = !showNotes"
      @enterPip="enterPip"
      @openSettings="openSettings"
    />

    <FindBar
      v-if="showFindBar"
      ref="findBarRef"
      :webview="webviewRefs[activeTabId]"
      @close="showFindBar = false"
    />

    <div class="content-area" :class="{ 'split-mode': activeTab?.splitWith }">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        v-show="tab.id === activeTabId || tab.id === activeTab?.splitWith"
        :class="['tab-content', { 'split-half': tab.splitWith }]"
      >
        <HomePage
          v-if="tab.isHome"
          @navigate="loadInTab"
          @openInNewTab="openUrlInNewTab"
          @openInNewWindow="openUrlInNewWindow"
          @openInSplitView="openUrlInSplitView"
          @print="printCurrentPage"
        />
        <SettingsPage
          v-else-if="tab.url === 'yocim://settings'"
        />
        <webview
          v-else
          :ref="el => setWebviewRef(tab.id, el)"
          class="webview"
          :partition="tab.partition"
          :style="tabContextMenu.show ? { pointerEvents: 'none' } : {}"
          allowpopups
        ></webview>
        <div v-if="tab.isSuspended && tab.id === activeTabId" class="suspended-overlay" @click="switchTab(tab.id)">
          <div class="suspended-content">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="suspended-icon"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            <span>{{ t('tabSuspended') }}</span>
            <span class="suspended-hint">{{ t('clickToReload') }}</span>
          </div>
        </div>
        <div v-if="tab.crashed && tab.id === activeTabId" class="suspended-overlay" @click="reloadCrashedTab(tab.id)">
          <div class="suspended-content">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="suspended-icon"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <span>{{ t('pageCrashed') }}</span>
            <span class="suspended-hint">{{ t('clickToReload') }}</span>
          </div>
        </div>
      </div>

      <BookmarkPanel
        v-if="activePanel === 'bookmarks'"
        :panelStyle="bookmarkPanelStyle"
        @close="activePanel = ''"
        @navigate="handlePanelNavigate"
        @openInNewWindow="openUrlInNewWindow"
      />
      <HistoryPanel
        v-if="activePanel === 'history'"
        :panelStyle="historyPanelStyle"
        @close="activePanel = ''"
        @navigate="handlePanelNavigate"
        @openInNewWindow="openUrlInNewWindow"
      />
      <DownloadPanel
        v-if="activePanel === 'downloads'"
        :downloads="downloads"
        :panelStyle="downloadPanelStyle"
        :downloadPath="reactiveSettings.downloadPath || ''"
        @close="activePanel = ''"
        @pause="pauseDownload"
        @resume="resumeDownload"
        @remove="handleRemoveDownload"
        @open-location="handleOpenDownloadLocation"
        @clearAll="handleClearDownloads"
        @openDownloadFolder="handleOpenDownloadFolder"
      />
      <ReadingListPanel
        v-if="showReadingList"
        :panelStyle="readingListPanelStyle"
        @close="showReadingList = false"
        @navigate="handlePanelNavigate"
        @openInNewWindow="openUrlInNewWindow"
      />
      <NotesPanel
        v-if="showNotes"
        :panelStyle="notesPanelStyle"
        @close="showNotes = false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick, provide } from 'vue'
import { isBookmarked, addBookmark, removeBookmarkByUrl, getSettings, updateSettings, exportAllData, getBookmarks, getHistory, addToReadingList, addDownload, updateDownload, saveSession, loadSession } from './utils/storage'
import { useI18n } from './utils/i18n'
import { useSettings } from './composables/useSettings'
import { useDownloads } from './composables/useDownloads'
import { useWebview } from './composables/useWebview'
import { useTabs } from './composables/useTabs'
import { useKeyboard } from './composables/useKeyboard'
import LangDialog from './components/LangDialog.vue'
import VerticalTitleBar from './components/VerticalTitleBar.vue'
import TabBar from './components/TabBar.vue'
import TabContextMenu from './components/TabContextMenu.vue'
import NavBar from './components/NavBar.vue'
import HomePage from './components/HomePage.vue'
import BookmarkPanel from './components/BookmarkPanel.vue'
import HistoryPanel from './components/HistoryPanel.vue'
import DownloadPanel from './components/DownloadPanel.vue'
import NotesPanel from './components/NotesPanel.vue'
import SettingsPage from './components/SettingsPage.vue'
import FindBar from './components/FindBar.vue'
import ReadingListPanel from './components/ReadingListPanel.vue'

const { t, setLocale, getLocale } = useI18n()

const {
  reactiveSettings, tabsPosition, sidebarCollapsed, toggleSidebar,
  systemDark, isDark, applyCustomTheme,
  bookmarkPanelStyle, readingListPanelStyle, historyPanelStyle,
  downloadPanelStyle, notesPanelStyle,
  bookmarkVersion, isCurrentBookmarked
} = useSettings()

const {
  downloads, downloadSpeedCache, downloadAutoHideTimer,
  pauseDownload, resumeDownload, handleRemoveDownload, handleOpenDownloadLocation,
  handleClearDownloads, handleOpenDownloadFolder
} = useDownloads()

const urlInput = ref('')
const activePanel = ref('')
const isMaximized = ref(false)
const isFullscreen = ref(false)
let escPressTimer = null
const urlSuggestions = ref([])
const showUrlSuggestions = ref(false)
let urlSuggestTimer = null
const showNotes = ref(false)
const showReadingList = ref(false)
const showLangDialog = ref(false)
const navBarRef = ref(null)

const urlInputRef = computed(() => navBarRef.value?.urlInputRef)

async function toggleFullscreen() {
  await window.electronAPI?.toggleFullscreen()
  isFullscreen.value = await window.electronAPI?.windowIsFullscreen()
}

const webviewDeps = {
  tabs: null,
  activeTabId: null,
  activeTab: null,
  urlInput,
  toggleDevTools: null,
  reload: null,
  toggleFullscreen,
  createTab: null,
  switchTab: null,
  toggleSplitView: null
}

const {
  webviewRefs, webviewReady, setupListenersMap,
  canGoBack, canGoForward, hasVideo, findBarRef, showFindBar,
  setWebviewRef, setupWebviewListeners, updateNavState,
  goBack, goForward, reload, navigate, loadInTab,
  openUrlInNewTab, openUrlInNewWindow, openUrlInSplitView,
  detectVideo, enterPip, printCurrentPage,
  takeScreenshot, toggleDevTools
} = useWebview(webviewDeps)

webviewDeps.toggleDevTools = toggleDevTools
webviewDeps.reload = reload

const {
  tabs, activeTabId, activeTab, closedTabs,
  dragTabIndex, dragOverTabId, tabContextMenu,
  createTab, addTab, switchTab, closeTab, closeOtherTabs, restoreClosedTab,
  duplicateTab, pinTab, toggleMute, freezeTab, thawTab, reloadCrashedTab,
  toggleSplitView, handleTabRightClick, reloadTab, muteTabMenuItem,
  onTabDragStart, onTabDragOver, onTabDrop, onTabDragEnd,
  openSettings, togglePanel
} = useTabs({
  webviewRefs, webviewReady, setupListenersMap, urlInput,
  tabsPosition, activePanel, downloadAutoHideTimer,
  setupWebviewListeners, updateNavState, t
})

webviewDeps.tabs = tabs
webviewDeps.activeTabId = activeTabId
webviewDeps.activeTab = activeTab
webviewDeps.createTab = createTab
webviewDeps.switchTab = switchTab
webviewDeps.toggleSplitView = toggleSplitView

const isCurrentBookmarkedComputed = computed(() => isCurrentBookmarked(activeTab.value))

provide('refreshSettings', () => {
  reactiveSettings.value = getSettings()
  bookmarkVersion.value++
  const dp = reactiveSettings.value.downloadPath
  if (dp) window.electronAPI?.setDownloadPath(dp)
  applyCustomTheme()
})
provide('hideLogo', computed(() => reactiveSettings.value.hideLogo))
provide('hideIcons', computed(() => reactiveSettings.value.hideIcons))

function toggleBookmark() {
  const tab = activeTab.value
  if (!tab || tab.isHome || tab.url === 'yocim://settings') return
  if (isBookmarked(tab.url)) {
    removeBookmarkByUrl(tab.url)
  } else {
    addBookmark({ title: tab.title, url: tab.url })
  }
  bookmarkVersion.value++
}

function addToReadingListCurrent() {
  const tab = activeTab.value
  if (!tab || tab.isHome || tab.url === 'yocim://settings') return
  addToReadingList({ title: tab.title, url: tab.url })
}

function handlePanelNavigate(url) {
  activePanel.value = ''
  loadInTab(url)
}

function selectLanguage(lang) {
  setLocale(lang)
  updateSettings({ language: lang })
  reactiveSettings.value = getSettings()
  showLangDialog.value = false
}

function onUrlInput() {
  clearTimeout(urlSuggestTimer)
  urlSuggestions.value = []
  showUrlSuggestions.value = false
  const input = urlInput.value.trim()
  if (!input || input.length < 2) return
  urlSuggestTimer = setTimeout(() => {
    const q = input.toLowerCase()
    const results = []
    const bookmarks = getBookmarks()
    for (const folder of bookmarks.folders) {
      for (const bm of folder.bookmarks) {
        if (bm.url.toLowerCase().includes(q) || bm.title.toLowerCase().includes(q)) {
          results.push({ title: bm.title, url: bm.url, type: 'bookmark' })
        }
      }
    }
    const history = getHistory()
    for (const entry of history) {
      if (entry.url.toLowerCase().includes(q) || entry.title.toLowerCase().includes(q)) {
        if (!results.some(r => r.url === entry.url)) {
          results.push({ title: entry.title, url: entry.url, type: 'history' })
        }
      }
    }
    results.sort((a, b) => {
      const aStarts = a.url.toLowerCase().startsWith(q) ? 0 : (a.title.toLowerCase().startsWith(q) ? 1 : 2)
      const bStarts = b.url.toLowerCase().startsWith(q) ? 0 : (b.title.toLowerCase().startsWith(q) ? 1 : 2)
      return aStarts - bStarts
    })
    urlSuggestions.value = results.slice(0, 8)
    showUrlSuggestions.value = urlSuggestions.value.length > 0
  }, 200)
}

function selectUrlSuggestion(suggestion) {
  urlInput.value = suggestion.url
  showUrlSuggestions.value = false
  urlSuggestions.value = []
  loadInTab(suggestion.url)
}

function hideUrlSuggestions() {
  setTimeout(() => { showUrlSuggestions.value = false }, 200)
}

async function handleMinimize() {
  await window.electronAPI?.windowMinimize()
}

async function handleMaximize() {
  await window.electronAPI?.windowMaximize()
  isMaximized.value = await window.electronAPI?.windowIsMaximized()
}

async function handleClose() {
  await window.electronAPI?.windowClose()
}

const { handleGlobalKeydown } = useKeyboard({
  addTab, closeTab, activeTabId, reload, toggleBookmark,
  togglePanel, showFindBar, switchTab, tabs, toggleDevTools,
  takeScreenshot, toggleFullscreen, urlInputRef, goBack, goForward,
  webviewRefs, restoreClosedTab
})

watch(activeTabId, () => {
  const tab = activeTab.value
  if (tab) {
    if (tab.url === 'yocim://settings') {
      urlInput.value = ''
    } else {
      urlInput.value = tab.isHome ? '' : tab.url
    }
  }
  updateNavState()
})

let saveTimer = null
watch(tabs, () => {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    const settings = getSettings()
    if (settings.sessionRestore) {
      saveSession(tabs.value)
    }
  }, 500)
}, { deep: true })

let backupInterval = null
let suspendInterval = null

function startAutoBackup() {
  backupInterval = setInterval(async () => {
    const settings = getSettings()
    if (!settings.autoBackupEnabled || !settings.autoBackupPath) return
    const now = Date.now()
    const intervalMs = (settings.autoBackupInterval || 24) * 60 * 60 * 1000
    if (now - settings.lastBackupTime < intervalMs) return
    const data = exportAllData()
    const fileName = `yocim-nexus-backup-${new Date().toISOString().slice(0, 10)}.json`
    const filePath = settings.autoBackupPath + '\\' + fileName
    try {
      await window.electronAPI?.writeFile(filePath, data)
      updateSettings({ lastBackupTime: now })
    } catch (e) {
      console.error('Auto backup failed:', e)
    }
  }, 60 * 60 * 1000)
}

function startAutoSuspend() {
  suspendInterval = setInterval(() => {
    const now = Date.now()
    const settings = getSettings()
    const suspendTimeout = (settings.suspendTimeout || 5) * 60 * 1000
    for (const tab of tabs.value) {
      if (tab.id === activeTabId.value || tab.isHome || tab.url === 'yocim://settings' || tab.isSuspended) continue
      if (now - tab.lastActiveTime > suspendTimeout) {
        freezeTab(tab.id)
      }
    }
  }, 30 * 1000)
}

onMounted(async () => {
  const isFirstRun = !localStorage.getItem('yocim_settings')
  const settings = getSettings()

  if (isFirstRun) {
    setLocale('en')
    updateSettings({ language: 'en' })
    showLangDialog.value = true
  } else if (settings.language) {
    setLocale(settings.language)
  }
  applyCustomTheme()
  if (settings.downloadPath) {
    window.electronAPI?.setDownloadPath(settings.downloadPath)
  }
  window.electronAPI?.onDownloadPathChanged((dir) => {
    const cur = getSettings()
    if (cur.downloadPath !== dir) {
      updateSettings({ downloadPath: dir })
      reactiveSettings.value = getSettings()
    }
  })
  addTab()
  if (settings.sessionRestore) {
    const session = loadSession()
    if (session && session.length > 0) {
      tabs.value = []
      for (const s of session) {
        const tab = createTab()
        tab.isHome = false
        tab.url = s.url
        tab.title = s.title || s.url
        tab.favicon = s.favicon || 'icon/app.png'
        tab.isPinned = s.isPinned || false
        tabs.value.push(tab)
      }
      activeTabId.value = tabs.value[0].id
    }
  }
  startAutoBackup()
  startAutoSuspend()
  isMaximized.value = await window.electronAPI?.windowIsMaximized()
  isFullscreen.value = await window.electronAPI?.windowIsFullscreen()
  document.addEventListener('keydown', handleGlobalKeydown)
  window.electronAPI?.onGlobalKeydown(({ key }) => {
    if (key === 'F12') {
      toggleDevTools()
    } else if (key === 'F5') {
      reload()
    } else if (key === 'F11') {
      toggleFullscreen()
    }
  })
  window.electronAPI?.onContextAction(async ({ action, url, dataUrl }) => {
    if (action === 'open-url') {
      const tab = activeTab.value
      if (tab && !tab.isHome && tab.url !== 'yocim://settings') {
        openUrlInNewTab(url)
      } else {
        loadInTab(url)
      }
    } else if (action === 'view-source') {
      openUrlInNewTab('view-source:' + url)
    } else if (action === 'screenshot') {
      if (!dataUrl) return
      const settings = getSettings()
      const dir = settings.downloadPath || (await window.electronAPI?.selectDirectory())
      if (!dir) return
      const fileName = `screenshot-${new Date().toISOString().replace(/[:.]/g, '-')}.png`
      const filePath = dir + '\\' + fileName
      await window.electronAPI?.saveScreenshot(dataUrl, filePath)
    }
  })
  window.electronAPI?.onOpenNewTab((url) => {
    openUrlInNewTab(url)
  })
  window.electronAPI?.onDownloadStart((data) => {
    downloads.value = addDownload(data)
    activePanel.value = 'downloads'
    clearTimeout(downloadAutoHideTimer.value)
  })
  window.electronAPI?.onDownloadProgress((data) => {
    const prev = downloadSpeedCache[data.id] || { bytes: 0, time: Date.now() }
    const now = Date.now()
    const dt = (now - prev.time) / 1000
    const speed = dt > 0.1 ? (data.receivedBytes - prev.bytes) / dt : 0
    downloadSpeedCache[data.id] = { bytes: data.receivedBytes, time: now }
    downloads.value = updateDownload(data.id, {
      receivedBytes: data.receivedBytes,
      totalBytes: data.totalBytes,
      state: data.state,
      speed: speed > 0 ? speed : undefined,
    })
  })
  window.electronAPI?.onDownloadDone((data) => {
    downloads.value = updateDownload(data.id, {
      state: data.state,
      filePath: data.filePath,
    })
    const allDone = downloads.value.every(d => d.state === 'completed' || d.state === 'failed')
    if (allDone) {
      downloadAutoHideTimer.value = setTimeout(() => {
        if (activePanel.value === 'downloads') {
          activePanel.value = ''
        }
      }, 3000)
    }
  })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isFullscreen.value) {
      e.preventDefault()
      escPressTimer = setTimeout(async () => {
        await window.electronAPI?.toggleFullscreen()
        isFullscreen.value = await window.electronAPI?.windowIsFullscreen()
        isMaximized.value = await window.electronAPI?.windowIsMaximized()
      }, 1000)
    }
  })
  document.addEventListener('keyup', (e) => {
    if (e.key === 'Escape') {
      clearTimeout(escPressTimer)
    }
  })
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    systemDark.value = e.matches
  })
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
  if (backupInterval) clearInterval(backupInterval)
  if (suspendInterval) clearInterval(suspendInterval)
  if (downloadAutoHideTimer.value) clearTimeout(downloadAutoHideTimer.value)
})
</script>

<style scoped>
.browser {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-primary);
}

.content-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.content-area.split-mode {
  display: flex;
}

.tab-content {
  width: 100%;
  height: 100%;
}

.tab-content.split-half {
  width: 50%;
}

.tab-content.split-half:first-child {
  border-right: 1px solid var(--border-color);
}

.webview {
  width: 100%;
  height: 100%;
}

.suspended-overlay {
  position: absolute;
  inset: 0;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  cursor: pointer;
}
.suspended-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 14px;
}
.suspended-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 8px;
}
.suspended-hint {
  font-size: 12px;
  color: var(--border-color);
}

.tabs-left.browser {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: auto auto 1fr;
}

.sidebar-collapsed.tabs-left.browser {
  grid-template-columns: 48px 1fr;
}

.tabs-left :deep(.tab-bar) {
  grid-column: 1;
  grid-row: 2 / -1;
  flex-direction: column;
  width: 200px;
  padding: 4px;
  overflow-y: auto;
  overflow-x: hidden;
  border-right: 1px solid var(--border-color);
  align-items: stretch;
  gap: 2px;
  min-height: 0;
  transition: width 0.2s ease;
}

.sidebar-collapsed .tabs-left :deep(.tab-bar) {
  width: 48px;
  align-items: center;
  padding: 4px 0;
}

.tabs-left :deep(.tab) {
  width: 100%;
  max-width: none;
  min-width: 0;
  border-radius: 6px;
  padding: 8px 10px;
  height: 36px;
  flex-shrink: 0;
}

.sidebar-collapsed .tabs-left :deep(.tab) {
  width: 40px;
  height: 40px;
  padding: 8px;
  justify-content: center;
  border-radius: 6px;
}

.tabs-left :deep(.tab).active {
  border-left: 3px solid var(--accent);
  border-radius: 0 6px 6px 0;
}

.sidebar-collapsed .tabs-left :deep(.tab).active {
  border-left: none;
  border-radius: 6px;
}

.sidebar-collapsed .tabs-left :deep(.tab-icon) {
  margin-right: 0;
}

.tabs-left :deep(.tab-title) {
  font-size: 13px;
}

.tabs-left :deep(.tab-add) {
  width: 100%;
  margin-left: 0;
  border-radius: 6px;
  flex-shrink: 0;
}

.tabs-left :deep(.tab-split-btn) {
  width: 100%;
  margin-left: 0;
  border-radius: 6px;
  flex-shrink: 0;
}

.tabs-left :deep(.navbar) {
  grid-column: 2;
  grid-row: 2;
}

.tabs-left .content-area {
  grid-column: 2;
  grid-row: 3;
}

.tabs-left :deep(.find-bar) {
  grid-column: 2;
  grid-row: 3;
}
</style>
