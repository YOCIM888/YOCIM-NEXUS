import { ref, watch } from 'vue'
import {
  getAiConfig, saveAiConfig, getActiveAiModel, generateId, AI_PROVIDERS,
  getAllConversations, getActiveConversation, createConversation,
  saveConversationMessages, deleteConversation, renameConversation,
  setActiveConversation,
  getAiMemories, getActiveMemories, addAiMemory, updateAiMemory, deleteAiMemory,
  getMemoryRange, setMemoryRange, AI_DEFAULT_SYSTEM_PROMPT,
  getSettings, updateSettings,
  getBookmarks, getBookmarksTree, getBookmarksFlat, saveBookmarks,
  addFolder, removeFolder, renameFolder, moveBookmarkToFolder, removeBookmark, renameBookmark,
  getHistory, clearHistory, removeHistoryEntry, deleteHistoryRange,
} from '../utils/storage'

// ===== 命令注册表 =====
export const AI_COMMANDS = {
  '/fav': {
    id: 'fav',
    command: '/fav',
    i18nKey: 'aiCommandFav',
    descKey: 'aiCommandFavDesc',
    needsConfirmation: true,
  },
  '/set': {
    id: 'set',
    command: '/set',
    i18nKey: 'aiCommandSet',
    descKey: 'aiCommandSetDesc',
    needsConfirmation: true,
  },
  '/exp': {
    id: 'exp',
    command: '/exp',
    i18nKey: 'aiCommandExp',
    descKey: 'aiCommandExpDesc',
    needsConfirmation: true,
  },
  '/his': {
    id: 'his',
    command: '/his',
    i18nKey: 'aiCommandHis',
    descKey: 'aiCommandHisDesc',
    needsConfirmation: true,
  },
  '/mem': {
    id: 'mem',
    command: '/mem',
    i18nKey: 'aiCommandMem',
    descKey: 'aiCommandMemDesc',
    needsConfirmation: false,
  },
  '/memory': {
    id: 'mem',
    command: '/memory',
    i18nKey: 'aiCommandMem',
    descKey: 'aiCommandMemDesc',
    needsConfirmation: false,
  },
}

// ===== 命令检测 =====
export function detectCommand(text) {
  const trimmed = text.trim()
  for (const prefix of Object.keys(AI_COMMANDS)) {
    if (trimmed === prefix) {
      return { command: AI_COMMANDS[prefix], content: '' }
    }
    if (trimmed.startsWith(prefix + ' ')) {
      return { command: AI_COMMANDS[prefix], content: trimmed.slice(prefix.length + 1).trim() }
    }
  }
  return null
}

export function getAllCommands() {
  const seen = {}
  const result = []
  for (const entry of Object.values(AI_COMMANDS)) {
    if (!seen[entry.id]) {
      seen[entry.id] = true
      result.push(entry)
    }
  }
  return result
}

