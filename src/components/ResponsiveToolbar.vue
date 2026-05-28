<template>
  <div class="responsive-toolbar">
    <select
      class="device-select"
      :value="selectedPresetName"
      @change="onPresetChange($event.target.value)"
    >
      <option value="">自定义</option>
      <option
        v-for="d in DEVICE_PRESETS"
        :key="d.name"
        :value="d.name"
      >{{ d.name }} ({{ d.width }}×{{ d.height }})</option>
    </select>

    <div class="size-inputs">
      <input
        type="number"
        class="size-input"
        :value="displayWidth"
        @input="onWidthChange"
        min="100"
        max="5120"
      />
      <span class="size-sep">×</span>
      <input
        type="number"
        class="size-input"
        :value="displayHeight"
        @input="onHeightChange"
        min="100"
        max="5120"
      />
    </div>

    <button class="tb-btn" @click="$emit('rotateDevice')" title="旋转">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="1 4 1 10 7 10"/>
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
      </svg>
    </button>

    <select
      class="zoom-select"
      :value="zoomMode"
      @change="$emit('update:zoomMode', $event.target.value)"
    >
      <option value="fit">适应画布</option>
      <option value="1">100%</option>
      <option value="0.75">75%</option>
      <option value="0.5">50%</option>
    </select>

    <button class="tb-btn close-btn" @click="$emit('close')" title="关闭响应式预览">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { DEVICE_PRESETS } from '../composables/useResponsive.js'

defineProps({
  selectedPresetName: String,
  displayWidth: Number,
  displayHeight: Number,
  zoomMode: String,
})

const emit = defineEmits([
  'close',
  'update:displayWidth',
  'update:displayHeight',
  'selectPreset',
  'rotateDevice',
  'update:zoomMode',
])

function onPresetChange(name) {
  if (!name) {
    emit('selectPreset', null)
  } else {
    const preset = DEVICE_PRESETS.find(d => d.name === name)
    if (preset) emit('selectPreset', preset)
  }
}

function onWidthChange(e) {
  emit('update:displayWidth', Number(e.target.value) || 375)
}

function onHeightChange(e) {
  emit('update:displayHeight', Number(e.target.value) || 667)
}
</script>

<style scoped>
.responsive-toolbar {
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 12px;
  background: #2d2d2d;
  border-bottom: 1px solid var(--border-color);
  gap: 10px;
  flex-shrink: 0;
}

.device-select {
  padding: 2px 6px;
  border: 1px solid #555;
  border-radius: 4px;
  background: #1e1e1e;
  color: #ccc;
  font-size: 12px;
  outline: none;
  min-width: 160px;
}

.device-select:focus {
  border-color: var(--accent);
}

.size-inputs {
  display: flex;
  align-items: center;
  gap: 4px;
}

.size-input {
  width: 56px;
  padding: 2px 4px;
  border: 1px solid #555;
  border-radius: 4px;
  background: #1e1e1e;
  color: #ccc;
  font-size: 12px;
  text-align: center;
  outline: none;
  -moz-appearance: textfield;
}

.size-input::-webkit-outer-spin-button,
.size-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.size-input:focus {
  border-color: var(--accent);
}

.size-sep {
  color: #888;
  font-size: 12px;
}

.tb-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border-radius: 4px;
  color: #aaa;
  cursor: pointer;
}

.tb-btn:hover {
  background: #444;
  color: #fff;
}

.tb-btn svg {
  width: 14px;
  height: 14px;
}

.close-btn {
  margin-left: auto;
}

.zoom-select {
  padding: 2px 6px;
  border: 1px solid #555;
  border-radius: 4px;
  background: #1e1e1e;
  color: #ccc;
  font-size: 12px;
  outline: none;
}

.zoom-select:focus {
  border-color: var(--accent);
}
</style>
