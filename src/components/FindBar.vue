<template>
  <div class="find-bar">
    <input
      ref="inputRef"
      type="text"
      v-model="query"
      :placeholder="t('findInPage')"
      @input="onInput"
      @keydown.enter="findNext"
      @keydown.shift.enter="findPrev"
      @keydown.escape="$emit('close')"
    />
    <span class="find-count" v-if="matchCount > 0">{{ activeMatch }}/{{ matchCount }}</span>
    <span class="find-count no-match" v-else-if="query">{{ t('noMatches') }}</span>
    <button class="find-btn" @click="findPrev" :title="t('findPrevious')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
    </button>
    <button class="find-btn" @click="findNext" :title="t('findNext')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
    <button class="find-close" @click="$emit('close')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from '../utils/i18n'

const { t } = useI18n()
const emit = defineEmits(['close'])

const query = ref('')
const matchCount = ref(0)
const activeMatch = ref(0)
const inputRef = ref(null)

const props = defineProps({
  webview: Object,
})

onMounted(() => {
  nextTick(() => inputRef.value?.focus())
})

onUnmounted(() => {
  if (props.webview) {
    props.webview.stopFindInPage('clearSelection')
  }
})

function onInput() {
  if (!props.webview || !query.value) {
    matchCount.value = 0
    activeMatch.value = 0
    if (props.webview) props.webview.stopFindInPage('clearSelection')
    return
  }
  props.webview.findInPage(query.value)
}

function findNext() {
  if (!props.webview || !query.value) return
  props.webview.findInPage(query.value, { findNext: true })
}

function findPrev() {
  if (!props.webview || !query.value) return
  props.webview.findInPage(query.value, { forward: false })
}

function handleFoundInPage(result) {
  matchCount.value = result.matches || 0
  activeMatch.value = result.activeMatchOrdinal || 0
}

defineExpose({ handleFoundInPage })
</script>

<style scoped>
.find-bar {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  gap: 6px;
}

.find-bar input {
  flex: 1;
  max-width: 240px;
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  background: var(--input-bg);
  color: var(--text-primary);
}

.find-bar input:focus {
  border-color: var(--accent);
}

.find-count {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}

.find-count.no-match {
  color: var(--danger);
}

.find-btn {
  color: var(--text-secondary);
  padding: 2px;
}

.find-btn svg {
  width: 16px;
  height: 16px;
}

.find-btn:hover {
  color: var(--text-primary);
}

.find-close {
  color: var(--text-muted);
  padding: 2px;
}

.find-close svg {
  width: 14px;
  height: 14px;
}

.find-close:hover {
  color: var(--text-primary);
}
</style>