export function useAi() {
  const messages = ref([])
  const isStreaming = ref(false)
  const error = ref('')
  const activeModel = ref(getActiveAiModel())
  const config = ref(getAiConfig())
  const memories = ref(getAiMemories())
  const memoryRange = ref(getMemoryRange())
  const pendingActions = ref(null)
  const activeConversationId = ref('')
  const conversationList = ref([])

  function initConversations() {
    const model = getActiveAiModel()
    const data = getAllConversations()
    let conv = getActiveConversation()

    if (!conv && model) {
      conv = createConversation('新对话', model.id)
    }

    if (conv) {
      activeConversationId.value = conv.id
      messages.value = conv.messages || []
    }
    conversationList.value = data.conversations || []
    error.value = ''
    pendingActions.value = null
  }

  function saveConversation() {
    if (activeConversationId.value) {
      saveConversationMessages(activeConversationId.value, messages.value)
    }
  }

  initConversations()

  watch(activeModel, (newModel, oldModel) => {
    if (oldModel?.id) {
      saveConversation()
    }
    initConversations()
  })

  function refreshConfig() {
    config.value = getAiConfig()
    activeModel.value = getActiveAiModel()
  }

  function refreshMemories() {
    memories.value = getAiMemories()
    memoryRange.value = getMemoryRange()
  }

  function refreshConversationList() {
    const data = getAllConversations()
    conversationList.value = data.conversations || []
  }

  function newConversation() {
    saveConversation()
    const model = getActiveAiModel()
    const conv = createConversation('新对话', model?.id || '')
    activeConversationId.value = conv.id
    messages.value = []
    error.value = ''
    pendingActions.value = null
    refreshConversationList()
  }

  function switchConversation(id) {
    if (!id || id === activeConversationId.value) return
    saveConversation()
    setActiveConversation(id)
    const conv = getActiveConversation()
    if (conv) {
      activeConversationId.value = conv.id
      messages.value = conv.messages || []
    }
    error.value = ''
    pendingActions.value = null
  }

  function clearCurrentConversation() {
    if (!activeConversationId.value) return
    deleteConversation(activeConversationId.value)
    const data = getAllConversations()
    conversationList.value = data.conversations || []
    if (data.activeId) {
      const conv = data.conversations.find(c => c.id === data.activeId)
      activeConversationId.value = data.activeId
      messages.value = conv?.messages || []
    } else {
      activeConversationId.value = ''
      messages.value = []
    }
    error.value = ''
    pendingActions.value = null
  }

  function deleteMessage(index) {
    if (index < 0 || index >= messages.value.length) return
    messages.value.splice(index, 1)
    saveConversation()
  }

  async function reReply(index, onChunk, onDone, onError) {
    // 找到被删除回复之前最后一条用户消息
    let lastUserIdx = -1
    for (let i = index - 1; i >= 0; i--) {
      if (messages.value[i].role === 'user') {
        lastUserIdx = i
        break
      }
    }
    if (lastUserIdx === -1) return

    const userMsg = messages.value[lastUserIdx].content
    // 截断消息（从该 AI 回复开始删除）
    messages.value.splice(index)
    saveConversation()

    // 重新发送
    await sendMessage(userMsg, onChunk, onDone, onError)
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
    pendingActions.value = null
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

  // ===== 上下文收集 =====

  function getCommandContext(cmdId) {
    switch (cmdId) {
      case 'fav': {
        const tree = getBookmarksTree()
        if (!tree || tree.every(f => f.bookmarks.length === 0)) {
          return { type: 'bookmarks', data: tree, isEmpty: true }
        }
        return { type: 'bookmarks', data: tree, isEmpty: false }
      }
      case 'set': {
        const settings = getSettings()
        return { type: 'settings', data: settings }
      }
      case 'exp': {
        return { type: 'extensions', placeholder: true }
      }
      case 'his': {
        const history = getHistory()
        if (!history || history.length === 0) {
          return { type: 'history', data: [], isEmpty: true }
        }
        const recent = history.slice(0, 200).map(e => ({
          id: e.id,
          title: e.title,
          time: e.time,
        }))
        return { type: 'history', data: recent, isEmpty: false }
      }
      default:
        return null
    }
  }

  function buildCommandPrompt(cmdId, context, userContent) {
    let ctxText = ''
    let jsonExample = ''
    switch (cmdId) {
      case 'fav': {
        if (context.isEmpty) {
          ctxText = '当前浏览器书签为空。'
        } else {
          const parts = context.data.map(folder => {
            const bms = folder.bookmarks.map(b => `    - ${b.title} [id: ${b.id}]`).join('\n')
            return `文件夹 "${folder.name}" [id: ${folder.id}]:\n${bms || '    (空)'}`
          })
          ctxText = '当前浏览器书签结构：\n' + parts.join('\n')
        }
        jsonExample = '示例JSON:\n```json\n{"actions": [{"action": "createFolder", "name": "社交"}, {"action": "moveBookmark", "bookmarkId": "实际书签id", "toFolderName": "社交"}], "summary": "创建了社交文件夹并移动了相关书签"}\n```\n\n注意：moveBookmark 使用 toFolderName（文件夹名称）而不是 toFolder（ID），因为新建文件夹的 ID 在创建前无法预知。请先用 createFolder 创建所有需要的文件夹，再用 moveBookmark 按 toFolderName 把书签移动到对应文件夹。'
        break
      }
      case 'set': {
        const s = context.data
        ctxText = `当前浏览器设置：\n- 主题: ${s.theme}\n- 广告拦截: ${s.adBlockEnabled ? '已开启' : '已关闭'}\n- 语言: ${s.language}\n- 搜索引擎: ${s.searchEngine}\n- 新标签页: ${s.newTabPage}\n- 启动页: ${s.startupPage}\n- 页面缩放: ${s.pageZoom}\n- 标签栏位置: ${s.tabsPosition || 'top'}\n- 隐藏Logo: ${s.hideLogo ? '是' : '否'}\n- 隐藏图标: ${s.hideIcons ? '是' : '否'}\n- 无痕浏览: ${s.incognitoBrowsing ? '是' : '否'}\n- 恢复页面: ${s.sessionRestore ? '是' : '否'}`
        jsonExample = '可用操作及JSON格式（每个action必须包含"action"和"value"字段）：\n- setTheme: {"action": "setTheme", "value": "dark"}\n- setAdBlock: {"action": "setAdBlock", "value": true}\n- setLanguage: {"action": "setLanguage", "value": "zh"}\n- setSearchEngine: {"action": "setSearchEngine", "value": "bing"}\n- setNewTabPage: {"action": "setNewTabPage", "value": "default"}\n- setStartupPage: {"action": "setStartupPage", "value": "default"}\n- setPageZoom: {"action": "setPageZoom", "value": 1.5}\n- setTabsPosition: {"action": "setTabsPosition", "value": "left"}\n- setHideLogo: {"action": "setHideLogo", "value": true}\n- setHideIcons: {"action": "setHideIcons", "value": false}\n- setIncognitoBrowsing: {"action": "setIncognitoBrowsing", "value": true}\n- setSessionRestore: {"action": "setSessionRestore", "value": false}\n\n示例JSON:\n```json\n{"actions": [{"action": "setTheme", "value": "dark"}], "summary": "已切换深色模式"}\n```'
        break
      }
      case 'exp': {
        ctxText = '浏览器扩展列表需要从 Electron 主进程获取。请告知用户使用浏览器的扩展面板手动查看，或只提供建议。你可以使用以下操作：disableExtension(id)、enableExtension(id)、removeExtension(id)，但需要先让用户提供扩展的 ID。'
        jsonExample = '示例JSON:\n```json\n{"actions": [{"action": "removeExtension", "id": "扩展id"}], "summary": "将删除指定的扩展"}\n```\n注意：如果不知道扩展ID，请告诉用户去扩展面板查看，不要编造ID。'
        break
      }
      case 'his': {
        if (context.isEmpty) {
          ctxText = '当前没有浏览历史记录。'
        } else {
          const entries = context.data.map(e =>
            `- [${new Date(e.time).toLocaleString('zh-CN')}] ${e.title} [id: ${e.id}]`
          ).join('\n')
          ctxText = `最近 ${context.data.length} 条浏览历史记录：\n${entries}`
        }
        jsonExample = '可用操作：deleteToday（删除今天）| deleteAll（删除全部）| deleteRange（删除时间段，需要from和to时间戳）\n示例JSON:\n```json\n{"actions": [{"action": "deleteToday"}], "summary": "将删除今天的所有历史记录"}\n```'
        break
      }
      default:
        break
    }

    return `用户请求: ${userContent || '执行操作'}\n\n${ctxText}\n\n${jsonExample}\n\n请根据上述信息和用户请求，生成操作计划。请用自然语言解释，在末尾用 \`\`\`json 代码块提供操作指令。`
  }

  // ===== JSON 解析 =====

  function extractJsonFromResponse(text) {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/)
    if (!jsonMatch) return null
    try {
      return JSON.parse(jsonMatch[1].trim())
    } catch (_) {
      return null
    }
  }

  // ===== 动作执行器 =====

  async function executeActions(cmdId, actions) {
    const results = []
    for (const action of actions) {
      try {
        switch (cmdId) {
          case 'fav':
            results.push(executeBookmarkAction(action))
            break
          case 'set':
            results.push(await executeSettingAction(action))
            break
          case 'exp':
            results.push(await executeExtensionAction(action))
            break
          case 'his':
            results.push(executeHistoryAction(action))
            break
          default:
            results.push({ action: action.action, success: false, error: 'Unknown command' })
        }
      } catch (e) {
        results.push({ action: action.action, success: false, error: e.message })
      }
    }
    return results
  }

  function executeBookmarkAction(action) {
    switch (action.action) {
      case 'createFolder': {
        if (!action.name) return { action: 'createFolder', success: false, error: 'Missing folder name' }
        const result = addFolder(action.name)
        const folder = result.folders[result.folders.length - 1]
        return { action: 'createFolder', success: true, folderId: folder.id, name: action.name }
      }
      case 'moveBookmark': {
        const bookmarkId = action.bookmarkId
        if (!bookmarkId) {
          return { action: 'moveBookmark', success: false, error: 'Missing bookmarkId' }
        }

        // 查找目标文件夹（支持 ID 或名称）
        let targetFolderId = null
        const bms = getBookmarks()
        if (action.toFolder) {
          // 先尝试按 ID 查找
          if (bms.folders.some(f => f.id === action.toFolder)) {
            targetFolderId = action.toFolder
          } else {
            // 按名称查找
            const byName = bms.folders.find(f => f.name === action.toFolder)
            if (byName) targetFolderId = byName.id
          }
        }
        if (action.toFolderName) {
          const byName = bms.folders.find(f => f.name === action.toFolderName)
          if (byName) targetFolderId = byName.id
        }
        if (!targetFolderId) {
          const nameInfo = action.toFolder || action.toFolderName || ''
          return { action: 'moveBookmark', success: false, error: `Target folder not found: ${nameInfo}` }
        }

        // 查找书签所在的源文件夹
        let fromFolderId = null
        for (const f of bms.folders) {
          if (f.bookmarks.some(b => b.id === bookmarkId)) {
            fromFolderId = f.id
            break
          }
        }
        if (!fromFolderId) return { action: 'moveBookmark', success: false, error: 'Bookmark not found' }
        if (fromFolderId === targetFolderId) return { action: 'moveBookmark', success: true, bookmarkId, toFolder: targetFolderId, skipped: true }

        moveBookmarkToFolder(fromFolderId, bookmarkId, targetFolderId)
        return { action: 'moveBookmark', success: true, bookmarkId, toFolder: targetFolderId }
      }
      case 'renameFolder': {
        if (!action.folderId) return { action: 'renameFolder', success: false, error: 'Missing folderId' }
        if (action.folderName) {
          const bms = getBookmarks()
          const folder = bms.folders.find(f => f.name === action.folderName)
          if (folder) action.folderId = folder.id
        }
        if (!action.newName) return { action: 'renameFolder', success: false, error: 'Missing newName' }
        renameFolder(action.folderId, action.newName)
        return { action: 'renameFolder', success: true, folderId: action.folderId, newName: action.newName }
      }
      case 'deleteFolder': {
        if (!action.folderId) return { action: 'deleteFolder', success: false, error: 'Missing folderId' }
        removeFolder(action.folderId)
        return { action: 'deleteFolder', success: true, folderId: action.folderId }
      }
      case 'renameBookmark': {
        if (!action.folderId || !action.bookmarkId || !action.newTitle) {
          return { action: 'renameBookmark', success: false, error: 'Missing folderId, bookmarkId, or newTitle' }
        }
        renameBookmark(action.folderId, action.bookmarkId, action.newTitle)
        return { action: 'renameBookmark', success: true, bookmarkId: action.bookmarkId }
      }
      case 'deleteBookmark': {
        if (!action.folderId || !action.bookmarkId) {
          return { action: 'deleteBookmark', success: false, error: 'Missing folderId or bookmarkId' }
        }
        removeBookmark(action.folderId, action.bookmarkId)
        return { action: 'deleteBookmark', success: true, bookmarkId: action.bookmarkId }
      }
      default:
        return { action: action.action, success: false, error: 'Unknown action: ' + action.action }
    }
  }

  async function executeSettingAction(action) {
    switch (action.action) {
      case 'setTheme':
        if (!['light', 'dark', 'system'].includes(action.value)) {
          return { action: 'setTheme', success: false, error: 'Invalid theme: ' + action.value }
        }
        updateSettings({ theme: action.value })
        return { action: 'setTheme', success: true, value: action.value }
      case 'setAdBlock': {
        const enabled = !!action.value
        updateSettings({ adBlockEnabled: enabled })
        try { await window.electronAPI?.adBlockToggle(enabled) } catch (_) {}
        return { action: 'setAdBlock', success: true, value: enabled }
      }
      case 'setLanguage':
        if (!['zh', 'en'].includes(action.value)) {
          return { action: 'setLanguage', success: false, error: 'Invalid language: ' + action.value }
        }
        updateSettings({ language: action.value })
        return { action: 'setLanguage', success: true, value: action.value }
      case 'setNewTabPage':
        updateSettings({ newTabPage: action.value, newTabUrl: action.url || '' })
        return { action: 'setNewTabPage', success: true, value: action.value }
      case 'setStartupPage':
        updateSettings({ startupPage: action.value, startupUrl: action.url || '' })
        return { action: 'setStartupPage', success: true, value: action.value }
      case 'setSearchEngine':
        updateSettings({ searchEngine: action.value })
        return { action: 'setSearchEngine', success: true, value: action.value }
      case 'setPageZoom': {
        const zoom = parseFloat(action.value)
        if (isNaN(zoom) || zoom < 0.5 || zoom > 3) {
          return { action: 'setPageZoom', success: false, error: 'Invalid zoom: ' + action.value }
        }
        updateSettings({ pageZoom: zoom })
        return { action: 'setPageZoom', success: true, value: zoom }
      }
      case 'setTabsPosition':
        if (!['top', 'left'].includes(action.value)) {
          return { action: 'setTabsPosition', success: false, error: 'Invalid position: ' + action.value }
        }
        updateSettings({ tabsPosition: action.value })
        return { action: 'setTabsPosition', success: true, value: action.value }
      case 'setHideLogo':
        updateSettings({ hideLogo: !!action.value })
        return { action: 'setHideLogo', success: true, value: !!action.value }
      case 'setHideIcons':
        updateSettings({ hideIcons: !!action.value })
        return { action: 'setHideIcons', success: true, value: !!action.value }
      case 'setIncognitoBrowsing':
        updateSettings({ incognitoBrowsing: !!action.value })
        return { action: 'setIncognitoBrowsing', success: true, value: !!action.value }
      case 'setSessionRestore':
        updateSettings({ sessionRestore: !!action.value })
        return { action: 'setSessionRestore', success: true, value: !!action.value }
      default:
        return { action: action.action, success: false, error: 'Unknown action' }
    }
  }

  async function executeExtensionAction(action) {
    switch (action.action) {
      case 'disableExtension':
        if (!action.id) return { action: 'disableExtension', success: false, error: 'Missing extension id' }
        await window.electronAPI?.extensionsToggle(action.id, false)
        return { action: 'disableExtension', success: true, id: action.id }
      case 'enableExtension':
        if (!action.id) return { action: 'enableExtension', success: false, error: 'Missing extension id' }
        await window.electronAPI?.extensionsToggle(action.id, true)
        return { action: 'enableExtension', success: true, id: action.id }
      case 'removeExtension':
        if (!action.id) return { action: 'removeExtension', success: false, error: 'Missing extension id' }
        await window.electronAPI?.extensionsRemove(action.id)
        return { action: 'removeExtension', success: true, id: action.id }
      default:
        return { action: action.action, success: false, error: 'Unknown action' }
    }
  }

  function executeHistoryAction(action) {
    switch (action.action) {
      case 'deleteToday': {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const deleted = deleteHistoryRange(today.getTime())
        return { action: 'deleteToday', success: true, deleted }
      }
      case 'deleteRange': {
        const from = action.from || 0
        const to = action.to || Date.now()
        const deleted = deleteHistoryRange(from, to)
        return { action: 'deleteRange', success: true, deleted }
      }
      case 'deleteAll': {
        const history = getHistory()
        clearHistory()
        return { action: 'deleteAll', success: true, deleted: history.length }
      }
      default:
        return { action: action.action, success: false, error: 'Unknown action' }
    }
  }

  // ===== 确认/取消 =====

  function formatActionResult(r) {
    switch (r.action) {
      case 'createFolder': return `已创建文件夹 "${r.name}"`
      case 'moveBookmark': return r.skipped ? '书签已在目标文件夹中' : `已移动书签 ${r.bookmarkId}`
      case 'renameFolder': return `已将文件夹重命名为 "${r.newName}"`
      case 'deleteFolder': return `已删除文件夹 ${r.folderId}`
      case 'renameBookmark': return `已重命名书签 ${r.bookmarkId}`
      case 'deleteBookmark': return `已删除书签 ${r.bookmarkId}`
      case 'setTheme': return `主题已切换为 ${r.value}`
      case 'setAdBlock': return `广告拦截已${r.value ? '开启' : '关闭'}`
      case 'setLanguage': return `语言已切换为 ${r.value}`
      case 'setSearchEngine': return `搜索引擎已切换为 ${r.value}`
      case 'setNewTabPage': return `新标签页已设置`
      case 'setStartupPage': return `启动页已设置`
      case 'setPageZoom': return `页面缩放已设置为 ${r.value}`
      case 'setTabsPosition': return `标签栏位置已切换为 ${r.value}`
      case 'setHideLogo': return `Logo ${r.value ? '已隐藏' : '已显示'}`
      case 'setHideIcons': return `图标 ${r.value ? '已隐藏' : '已显示'}`
      case 'setIncognitoBrowsing': return `无痕浏览已${r.value ? '开启' : '关闭'}`
      case 'setSessionRestore': return `页面恢复已${r.value ? '开启' : '关闭'}`
      case 'disableExtension': return `已禁用扩展 ${r.id}`
      case 'enableExtension': return `已启用扩展 ${r.id}`
      case 'removeExtension': return `已删除扩展 ${r.id}`
      case 'deleteToday': return `已删除今天 ${r.deleted} 条历史记录`
      case 'deleteRange': return `已删除 ${r.deleted} 条历史记录`
      case 'deleteAll': return `已删除全部 ${r.deleted} 条历史记录`
      default: return `${r.action} 完成`
    }
  }

  function confirmPendingActions() {
    if (!pendingActions.value) return
    const pa = pendingActions.value
    pendingActions.value = null
    executeActions(pa.commandType, pa.actions).then(results => {
      const successResults = results.filter(r => r.success)
      const failResults = results.filter(r => !r.success)
      
      let resultMsg = pa.summary + '\n\n'
      resultMsg += `✅ ${successResults.length} 项成功`
      if (failResults.length > 0) resultMsg += `，❌ ${failResults.length} 项失败`
      resultMsg += '\n'
      
      for (const r of successResults) {
        resultMsg += `  ✓ ${formatActionResult(r)}\n`
      }
      for (const r of failResults) {
        resultMsg += `  ✗ ${r.action}: ${r.error || '未知错误'}\n`
      }
      
      messages.value.push({ role: 'assistant', content: resultMsg.trim() })
      saveConversation()
    }).catch(e => {
      messages.value.push({ role: 'assistant', content: `操作执行失败: ${e.message}` })
      saveConversation()
    })
  }

  function cancelPendingActions() {
    if (pendingActions.value) {
      pendingActions.value = null
      messages.value.push({ role: 'assistant', content: '操作已取消。' })
      saveConversation()
    }
  }

  // ===== 检测 /memory 或 /mem 命令 =====
  function isMemoryCommand(text) {
    const trimmed = text.trim()
    return trimmed === '/memory' || trimmed === '/mem'
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

      if (fullContent.trim()) {
        addAiMemory(fullContent.trim(), '')
        refreshMemories()
        messages.value.push({ role: 'user', content: '/mem' })
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

  // ===== 发送消息 (支持命令) =====

  async function sendMessage(userContent, onChunk, onDone, onError) {
    const model = getActiveAiModel()
    if (!model) {
      error.value = 'No active model'
      if (onError) onError('No active model')
      return
    }

    // 检测命令
    const cmdResult = detectCommand(userContent.trim())

    // /mem 或 /memory 命令
    if (cmdResult && cmdResult.command.id === 'mem') {
      await summarizeConversation(onDone, onError)
      return
    }

    // 其他浏览器命令
    if (cmdResult && cmdResult.command.needsConfirmation) {
      await handleBrowserCommand(cmdResult, onDone, onError)
      return
    }

    // 普通对话
    messages.value.push({ role: 'user', content: userContent })
    saveConversation()
    isStreaming.value = true
    error.value = ''

    const provider = AI_PROVIDERS[model.provider] || AI_PROVIDERS.custom
    const isAnthropic = provider.type === 'anthropic'
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

      messages.value.push({ role: 'assistant', content: fullContent })
      saveConversation()

      isStreaming.value = false
      if (onDone) onDone(fullContent)
    } catch (e) {
      error.value = e.message
      isStreaming.value = false
      if (onError) onError(e.message)
    }
  }

  // ===== 浏览器命令处理 =====

  async function handleBrowserCommand(cmdResult, onDone, onError) {
    const cmdId = cmdResult.command.id
    const userContent = cmdResult.content

    const model = getActiveAiModel()
    if (!model) {
      if (onError) onError('No active model')
      return
    }

    // 收集上下文
    const context = getCommandContext(cmdId)

    // 扩展命令需要获取真实扩展列表
    if (cmdId === 'exp' && context.placeholder) {
      try {
        const extList = await window.electronAPI?.extensionsList()
        context.data = extList || []
        context.placeholder = false
        if (!context.data || context.data.length === 0) {
          context.isEmpty = true
        }
      } catch (_) {
        context.data = []
        context.isEmpty = true
      }
    }

    // 构建命令提示词
    const commandPrompt = buildCommandPrompt(cmdId, context, userContent)

    // 添加用户消息并发送给 AI
    messages.value.push({ role: 'user', content: cmdResult.command.command + (userContent ? ' ' + userContent : '') })
    saveConversation()

    // 添加系统上下文作为隐藏消息（只发 API，不进 UI）
    const modelMessages = [
      { role: 'system', content: (model.systemPrompt || AI_DEFAULT_SYSTEM_PROMPT) },
      ...messages.value.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: commandPrompt },
    ]

    isStreaming.value = true
    error.value = ''

    const provider = AI_PROVIDERS[model.provider] || AI_PROVIDERS.custom
    const isAnthropic = provider.type === 'anthropic'

    try {
      let body, headers

      if (isAnthropic) {
        const systemContent = (model.systemPrompt || AI_DEFAULT_SYSTEM_PROMPT)
        const userMsgs = [
          ...messages.value.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: commandPrompt },
        ]
        body = JSON.stringify({
          model: model.modelId,
          messages: userMsgs,
          system: systemContent,
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
          messages: modelMessages,
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
              }
            } catch (_) {
              // skip unparseable lines
            }
          }
        }
      }

      isStreaming.value = false

      // 解析 JSON 操作指令
      const json = extractJsonFromResponse(fullContent)

      if (!fullContent.trim()) {
        messages.value.push({ role: 'assistant', content: 'AI 未返回有效内容' })
        saveConversation()
        if (onDone) onDone()
        return
      }

      if (json && json.actions && json.actions.length > 0) {
        // 去掉 AI 响应中的 JSON 代码块，只留自然语言
        const cleanContent = fullContent.replace(/```json[\s\S]*?```/g, '').trim()

        // 显示 AI 的自然语言解释
        if (cleanContent) {
          messages.value.push({ role: 'assistant', content: cleanContent })
        } else {
          messages.value.push({ role: 'assistant', content: fullContent.replace(/```json[\s\S]*?```/g, '').trim() || fullContent })
        }

        saveConversation()

        // 设置待确认动作
        pendingActions.value = {
          commandType: cmdId,
          actions: json.actions,
          summary: json.summary || '确认执行以下操作？',
        }
      } else {
        // 无操作指令，直接显示 AI 回复
        messages.value.push({ role: 'assistant', content: fullContent })
        saveConversation()
      }

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
    pendingActions,
    activeConversationId,
    conversationList,
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
    newConversation,
    switchConversation,
    deleteMessage,
    reReply,
    refreshConversationList,
    sendMessage,
    summarizeConversation,
    addMemoryItem,
    updateMemoryItem,
    deleteMemoryItem,
    setMemoryRangeDays,
    getActiveMemories,
    confirmPendingActions,
    cancelPendingActions,
  }
}
