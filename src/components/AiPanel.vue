<template>
  <div class="ai-panel" :style="panelStyle" @click.stop>
    <div class="ai-header">
      <span class="ai-title">{{ t('aiAssistant') }}</span>
      <div class="ai-header-actions">
        <button class="ai-icon-btn" @click="showSettings = !showSettings" :title="t('aiSettings')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </button>
        <button class="ai-icon-btn" @click="$emit('close')" :title="t('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>

    <!-- 设置面板 -->
    <div v-if="showSettings" class="ai-settings">
      <h3>{{ t('aiModels') }}</h3>
      <div v-if="config.models.length === 0" class="ai-settings-empty">
        <p>{{ t('aiNotConfiguredDesc') }}</p>
      </div>
      <div v-else class="ai-model-list">
        <div v-for="model in config.models" :key="model.id" class="ai-model-item" :class="{ active: model.enabled }">
          <div class="ai-model-info">
            <span class="ai-model-name">{{ model.name }}</span>
            <span class="ai-model-provider">{{ getProviderName(model.provider) }} · {{ model.modelId }}</span>
          </div>
          <div class="ai-model-actions">
            <button
              class="ai-model-toggle"
              :class="{ on: model.enabled }"
              @click="model.enabled ? disableModel(model.id) : enableModel(model.id)"
            >
              {{ model.enabled ? t('aiEnabled') : t('aiEnable') }}
            </button>
            <button class="ai-model-edit" @click="startEditModel(model)" :title="t('edit')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="ai-model-delete" @click="deleteModel(model.id)" :title="t('delete')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      </div>
      <button class="ai-add-model-btn" @click="startAddModel">{{ t('aiAddModel') }}</button>

      <!-- 添加/编辑表单 -->
      <div v-if="showForm" class="ai-form">
        <div class="ai-form-row">
          <label>{{ t('aiProvider') }}</label>
          <select v-model="form.provider" @change="onProviderChange">
            <option v-for="(p, key) in AI_PROVIDERS" :key="key" :value="key">{{ p.name }}</option>
          </select>
        </div>
        <div class="ai-form-row">
          <label>{{ t('aiModelName') }}</label>
          <input v-model="form.name" :placeholder="t('aiModelNamePlaceholder')" />
        </div>
        <div class="ai-form-row">
          <label>{{ t('aiModelId') }}</label>
          <input v-model="form.modelId" :placeholder="t('aiModelIdPlaceholder')" />
        </div>
        <div class="ai-form-row">
          <label>{{ t('aiApiEndpoint') }}</label>
          <input v-model="form.apiEndpoint" placeholder="https://api.openai.com/v1/chat/completions" />
        </div>
        <div class="ai-form-row">
          <label>{{ t('aiApiKey') }}</label>
          <input
            v-model="form.apiKey"
            type="password"
            :placeholder="t('aiApiKeyPlaceholder')"
            @focus="onApiKeyFocus"
            @blur="onApiKeyBlur"
          />
          <span v-if="editingId && form._maskedKey && !formApiKeyFocused" class="ai-key-masked">{{ form._maskedKey }}</span>
        </div>
        <div class="ai-form-row">
          <label>{{ t('aiTemperature') }}: {{ form.temperature.toFixed(1) }}</label>
          <input type="range" v-model.number="form.temperature" min="0" max="2" step="0.1" />
        </div>
        <div class="ai-form-actions">
          <button class="btn" @click="saveModel">{{ t('aiSave') }}</button>
          <button class="btn btn-secondary" @click="cancelForm">{{ t('cancel') }}</button>
        </div>
      </div>
    </div>

    <!-- 对话区域 -->
    <div v-if="!showSettings" class="ai-chat">
      <!-- 未配置状态 -->
      <div v-if="!activeModel" class="ai-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="ai-empty-icon">
          <path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10h-7.5L12 9.5V2z"/><path d="M17.5 12H22v0"/><circle cx="9" cy="17" r="1"/><circle cx="13" cy="14" r="1"/><circle cx="16" cy="17" r="1"/>
        </svg>
        <p>{{ t('aiNotConfigured') }}</p>
        <p class="ai-empty-desc">{{ t('aiNotConfiguredDesc') }}</p>
        <button class="btn" @click="showSettings = true">{{ t('aiGoSettings') }}</button>
      </div>

      <!-- 对话界面 -->
      <div v-else class="ai-chat-active">
        <div class="ai-messages" ref="messagesContainer">
          <div v-if="messages.length === 0" class="ai-chat-hint">
            <p>{{ activeModel.name }} ({{ activeModel.modelId }})</p>
            <p class="ai-chat-hint-desc">{{ t('aiInputPlaceholder') }}</p>
          </div>
          <div v-for="(msg, i) in messages" :key="i" :class="['ai-message', msg.role]">
            <div class="ai-message-role">{{ msg.role === 'user' ? 'You' : activeModel.name }}</div>
            <div class="ai-message-content">{{ msg.content }}</div>
          </div>
          <div v-if="isStreaming && streamingContent" class="ai-message assistant">
            <div class="ai-message-role">{{ activeModel.name }}</div>
            <div class="ai-message-content">{{ streamingContent }}<span class="ai-cursor">|</span></div>
          </div>
          <div v-else-if="isStreaming" class="ai-message assistant">
            <div class="ai-message-role">{{ activeModel.name }}</div>
            <div class="ai-message-content ai-thinking">{{ t('aiThinking') }}<span class="ai-cursor">|</span></div>
          </div>
        </div>

        <div v-if="error" class="ai-error">{{ t('aiError') }}: {{ error }}</div>

        <div class="ai-input-area">
          <input
            v-model="inputText"
            class="ai-input"
            :placeholder="t('aiInputPlaceholder')"
            @keydown.enter="handleSend"
            :disabled="isStreaming"
          />
          <button class="ai-send-btn" @click="handleSend" :disabled="isStreaming || !inputText.trim()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useI18n } from '../utils/i18n'
