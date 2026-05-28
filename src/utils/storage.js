const KEYS = {
  NAV_SITES: 'yocim_nav_sites',
  BOOKMARKS: 'yocim_bookmarks',
  HISTORY: 'yocim_history',
  SETTINGS: 'yocim_settings',
  DOWNLOADS: 'yocim_downloads',
  NOTES: 'yocim_notes',
  READING_LIST: 'yocim_reading_list',
  PASSWORDS: 'yocim_passwords',
  PASSWORD_PIN: 'yocim_password_pin',
  SESSION: 'yocim_session',
  AI_CONFIG: 'yocim_ai_config',
  AI_CONVERSATIONS: 'yocim_ai_conversations',
  AI_MEMORIES: 'yocim_ai_memories',
}

export const AI_PROVIDERS = {
  openai: { name: 'OpenAI', endpoint: 'https://api.openai.com/v1/chat/completions', authHeader: 'Bearer', type: 'openai' },
  anthropic: { name: 'Anthropic Claude', endpoint: 'https://api.anthropic.com/v1/messages', authHeader: 'x-api-key', type: 'anthropic', modelId: 'claude-3-5-sonnet-20241022' },
  deepseek: { name: 'DeepSeek', endpoint: 'https://api.deepseek.com/v1/chat/completions', authHeader: 'Bearer', type: 'openai' },
  groq: { name: 'Groq', endpoint: 'https://api.groq.com/openai/v1/chat/completions', authHeader: 'Bearer', type: 'openai' },
  ollama: { name: 'Ollama (本地)', endpoint: 'http://localhost:11434/v1/chat/completions', authHeader: 'Bearer', type: 'openai' },
  custom: { name: '自定义', endpoint: '', authHeader: 'Bearer', type: 'openai' },
}

const defaultNavSites = [
  { id: '1', name: 'YOCIM轻站', url: 'https://yocim.top', icon: 'https://yocim.top/public/images/xiyue.webp' },
  { id: '2', name: 'YOCIM面板', url: 'https://workbench.yocim.top', icon: 'https://workbench.yocim.top/icon/YOCIM.png' },
  { id: '3', name: 'GitHub', url: 'https://github.com', icon: 'https://github.githubassets.com/favicons/favicon.svg' },
  { id: '4', name: 'Vercel', url: 'https://vercel.com', icon: 'https://image.uisdc.com/wp-content/uploads/2025/10/nav-logo-Vercel.webp' },
  { id: '5', name: 'GitLab', url: 'https://gitlab.com', icon: 'https://gitlab.com/favicon.png' },
  { id: '6', name: 'Gitee', url: 'https://gitee.com', icon: 'https://gitee.com/favicon.ico' },
  { id: '7', name: 'GitCode', url: 'https://gitcode.com', icon: 'https://gitcode.com/favicon.ico' },
  { id: '8', name: 'Gitea', url: 'https://gitea.com', icon: 'https://www1.cstcloud.cn/app/site/resources/2023/08/00549/Gitea-Logo.wine.png' },
]

const defaultBookmarks = {
  folders: [
    { id: 'default', name: '默认书签', bookmarks: [] },
  ],
}

