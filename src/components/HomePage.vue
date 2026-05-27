<template>
  <div class="home-page" :style="bgStyle" @contextmenu.prevent="handlePageRightClick">
    <div class="home-content">
      <div class="logo-area" v-if="!hideLogo">
        <img class="logo-img" src="/icon/yocim.jpg" alt="LOGO" />
        <span class="logo-text">YOCIM NEXUS</span>
      </div>
      <div class="search-box-wrapper">
        <div class="search-box">
          <input
            type="text"
            v-model="query"
            :placeholder="t('search')"
            @keyup.enter="search()"
            @input="onQueryInput"
            @blur="hideSuggestions"
            @focus="onQueryFocus"
            @contextmenu.stop
          />
          <button v-if="query" class="clear-btn" @click="query = ''; suggestions = []; showSuggestions = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <button class="search-btn" @click="search()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
        </div>
        <div v-if="showSuggestions && suggestions.length" class="suggestions">
          <div v-for="s in suggestions" :key="s" class="suggestion-item" @mousedown.prevent="selectSuggestion(s)">
            <svg class="suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <span>{{ s }}</span>
          </div>
        </div>
      </div>
      <div class="nav-grid" v-if="!hideIcons">
        <div
          v-for="(site, index) in sites"
          :key="site.id"
          class="nav-card"
          draggable="true"
          @click="$emit('navigate', site.url)"
          @contextmenu.prevent.stop="handleRightClick(site, $event)"
          @dragstart="onDragStart(index, $event)"
          @dragover.prevent="onDragOver(index)"
          @drop="onDrop(index)"
          @dragend="onDragEnd"
        >
          <div class="nav-icon">
            <img v-if="site.icon" :src="site.icon" :alt="site.name" @error="onIconError" />
            <span v-else class="fallback">{{ site.name.charAt(0) }}</span>
          </div>
          <span class="nav-name">{{ site.name }}</span>
        </div>
        <div class="nav-card add-card" @click="openAddForm">
          <div class="nav-icon add-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          <span class="nav-name">{{ t('add') }}</span>
        </div>
      </div>
    </div>

    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal">
        <h3>{{ isEditing ? t('editNav') : t('addNav') }}</h3>
        <input v-model="formData.name" :placeholder="t('name')" />
        <input v-model="formData.url" :placeholder="t('url')" />
        <input v-model="formData.icon" :placeholder="t('iconUrl')" />
        <div class="modal-actions">
          <button class="btn-cancel" @click="showForm = false">{{ t('cancel') }}</button>
          <button class="btn-confirm" @click="submitForm">{{ isEditing ? t('save') : t('add') }}</button>
        </div>
      </div>
    </div>

    <div v-if="contextMenu.show" class="context-menu" :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }">
      <button @click="openSiteInNewTab">{{ t('openInNewTab') }}</button>
      <button @click="openSiteInNewWindow">{{ t('openInNewWindow') }}</button>
      <button @click="openSiteInSplitView">{{ t('openInSplitView') }}</button>
      <button @click="editSite(contextMenu.siteId)">{{ t('edit') }}</button>
      <button @click="deleteSite(contextMenu.siteId)">{{ t('delete') }}</button>
    </div>

    <div v-if="pageContextMenu.show" class="context-menu" :style="{ left: pageContextMenu.x + 'px', top: pageContextMenu.y + 'px' }">
      <button @click="refreshPageHandler">{{ t('refreshPage') }}</button>
      <button @click="$emit('print')">{{ t('print') }}</button>
      <button @click="viewBackground" :disabled="!bgDataUrl">{{ t('viewBackground') }}</button>
      <button @click="changeBackground">{{ t('changeBackground') }}</button>
      <button @click="toggleDarkMode">{{ isDarkMode ? t('light') : t('dark') }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import { getNavSites, addNavSite, removeNavSite, updateNavSite, saveNavSites, getSettings, updateSettings, SEARCH_ENGINES } from '../utils/storage'
import { useI18n } from '../utils/i18n'

const { t } = useI18n()
const emit = defineEmits(['navigate', 'openInNewTab', 'openInNewWindow', 'openInSplitView', 'print'])

const query = ref('')
const sites = ref([])
const showForm = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const formData = ref({ name: '', url: '', icon: '' })
const contextMenu = ref({ show: false, x: 0, y: 0, siteId: null, siteUrl: '' })
const pageContextMenu = ref({ show: false, x: 0, y: 0 })
const isDarkMode = ref(getSettings().theme === 'dark')
const dragIndex = ref(null)
const suggestions = ref([])
const showSuggestions = ref(false)
const bgDataUrl = ref('')

const refreshSettings = inject('refreshSettings', () => {})
const hideLogo = inject('hideLogo', false)
const hideIcons = inject('hideIcons', false)

let suggestTimer = null

const bgStyle = computed(() => {
  if (bgDataUrl.value) {
    return { backgroundImage: `url(${bgDataUrl.value})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  }
  return {}
})

async function loadBackground() {
  const settings = getSettings()
  if (settings.background) {
    try {
      const dataUrl = await window.electronAPI?.readFileAsBase64(settings.background)
      bgDataUrl.value = dataUrl || ''
    } catch (e) {
      bgDataUrl.value = ''
    }
  } else {
    bgDataUrl.value = ''
  }
}

onMounted(() => {
  sites.value = getNavSites()
  document.addEventListener('click', closeContextMenu)
  loadBackground()
})

onUnmounted(() => {
  document.removeEventListener('click', closeContextMenu)
})

function search(queryText) {
  const q = (queryText || query.value).trim()
  if (!q) return
  const engine = getSettings().searchEngine || 'bing'
  const searchUrl = SEARCH_ENGINES[engine]?.searchUrl || SEARCH_ENGINES.bing.searchUrl
  emit('navigate', searchUrl + encodeURIComponent(q))
}

function onQueryInput() {
  clearTimeout(suggestTimer)
  suggestions.value = []
  showSuggestions.value = false
  if (!query.value.trim() || query.value.trim().length < 2) return
  suggestTimer = setTimeout(async () => {
    try {
      const suggestUrl = `https://www.baidu.com/sugrec?prod=pc&wd=${encodeURIComponent(query.value.trim())}`
      const data = await window.electronAPI?.fetchSuggestions(suggestUrl)
      if (data && data.g && Array.isArray(data.g)) {
        suggestions.value = data.g.map(s => s.q)
        showSuggestions.value = suggestions.value.length > 0
      }
    } catch (e) {
    }
  }, 300)
}

function selectSuggestion(text) {
  query.value = text
  showSuggestions.value = false
  suggestions.value = []
  search(text)
}

function hideSuggestions() {
  setTimeout(() => { showSuggestions.value = false }, 200)
}

function onQueryFocus() {
  if (suggestions.value.length > 0) showSuggestions.value = true
}

function openAddForm() {
  isEditing.value = false
  editingId.value = null
  formData.value = { name: '', url: '', icon: '' }
  showForm.value = true
}

function editSite(id) {
  const site = sites.value.find(s => s.id === id)
  if (!site) return
  isEditing.value = true
  editingId.value = id
  formData.value = { name: site.name, url: site.url, icon: site.icon || '' }
  contextMenu.value.show = false
  showForm.value = true
}

function submitForm() {
  const { name, url, icon } = formData.value
  if (!name.trim() || !url.trim()) return
  if (isEditing.value && editingId.value) {
    sites.value = updateNavSite(editingId.value, { name: name.trim(), url: url.trim(), icon: icon.trim() })
  } else {
    sites.value = addNavSite({ name: name.trim(), url: url.trim(), icon: icon.trim() })
  }
  formData.value = { name: '', url: '', icon: '' }
  showForm.value = false
}

function deleteSite(id) {
  sites.value = removeNavSite(id)
  contextMenu.value.show = false
}

function openSiteInNewTab() {
  contextMenu.value.show = false
  emit('openInNewTab', contextMenu.value.siteUrl)
}

function openSiteInNewWindow() {
  contextMenu.value.show = false
  emit('openInNewWindow', contextMenu.value.siteUrl)
}

function openSiteInSplitView() {
  contextMenu.value.show = false
  emit('openInSplitView', contextMenu.value.siteUrl)
}

function handleRightClick(site, e) {
  e.stopPropagation()
  pageContextMenu.value.show = false
  contextMenu.value = { show: true, x: e.clientX, y: e.clientY, siteId: site.id, siteUrl: site.url }
}

function closeContextMenu() {
  contextMenu.value.show = false
  pageContextMenu.value.show = false
}

function handlePageRightClick(e) {
  // 只在点击空白区域（非导航卡片）时显示
  pageContextMenu.value = { show: true, x: e.clientX, y: e.clientY }
  isDarkMode.value = getSettings().theme === 'dark'
}

function toggleDarkMode() {
  const newTheme = isDarkMode.value ? 'light' : 'dark'
  updateSettings({ theme: newTheme })
  isDarkMode.value = !isDarkMode.value
  refreshSettings()
  pageContextMenu.value.show = false
}

async function changeBackground() {
  pageContextMenu.value.show = false
  const result = await window.electronAPI?.selectFile([{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'] }])
  if (!result) return
  updateSettings({ background: result })
  refreshSettings()
  loadBackground()
}

function refreshPageHandler() {
  pageContextMenu.value.show = false
  window.location.reload()
}

function viewBackground() {
  pageContextMenu.value.show = false
  const settings = getSettings()
  if (settings.background) {
    emit('navigate', 'file:///' + settings.background.replace(/\\/g, '/'))
  }
}

function onDragStart(index, e) {
  dragIndex.value = index
  e.dataTransfer.effectAllowed = 'move'
}

function onDragOver(index) {
  if (dragIndex.value === null || dragIndex.value === index) return
  const list = [...sites.value]
  const item = list.splice(dragIndex.value, 1)[0]
  list.splice(index, 0, item)
  sites.value = list
  dragIndex.value = index
}

function onDrop(index) {
  saveNavSites(sites.value)
  dragIndex.value = null
}

function onDragEnd() {
  dragIndex.value = null
}

function onIconError(e) {
  e.target.style.display = 'none'
  const fallback = e.target.parentElement.querySelector('.fallback')
  if (fallback) fallback.style.display = 'flex'
}
</script>

<style scoped>
.home-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding-bottom: 25vh;
  background: var(--bg-primary);
  position: relative;
  box-sizing: border-box;
}

.home-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 900px;
  padding: 0 20px;
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

.logo-img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 12px;
}

.logo-text {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 4px;
  background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.search-box-wrapper {
  position: relative;
  width: 100%;
  max-width: 500px;
  margin-bottom: 40px;
}

.search-box {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 16px;
  background: var(--input-bg);
  border-radius: 24px;
}

.search-box input {
  flex: 1;
  background: transparent;
  border: none;
  font-size: 15px;
  color: var(--text-primary);
  outline: none;
}

.search-box input::placeholder {
  color: var(--text-muted);
}

.clear-btn {
  color: var(--text-muted);
  padding: 4px;
  margin-right: 4px;
}

.clear-btn svg {
  width: 16px;
  height: 16px;
}

.search-btn {
  color: var(--text-muted);
  padding: 4px;
}

.search-btn:hover {
  color: var(--accent);
}

.search-btn svg {
  width: 18px;
  height: 18px;
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-primary);
  border-radius: 0 0 16px 16px;
  box-shadow: 0 4px 16px var(--modal-shadow);
  z-index: 10;
  overflow: hidden;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-primary);
  gap: 10px;
}

.suggestion-item:hover {
  background: var(--bg-tertiary);
}

.suggestion-icon {
  width: 16px;
  height: 16px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(10, 80px);
  gap: 16px;
  justify-content: center;
}

.nav-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
  user-select: none;
}