import { AI_PROVIDERS } from '../utils/storage'
import { useAi } from '../composables/useAi'

const { t } = useI18n()
const {
  messages, isStreaming, error, activeModel, config,
  addModel, updateModel, deleteModel,
  enableModel, disableModel, maskApiKey, clearMessages, sendMessage
} = useAi()

const props = defineProps({
  panelStyle: { type: Object, default: () => ({}) },
})

defineEmits(['close'])

const showSettings = ref(false)
const showForm = ref(false)
const editingId = ref('')
const inputText = ref('')
const streamingContent = ref('')
const formApiKeyFocused = ref(false)
const messagesContainer = ref(null)

const form = ref({
  provider: 'openai',
  name: '',
  modelId: '',
  apiEndpoint: '',
  apiKey: '',
  temperature: 0.7,
  _maskedKey: '',
})

function getProviderName(key) {
  return AI_PROVIDERS[key]?.name || key
}

function onProviderChange() {
  const p = AI_PROVIDERS[form.value.provider]
  if (p) {
    form.value.apiEndpoint = p.endpoint || ''
    if (p.modelId && !form.value.modelId) {
      form.value.modelId = p.modelId
    }
  }
}

function startAddModel() {
  editingId.value = ''
  const p = AI_PROVIDERS.openai
  form.value = {
    provider: 'openai',
    name: '',
    modelId: '',
    apiEndpoint: p.endpoint,
    apiKey: '',
    temperature: 0.7,
    _maskedKey: '',
  }
  showForm.value = true
}

function startEditModel(model) {
  editingId.value = model.id
  form.value = {
    provider: model.provider,
    name: model.name,
    modelId: model.modelId,
    apiEndpoint: model.apiEndpoint,
    apiKey: model.apiKey,
    temperature: model.temperature,
    _maskedKey: maskApiKey(model.apiKey),
  }
  showForm.value = true
}

function saveModel() {
  if (!form.value.name.trim()) return

  const data = {
    name: form.value.name.trim(),
    provider: form.value.provider,
    modelId: form.value.modelId.trim(),
    apiEndpoint: form.value.apiEndpoint.trim(),
    apiKey: form.value.apiKey.trim(),
    temperature: form.value.temperature,
  }

  if (editingId.value) {
    updateModel(editingId.value, data)
  } else {
    addModel(data)
  }
  cancelForm()
}

function cancelForm() {
  showForm.value = false
  editingId.value = ''
}

function onApiKeyFocus() {
  formApiKeyFocused.value = true
}

function onApiKeyBlur() {
  formApiKeyFocused.value = false
}

