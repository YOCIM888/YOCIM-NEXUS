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
  isDefaultBrowser: () => ipcRenderer.invoke('is-default-browser'),

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

  // 开发者工具（内嵌面板）
  getWebviewPreloadPath: () => ipcRenderer.invoke('get-webview-preload-path'),
  toggleEmbeddedDevTools: (bounds) => ipcRenderer.invoke('toggle-embedded-devtools', bounds),
  closeDevToolsPanel: () => ipcRenderer.invoke('close-devtools-panel'),
  isDevToolsPanelOpen: () => ipcRenderer.invoke('is-devtools-panel-open'),
  updateDevToolsBounds: (bounds) => ipcRenderer.invoke('update-devtools-bounds', bounds),
  onDevToolsStateChanged: (callback) => ipcRenderer.on('devtools-state-changed', (_e, open) => callback(open)),
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

  // 打开本地文件
  onOpenLocalFile: (callback) => ipcRenderer.on('open-local-file', (_e, url) => callback(url)),

  // 下载路径
  setDownloadPath: (dir) => ipcRenderer.invoke('set-download-path', dir),
  onDownloadPathChanged: (callback) => ipcRenderer.on('download-path-changed', (_e, dir) => callback(dir)),

  // 清除数据
  clearAllData: () => ipcRenderer.invoke('clear-all-data'),

  // Cookie 管理
  getCookies: (domain) => ipcRenderer.invoke('get-cookies', domain),
  deleteCookie: (name, url) => ipcRenderer.invoke('delete-cookie', { name, url }),

  // 数据导出/导入（外部配置）
  getExternalSettings: () => ipcRenderer.invoke('get-external-settings'),
  setExternalSettings: (data) => ipcRenderer.invoke('set-external-settings', data),

  // 扩展数据导出/导入
  getExtensionsData: () => ipcRenderer.invoke('get-extensions-data'),
  setExtensionsData: (data) => ipcRenderer.invoke('set-extensions-data', data),

  // 复原默认设置（清除所有数据：settings.json + extensions.json + Session）
  restoreDefaultSettings: () => ipcRenderer.invoke('restore-default-settings'),

  // 站点权限
  getSitePermissions: () => ipcRenderer.invoke('get-site-permissions'),
  updatePermission: (type, status) => ipcRenderer.invoke('update-permission', { type, status }),
  onPermissionRequest: (callback) => ipcRenderer.on('permission-request', (_e, data) => callback(data)),
  respondPermission: (data) => ipcRenderer.invoke('permission-response', data),

  // 协议拦截
  getProtocolSettings: () => ipcRenderer.invoke('get-protocol-settings'),
  updateProtocolSettings: (data) => ipcRenderer.invoke('update-protocol-settings', data),
})
