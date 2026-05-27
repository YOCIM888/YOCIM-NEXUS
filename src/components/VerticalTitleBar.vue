<template>
  <div class="vertical-title-bar">
    <button class="sidebar-toggle-btn" @click="$emit('toggleSidebar')" :title="sidebarCollapsed ? 'Expand' : 'Collapse'">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <line x1="9" y1="3" x2="9" y2="21"/>
      </svg>
    </button>
    <div class="vertical-title-info">
      <img v-if="activeTab?.favicon && !activeTab?.isHome" class="vertical-title-favicon" :src="activeTab.favicon" @error="activeTab.favicon = ''" />
      <span class="vertical-title-text">{{ activeTab?.isHome ? 'YOCIM NEXUS' : (activeTab?.title || t('newTab')) }}</span>
    </div>
    <button class="win-btn win-minimize" @click="$emit('minimize')" title="最小化">─</button>
    <button class="win-btn win-maximize" @click="$emit('maximize')" :title="isMaximized ? '还原' : '最大化'">{{ isMaximized ? '❐' : '□' }}</button>
    <button class="win-btn win-close" @click="$emit('close')" title="关闭">✕</button>
  </div>
</template>

<script setup>
import { useI18n } from '../utils/i18n'
const { t } = useI18n()
defineProps({
  activeTab: Object,
  sidebarCollapsed: Boolean,
  isMaximized: Boolean
})
defineEmits(['toggleSidebar', 'minimize', 'maximize', 'close'])
</script>

<style scoped>
.vertical-title-bar {
  grid-column: 1 / -1;
  grid-row: 1;
  display: flex;
  align-items: center;
  height: 36px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  -webkit-app-region: drag;
  padding: 0;
}

.sidebar-toggle-btn {
  -webkit-app-region: no-drag;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  flex-shrink: 0;
  border-radius: 4px;
}

.sidebar-toggle-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.vertical-title-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  padding: 0 8px;
  -webkit-app-region: drag;
}

.vertical-title-favicon {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  flex-shrink: 0;
}

.vertical-title-text {
  font-size: 12px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.win-btn {
  -webkit-app-region: no-drag;
  width: 46px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--text-primary);
  transition: background 0.15s;
  flex-shrink: 0;
}

.win-btn:hover {
  background: var(--bg-tertiary);
}

.win-close:hover {
  background: #e81123;
  color: #fff;
}
</style>