function handleSend() {
  const text = inputText.value.trim()
  if (!text || isStreaming.value) return
  inputText.value = ''
  streamingContent.value = ''

  sendMessage(
    text,
    (chunk, full) => { streamingContent.value = full },
    () => { streamingContent.value = ''; scrollToBottom() },
    (err) => { streamingContent.value = ''; scrollToBottom() }
  )
}

function scrollToBottom() {
  nextTick(() => {
    const el = messagesContainer.value
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  })
}

watch(messages, () => {
  scrollToBottom()
}, { deep: true })

watch(streamingContent, () => {
  scrollToBottom()
})
</script>

<style scoped>
.ai-panel {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  border-left: 1px solid var(--border-color);
  box-shadow: -4px 0 20px var(--modal-shadow);
  z-index: 50;
  width: 380px;
}

.ai-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.ai-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.ai-header-actions {
  display: flex;
  gap: 4px;
}

.ai-icon-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-icon-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.ai-icon-btn svg {
  width: 15px;
  height: 15px;
}

/* 设置面板 */
.ai-settings {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.ai-settings h3 {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ai-settings-empty {
  padding: 20px 0;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}

.ai-model-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.ai-model-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
}

.ai-model-item.active {
  border-color: var(--accent);
  background: var(--bg-secondary);
}

.ai-model-info {
  flex: 1;
  min-width: 0;
}

.ai-model-name {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.ai-model-provider {
  font-size: 11px;
  color: var(--text-muted);
}

.ai-model-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}

.ai-model-toggle {
  padding: 3px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
}

.ai-model-toggle.on {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.ai-model-edit,
.ai-model-delete {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  border-radius: 4px;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-model-edit:hover { color: var(--accent); }
.ai-model-delete:hover { color: var(--danger); }

.ai-model-edit svg,
.ai-model-delete svg {
  width: 13px;
  height: 13px;
}

.ai-add-model-btn {
  width: 100%;
  padding: 8px;
  border: 1px dashed var(--border-color);
  border-radius: 6px;
  background: none;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
}

.ai-add-model-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

/* 表单 */
.ai-form {
  margin-top: 12px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
}

.ai-form-row {
  margin-bottom: 10px;
}

.ai-form-row label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.ai-form-row input,
.ai-form-row select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 13px;
  background: var(--input-bg);
  color: var(--text-primary);
  box-sizing: border-box;
  outline: none;
}

.ai-form-row input:focus,
.ai-form-row select:focus {
  border-color: var(--accent);
}

.ai-form-row input[type="range"] {
  padding: 0;
  height: 4px;
  accent-color: var(--accent);
}

.ai-key-masked {
  font-size: 11px;
  color: var(--text-muted);
  font-family: monospace;
}

.ai-form-actions {
  display: flex;
  gap: 6px;
  margin-top: 12px;
}

.btn {
  padding: 6px 14px;
  border: none;
  border-radius: 4px;
  background: var(--accent);
  color: #fff;
  font-size: 12px;
  cursor: pointer;
}

.btn:hover { background: var(--accent-hover); }

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}
.btn-secondary:hover {
  background: var(--border-color);
}

/* 对话区域 */
.ai-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ai-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: var(--text-muted);
  font-size: 14px;
}

.ai-empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 8px;
  color: var(--border-color);
}

.ai-empty-desc {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
}

.ai-chat-active {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ai-chat-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  font-size: 13px;
  gap: 4px;
}

.ai-chat-hint-desc {
  font-size: 12px;
  color: var(--border-color);
}

.ai-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.ai-message {
  margin-bottom: 16px;
}

.ai-message-role {
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.ai-message.user .ai-message-role {
  color: var(--accent);
}

.ai-message-content {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-word;
}

.ai-thinking {
  color: var(--text-muted);
  font-style: italic;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.ai-cursor {
  animation: blink 1s infinite;
  color: var(--accent);
}

.ai-error {
  padding: 6px 12px;
  margin: 0 12px;
  font-size: 12px;
  color: var(--danger);
  background: var(--bg-secondary);
  border-radius: 4px;
}

.ai-input-area {
  display: flex;
  padding: 8px 12px;
  border-top: 1px solid var(--border-color);
  gap: 8px;
  align-items: center;
}

.ai-input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  background: var(--input-bg);
  color: var(--text-primary);
}

.ai-input:focus {
  border-color: var(--accent);
}

.ai-send-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-send-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.ai-send-btn svg {
  width: 15px;
  height: 15px;
}
</style>