const defaultSettings = {
  language: 'en',
  downloadPath: '',
  background: '',
  autoBackupPath: '',
  autoBackupEnabled: false,
  autoBackupInterval: 24,
  lastBackupTime: 0,
  searchEngine: 'bing',
  theme: 'light',
  customTheme: null,
  adBlockEnabled: true,
  suspendTimeout: 5,
  startupPage: 'default',
  startupUrl: '',
  newTabPage: 'default',
  newTabUrl: '',
  hideLogo: false,
  hideIcons: false,
  incognitoBrowsing: false,
  pageZoom: 1.0,
  bookmarkPanelWidth: 260,
  bookmarkPanelBg: '',
  historyPanelWidth: 260,
  historyPanelBg: '',
  downloadPanelWidth: 260,
  downloadPanelBg: '',
  readingListPanelWidth: 260,
  readingListPanelBg: '',
  notesPanelWidth: 260,
  notesPanelBg: '',
  extensionsPanelWidth: 260,
  extensionsPanelBg: '',
  sessionRestore: false,
  tabsPosition: 'top',
  langConfirmed: false,
  toolbarBookmarks: true,
  toolbarReadingList: false,
  toolbarHistory: true,
  toolbarDownloads: true,
  toolbarNotes: false,
  toolbarExtensions: false,
  toolbarAI: true,
  aiPanelWidth: 380,
  aiPanelBg: '',
  protocolBlockMode: 'blacklist',
  protocolWhitelist: ['http:', 'https:', 'file:', 'blob:', 'data:'],
  protocolBlacklist: [
    'shell:', 'explorer:', 'cmd:', 'powershell:', 'pwsh:', 'regedit:',
    'control:', 'ms-settings:', 'ms-windows-store:', 'ms-edge:',
    'ms-excel:', 'ms-word:', 'ms-powerpoint:', 'ms-outlook:', 'ms-teams:',
    'ms-calculator:', 'ms-photos:', 'ms-music:', 'ms-video:',
    'rundll32:', 'wscript:', 'cscript:', 'mshta:', 'javascript:',
    'vbscript:', 'about:', 'chrome:', 'edge:', 'brave:', 'firefox:',
    'bytedance:', 'douyin:', 'douyinlite:', 'iesdouyin:', 'toutiao:',
    'xigua:', 'huoshan:', 'feishu:', 'lark:', 'capcut:', 'jianying:',
    'volcengine:', 'doubao:', 'zijie:',
    'wechat:', 'weixin:', 'qq:', 'mqq:', 'tencent:', 'wxpay:',
    'qzone:', 'tim:', 'wegame:', 'qqmusic:', 'qqvideo:', 'tencentvideo:',
    'kingsoft:', 'wps:', 'dianping:', 'meituan:',
    'alipay:', 'alipays:', 'taobao:', 'tmall:', '1688:', 'dingtalk:',
    'aliyun:', 'alibaba:', 'eleme:', 'koubei:', 'amap:', 'gaode:',
    'baidu:', 'baidumap:', 'tieba:', 'pan:', 'baiduapp:', 'haokan:',
    'jd:', 'openapp.jdmobile:', 'bilibili:', 'xiaohongshu:', 'kuaishou:',
    'pinduoduo:', 'suning:', 'netease:', '163:', 'music.163:', 'orpheus:',
    'zhihu:', 'weibo:', 'sinaweibo:', '58:', 'ganji:', 'lianjia:',
    'ke:', 'didi:', 'mobike:', 'ofo:', 'ctrip:', 'qunar:', 'mafengwo:',
    'google:', 'gmail:', 'drive:', 'maps:', 'youtube:',
    'apple:', 'itunes:', 'appstore:', 'icloud:', 'facetime:', 'imessage:',
    'microsoft:', 'skype:', 'teams:', 'outlook:', 'onedrive:',
    'amazon:', 'aws:', 'spotify:', 'netflix:', 'hulu:', 'disney:',
    'steam:', 'epic:', 'origin:', 'uplay:', 'discord:', 'slack:',
    'zoom:', 'meet:', 'webex:', 'telegram:', 'whatsapp:', 'signal:',
    'twitter:', 'x:', 'facebook:', 'instagram:', 'tiktok:', 'snapchat:',
    'mailto:', 'tel:', 'sms:', 'fax:', 'callto:',
    'ssh:', 'telnet:', 'ftp:', 'sftp:', 'tftp:', 'ldap:',
    'nntp:', 'gopher:', 'irc:', 'xmpp:', 'jabber:', 'magnet:',
    'thunder:', 'xunlei:', 'ed2k:', 'emule:', 'bittorrent:',
    'torrent:', 'flashget:', 'qqdl:', 'fs2you:',
    '115:', 'baiduyun:', 'pan.baidu:', 'aliyundrive:',
    'epicgames:', 'battlenet:',
    'riotgames:', 'leagueoflegends:', 'valorant:', 'csgo:',
    'minecraft:', 'roblox:', 'fortnite:', 'pubg:', 'genshin:',
    'starrail:', 'zenless:', 'wutheringwaves:',
  ],
}

