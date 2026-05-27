import { ref, computed } from 'vue'
import { getSettings, updateSettings, isBookmarked } from '../utils/storage'

export function useSettings() {
  const reactiveSettings = ref(getSettings())

  const tabsPosition = computed({
    get: () => reactiveSettings.value.tabsPosition || 'top',
    set: (val) => {
      reactiveSettings.value = { ...reactiveSettings.value, tabsPosition: val }
      updateSettings({ tabsPosition: val })
      if (val === 'top') {
        sidebarCollapsed.value = false
      }
    }
  })

  const sidebarCollapsed = computed({
    get: () => reactiveSettings.value.sidebarCollapsed || false,
    set: (val) => {
      reactiveSettings.value = { ...reactiveSettings.value, sidebarCollapsed: val }
      updateSettings({ sidebarCollapsed: val })
    }
  })

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const systemDark = ref(window.matchMedia?.('(prefers-color-scheme: dark)').matches || false)

  const isDark = computed(() => {
    const s = reactiveSettings.value
    if (s.theme === 'system') {
      return systemDark.value
    }
    return s.theme === 'dark'
  })

  const LIGHT_VARS = {
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#f5f5f5',
    '--bg-tertiary': '#e0e0e0',
    '--bg-hover': '#eaeaea',
    '--text-primary': '#333333',
    '--text-secondary': '#666666',
    '--text-muted': '#999999',
    '--border-color': '#e0e0e0',
    '--border-light': '#f0f0f0',
    '--input-bg': '#f5f5f5',
    '--input-focus-bg': '#ffffff',
    '--accent': '#4a90d9',
    '--accent-hover': '#3a7bc8',
    '--danger': '#e74c3c',
    '--danger-hover': '#c0392b',
    '--modal-shadow': 'rgba(0,0,0,0.1)',
    '--overlay-bg': 'rgba(0,0,0,0.3)',
  }

  const DARK_VARS = {
    '--bg-primary': '#1e1e1e',
    '--bg-secondary': '#252526',
    '--bg-tertiary': '#3c3c3c',
    '--bg-hover': '#2d2d2d',
    '--text-primary': '#e0e0e0',
    '--text-secondary': '#aaaaaa',
    '--text-muted': '#777777',
    '--border-color': '#3c3c3c',
    '--border-light': '#2d2d2d',
    '--input-bg': '#2d2d2d',
    '--input-focus-bg': '#1e1e1e',
    '--accent': '#5a9fd4',
    '--accent-hover': '#4a8fc4',
    '--danger': '#e74c3c',
    '--danger-hover': '#c0392b',
    '--modal-shadow': 'rgba(0,0,0,0.4)',
    '--overlay-bg': 'rgba(0,0,0,0.6)',
  }

  function applyCustomTheme() {
    const s = reactiveSettings.value
    if (s.theme === 'custom' && s.customTheme) {
      const ct = s.customTheme
      for (const key of Object.keys(LIGHT_VARS)) {
        if (ct[key]) {
          document.documentElement.style.setProperty(key, ct[key])
        }
      }
    } else {
      for (const key of Object.keys(LIGHT_VARS)) {
        document.documentElement.style.removeProperty(key)
      }
    }
  }

  const bookmarkPanelStyle = computed(() => ({
    width: (reactiveSettings.value.bookmarkPanelWidth || 360) + 'px',
    background: reactiveSettings.value.bookmarkPanelBg || undefined,
  }))
  const readingListPanelStyle = computed(() => ({
    width: (reactiveSettings.value.readingListPanelWidth || 360) + 'px',
    background: reactiveSettings.value.readingListPanelBg || undefined,
  }))
  const historyPanelStyle = computed(() => ({
    width: (reactiveSettings.value.historyPanelWidth || 360) + 'px',
    background: reactiveSettings.value.historyPanelBg || undefined,
  }))
  const downloadPanelStyle = computed(() => ({
    width: (reactiveSettings.value.downloadPanelWidth || 380) + 'px',
    background: reactiveSettings.value.downloadPanelBg || undefined,
  }))
  const notesPanelStyle = computed(() => ({
    width: (reactiveSettings.value.notesPanelWidth || 360) + 'px',
    background: reactiveSettings.value.notesPanelBg || undefined,
  }))

  const bookmarkVersion = ref(0)

  function isCurrentBookmarked(activeTab) {
    bookmarkVersion.value
    if (!activeTab || activeTab.isHome || activeTab.url === 'yocim://settings') return false
    return isBookmarked(activeTab.url)
  }

  return {
    reactiveSettings, tabsPosition, sidebarCollapsed, toggleSidebar,
    systemDark, isDark, LIGHT_VARS, DARK_VARS, applyCustomTheme,
    bookmarkPanelStyle, readingListPanelStyle, historyPanelStyle,
    downloadPanelStyle, notesPanelStyle,
    bookmarkVersion, isCurrentBookmarked
  }
}
