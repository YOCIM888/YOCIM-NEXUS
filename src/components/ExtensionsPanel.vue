<template>
  <div class="panel extensions-panel" :style="panelStyle" @click.stop>
    <div class="panel-header">
      <h3>{{ t('extensions') }}</h3>
      <div class="header-actions">
        <button class="icon-btn" @click="handleInstall" :title="t('installExtension')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        </button>
        <button class="close-btn" @click="$emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>

    <div class="panel-body">
      <div v-if="extensions.length === 0" class="empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/></svg>
        <span>{{ t('noExtensions') }}</span>
      </div>

      <div
        v-for="ext in extensions"
        :key="ext.id"
        :class="['ext-item', { disabled: !ext.enabled }]"
      >
        <div class="ext-icon">
          <img v-if="ext.icon" :src="ext.icon" alt="" />
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/></svg>
        </div>
        <div class="ext-info">
          <span class="ext-name">{{ ext.name }}</span>
          <span class="ext-version">{{ ext.version }}</span>
        </div>
        <div class="ext-actions">
          <label class="toggle small-toggle">
            <input type="checkbox" :checked="ext.enabled" @change="handleToggle(ext)" />
            <span class="toggle-slider"></span>
          </label>
          <button class="btn-danger-sm" @click="confirmUninstall(ext)" :title="t('uninstallExtension')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    </div>

    <div v-if="showUninstallConfirm" class="modal-overlay" @click.self="showUninstallConfirm = null">
      <div class="modal">
        <h3>{{ t('uninstallExtension') }}</h3>
        <p>{{ t('uninstallConfirm') }}</p>
        <p class="ext-name-confirm">{{ showUninstallConfirm.name }}</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showUninstallConfirm = null">{{ t('cancel') }}</button>
          <button class="btn-danger" @click="doUninstall">{{ t('delete') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from '../utils/i18n'

const { t } = useI18n()
defineProps({ panelStyle: { type: Object, default: () => ({}) } })
const emit = defineEmits(['close'])

const extensions = ref([])
const showUninstallConfirm = ref(null)

let installedHandler = null

onMounted(async () => {
  const list = await window.electronAPI?.extensionsList()
  if (list) extensions.value = list
  installedHandler = (data) => {
    extensions.value.push({ ...data, enabled: true })
  }
  window.electronAPI?.onExtensionInstalled(installedHandler)
})

onUnmounted(() => {
  if (installedHandler) {
    window.electronAPI?.onExtensionInstalled(() => {})
  }
})

async function refreshList() {
  const list = await window.electronAPI?.extensionsList()
  if (list) extensions.value = list
}

async function handleInstall() {
  const result = await window.electronAPI?.extensionsInstall()
  if (result) {
    await refreshList()
  }
}

async function handleToggle(ext) {
  const newState = !ext.enabled
  await window.electronAPI?.extensionsToggle(ext.id, newState)
  ext.enabled = newState
}

function confirmUninstall(ext) {
  showUninstallConfirm.value = ext
}

async function doUninstall() {
  const ext = showUninstallConfirm.value
  showUninstallConfirm.value = null
  if (!ext) return
  await window.electronAPI?.extensionsRemove(ext.id)
  extensions.value = extensions.value.filter(e => e.id !== ext.id)
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

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.empty {
  padding: 40px 16px;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-icon {
  width: 40px;
  height: 40px;
  opacity: 0.4;
}

.ext-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  gap: 12px;
  transition: background 0.15s;
}

.ext-item:hover {
  background: var(--bg-tertiary);
}

.ext-item.disabled {
  opacity: 0.5;
}

.ext-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ext-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.ext-icon svg {
  width: 18px;
  height: 18px;
  color: var(--text-muted);
}

.ext-info {
  flex: 1;
  min-width: 0;
}

.ext-name {
  display: block;
  font-size: 13px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ext-version {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}

.ext-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.small-toggle {
  transform: scale(0.75);
  transform-origin: right center;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: var(--bg-tertiary);
  border-radius: 20px;
  transition: background 0.2s;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background: var(--text-primary);
  border-radius: 50%;
  transition: transform 0.2s;
}

.toggle input:checked + .toggle-slider {
  background: var(--accent);
}

.toggle input:checked + .toggle-slider::before {
  transform: translateX(16px);
  background: #fff;
}

.btn-danger-sm {
  color: var(--text-muted);
  padding: 4px;
  border-radius: 4px;
}

.btn-danger-sm svg {
  width: 16px;
  height: 16px;
}

.btn-danger-sm:hover {
  color: var(--danger);
  background: var(--bg-tertiary);
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
  width: 320px;
  box-shadow: 0 8px 30px var(--modal-shadow);
}

.modal h3 {
  margin-bottom: 12px;
  font-size: 16px;
  color: var(--text-primary);
}

.modal p {
  color: var(--text-secondary);
  font-size: 13px;
  margin-bottom: 8px;
}

.ext-name-confirm {
  font-weight: 600;
  color: var(--text-primary) !important;
  font-size: 14px !important;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-radius: 6px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
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

.btn-danger {
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 14px;
  background: var(--danger);
  color: #fff;
}

.btn-danger:hover {
  background: var(--danger-hover);
}
</style>