export const SEARCH_ENGINES = {
  google: { key: 'google', searchUrl: 'https://www.google.com/search?q=', suggestUrl: 'https://suggestqueries.google.com/complete/search?client=chrome&q=' },
  bing: { key: 'bing', searchUrl: 'https://www.bing.com/search?q=', suggestUrl: 'https://api.bing.com/qsonhs.aspx?q=' },
  baidu: { key: 'baidu', searchUrl: 'https://www.baidu.com/s?wd=', suggestUrl: 'https://suggestion.baidu.com/su?wd=' },
  sogou: { key: 'sogou', searchUrl: 'https://www.sogou.com/web?query=', suggestUrl: 'https://suggest.sogou.com/suggest?type=web&query=' },
  yandex: { key: 'yandex', searchUrl: 'https://yandex.com/search/?text=', suggestUrl: 'https://suggest.yandex.com/suggest-ff.cgi?part=' },
  naver: { key: 'naver', searchUrl: 'https://search.naver.com/search.naver?query=', suggestUrl: 'https://ac.search.naver.com/nx/ac?q=' },
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function getNavSites() {
  const data = localStorage.getItem(KEYS.NAV_SITES)
  if (!data) {
    saveNavSites(defaultNavSites)
    return [...defaultNavSites]
  }
  return JSON.parse(data)
}

export function saveNavSites(sites) {
  localStorage.setItem(KEYS.NAV_SITES, JSON.stringify(sites))
}

export function addNavSite(site) {
  const sites = getNavSites()
  sites.push({ id: generateId(), ...site })
  saveNavSites(sites)
  return sites
}

export function removeNavSite(id) {
  const sites = getNavSites().filter(s => s.id !== id)
  saveNavSites(sites)
  return sites
}

export function updateNavSite(id, data) {
  const sites = getNavSites()
  const idx = sites.findIndex(s => s.id === id)
  if (idx === -1) return sites
  sites[idx] = { ...sites[idx], ...data }
  saveNavSites(sites)
  return sites
}

export function getBookmarks() {
  const data = localStorage.getItem(KEYS.BOOKMARKS)
  if (!data) {
    saveBookmarks(defaultBookmarks)
    return JSON.parse(JSON.stringify(defaultBookmarks))
  }
  return JSON.parse(data)
}

export function saveBookmarks(data) {
  localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(data))
}

export function addBookmark({ title, url, folderId }) {
  const data = getBookmarks()
  const targetId = folderId || 'default'
  const folder = data.folders.find(f => f.id === targetId)
  if (!folder) return data
  if (folder.bookmarks.some(b => b.url === url)) return data
  folder.bookmarks.push({ id: generateId(), title, url })
  saveBookmarks(data)
  return data
}

export function removeBookmark(folderId, bookmarkId) {
  const data = getBookmarks()
  const folder = data.folders.find(f => f.id === folderId)
  if (!folder) return data
  folder.bookmarks = folder.bookmarks.filter(b => b.id !== bookmarkId)
  saveBookmarks(data)
  return data
}

export function removeBookmarkByUrl(url) {
  const data = getBookmarks()
  for (const folder of data.folders) {
    folder.bookmarks = folder.bookmarks.filter(b => b.url !== url)
  }
  saveBookmarks(data)
  return data
}

export function isBookmarked(url) {
  const data = getBookmarks()
  return data.folders.some(f => f.bookmarks.some(b => b.url === url))
}

export function addFolder(name) {
  const data = getBookmarks()
  data.folders.push({ id: generateId(), name, bookmarks: [] })
  saveBookmarks(data)
  return data
}

