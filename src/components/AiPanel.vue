<template>
  <div class="ai-panel" :style="panelStyle" @click.stop>
    <div class="ai-header">
      <span class="ai-title">{{ t('aiAssistant') }}</span>
      <div class="ai-header-actions">
        <button class="ai-icon-btn" @click="doNewConversation" :title="t('aiNewChat')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <button class="ai-icon-btn" @click="toggleHistory" :title="t('aiHistoryConversations')" :class="{ active: showHistory }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </button>
        <button class="ai-icon-btn" @click="toggleMemory" :title="t('aiMemory')" :class="{ active: showMemory }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a7 7 0 0 1 7 7c0 2.4-1.2 4.5-3 5.7V17a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3v-2.3c-1.8-1.2-3-3.3-3-5.7a7 7 0 0 1 7-7z"/><path d="M8 21h8"/><path d="M10 14h4"/></svg>
        </button>
        <button class="ai-icon-btn" @click="confirmClearChat" :title="t('aiClearChat')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
        <button class="ai-icon-btn" @click="toggleSettings" :title="t('aiSettings')" :class="{ active: showSettings }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </button>
        <button class="ai-icon-btn" @click="$emit('close')" :title="t('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>

    <!-- 记忆面板 -->
    <div v-if="showMemory" class="ai-memory-panel">
      <div class="ai-memory-header">
        <label>{{ t('aiMemoryRange') }}</label>
        <select v-model.number="memoryRangeDays" @change="onRangeChange">
          <option :value="3">{{ t('aiMemoryRange3d') }}</option>
          <option :value="7">{{ t('aiMemoryRange7d') }}</option>
          <option :value="15">{{ t('aiMemoryRange15d') }}</option>
          <option :value="30">{{ t('aiMemoryRange30d') }}</option>
          <option :value="0">{{ t('aiMemoryRangeForever') }}</option>
        </select>
      </div>

      <div v-if="filteredMemories.length === 0" class="ai-memory-empty">
        <p>{{ t('aiNoMemories') }}</p>
      </div>

      <div v-else class="ai-memory-list">
        <div v-for="mem in filteredMemories" :key="mem.id" class="ai-memory-item">
          <div v-if="editingMemoryId !== mem.id" class="ai-memory-view">
            <p class="ai-memory-summary">{{ mem.summary }}</p>
            <span class="ai-memory-time">{{ formatTime(mem.createdAt) }}</span>
            <div class="ai-memory-actions">
              <button class="ai-memory-btn" @click="startEditMemory(mem)">{{ t('edit') }}</button>
              <button class="ai-memory-btn ai-memory-delete-btn" @click="deleteMemoryItem(mem.id)">{{ t('delete') }}</button>
            </div>
          </div>
          <div v-else class="ai-memory-edit">
            <textarea v-model="editingMemoryText" class="ai-memory-edit-input"></textarea>
            <div class="ai-memory-edit-actions">
              <button class="ai-memory-btn" @click="saveMemoryEdit(mem.id)">{{ t('save') }}</button>
              <button class="ai-memory-btn" @click="cancelMemoryEdit">{{ t('cancel') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 历史对话面板 -->
    <div v-if="showHistory" class="ai-history-panel">
      <div v-if="conversationList.length === 0" class="ai-history-empty">
        <p>{{ t('aiNoConversations') }}</p>
      </div>
      <div v-else class="ai-history-list">
        <div
          v-for="conv in conversationList"
          :key="conv.id"
          :class="['ai-history-item', { active: conv.id === activeConversationId }]"
          @click="doSwitchConversation(conv.id)"
          @contextmenu.prevent="openConvContextMenu($event, conv)"
        >
          <div class="ai-history-item-main">
            <span class="ai-history-item-title">{{ conv.title || t('aiConversationDefaultTitle') }}</span>
            <span class="ai-history-item-time">{{ formatTime(conv.updatedAt) }}</span>
          </div>
          <span v-if="conv.id === activeConversationId" class="ai-history-item-active">{{ t('aiActive') }}</span>
        </div>
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
          <label>{{ t('aiSystemPrompt') }}</label>
          <textarea
            v-model="form.systemPrompt"
            :placeholder="t('aiSystemPromptPlaceholder')"
            rows="5"
            class="ai-system-prompt-input"
          ></textarea>
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
    <div v-if="!showSettings && !showMemory && !showHistory" class="ai-chat">
      <!-- 未配置状态 -->
      <div v-if="!activeModel" class="ai-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="ai-empty-icon">
          <path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10h-7.5L12 9.5V2z"/><path d="M17.5 12H22v0"/><circle cx="9" cy="17" r="1"/><circle cx="13" cy="14" r="1"/><circle cx="16" cy="17" r="1"/>
        </svg>
        <p>{{ t('aiNotConfigured') }}</p>
        <p class="ai-empty-desc">{{ t('aiNotConfiguredDesc') }}</p>
        <button class="btn" @click="toggleSettings">{{ t('aiGoSettings') }}</button>
      </div>

      <!-- 对话界面 -->
      <div v-else class="ai-chat-active">
        <div class="ai-messages" ref="messagesContainer">
          <div v-if="messages.length === 0" class="ai-chat-hint">
            <p>{{ activeModel.name }} ({{ activeModel.modelId }})</p>
            <p class="ai-chat-hint-desc">输入 / 可执行浏览器操作</p>
          </div>
          <div v-for="(msg, i) in messages" :key="i" :class="['ai-message', msg.role]">
            <span class="ai-message-label">{{ msg.role === 'user' ? 'You' : activeModel.name }}</span>
            <div class="ai-message-bubble" @contextmenu.prevent="openMsgContextMenu($event, msg, i)">
              <template v-for="(part, pi) in parseMessageParts(msg.content)" :key="pi">
                <div v-if="part.type === 'code'" class="ai-code-block">
                  <div class="ai-code-header">
                    <span class="ai-code-lang">{{ part.lang || 'code' }}</span>
                    <button class="ai-code-copy" @click="copyText(part.content)">复制</button>
                  </div>
                  <pre><code>{{ part.content }}</code></pre>
                </div>
                <div v-else class="ai-message-text">{{ part.content }}</div>
              </template>
            </div>
          </div>
          <!-- 待确认操作卡片 -->
          <div v-if="pendingActions" class="ai-confirm-card">
            <div class="ai-confirm-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div class="ai-confirm-card-text">
              <div class="ai-confirm-card-title">{{ t('aiActionSummary') }}</div>
              <p class="ai-confirm-card-summary">{{ pendingActions.summary }}</p>
            </div>
            <div class="ai-confirm-card-actions">
              <button class="btn" @click="doConfirmActions">{{ t('aiConfirmExecute') }}</button>
              <button class="btn btn-secondary" @click="doCancelActions">{{ t('aiCancelAction') }}</button>
            </div>
          </div>
          <div v-if="isStreaming && streamingContent" class="ai-message assistant">
            <span class="ai-message-label">{{ activeModel.name }}</span>
            <div class="ai-message-bubble">
              <div class="ai-message-text">{{ streamingContent }}<span class="ai-cursor">|</span></div>
            </div>
          </div>
          <div v-else-if="isStreaming" class="ai-message assistant">
            <span class="ai-message-label">{{ activeModel.name }}</span>
            <div class="ai-message-bubble">
              <div class="ai-message-text ai-thinking">{{ t('aiThinking') }}<span class="ai-cursor">|</span></div>
            </div>
          </div>
        </div>

        <div v-if="error" class="ai-error">{{ t('aiError') }}: {{ error }}</div>

        <div class="ai-input-area">
          <div class="ai-input-wrapper">
            <!-- 命令弹出菜单 -->
            <div v-if="showCommandPopover" class="ai-command-popover" @click.stop>
              <div
                v-for="cmd in allCommands"
                :key="cmd.id"
                class="ai-command-item"
                @click="selectCommand(cmd.command)"
              >
                <span class="ai-command-name">{{ cmd.command }}</span>
                <span class="ai-command-desc">{{ t(cmd.descKey) }}</span>
              </div>
            </div>
            <textarea
              v-model="inputText"
              class="ai-input"
              placeholder="输入消息，或输入 / 执行浏览器操作..."
              @keydown="onInputKeydown"
              @input="onInputChange"
              :disabled="isStreaming"
              rows="1"
            />
          </div>
          <button class="ai-send-btn" @click="handleSend" :disabled="isStreaming || !inputText.trim()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 清空确认弹窗 -->
    <div v-if="showClearConfirm" class="ai-confirm-overlay" @click.stop>
      <div class="ai-confirm-dialog">
        <p>{{ t('aiClearChatConfirm') }}</p>
        <div class="ai-confirm-actions">
          <button class="btn" @click="doClearChat">{{ t('confirm') }}</button>
          <button class="btn btn-secondary" @click="showClearConfirm = false">{{ t('cancel') }}</button>
        </div>
      </div>
    </div>

    <!-- 消息右键菜单 -->
    <Teleport to="body">
      <div v-if="msgCtxMenu.show" class="ai-ctx-overlay" @click="msgCtxMenu.show = false" @contextmenu.prevent="msgCtxMenu.show = false">
        <div class="ai-ctx-menu" :style="{ left: msgCtxMenu.x + 'px', top: msgCtxMenu.y + 'px' }">
          <button @click="doCopyMessage">{{ t('aiCopyMessage') }}</button>
          <button @click="doDeleteMessage">{{ t('aiDeleteMessage') }}</button>
          <button v-if="msgCtxMenu.msg?.role === 'assistant'" @click="doReReply">{{ t('aiReReply') }}</button>
        </div>
      </div>
    </Teleport>

    <!-- 对话右键菜单 -->
    <Teleport to="body">
      <div v-if="convCtxMenu.show" class="ai-ctx-overlay" @click="convCtxMenu.show = false" @contextmenu.prevent="convCtxMenu.show = false">
        <div class="ai-ctx-menu" :style="{ left: convCtxMenu.x + 'px', top: convCtxMenu.y + 'px' }">
          <button @click="doRenameConversation">{{ t('aiRenameConversation') }}</button>
          <button @click="doDeleteConversationConfirm">{{ t('aiDeleteConversation') }}</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useI18n } from '../utils/i18n'
import { AI_PROVIDERS, AI_DEFAULT_SYSTEM_PROMPT, renameConversation, deleteConversation, getAllConversations } from '../utils/storage'
import { useAi, getAllCommands } from '../composables/useAi'

const { t } = useI18n()
const {
  messages, isStreaming, error, activeModel, config,
  memories, memoryRange, pendingActions,
  activeConversationId, conversationList,
  addModel, updateModel, deleteModel,
  enableModel, disableModel, maskApiKey,
  clearMessages, clearCurrentConversation, newConversation, switchConversation,
  deleteMessage, reReply, refreshConversationList,
  sendMessage, summarizeConversation,
  updateMemoryItem, deleteMemoryItem, setMemoryRangeDays,
  getActiveMemories, confirmPendingActions, cancelPendingActions,
} = useAi()

const props = defineProps({
  panelStyle: { type: Object, default: () => ({}) },
})

defineEmits(['close'])

const showSettings = ref(false)
const showMemory = ref(false)
const showHistory = ref(false)
const showForm = ref(false)
const showClearConfirm = ref(false)
const showCommandPopover = ref(false)
const editingId = ref('')
const editingMemoryId = ref('')
const editingMemoryText = ref('')
const inputText = ref('')
const streamingContent = ref('')
const formApiKeyFocused = ref(false)
const messagesContainer = ref(null)

const msgCtxMenu = ref({ show: false, x: 0, y: 0, msg: null, index: -1 })
const convCtxMenu = ref({ show: false, x: 0, y: 0, conv: null })

const allCommands = getAllCommands()

const memoryRangeDays = computed({
  get: () => memoryRange.value,
  set: (val) => setMemoryRangeDays(val),
})

const filteredMemories = computed(() => {
  const range = memoryRange.value
  if (range === 0) return memories.value.entries
  const cutoff = Date.now() - range * 24 * 60 * 60 * 1000
  return memories.value.entries.filter(m => m.createdAt >= cutoff)
})

const form = ref({
  provider: 'openai',
  name: '',
  modelId: '',
  apiEndpoint: '',
  apiKey: '',
  systemPrompt: '',
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
    systemPrompt: AI_DEFAULT_SYSTEM_PROMPT,
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
    systemPrompt: model.systemPrompt || '',
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
    systemPrompt: form.value.systemPrompt,
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

function toggleMemory() {
  showMemory.value = !showMemory.value
  if (showMemory.value) { showSettings.value = false; showHistory.value = false }
}

function toggleSettings() {
  showSettings.value = !showSettings.value
  if (showSettings.value) { showMemory.value = false; showHistory.value = false }
}

function toggleHistory() {
  showHistory.value = !showHistory.value
  if (showHistory.value) { showSettings.value = false; showMemory.value = false }
  if (showHistory.value) refreshConversationList()
}

function confirmClearChat() {
  if (messages.value.length === 0) return
  showClearConfirm.value = true
}

function doClearChat() {
  clearCurrentConversation()
  refreshConversationList()
  showClearConfirm.value = false
}

// 新建对话
function doNewConversation() {
  newConversation()
}

// 切换对话
function doSwitchConversation(id) {
  switchConversation(id)
  showHistory.value = false
}

// 消息右键菜单
function openMsgContextMenu(e, msg, index) {
  msgCtxMenu.value = { show: true, x: e.clientX, y: e.clientY, msg, index }
}

function doCopyMessage() {
  const msg = msgCtxMenu.value.msg
  if (msg) copyText(msg.content)
  msgCtxMenu.value.show = false
}

function doDeleteMessage() {
  deleteMessage(msgCtxMenu.value.index)
  msgCtxMenu.value.show = false
}

function doReReply() {
  const idx = msgCtxMenu.value.index
  msgCtxMenu.value.show = false
  reReply(idx,
    (chunk, full) => { streamingContent.value = full },
    () => { streamingContent.value = ''; scrollToBottom() },
    (err) => { streamingContent.value = ''; scrollToBottom() }
  )
}

// 对话右键菜单
function openConvContextMenu(e, conv) {
  convCtxMenu.value = { show: true, x: e.clientX, y: e.clientY, conv }
}

function doRenameConversation() {
  const conv = convCtxMenu.value.conv
  convCtxMenu.value.show = false
  if (!conv) return
  setTimeout(() => {
    const newName = window.prompt(t('aiRenameConversation'), conv.title)
    if (newName && newName.trim()) {
      renameConversation(conv.id, newName.trim())
      refreshConversationList()
    }
  }, 0)
}

function doDeleteConversationConfirm() {
  const conv = convCtxMenu.value.conv
  convCtxMenu.value.show = false
  if (!conv) return
  setTimeout(() => {
    if (window.confirm(t('aiDeleteConversationConfirm'))) {
      deleteConversation(conv.id)
      refreshConversationList()
      if (conv.id === activeConversationId.value) {
        const data = getAllConversations()
        if (data.conversations.length > 0) {
          const last = data.conversations[data.conversations.length - 1]
          activeConversationId.value = last.id
          messages.value = last.messages || []
        } else {
          activeConversationId.value = ''
          messages.value = []
        }
      }
    }
  }, 0)
}

// 输入键盘处理
function onInputKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
    e.preventDefault()
    handleSend()
  }
}

function onRangeChange() {
  setMemoryRangeDays(memoryRangeDays.value)
}

function startEditMemory(mem) {
  editingMemoryId.value = mem.id
  editingMemoryText.value = mem.summary
}

function saveMemoryEdit(id) {
  if (editingMemoryText.value.trim()) {
    updateMemoryItem(id, { summary: editingMemoryText.value.trim() })
  }
  editingMemoryId.value = ''
  editingMemoryText.value = ''
}

function cancelMemoryEdit() {
  editingMemoryId.value = ''
  editingMemoryText.value = ''
}

function formatTime(timestamp) {
  const d = new Date(timestamp)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function handleSend() {
  const text = inputText.value.trim()
  if (!text || isStreaming.value) return
  inputText.value = ''
  streamingContent.value = ''
  showCommandPopover.value = false

  // /mem 或 /memory 命令
  if (text === '/mem' || text === '/memory') {
    if (messages.value.length === 0) return
    summarizeConversation(
      () => { scrollToBottom() },
      () => {}
    )
    return
  }

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

function onInputChange() {
  showCommandPopover.value = inputText.value === '/'
}

function selectCommand(cmd) {
  inputText.value = cmd + ' '
  showCommandPopover.value = false
}

function parseMessageParts(text) {
  const parts = []
  const regex = /```(\w*)\n?([\s\S]*?)```/g
  let lastIndex = 0
  let match
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    }
    parts.push({ type: 'code', lang: match[1] || '', content: match[2].replace(/\n$/, '') })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) })
  }
  return parts.length > 0 ? parts : [{ type: 'text', content: text }]
}

