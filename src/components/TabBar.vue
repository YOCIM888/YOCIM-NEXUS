<template>
  <div class="tab-bar">
    <div
      v-for="tab in tabs"
      :key="tab.id"
      :class="['tab', { active: tab.id === activeTabId, dragging: dragTabIndex !== null && tabs[dragTabIndex]?.id === tab.id }]"
      draggable="true"
      @click="$emit('switchTab', tab.id)"
      @contextmenu.prevent="$emit('contextmenu', $event, tab)"
      @dragstart="$emit('dragstart', $event, tab.id)"
      @dragover.prevent="$emit('dragover', tab.id)"
      @drop="$emit('drop', tab.id)"
      @dragend="$emit('dragend')"
    >
      <img v-if="tab.favicon" class="tab-icon" :class="{ loading: tab.isLoading }" :src="tab.favicon" @error="tab.favicon = ''" />
      <button v-if="tab.isAudioPlaying && !sidebarCollapsed" class="tab-audio" @click.stop="$emit('toggleMute', tab.id)">{{ tab.isMuted ? '🔇' : '🔊' }}</button>
      <button v-if="tab.isSuspended && !sidebarCollapsed" class="tab-freeze-icon" @click.stop="$emit('thawTab', tab.id)">❄️</button>
      <button v-else-if="!sidebarCollapsed" class="tab-freeze-btn" @click.stop="$emit('freezeTab', tab.id)"></button>
      <span v-if="!sidebarCollapsed" class="tab-title">{{ tab.title || 'New Tab' }}</span>
      <button v-if="!sidebarCollapsed" class="tab-close" @click.stop="$emit('closeTab', tab.id)">&times;</button>
    </div>
    <button v-if="!sidebarCollapsed" class="tab-add" @click="$emit('addTab')">+</button>
    <button v-if="!sidebarCollapsed" class="tab-split-btn" @click="$emit('toggleSplitView', activeTabId)" :title="'Split View'">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
    </button>
    <template v-if="tabsPosition !== 'left'">
      <div class="tab-bar-spacer"></div>
      <button class="win-btn win-minimize" @click="$emit('minimize')" title="最小化">─</button>
      <button class="win-btn win-maximize" @click="$emit('maximize')" :title="isMaximized ? '还原' : '最大化'">{{ isMaximized ? '❐' : '□' }}</button>
      <button class="win-btn win-close" @click="$emit('close')" title="关闭">✕</button>
    </template>
  </div>
</template>

<script setup>
defineProps({
  tabs: Array,
  activeTabId: [String, Number],
  sidebarCollapsed: Boolean,
  tabsPosition: String,
  isMaximized: Boolean,
  dragTabIndex: Number
})
defineEmits(['switchTab', 'closeTab', 'addTab', 'toggleSplitView', 'contextmenu', 'dragstart', 'dragover', 'drop', 'dragend', 'toggleMute', 'freezeTab', 'thawTab', 'minimize', 'maximize', 'close'])
</script>

<style scoped>
.tab-bar {
  display: flex;
  align-items: center;
  background: var(--bg-secondary);
  padding: 4px 8px 0;
  gap: 2px;
  min-height: 36px;
  -webkit-app-region: drag;
}

.tab {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background: transparent;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  max-width: 200px;
  min-width: 100px;
  -webkit-app-region: no-drag;
  transition: background 0.15s;
}

.tab:hover {
  background: var(--bg-hover);
}

.tab.active {
  background: var(--bg-primary);
}

.tab.dragging {
  opacity: 0.4;
}

.tab-icon {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  flex-shrink: 0;
  margin-right: 6px;
}

.tab-icon.loading {
  animation: tab-icon-spin 0.8s linear infinite;
}

@keyframes tab-icon-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.tab-title {
  flex: 1;
  font-size: 12px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tab-close {
  margin-left: 8px;
  font-size: 14px;
  color: var(--text-muted);
  padding: 0 2px;
  border-radius: 4px;
  line-height: 1;
  flex-shrink: 0;
}

.tab-close:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.tab-audio {
  font-size: 11px;
  padding: 0 2px;
  line-height: 1;
  flex-shrink: 0;
  -webkit-app-region: no-drag;
}

.tab-freeze-btn,
.tab-freeze-icon {
  font-size: 10px;
  padding: 0 2px;
  line-height: 1;
  flex-shrink: 0;
  -webkit-app-region: no-drag;
}

.tab-freeze-btn:hover {
  opacity: 0.8;
}

.tab-add {
  width: 28px;
  height: 28px;
  font-size: 18px;
  color: var(--text-secondary);
  border-radius: 6px;
  margin-left: 4px;
  -webkit-app-region: no-drag;
}

.tab-add:hover {
  background: var(--bg-tertiary);
}

.tab-split-btn {
  width: 28px;
  height: 28px;
  font-size: 14px;
  color: var(--text-secondary);
  border-radius: 6px;
  margin-left: 2px;
  -webkit-app-region: no-drag;
}

.tab-split-btn:hover {
  background: var(--bg-tertiary);
}

.tab-split-btn svg {
  width: 14px;
  height: 14px;
}

.tab-bar-spacer {
  flex: 1;
  -webkit-app-region: drag;
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