export function removeFolder(folderId) {
  const data = getBookmarks()
  data.folders = data.folders.filter(f => f.id !== folderId)
  saveBookmarks(data)
  return data
}

export function renameFolder(folderId, newName) {
  const data = getBookmarks()
  const folder = data.folders.find(f => f.id === folderId)
  if (folder) folder.name = newName
  saveBookmarks(data)
  return data
}

export function renameBookmark(folderId, bookmarkId, newTitle) {
  const data = getBookmarks()
  const folder = data.folders.find(f => f.id === folderId)
  if (!folder) return data
  const bm = folder.bookmarks.find(b => b.id === bookmarkId)
  if (bm) bm.title = newTitle
  saveBookmarks(data)
  return data
}

export function moveBookmarkToFolder(fromFolderId, bookmarkId, toFolderId) {
  const data = getBookmarks()
  const fromFolder = data.folders.find(f => f.id === fromFolderId)
  const toFolder = data.folders.find(f => f.id === toFolderId)
  if (!fromFolder || !toFolder) return data
  const idx = fromFolder.bookmarks.findIndex(b => b.id === bookmarkId)
  if (idx === -1) return data
  const [bookmark] = fromFolder.bookmarks.splice(idx, 1)
  toFolder.bookmarks.push(bookmark)
  saveBookmarks(data)
  return data
}

export function getHistory() {
  const data = localStorage.getItem(KEYS.HISTORY)
  return data ? JSON.parse(data) : []
}

export function saveHistory(history) {
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(history))
}

export function addHistoryEntry({ title, url }) {
  if (!url || url.startsWith('yocim://')) return getHistory()
  const history = getHistory()
  history.unshift({ id: generateId(), title: title || url, url, time: Date.now() })
  if (history.length > 500) history.length = 500
  saveHistory(history)
  return history
}

export function clearHistory() {
  saveHistory([])
  return []
}

export function removeHistoryEntry(id) {
  const history = getHistory().filter(e => e.id !== id)
  saveHistory(history)
  return history
}

export function getSettings() {
  const data = localStorage.getItem(KEYS.SETTINGS)
  if (!data) {
    saveSettings(defaultSettings)
    return { ...defaultSettings }
  }
  return { ...defaultSettings, ...JSON.parse(data) }
}

export function saveSettings(settings) {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings))
}

export function updateSettings(partial) {
  const settings = getSettings()
  const updated = { ...settings, ...partial }
  saveSettings(updated)
  return updated
}

export function getDownloads() {
  const data = localStorage.getItem(KEYS.DOWNLOADS)
  return data ? JSON.parse(data) : []
}

export function saveDownloads(downloads) {
  localStorage.setItem(KEYS.DOWNLOADS, JSON.stringify(downloads))
}

export function addDownload(item) {
  const downloads = getDownloads()
  downloads.unshift({ ...item, id: item.id || generateId() })
  saveDownloads(downloads)
  return downloads
}

export function updateDownload(id, partial) {
  const downloads = getDownloads()
  const idx = downloads.findIndex(d => d.id === id)
  if (idx !== -1) {
    downloads[idx] = { ...downloads[idx], ...partial }
    saveDownloads(downloads)
  }
  return downloads
}

export function removeDownload(id) {
  const downloads = getDownloads().filter(d => d.id !== id)
  saveDownloads(downloads)
  return downloads
}

export function exportAllData() {
  const data = {}
  for (const [key, storageKey] of Object.entries(KEYS)) {
    const raw = localStorage.getItem(storageKey)
    data[key] = raw ? JSON.parse(raw) : null
  }
  return JSON.stringify(data, null, 2)
}

export function importAllData(jsonStr) {
  const data = JSON.parse(jsonStr)
  for (const [key, storageKey] of Object.entries(KEYS)) {
    if (data[key] !== null && data[key] !== undefined) {
      localStorage.setItem(storageKey, JSON.stringify(data[key]))
    }
  }
}

