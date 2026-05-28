<template>
  <div class="panel download-panel" :style="panelStyle" @click.stop>
    <div class="panel-header">
      <h3>{{ t('downloads') }}</h3>
      <div class="header-actions">
        <button class="icon-btn" @click="handleViewFolder" :title="t('viewFolder')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><polyline points="12 11 12 17"/><polyline points="9 14 15 14"/></svg>
        </button>
        <button class="icon-btn" :class="{ active: showSearch }" @click="toggleSearch" :title="t('searchDownloads')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
        <button class="icon-btn" @click="$emit('clearAll')" :title="t('clearDownloads')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
        <button class="close-btn" @click="$emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    <div v-if="showSearch" class="search-bar">
      <svg class="search-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input v-model="searchQuery" :placeholder="t('searchDownloads')" class="search-input" />
    </div>
    <div class="panel-body">
      <div v-if="filteredDownloads.length === 0" class="empty">{{ t('noDownloads') }}</div>
      <div
        v-for="item in filteredDownloads"
        :key="item.id"
        class="download-item"
        @dblclick="openLocation(item)"
      >
        <div class="item-info">
          <span class="item-name">{{ item.fileName }}</span>
          <div class="progress-row">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: getProgress(item) + '%' }"></div>
            </div>
            <span class="progress-text">{{ getProgress(item).toFixed(0) }}%</span>
            <span v-if="item.state === 'downloading' && item.speed" class="speed-text">{{ formatSpeed(item.speed) }}</span>
          </div>
          <span class="item-status">{{ getStatusText(item) }}</span>
        </div>
        <div class="item-actions">
          <button v-if="item.state === 'downloading'" class="action-btn" @click.stop="pauseDownload(item)" :title="t('pause')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          </button>
          <button v-if="item.state === 'paused'" class="action-btn" @click.stop="resumeDownload(item)" :title="t('resume')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </button>
          <button class="action-btn delete-btn" @click.stop="removeItem(item.id)" :title="t('delete')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from '../utils/i18n'

const { t } = useI18n()
const props = defineProps({
  downloads: { type: Array, default: () => [] },
  panelStyle: { type: Object, default: () => ({}) },
  downloadPath: { type: String, default: '' }
})
const emit = defineEmits(['close', 'pause', 'resume', 'remove', 'open-location', 'clearAll', 'openDownloadFolder'])

const showSearch = ref(false)
const searchQuery = ref('')

const filteredDownloads = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return props.downloads
  return props.downloads.filter(item =>
    item.fileName.toLowerCase().includes(q)
  )
})

function toggleSearch() {
  showSearch.value = !showSearch.value
  if (!showSearch.value) searchQuery.value = ''
}

function handleViewFolder() {
  if (props.downloadPath) {
    emit('openDownloadFolder', props.downloadPath)
  } else {
    alert(t('downloadFolderNotSet'))
  }
}

function getProgress(item) {
  if (!item.totalBytes || item.totalBytes === 0) return 0
  return (item.receivedBytes / item.totalBytes) * 100
}

function getStatusText(item) {
  const map = {
    downloading: t('downloading'),
    paused: t('paused'),
    completed: t('completed'),
    failed: t('failed'),
  }
  return map[item.state] || item.state
}

function formatSpeed(bytesPerSec) {
  if (!bytesPerSec || bytesPerSec < 0) return ''
  if (bytesPerSec >= 1048576) return (bytesPerSec / 1048576).toFixed(1) + ' MB/s'
  if (bytesPerSec >= 1024) return (bytesPerSec / 1024).toFixed(0) + ' KB/s'
  return bytesPerSec.toFixed(0) + ' B/s'
}

function pauseDownload(item) {
  emit('pause', item)
}

function resumeDownload(item) {
  emit('resume', item)
}

function removeItem(id) {
  emit('remove', id)
}

function openLocation(item) {
  if (item.filePath) {
    emit('open-location', item.filePath)
  }
}
</script>

<style scoped>
.panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 380px;
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

.download-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid var(--border-light);
}

.download-item:hover {
  background: var(--bg-tertiary);
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  display: block;
  font-size: 13px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 6px;
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 11px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.speed-text {
  font-size: 11px;
  color: var(--accent);
  flex-shrink: 0;
}

.item-status {
  font-size: 11px;
  color: var(--text-muted);
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
}

.action-btn {
  color: var(--text-muted);
  padding: 4px;
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

.action-btn:hover {
  color: var(--text-primary);
}

.delete-btn:hover {
  color: var(--danger);
}
</style>
