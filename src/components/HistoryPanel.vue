<template>
  <div class="panel history-panel" :style="panelStyle" @click.stop>
    <div class="panel-header">
      <h3>{{ t('history') }}</h3>
      <div class="header-actions">
        <button v-if="filteredHistory.length" class="clear-all-btn" @click="handleClear">{{ t('clearAll') }}</button>
        <button class="close-btn" @click="$emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    <div class="search-bar">
      <input
        type="text"
        v-model="searchQuery"
        :placeholder="t('searchHistory')"
        class="search-input"
      />
    </div>
    <div class="panel-body">
      <div v-if="filteredHistory.length === 0" class="empty">{{ t('noHistory') }}</div>
      <div v-for="group in groupedHistory" :key="group.date">
        <div class="date-label">{{ group.date }}</div>
        <div
          v-for="entry in group.items"
          :key="entry.id"
          class="list-item"
          @click="$emit('navigate', entry.url)"
          @contextmenu.prevent="handleContextMenu($event, entry)"
        >
          <div class="item-info">
            <span class="item-title">{{ entry.title }}</span>
            <span class="item-url">{{ entry.url }}</span>
          </div>
          <span class="item-time">{{ formatTime(entry.time) }}</span>
        </div>
      </div>
    </div>
  </div>
  <Teleport to="body">
    <div v-if="contextMenu.show" class="context-menu" :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }" @click="closeContextMenu">
      <button @click="openInNewTab">{{ t('openInNewTab') }}</button>
      <button @click="openInNewWindow">{{ t('openInNewWindow') }}</button>
      <button @click="copyLink">{{ t('copyLink') }}</button>
      <button @click="deleteEntry">{{ t('delete') }}</button>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getHistory, clearHistory, removeHistoryEntry } from '../utils/storage'
import { useI18n } from '../utils/i18n'

const { t } = useI18n()
const emit = defineEmits(['close', 'navigate', 'openInNewWindow'])
defineProps({ panelStyle: { type: Object, default: () => ({}) } })

const history = ref([])
const searchQuery = ref('')
const contextMenu = ref({ show: false, x: 0, y: 0, entry: null })

onMounted(() => {
  history.value = getHistory()
  document.addEventListener('click', closeContextMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeContextMenu)
})

const filteredHistory = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return history.value
  return history.value.filter(e =>
    e.title.toLowerCase().includes(q) || e.url.toLowerCase().includes(q)
  )
})

const groupedHistory = computed(() => {
  const groups = {}
  for (const entry of filteredHistory.value) {
    const d = new Date(entry.time)
    const dateStr = d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
    if (!groups[dateStr]) groups[dateStr] = []
    groups[dateStr].push(entry)
  }
  return Object.entries(groups).map(([date, items]) => ({ date, items }))
})

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function handleClear() {
  history.value = clearHistory()
}

function handleContextMenu(e, entry) {
  contextMenu.value = { show: true, x: e.clientX, y: e.clientY, entry }
}

function closeContextMenu() {
  contextMenu.value.show = false
}

function openInNewTab() {
  if (contextMenu.value.entry) emit('navigate', contextMenu.value.entry.url)
  closeContextMenu()
}

function openInNewWindow() {
  if (contextMenu.value.entry) emit('openInNewWindow', contextMenu.value.entry.url)
  closeContextMenu()
}

function copyLink() {
  if (contextMenu.value.entry) navigator.clipboard.writeText(contextMenu.value.entry.url)
  closeContextMenu()
}

function deleteEntry() {
  if (contextMenu.value.entry) {
    history.value = removeHistoryEntry(contextMenu.value.entry.id)
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
  gap: 8px;
}

.clear-all-btn {
  font-size: 12px;
  color: var(--danger);
  padding: 4px 8px;
  border-radius: 4px;
}

.clear-all-btn:hover {
  background: var(--danger-bg);
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
  padding: 8px 16px;
  border-bottom: 1px solid var(--border-light);
}

.search-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
  background: var(--input-bg);
  color: var(--text-primary);
}

.search-input:focus {
  border-color: var(--accent);
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

.date-label {
  padding: 8px 16px;
  font-size: 12px;
  color: var(--text-muted);
  background: var(--bg-secondary);
  font-weight: 500;
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

.item-time {
  font-size: 11px;
  color: var(--border-color);
  flex-shrink: 0;
  margin-left: 8px;
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