.nav-card:hover {
  background: var(--bg-tertiary);
}

.nav-card[draggable="true"] {
  cursor: grab;
}

.nav-card[draggable="true"]:active {
  cursor: grabbing;
}

.nav-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
  overflow: hidden;
}

.nav-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 6px;
}

.nav-icon .fallback {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-secondary);
  display: none;
}

.add-icon {
  background: transparent;
  color: var(--accent);
}

.add-icon svg {
  width: 20px;
  height: 20px;
}

.nav-name {
  font-size: 12px;
  color: var(--text-primary);
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.add-card {
  border: 2px dashed var(--border-color);
}

.add-card:hover {
  border-color: var(--accent);
  background: rgba(74, 144, 217, 0.05);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 24px;
  width: 360px;
  box-shadow: 0 8px 30px var(--modal-shadow);
}

.modal h3 {
  margin-bottom: 16px;
  font-size: 16px;
  color: var(--text-primary);
}

.modal input {
  display: block;
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: var(--input-bg);
  color: var(--text-primary);
}

.modal input:focus {
  border-color: var(--accent);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.btn-cancel {
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 14px;
  color: var(--text-secondary);
}

.btn-cancel:hover {
  background: var(--bg-tertiary);
}

.btn-confirm {
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 14px;
  background: var(--accent);
  color: #fff;
}

.btn-confirm:hover {
  background: var(--accent-hover);
}

.context-menu {
  position: fixed;
  background: var(--bg-primary);
  border-radius: 8px;
  box-shadow: 0 4px 16px var(--modal-shadow);
  z-index: 200;
  overflow: hidden;
  min-width: 80px;
}

.context-menu button {
  display: block;
  width: 100%;
  padding: 8px 20px;
  font-size: 13px;
  color: var(--text-primary);
  text-align: left;
}

.context-menu button:hover {
  background: var(--bg-tertiary);
}

.context-menu button:last-child:hover {
  color: var(--danger);
}
</style>