export function clearAllData() {
  localStorage.clear()
}

export function getReadingList() {
  const data = localStorage.getItem(KEYS.READING_LIST)
  return data ? JSON.parse(data) : []
}

export function saveReadingList(list) {
  localStorage.setItem(KEYS.READING_LIST, JSON.stringify(list))
}

export function addToReadingList({ title, url }) {
  const list = getReadingList()
  if (list.some(item => item.url === url)) return list
  list.unshift({ id: generateId(), title, url, time: Date.now() })
  saveReadingList(list)
  return list
}

export function removeFromReadingList(id) {
  const list = getReadingList().filter(item => item.id !== id)
  saveReadingList(list)
  return list
}

export function getNotes() {
  const data = localStorage.getItem(KEYS.NOTES)
  return data ? JSON.parse(data) : []
}

export function saveNotes(notes) {
  localStorage.setItem(KEYS.NOTES, JSON.stringify(notes))
}

export function addNote({ title, content }) {
  const notes = getNotes()
  notes.unshift({ id: generateId(), title: title || '', content: content || '', time: Date.now(), pinned: false, color: '', order: Date.now() })
  saveNotes(notes)
  return notes
}

export function updateNote(id, { title, content }) {
  const notes = getNotes()
  const idx = notes.findIndex(n => n.id === id)
  if (idx !== -1) {
    if (title !== undefined) notes[idx].title = title
    if (content !== undefined) notes[idx].content = content
    notes[idx].time = Date.now()
    saveNotes(notes)
  }
  return notes
}

export function updateNoteMeta(id, meta) {
  const notes = getNotes()
  const idx = notes.findIndex(n => n.id === id)
  if (idx !== -1) {
    Object.assign(notes[idx], meta)
    saveNotes(notes)
  }
  return notes
}

export function reorderNotes(orderedIds) {
  const notes = getNotes()
  const map = {}
  for (const n of notes) map[n.id] = n
  const reordered = orderedIds.map((id, i) => {
    if (map[id]) {
      map[id].order = i
      return map[id]
    }
    return null
  }).filter(Boolean)
  for (const n of notes) {
    if (!orderedIds.includes(n.id)) {
      n.order = reordered.length
      reordered.push(n)
    }
  }
  saveNotes(reordered)
  return reordered
}

export function removeNote(id) {
  const notes = getNotes().filter(n => n.id !== id)
  saveNotes(notes)
  return notes
}

// ===== 密码管理 =====

export function getPasswordPin() {
  return localStorage.getItem(KEYS.PASSWORD_PIN) || ''
}

export function setPasswordPin(pin) {
  localStorage.setItem(KEYS.PASSWORD_PIN, pin)
}

export function verifyPasswordPin(pin) {
  const stored = getPasswordPin()
  return stored === pin
}

export function hasPasswordPin() {
  return !!getPasswordPin()
}

export function getPasswords() {
  const data = localStorage.getItem(KEYS.PASSWORDS)
  return data ? JSON.parse(data) : []
}

export function savePasswords(passwords) {
  localStorage.setItem(KEYS.PASSWORDS, JSON.stringify(passwords))
}

export function addPassword(entry) {
  const passwords = getPasswords()
  passwords.push({ id: generateId(), site: entry.site, username: entry.username, password: entry.password, url: entry.url || '' })
  savePasswords(passwords)
  return passwords
}

export function updatePasswordItem(id, entry) {
  const passwords = getPasswords()
  const idx = passwords.findIndex(p => p.id === id)
  if (idx !== -1) {
    passwords[idx] = { ...passwords[idx], ...entry }
    savePasswords(passwords)
  }
  return passwords
}

export function removePasswordItem(id) {
  const passwords = getPasswords().filter(p => p.id !== id)
  savePasswords(passwords)
  return passwords
}

// ===== 标签页会话 =====

