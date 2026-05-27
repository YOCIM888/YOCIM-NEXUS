<template>
  <Teleport to="body">
    <div v-if="show" class="tab-context-menu-overlay" @click="$emit('close')" @contextmenu.prevent="$emit('close')">
      <div class="tab-context-menu" :style="{ left: x + 'px', top: y + 'px' }">
        <button @click="$emit('reload', tab)">{{ t('refresh') }}</button>
        <button @click="$emit('duplicate', tab)">{{ t('duplicateTab') }}</button>
        <button @click="$emit('pin', tab)">{{ tab?.isPinned ? t('unpinTab') : t('pinTab') }}</button>
        <button @click="$emit('mute', tab)">{{ tab?.isMuted ? t('unmuteTab') : t('muteTab') }}</button>
        <button @click.stop="$emit('togglePosition')">{{ tabsPosition === 'left' ? t('switchToHorizontal') : t('switchToVertical') }}</button>
        <button @click="$emit('closeOther', tab)">{{ t('closeOtherTabs') }}</button>
        <button @click="$emit('closeTab', tab)">{{ t('close') }}</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useI18n } from '../utils/i18n'
const { t } = useI18n()
defineProps({
  show: Boolean,
  x: Number,
  y: Number,
  tab: Object,
  tabsPosition: String
})
defineEmits(['close', 'reload', 'duplicate', 'pin', 'mute', 'togglePosition', 'closeOther', 'closeTab'])
</script>

<style scoped>
.tab-context-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: transparent;
  transform: translateZ(0);
  -webkit-app-region: no-drag;
}

.tab-context-menu {
  position: fixed;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 4px;
  min-width: 150px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  z-index: 10000;
  transform: translateZ(0);
  -webkit-app-region: no-drag;
}

.tab-context-menu button {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 14px;
  font-size: 13px;
  color: var(--text-primary);
  border-radius: 4px;
  cursor: pointer;
  background: transparent;
  border: none;
}

.tab-context-menu button:hover {
  background: var(--bg-tertiary);
}
</style>
