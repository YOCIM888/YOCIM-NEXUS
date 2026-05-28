import { ref } from 'vue'
import { getAiConfig, saveAiConfig, getActiveAiModel, generateId, AI_PROVIDERS } from '../utils/storage'

export function useAi() {
  const messages = ref([])
  const isStreaming = ref(false)
  const error = ref('')
  const activeModel = ref(getActiveAiModel())
  const config = ref(getAiConfig())

  function refreshConfig() {
    config.value = getAiConfig()
    activeModel.value = getActiveAiModel()
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

  async function sendMessage(userContent, onChunk, onDone, onError) {
    const model = getActiveAiModel()
    if (!model) {
      error.value = 'No active model'
      if (onError) onError('No active model')
      return
    }

    messages.value.push({ role: 'user', content: userContent })
    isStreaming.value = true
    error.value = ''

    const provider = AI_PROVIDERS[model.provider] || AI_PROVIDERS.custom
    const isAnthropic = provider.type === 'anthropic'

    try {
      let body, headers

      if (isAnthropic) {
        const msgs = messages.value.map(m => ({ role: m.role, content: m.content }))
        body = JSON.stringify({
          model: model.modelId,
          messages: msgs,
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
          messages: messages.value,
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

      messages.value.push({ role: 'assistant', content: fullContent })
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
    refreshConfig,
    addModel,
    updateModel,
    deleteModel,
    enableModel,
    disableModel,
    maskApiKey,
    clearMessages,
    sendMessage,
  }
}
