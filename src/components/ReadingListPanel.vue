<template>
  <div class="panel reading-list-panel" :style="panelStyle" @click.stop>
    <div class="panel-header">
      <h3>{{ t('readingList') }}</h3>
      <div class="header-actions">
        <button class="icon-btn" :class="{ active: showSearch }" @click="toggleSearch" :title="t('searchReadingList')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
        <button class="close-btn" @click="$emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    <div v-if="showSearch" class="search-bar">
      <svg class="search-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input v-model="searchQuery" :placeholder="t('searchReadingList')" class="search-input" />
    </div>
    <div class="panel-body">
      <div v-if="filteredReadingList.length === 0" class="empty">{{ t('noReadingList') }}</div>
      <div
        v-for="item in filteredReadingList"
        :key="item.id"
        class="list-item"
        @click="$emit('navigate', item.url)"
        @contextmenu.prevent="handleContextMenu($event, item)"
      >
        <div class="item-info">
          <span class="item-title">{{ item.title }}</span>
          <span class="item-url">{{ item.url }}</span>
        </div>
      </div>
    </div>
    <Teleport to="body">
      <div v-if="contextMenu.show" class="context-menu" :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }" @click="closeContextMenu">
        <button @click="openInNewTab">{{ t('openInNewTab') }}</button>
        <button @click="openInNewWindow">{{ t('openInNewWindow') }}</button>
        <button @click="copyLink">{{ t('copyLink') }}</button>
        <button @click="deleteItem">{{ t('delete') }}</button>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getReadingList, removeFromReadingList } from '../utils/storage'
import { useI18n } from '../utils/i18n'

const { t } = useI18n()
const emit = defineEmits(['close', 'navigate', 'openInNewWindow'])
defineProps({ panelStyle: { type: Object, default: () => ({}) } })

const readingList = ref([])
const showSearch = ref(false)
const searchQuery = ref('')
const contextMenu = ref({ show: false, x: 0, y: 0, item: null })

onMounted(() => {
  readingList.value = getReadingList()
  document.addEventListener('click', closeContextMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeContextMenu)
})

const filteredReadingList = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return readingList.value
  return readingList.value.filter(item =>
    item.title.toLowerCase().includes(q) || item.url.toLowerCase().includes(q)
  )
})

function toggleSearch() {
  showSearch.value = !showSearch.value
  if (!showSearch.value) searchQuery.value = ''
}

function handleContextMenu(e, item) {
  contextMenu.value = { show: true, x: e.clientX, y: e.clientY, item }
}

function closeContextMenu() {
  contextMenu.value.show = false
}

function openInNewTab() {
  if (contextMenu.value.item) emit('navigate', contextMenu.value.item.url)
  closeContextMenu()
}

function openInNewWindow() {
  if (contextMenu.value.item) emit('openInNewWindow', contextMenu.value.item.url)
  closeContextMenu()
}

function copyLink() {
  if (contextMenu.value.item) navigator.clipboard.writeText(contextMenu.value.item.url)
  closeContextMenu()
}

function deleteItem() {
  if (contextMenu.value.item) {
    readingList.value = removeFromReadingList(contextMenu.value.item.id)
  }
  closeContextMenu()
}
</script>

<style scoped>
.panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 360px;
  height: 100%;
  background: var(--bg-primary);
  border-left: 1px solid var(--border-color);
  z-index: 50;
  display: flex;
  flex-direction: column;
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}
.panel-header h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
.icon-btn {
  color: var(--text-muted);
  padding: 4px;
  border-radius: 4px;
}
.icon-btn svg {
  width: 18px;
  height: 18px;
}
.icon-btn:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}
.icon-btn.active {
  color: var(--accent);
  background: var(--accent-bg);
}
.close-btn {
  color: var(--text-muted);
  padding: 4px;
}
.close-btn svg {
  width: 18px;
  height: 18px;
}
.close-btn:hover {
  color: var(--text-primary);
}
.search-bar {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  gap: 8px;
  border-bottom: 1px solid var(--border-color);
}
.search-icon-sm {
  width: 16px;
  height: 16px;
  color: var(--text-muted);
  flex-shrink: 0;
}
.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 13px;
  background: transparent;
  color: var(--text-primary);
}
.search-input::placeholder {
  color: var(--text-muted);
}
.panel-body {
  flex: 1;
  overflow-y: auto;
}
.empty {
  padding: 40px 16px;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
}
.list-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.15s;
}
.list-item:hover {
  background: var(--bg-tertiary);
}
.item-info {
  flex: 1;
  min-width: 0;
}
.item-title {
  display: block;
  font-size: 13px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-url {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
}
.context-menu {
  position: fixed;
  background: var(--bg-primary);
  border-radius: 8px;
  box-shadow: 0 4px 16px var(--modal-shadow);
  z-index: 200;
  overflow: hidden;
  min-width: 120px;
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
