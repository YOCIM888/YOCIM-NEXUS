import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  setWindowTitle: (title) => ipcRenderer.send('set-window-title', title),

  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  selectFile: (filters) => ipcRenderer.invoke('select-file', filters),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  showItemInFolder: (filePath) => ipcRenderer.invoke('show-item-in-folder', filePath),

  downloadPause: (id) => ipcRenderer.invoke('download:pause', id),
  downloadResume: (id) => ipcRenderer.invoke('download:resume', id),
  downloadCancel: (id) => ipcRenderer.invoke('download:cancel', id),

  onDownloadStart: (callback) => ipcRenderer.on('download:start', (_e, data) => callback(data)),
  onDownloadProgress: (callback) => ipcRenderer.on('download:progress', (_e, data) => callback(data)),
  onDownloadDone: (callback) => ipcRenderer.on('download:done', (_e, data) => callback(data)),

  setDefaultBrowser: () => ipcRenderer.invoke('set-default-browser'),

  windowMinimize: () => ipcRenderer.send('window-minimize'),
  windowMaximize: () => ipcRenderer.send('window-maximize'),
  windowClose: () => ipcRenderer.send('window-close'),
  windowIsMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  windowIsFullscreen: () => ipcRenderer.invoke('window-is-fullscreen'),
  toggleFullscreen: () => ipcRenderer.send('toggle-fullscreen'),
  readFileAsBase64: (filePath) => ipcRenderer.invoke('read-file-as-base64', filePath),
  fetchSuggestions: (url) => ipcRenderer.invoke('fetch-suggestions', url),

  adBlockToggle: (enabled) => ipcRenderer.invoke('adblock-toggle', enabled),
  adBlockStatus: () => ipcRenderer.invoke('adblock-status'),
  parseBookmarksHtml: (filePath) => ipcRenderer.invoke('parse-bookmarks-html', filePath),
  capturePage: () => ipcRenderer.invoke('capture-page'),
  saveScreenshot: (dataUrl, filePath) => ipcRenderer.invoke('save-screenshot', dataUrl, filePath),
  openIncognito: () => ipcRenderer.invoke('open-incognito'),
  openPip: (videoUrl) => ipcRenderer.invoke('open-pip', videoUrl),
  clearPartition: (partitionName) => ipcRenderer.invoke('clear-partition', partitionName),
  checkUpdate: () => ipcRenderer.invoke('check-update'),
  openReleasePage: (url) => ipcRenderer.invoke('open-release-page', url),

  // 开发者工具
  getWebviewPreloadPath: () => ipcRenderer.invoke('get-webview-preload-path'),
  toggleDevTools: () => ipcRenderer.invoke('toggle-devtools'),
  closeShellDevTools: () => ipcRenderer.invoke('close-shell-devtools'),
  isDevToolsOpened: () => ipcRenderer.invoke('is-devtools-opened'),
  onGlobalKeydown: (callback) => ipcRenderer.on('global-keydown', (_e, data) => callback(data)),

  // 标签页冻结
  setTabBackgroundThrottling: (tabId, shouldThrottle) => ipcRenderer.invoke('set-tab-background-throttling', tabId, shouldThrottle),
  getTabMemoryInfo: () => ipcRenderer.invoke('get-tab-memory-info'),

  // 扩展管理
  extensionsInstall: () => ipcRenderer.invoke('extensions:install'),
  extensionsList: () => ipcRenderer.invoke('extensions:list'),
  extensionsRemove: (extId) => ipcRenderer.invoke('extensions:remove', extId),
  extensionsToggle: (extId, enabled) => ipcRenderer.invoke('extensions:toggle', extId, enabled),
  onExtensionInstalled: (callback) => ipcRenderer.on('extension:installed', (_e, data) => callback(data)),

  // 右键菜单
  onContextAction: (callback) => ipcRenderer.on('context-action', (_e, data) => callback(data)),

  // 新标签页打开
  onOpenNewTab: (callback) => ipcRenderer.on('open-new-tab', (_e, url) => callback(url)),

  // 下载路径
  setDownloadPath: (dir) => ipcRenderer.invoke('set-download-path', dir),
  onDownloadPathChanged: (callback) => ipcRenderer.on('download-path-changed', (_e, dir) => callback(dir)),

  // 清除数据
  clearAllData: () => ipcRenderer.invoke('clear-all-data'),

  // Cookie 管理
  getCookies: (domain) => ipcRenderer.invoke('get-cookies', domain),
  deleteCookie: (name, url) => ipcRenderer.invoke('delete-cookie', { name, url }),

  // 站点权限
  getSitePermissions: () => ipcRenderer.invoke('get-site-permissions'),
})