function copyText(text) {
  navigator.clipboard?.writeText(text).then(() => {}).catch(() => {})
}

function doConfirmActions() {
  confirmPendingActions()
  scrollToBottom()
}

function doCancelActions() {
  cancelPendingActions()
  scrollToBottom()
}

watch(messages, () => {
  scrollToBottom()
}, { deep: true })

watch(streamingContent, () => {
  scrollToBottom()
})

watch(pendingActions, () => {
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
  gap: 2px;
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

.ai-icon-btn.active {
  background: var(--bg-tertiary);
  color: var(--accent);
}

.ai-icon-btn svg {
  width: 15px;
  height: 15px;
}

/* 记忆面板 */
.ai-memory-panel {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.ai-memory-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.ai-memory-header label {
  font-size: 13px;
  color: var(--text-secondary);
}

.ai-memory-header select {
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 12px;
  background: var(--input-bg);
  color: var(--text-primary);
  outline: none;
}

.ai-memory-header select:focus {
  border-color: var(--accent);
}

.ai-memory-empty {
  padding: 40px 0;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}

.ai-memory-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-memory-item {
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
}

.ai-memory-view {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ai-memory-summary {
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-primary);
  margin: 0;
}

.ai-memory-time {
  font-size: 11px;
  color: var(--text-muted);
}

.ai-memory-actions {
  display: flex;
  gap: 6px;
}

.ai-memory-btn {
  padding: 3px 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 11px;
  cursor: pointer;
}

.ai-memory-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.ai-memory-delete-btn:hover {
  border-color: var(--danger);
  color: var(--danger);
}

.ai-memory-edit {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ai-memory-edit-input {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 13px;
  background: var(--input-bg);
  color: var(--text-primary);
  outline: none;
  resize: vertical;
  min-height: 60px;
  box-sizing: border-box;
}

.ai-memory-edit-input:focus {
  border-color: var(--accent);
}

.ai-memory-edit-actions {
  display: flex;
  gap: 6px;
}

/* 历史对话面板 */
.ai-history-panel {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.ai-history-empty {
  padding: 40px 0;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}

.ai-history-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ai-history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  background: var(--bg-primary);
}

.ai-history-item:hover {
  background: var(--bg-secondary);
}

.ai-history-item.active {
  border-color: var(--accent);
  background: var(--bg-secondary);
}

.ai-history-item-main {
  flex: 1;
  min-width: 0;
}

.ai-history-item-title {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ai-history-item-time {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}

.ai-history-item-active {
  font-size: 10px;
  color: var(--accent);
  font-weight: 600;
  padding: 2px 6px;
  border: 1px solid var(--accent);
  border-radius: 3px;
  white-space: nowrap;
  margin-left: 8px;
}

/* 右键菜单 */
.ai-ctx-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: transparent;
  transform: translateZ(0);
  -webkit-app-region: no-drag;
}

.ai-ctx-menu {
  position: fixed;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 4px;
  min-width: 140px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  z-index: 10000;
  transform: translateZ(0);
  -webkit-app-region: no-drag;
}

.ai-ctx-menu button {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 14px;
  font-size: 13px;
  color: var(--text-primary);
  border-radius: 4px;
}

.ai-ctx-menu button:hover {
  background: var(--bg-secondary);
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

.ai-system-prompt-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 13px;
  background: var(--input-bg);
  color: var(--text-primary);
  box-sizing: border-box;
  outline: none;
  resize: vertical;
  font-family: inherit;
}

.ai-system-prompt-input:focus {
  border-color: var(--accent);
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

/* 确认弹窗 */
.ai-confirm-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--overlay-bg);
  z-index: 60;
}

.ai-confirm-dialog {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  width: 280px;
  box-shadow: 0 4px 20px var(--modal-shadow);
}

.ai-confirm-dialog p {
  font-size: 13px;
  color: var(--text-primary);
  margin: 0 0 16px;
  line-height: 1.5;
}

.ai-confirm-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
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
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
}

.ai-message.assistant {
  align-items: flex-start;
}

.ai-message.user {
  align-items: flex-end;
}

.ai-message-label {
  font-size: 10px;
  color: var(--text-muted);
  margin-bottom: 3px;
  padding: 0 4px;
}

.ai-message.user .ai-message-label {
  color: var(--accent);
}

.ai-message-bubble {
  max-width: 88%;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.6;
  word-break: break-word;
}

.ai-message.assistant .ai-message-bubble {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-top-left-radius: 4px;
  border-bottom-left-radius: 12px;
}

.ai-message.user .ai-message-bubble {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-left: 3px solid var(--accent);
  border-top-right-radius: 4px;
  border-bottom-right-radius: 12px;
}

.ai-message-text {
  white-space: pre-wrap;
  color: var(--text-primary);
}

.ai-thinking {
  color: var(--text-muted);
  font-style: italic;
}

/* 代码块 */
.ai-code-block {
  margin: 6px 0;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
  background: var(--bg-primary);
}

.ai-code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 10px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  font-size: 11px;
}

.ai-code-lang {
  color: var(--text-muted);
  text-transform: uppercase;
  font-size: 10px;
  font-weight: 600;
}

.ai-code-copy {
  border: none;
  background: none;
  color: var(--text-secondary);
  font-size: 11px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 3px;
}

.ai-code-copy:hover {
  background: var(--bg-secondary);
  color: var(--accent);
}

.ai-code-block pre {
  margin: 0;
  padding: 10px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.5;
}

.ai-code-block code {
  font-family: 'Consolas', 'Courier New', monospace;
  color: var(--text-primary);
  white-space: pre;
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

.ai-input-wrapper {
  flex: 1;
  position: relative;
}

.ai-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  background: var(--input-bg);
  color: var(--text-primary);
  box-sizing: border-box;
  font-family: inherit;
  resize: none;
  max-height: 5.2em;
  line-height: 1.3;
  overflow-y: auto;
}

.ai-input:focus {
  border-color: var(--accent);
}

/* 命令弹出菜单 */
.ai-command-popover {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  margin-bottom: 4px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 -2px 12px var(--modal-shadow);
  overflow: hidden;
  z-index: 70;
}

.ai-command-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-light);
}

.ai-command-item:last-child {
  border-bottom: none;
}

.ai-command-item:hover {
  background: var(--bg-secondary);
}

.ai-command-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
  background: var(--bg-secondary);
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.ai-command-desc {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 确认操作卡片 */
.ai-confirm-card {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px;
  margin: 4px 0 12px;
  border: 1px solid var(--accent);
  border-radius: 8px;
  background: var(--bg-secondary);
}

.ai-confirm-card-icon {
  width: 20px;
  height: 20px;
  color: var(--accent);
  flex-shrink: 0;
}

.ai-confirm-card-icon svg {
  width: 20px;
  height: 20px;
}

.ai-confirm-card-text {
  flex: 1;
  min-width: 0;
}

.ai-confirm-card-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.ai-confirm-card-summary {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.ai-confirm-card-actions {
  display: flex;
  gap: 6px;
  width: 100%;
  justify-content: flex-end;
}

.ai-confirm-card-actions .btn {
  padding: 5px 12px;
  font-size: 11px;
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
