import { ref, watch } from 'vue'
import {
  getAiConfig, saveAiConfig, getActiveAiModel, generateId, AI_PROVIDERS,
  getAiConversation, saveAiConversation, clearAiConversation,
  getAiMemories, getActiveMemories, addAiMemory, updateAiMemory, deleteAiMemory,
  getMemoryRange, setMemoryRange, AI_DEFAULT_SYSTEM_PROMPT,
} from '../utils/storage'

export function useAi() {
  const messages = ref([])
  const isStreaming = ref(false)
  const error = ref('')
  const activeModel = ref(getActiveAiModel())
  const config = ref(getAiConfig())
  const memories = ref(getAiMemories())
  const memoryRange = ref(getMemoryRange())

  // 加载当前活跃模型的对话
  function loadConversation(modelId) {
    if (modelId) {
      messages.value = getAiConversation(modelId)
    } else {
      messages.value = []
    }
    error.value = ''
  }

  // 保存当前对话
  function saveConversation() {
    if (activeModel.value?.id) {
      saveAiConversation(activeModel.value.id, messages.value)
    }
  }

  // 清空当前对话
  function clearCurrentConversation() {
    messages.value = []
    error.value = ''
    if (activeModel.value?.id) {
      clearAiConversation(activeModel.value.id)
    }
  }

  // 初始加载
  loadConversation(activeModel.value?.id)

  // 监听模型切换
  watch(activeModel, (newModel, oldModel) => {
    if (oldModel?.id) {
      saveAiConversation(oldModel.id, messages.value)
    }
    loadConversation(newModel?.id)
  })

  function refreshConfig() {
    config.value = getAiConfig()
    activeModel.value = getActiveAiModel()
  }

  function refreshMemories() {
    memories.value = getAiMemories()
    memoryRange.value = getMemoryRange()
  }

  function addModel(modelData) {
    const cfg = getAiConfig()
    const model = {
      id: generateId(),
      name: modelData.name || '',
      provider: modelData.provider || 'custom',
      apiEndpoint: modelData.apiEndpoint || '',
      modelId: modelData.modelId || '',
      apiKey: modelData.apiKey || '',
      temperature: modelData.temperature ?? 0.7,
      systemPrompt: modelData.systemPrompt || '',
      enabled: false,
    }
    cfg.models.push(model)
    saveAiConfig(cfg)
    refreshConfig()
    return model
  }

  function updateModel(id, updates) {
    const cfg = getAiConfig()
    const idx = cfg.models.findIndex(m => m.id === id)
    if (idx === -1) return
    cfg.models[idx] = { ...cfg.models[idx], ...updates }
    saveAiConfig(cfg)
    refreshConfig()
  }

  function deleteModel(id) {
    const cfg = getAiConfig()
    cfg.models = cfg.models.filter(m => m.id !== id)
    if (cfg.activeModelId === id) {
      cfg.activeModelId = ''
    }
    saveAiConfig(cfg)
    refreshConfig()
  }

  function enableModel(id) {
    const cfg = getAiConfig()
    for (const m of cfg.models) {
      m.enabled = m.id === id
    }
    cfg.activeModelId = id
    saveAiConfig(cfg)
    refreshConfig()
  }

  function disableModel(id) {
    const cfg = getAiConfig()
    const model = cfg.models.find(m => m.id === id)
    if (model) {
      model.enabled = false
      if (cfg.activeModelId === id) {
        cfg.activeModelId = ''
      }
    }
    saveAiConfig(cfg)
    refreshConfig()
  }

  function maskApiKey(key) {
    if (!key) return ''
    if (key.length <= 6) return '****'
    return key.substring(0, 6) + '****'
  }

  function clearMessages() {
    messages.value = []
    error.value = ''
  }

  // 获取记忆上下文文本
  function getMemoryContext() {
    const activeMems = getActiveMemories()
    if (activeMems.length === 0) return ''
    const lines = activeMems.map(m => `- ${m.summary}`)
    return '\n\n以下是之前对话的记忆摘要，请参考这些信息来更好地理解用户：\n' + lines.join('\n')
  }

  // 构建包含系统提示词和记忆的 API 消息
  function buildApiMessages(model) {
    const systemPrompt = model.systemPrompt || AI_DEFAULT_SYSTEM_PROMPT
    const memoryCtx = getMemoryContext()
    const fullSystem = systemPrompt + memoryCtx

    const provider = AI_PROVIDERS[model.provider] || AI_PROVIDERS.custom
    const isAnthropic = provider.type === 'anthropic'

    // messages.value 已经包含当前用户消息
    const conversationMsgs = messages.value.map(m => ({ role: m.role, content: m.content }))

    if (isAnthropic) {
      return {
        apiMessages: conversationMsgs,
        systemParam: fullSystem,
        isAnthropic: true,
      }
    } else {
      return {
        apiMessages: [
          { role: 'system', content: fullSystem },
          ...conversationMsgs,
        ],
        systemParam: null,
        isAnthropic: false,
      }
    }
  }

  // 检测 /memory 命令
  function isMemoryCommand(text) {
    return text.trim() === '/memory'
  }

  // 调用 AI 总结对话并保存为记忆
  async function summarizeConversation(onDone, onError) {
    const model = getActiveAiModel()
    if (!model) {
      error.value = 'No active model'
      if (onError) onError('No active model')
      return
    }

    if (messages.value.length === 0) {
      error.value = 'No messages to summarize'
      if (onError) onError('No messages to summarize')
      return
    }

    isStreaming.value = true
    error.value = ''

    const provider = AI_PROVIDERS[model.provider] || AI_PROVIDERS.custom
    const isAnthropic = provider.type === 'anthropic'

    // 构建总结请求消息
    const conversationText = messages.value
      .map(m => `[${m.role === 'user' ? '用户' : '助手'}]: ${m.content}`)
      .join('\n')

    const summaryPrompt = isAnthropic
      ? `Please summarize the following conversation into a concise memory. Include key topics and important conclusions. Output directly without any prefix or explanation. Keep it within 200 words.\n\n${conversationText}`
      : '请将以上对话总结为一段简洁的记忆，包含关键话题和重要结论。使用中文，控制在 200 字以内。直接输出总结内容，不要添加任何前缀或解释。'

    const summaryMessages = isAnthropic
      ? [{ role: 'user', content: summaryPrompt }]
      : [
          { role: 'system', content: model.systemPrompt || AI_DEFAULT_SYSTEM_PROMPT },
          { role: 'user', content: summaryPrompt },
        ]

    try {
      let body, headers

      if (isAnthropic) {
        body = JSON.stringify({
          model: model.modelId,
          messages: summaryMessages,
          max_tokens: 1024,
          temperature: 0.3,
          stream: true,
        })
        headers = {
          'Content-Type': 'application/json',
          'x-api-key': model.apiKey,
          'anthropic-version': '2023-06-01',
        }
      } else {
        body = JSON.stringify({
          model: model.modelId,
          messages: summaryMessages,
          temperature: 0.3,
          stream: true,
        })
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${model.apiKey}`,
        }
      }

      const response = await fetch(model.apiEndpoint, {
        method: 'POST',
        headers,
        body,
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(`API error ${response.status}: ${errText}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || trimmed === 'data: [DONE]') continue

          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6))

              let content = ''
              if (isAnthropic) {
                if (data.type === 'content_block_delta' && data.delta?.text) {
                  content = data.delta.text
                }
              } else {
                content = data.choices?.[0]?.delta?.content || ''
              }

              if (content) {
                fullContent += content
              }
            } catch (_) {
              // skip unparseable lines
            }
          }
        }
      }

      // 保存记忆
      if (fullContent.trim()) {
        addAiMemory(fullContent.trim(), '')
        refreshMemories()
        // 在对话中显示系统消息
        messages.value.push({ role: 'user', content: '/memory' })
        messages.value.push({ role: 'assistant', content: '记忆已保存：' + fullContent.trim() })
        saveConversation()
      }

      isStreaming.value = false
      if (onDone) onDone()
    } catch (e) {
      error.value = e.message
      isStreaming.value = false
      if (onError) onError(e.message)
    }
  }

  // 添加记忆（从面板）
  function addMemoryItem(summary) {
    addAiMemory(summary, '')
    refreshMemories()
  }

  // 更新记忆
  function updateMemoryItem(id, updates) {
    updateAiMemory(id, updates)
    refreshMemories()
  }

  // 删除记忆
  function deleteMemoryItem(id) {
    deleteAiMemory(id)
    refreshMemories()
  }

  // 设置记忆范围
  function setMemoryRangeDays(days) {
    setMemoryRange(days)
    memoryRange.value = days
  }

  async function sendMessage(userContent, onChunk, onDone, onError) {
    const model = getActiveAiModel()
    if (!model) {
      error.value = 'No active model'
      if (onError) onError('No active model')
      return
    }

    // 检测 /memory 命令
    if (isMemoryCommand(userContent.trim())) {
      await summarizeConversation(onDone, onError)
      return
    }

    // 立即添加用户消息到 UI
    messages.value.push({ role: 'user', content: userContent })
    saveConversation()
    isStreaming.value = true
    error.value = ''

    const provider = AI_PROVIDERS[model.provider] || AI_PROVIDERS.custom
    const isAnthropic = provider.type === 'anthropic'

    // 构建包含系统提示词和记忆的消息
    const { apiMessages, systemParam } = buildApiMessages(model)

    try {
      let body, headers

      if (isAnthropic) {
        body = JSON.stringify({
          model: model.modelId,
          messages: apiMessages,
          system: systemParam,
          max_tokens: 4096,
          temperature: model.temperature,
          stream: true,
        })
        headers = {
          'Content-Type': 'application/json',
          'x-api-key': model.apiKey,
          'anthropic-version': '2023-06-01',
        }
      } else {
        body = JSON.stringify({
          model: model.modelId,
          messages: apiMessages,
          temperature: model.temperature,
          stream: true,
        })
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${model.apiKey}`,
        }
      }

      const response = await fetch(model.apiEndpoint, {
        method: 'POST',
        headers,
        body,
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(`API error ${response.status}: ${errText}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || trimmed === 'data: [DONE]') continue

          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6))

              let content = ''
              if (isAnthropic) {
                if (data.type === 'content_block_delta' && data.delta?.text) {
                  content = data.delta.text
                }
              } else {
                content = data.choices?.[0]?.delta?.content || ''
              }

              if (content) {
                fullContent += content
                if (onChunk) onChunk(content, fullContent)
              }
            } catch (_) {
              // skip unparseable lines
            }
          }
        }
      }

      // 将 AI 回复添加到 messages
      messages.value.push({ role: 'assistant', content: fullContent })
      messages.value.push({ role: 'assistant', content: fullContent })
      // 持久化保存
      saveConversation()

      isStreaming.value = false
      if (onDone) onDone(fullContent)
    } catch (e) {
      error.value = e.message
      isStreaming.value = false
      if (onError) onError(e.message)
    }
  }

  return {
    messages,
    isStreaming,
    error,
    activeModel,
    config,
    memories,
    memoryRange,
    refreshConfig,
    refreshMemories,
    addModel,
    updateModel,
    deleteModel,
    enableModel,
    disableModel,
    maskApiKey,
    clearMessages,
    clearCurrentConversation,
    sendMessage,
    summarizeConversation,
    addMemoryItem,
    updateMemoryItem,
    deleteMemoryItem,
    setMemoryRangeDays,
    getActiveMemories,
  }
}
