<template>
  <div class="navbar">
    <button class="nav-btn" @click="$emit('back')" :disabled="!canGoBack" :title="t('back')">&#9664;</button>
    <button class="nav-btn" @click="$emit('forward')" :disabled="!canGoForward" :title="t('forward')">&#9654;</button>
    <button class="nav-btn" @click="$emit('reload')" :title="t('refresh')">&#8635;</button>
    <div class="url-bar">
      <form class="url-form" @submit.prevent="$emit('navigate')">
        <input
          ref="urlInputRef"
          class="url-input"
          type="text"
          :value="urlInput"
          :placeholder="t('enterUrl')"
          @focus="$event.target.select()"
          @input="$emit('update:urlInput', $event.target.value); $emit('input')"
          @blur="$emit('blur')"
        />
      </form>
      <button :class="['heart-btn', { bookmarked: isCurrentBookmarked }]" @click="$emit('toggleBookmark')" :title="t('bookmark')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>
      <button class="reading-list-btn" @click="$emit('addToReadingList')" :title="t('addToReadingList')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
      </button>
      <div v-if="showUrlSuggestions && urlSuggestions.length" class="url-suggestions">
        <div v-for="s in urlSuggestions" :key="s.url" class="url-suggestion-item" @mousedown.prevent="$emit('selectSuggestion', s)">
          <svg v-if="s.type === 'bookmark'" class="url-suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          <svg v-else class="url-suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <div class="url-suggestion-info">
            <span class="url-suggestion-title">{{ s.title }}</span>
            <span class="url-suggestion-url">{{ s.url }}</span>
          </div>
        </div>
      </div>
    </div>
    <button class="nav-btn" @click="$emit('togglePanel', 'bookmarks')" :title="t('bookmarks')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
    </button>
    <button class="nav-btn" @click="$emit('toggleReadingList')" :title="t('readingList')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
    </button>
    <button class="nav-btn" @click="$emit('togglePanel', 'history')" :title="t('history')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    </button>
    <button class="nav-btn" @click="$emit('togglePanel', 'downloads')" :title="t('downloads')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    </button>
    <button class="nav-btn" @click="$emit('toggleNotes')" :title="t('notes')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
    </button>
    <button v-if="hasVideo" class="nav-btn" @click="$emit('enterPip')" :title="t('pictureInPicture')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><rect x="11" y="9" width="9" height="6" rx="1"/></svg>
    </button>
    <button class="nav-btn" @click="$emit('openSettings')" :title="t('settings')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from '../utils/i18n'
const { t } = useI18n()
const urlInputRef = ref(null)
defineProps({
  canGoBack: Boolean,
  canGoForward: Boolean,
  urlInput: String,
  isCurrentBookmarked: Boolean,
  showUrlSuggestions: Boolean,
  urlSuggestions: Array,
  hasVideo: Boolean
})
defineEmits(['back', 'forward', 'reload', 'navigate', 'input', 'blur', 'update:urlInput', 'selectSuggestion', 'toggleBookmark', 'addToReadingList', 'togglePanel', 'toggleReadingList', 'toggleNotes', 'enterPip', 'openSettings'])
defineExpose({ urlInputRef })
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  gap: 4px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  -webkit-app-region: drag;
}

.nav-btn {
  -webkit-app-region: no-drag;
  width: 30px;
  height: 30px;
  border: none;
  background: none;
  border-radius: 4px;
  font-size: 12px;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-btn:hover:not(:disabled) {
  background: var(--bg-tertiary);
}

.nav-btn:disabled {
  color: var(--border-color);
  cursor: default;
}

.nav-btn svg {
  width: 16px;
  height: 16px;
}

.url-bar {
  flex: 1;
  display: flex;
  align-items: center;
  -webkit-app-region: no-drag;
  position: relative;
}

.url-form {
  flex: 1;
}

.url-input {
  width: 100%;
  height: 30px;
  padding: 0 32px 0 10px;
  border: 1px solid var(--border-color);
  border-radius: 15px;
  font-size: 13px;
  outline: none;
  background: var(--input-bg);
  color: var(--text-primary);
  box-sizing: border-box;
}

.url-input:focus {
  border-color: var(--text-muted);
  background: var(--input-focus-bg);
}

.heart-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: var(--border-color);
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.heart-btn svg {
  width: 14px;
  height: 14px;
  transition: fill 0.2s, stroke 0.2s;
}

.heart-btn.bookmarked {
  color: #e74c3c;
}

.heart-btn.bookmarked svg {
  fill: #e74c3c;
  stroke: #e74c3c;
}

.reading-list-btn {
  position: absolute;
  right: 28px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: var(--border-color);
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.reading-list-btn svg {
  width: 14px;
  height: 14px;
}
.reading-list-btn:hover {
  color: var(--accent);
}

.url-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-top: none;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 4px 12px var(--modal-shadow);
  z-index: 100;
  overflow: hidden;
}

.url-suggestion-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  gap: 8px;
}

.url-suggestion-item:hover {
  background: var(--bg-tertiary);
}

.url-suggestion-icon {
  width: 14px;
  height: 14px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.url-suggestion-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.url-suggestion-title {
  display: block;
  font-size: 13px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.url-suggestion-url {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