export function saveSession(tabs) {
  const data = tabs
    .filter(t => !t.isHome && t.url && t.url !== 'yocim://settings')
    .map(t => ({
      url: t.url,
      title: t.title,
      favicon: t.favicon,
      isPinned: t.isPinned,
    }))
  localStorage.setItem(KEYS.SESSION, JSON.stringify(data))
}

export function loadSession() {
  try {
    const data = localStorage.getItem(KEYS.SESSION)
    if (!data) return null
    const parsed = JSON.parse(data)
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    return parsed
  } catch (_) {
    return null
  }
}

// ===== AI 配置 =====

const defaultAiConfig = {
  models: [],
  activeModelId: '',
}

export function getAiConfig() {
  try {
    const data = localStorage.getItem(KEYS.AI_CONFIG)
    if (!data) return { ...defaultAiConfig }
    return { ...defaultAiConfig, ...JSON.parse(data) }
  } catch (_) {
    return { ...defaultAiConfig }
  }
}

export function saveAiConfig(config) {
  localStorage.setItem(KEYS.AI_CONFIG, JSON.stringify(config))
}

export function getActiveAiModel() {
  const config = getAiConfig()
  return config.models.find(m => m.id === config.activeModelId && m.enabled) || null
}

// ===== AI 对话持久化 =====

export function getAiConversations() {
  try {
    const data = localStorage.getItem(KEYS.AI_CONVERSATIONS)
    return data ? JSON.parse(data) : {}
  } catch (_) {
    return {}
  }
}

export function getAiConversation(modelId) {
  if (!modelId) return []
  const all = getAiConversations()
  return all[modelId]?.messages || []
}

export function saveAiConversation(modelId, messages) {
  if (!modelId) return
  const all = getAiConversations()
  all[modelId] = { messages: [...messages], updatedAt: Date.now() }
  localStorage.setItem(KEYS.AI_CONVERSATIONS, JSON.stringify(all))
}

export function clearAiConversation(modelId) {
  if (!modelId) return
  const all = getAiConversations()
  delete all[modelId]
  localStorage.setItem(KEYS.AI_CONVERSATIONS, JSON.stringify(all))
}

// ===== AI 记忆 =====

const defaultMemories = { entries: [], range: 7 }

export function getAiMemories() {
  try {
    const data = localStorage.getItem(KEYS.AI_MEMORIES)
    if (!data) return JSON.parse(JSON.stringify(defaultMemories))
    return { ...defaultMemories, ...JSON.parse(data) }
  } catch (_) {
    return JSON.parse(JSON.stringify(defaultMemories))
  }
}

export function saveAiMemories(data) {
  localStorage.setItem(KEYS.AI_MEMORIES, JSON.stringify(data))
}

export function addAiMemory(summary, keywords) {
  const data = getAiMemories()
  data.entries.push({
    id: generateId(),
    summary: summary || '',
    keywords: keywords || '',
    createdAt: Date.now(),
  })
  saveAiMemories(data)
  return data.entries
}

export function updateAiMemory(id, updates) {
  const data = getAiMemories()
  const idx = data.entries.findIndex(m => m.id === id)
  if (idx !== -1) {
    data.entries[idx] = { ...data.entries[idx], ...updates }
    saveAiMemories(data)
  }
  return data.entries
}

export function deleteAiMemory(id) {
  const data = getAiMemories()
  data.entries = data.entries.filter(m => m.id !== id)
  saveAiMemories(data)
  return data.entries
}

export function getMemoryRange() {
  return getAiMemories().range
}

export function setMemoryRange(days) {
  const data = getAiMemories()
  data.range = days
  saveAiMemories(data)
}

export function getActiveMemories() {
  const data = getAiMemories()
  const range = data.range
  if (range === 0) return data.entries
  const cutoff = Date.now() - range * 24 * 60 * 60 * 1000
  return data.entries.filter(m => m.createdAt >= cutoff)
}

// ===== AI 默认系统提示词 =====

