<template>
  <Teleport to="body">
    <div v-if="show" class="lang-dialog-overlay">
      <div class="lang-dialog">
        <h2>{{ t('chooseLanguage') }}</h2>
        <p class="lang-dialog-hint">{{ t('languageHint') }}</p>
        <div class="lang-options">
          <button class="lang-option" @click="$emit('selectLanguage', 'en')">
            <span class="lang-flag">🇺🇸</span>
            <span>English</span>
          </button>
          <button class="lang-option" @click="$emit('selectLanguage', 'zh')">
            <span class="lang-flag">🇨🇳</span>
            <span>中文</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useI18n } from '../utils/i18n'
const { t } = useI18n()
defineProps({ show: Boolean })
defineEmits(['selectLanguage'])
</script>

<style scoped>
.lang-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.lang-dialog {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 32px;
  min-width: 360px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.lang-dialog h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.lang-dialog-hint {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0 0 24px;
}

.lang-options {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.lang-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 28px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 16px;
  color: var(--text-primary);
}

.lang-option:hover {
  border-color: var(--accent);
  background: var(--bg-tertiary);
  transform: translateY(-2px);
}

.lang-flag {
  font-size: 32px;
}
</style>
