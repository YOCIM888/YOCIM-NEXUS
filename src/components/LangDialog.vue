<template>
  <Teleport to="body">
    <div v-if="show" class="lang-dialog-overlay">
      <div class="lang-dialog">
        <h2>{{ t('langConfirmTitle') }}</h2>
        <p class="lang-dialog-question">Are you sure you have set the correct language?</p>
        <p class="lang-dialog-question-zh">您确定设置了正确的语言吗？</p>
        <div class="lang-options">
          <button class="lang-option lang-option-confirm" @click="$emit('confirm')">
            <span class="lang-option-main">Yes</span>
            <span class="lang-option-sub">（是的，不再提醒）</span>
          </button>
          <button class="lang-option lang-option-settings" @click="$emit('goSettings')">
            <span class="lang-option-main">Not yet</span>
            <span class="lang-option-sub">（还没有，前往设置）</span>
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
defineEmits(['confirm', 'goSettings'])
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
  padding: 32px 36px;
  min-width: 400px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.lang-dialog h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px;
}

.lang-dialog-question {
  font-size: 15px;
  color: var(--text-primary);
  margin: 0 0 4px;
}

.lang-dialog-question-zh {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0 0 24px;
}

.lang-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lang-option {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 14px 24px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 15px;
  color: var(--text-primary);
}

.lang-option:hover {
  border-color: var(--accent);
  background: var(--bg-tertiary);
  transform: translateY(-1px);
}

.lang-option-main {
  font-weight: 600;
}

.lang-option-sub {
  font-size: 13px;
  color: var(--text-muted);
}

.lang-option-confirm:hover {
  border-color: #4caf50;
}

.lang-option-settings:hover {
  border-color: var(--accent);
}
</style>