export function getBookmarksFlat() {
  const data = getBookmarks()
  const result = []
  for (const folder of data.folders) {
    const folderInfo = { id: folder.id, name: folder.name, bookmarkCount: folder.bookmarks.length }
    result.push({ type: 'folder', ...folderInfo })
    for (const bm of folder.bookmarks) {
      result.push({ type: 'bookmark', id: bm.id, title: bm.title, url: bm.url, folderId: folder.id, folderName: folder.name })
    }
  }
  return result
}

export function getBookmarksTree() {
  const data = getBookmarks()
  return data.folders.map(f => ({
    id: f.id,
    name: f.name,
    bookmarks: f.bookmarks.map(b => ({ id: b.id, title: b.title, url: b.url })),
  }))
}

export function deleteHistoryRange(fromTimestamp, toTimestamp) {
  const history = getHistory()
  const filtered = history.filter(e => {
    const t = e.time || 0
    if (fromTimestamp && t < fromTimestamp) return true
    if (toTimestamp && t > toTimestamp) return true
    return false
  })
  saveHistory(filtered)
  return history.length - filtered.length
}

export function getHistoryInRange(fromTimestamp, toTimestamp, maxCount = 200) {
  const history = getHistory()
  const filtered = history.filter(e => {
    const t = e.time || 0
    if (fromTimestamp && t < fromTimestamp) return false
    if (toTimestamp && t > toTimestamp) return false
    return true
  })
  return filtered.slice(0, maxCount)
}

export const AI_DEFAULT_SYSTEM_PROMPT = '你是 YOCIM 浏览器内置的 AI 助手，名字叫 Nex。你是一个友好、耐心、知识渊博的助手。你的目标是：\n1. 用简洁清晰的语言回答用户问题\n2. 如果问题复杂，适当展开解释，但不要冗长\n3. 使用中文回复（除非用户使用英文提问）\n4. 保持专业且温暖的语气\n5. 如果用户询问关于代码、编程、技术的问题，提供准确、实用的建议\n6. 不编造信息，不确定时坦诚说明\n\n你具有操作浏览器的能力。当用户通过 / 命令请求浏览器操作时，你需要：\n1. 理解用户意图并确认操作目标\n2. 用自然语言解释你将要执行的操作\n3. 在响应末尾用 ```json 代码块提供操作指令\n\n支持的浏览器命令和操作：\n\n**书签管理 (/fav)** - 整理和分类书签\n- 可用操作: createFolder(名称), moveBookmark(书签id, 目标文件夹id), renameFolder(文件夹id, 新名称), deleteFolder(文件夹id), renameBookmark(文件夹id, 书签id, 新标题), deleteBookmark(文件夹id, 书签id)\n\n**设置管理 (/set)** - 调整浏览器设置\n- 可用操作: setTheme(light|dark|system), setAdBlock(true|false), setLanguage(zh|en), setNewTabPage(default|custom, url?), setStartupPage(default|custom, url?), setSearchEngine(google|bing|baidu|sogou|yandex|naver), setPageZoom(0.5~3.0), setTabsPosition(top|left), setHideLogo(true|false), setHideIcons(true|false), setIncognitoBrowsing(true|false), setSessionRestore(true|false)\n\n**扩展管理 (/exp)** - 管理浏览器扩展\n- 可用操作: disableExtension(扩展id), enableExtension(扩展id), removeExtension(扩展id)\n\n**历史管理 (/his)** - 分析和清理浏览历史\n- 可用操作: deleteToday(), deleteRange(开始时间戳, 结束时间戳), deleteAll()\n\nJSON 格式示例:\n```json\n{"actions": [{"action": "createFolder", "name": "社交"}], "summary": "创建了1个文件夹"}\n```\n\n注意：操作会由用户确认后才执行。summary 字段为必填，简要说明即将执行的操作。'

// ===== 重置所有设置 =====

export function resetAllSettings() {
  localStorage.clear()
}
