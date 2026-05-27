import { app, BrowserWindow, ipcMain, Menu, dialog, shell, session, webContents, clipboard } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { setupAdBlocker, setAdBlockEnabled, isAdBlockEnabled } from './adblocker.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

process.env.APP_ROOT = path.join(__dirname, '..')

// ===== 启动速度优化 =====
app.commandLine.appendSwitch('lang', 'zh-CN')
app.commandLine.appendSwitch('enable-features', 'OverlayScrollbar,ParallelDownloading')
app.commandLine.appendSwitch('enable-gpu-rasterization')
app.commandLine.appendSwitch('enable-zero-copy')
app.commandLine.appendSwitch('ignore-gpu-blocklist')
app.commandLine.appendSwitch('disable-background-timer-throttling')
app.commandLine.appendSwitch('disable-renderer-backgrounding')
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=512')
app.setPath('crashDumps', path.join(app.getPath('temp'), 'yocim-crashes'))

let win
const activeDownloads = new Map()
const installedExtensions = new Map()
let downloadPath = ''

const EXTENSIONS_FILE = path.join(app.getPath('userData'), 'extensions.json')

function loadExtensions() {
  try {
    if (fs.existsSync(EXTENSIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(EXTENSIONS_FILE, 'utf-8'))
      for (const ext of data) {
        if (fs.existsSync(ext.path)) {
          loadExtension(ext.path).catch(() => {})
        }
      }
    }
  } catch (_) {}
}

async function loadExtension(extPath) {
  try {
    const ext = await session.defaultSession.loadExtension(extPath, { allowFileAccess: true })
    installedExtensions.set(ext.id, { id: ext.id, name: ext.name, version: ext.version, path: extPath, enabled: true })
    saveExtensionsList()
    return { id: ext.id, name: ext.name, version: ext.version }
  } catch (e) {
    return null
  }
}

function saveExtensionsList() {
  const list = []
  for (const [, ext] of installedExtensions) {
    list.push({ id: ext.id, name: ext.name, version: ext.version, path: ext.path, enabled: ext.enabled })
  }
  fs.writeFileSync(EXTENSIONS_FILE, JSON.stringify(list, null, 2), 'utf-8')
}

// 拦截所有 webview 内部按键，防止 F12/F5/F11 被吞掉
// 通用下载处理器（主 session 和 webview session 共用）
function sendToWin(channel, data) {
  if (win && !win.isDestroyed()) {
    win.webContents.send(channel, data)
  }
}

function setupDownloadHandler(sessionObj) {
  sessionObj.on('will-download', (_event, item) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2)
    activeDownloads.set(id, item)

    const fileName = item.getFilename()
    if (downloadPath && fs.existsSync(downloadPath)) {
      const savePath = path.join(downloadPath, fileName)
      item.setSavePath(savePath)
      sendToWin('download:start', {
        id, fileName, filePath: savePath,
        totalBytes: item.getTotalBytes(),
        receivedBytes: item.getReceivedBytes(),
        state: 'downloading',
      })
    } else {
      const defaultPath = path.join(app.getPath('downloads'), fileName)
      item.setSavePath(defaultPath)
      sendToWin('download:start', {
        id, fileName, filePath: defaultPath,
        totalBytes: item.getTotalBytes(),
        receivedBytes: item.getReceivedBytes(),
        state: 'downloading',
      })
      downloadPath = app.getPath('downloads')
      sendToWin('download-path-changed', downloadPath)
    }

    item.on('updated', (_e, state) => {
      sendToWin('download:progress', {
        id,
        receivedBytes: item.getReceivedBytes(),
        totalBytes: item.getTotalBytes(),
        state: state === 'progressing' ? 'downloading' : 'paused',
      })
    })

    item.once('done', (_e, state) => {
      activeDownloads.delete(id)
      sendToWin('download:done', {
        id,
        state: state === 'completed' ? 'completed' : 'failed',
        filePath: item.getSavePath(),
      })
    })
  })
}

app.on('web-contents-created', (_event, contents) => {
  const isWebview = contents.getType() === 'webview'
  if (!isWebview) return

  // webview 下载也走统一处理器
  setupDownloadHandler(contents.session)

  // 拦截 window.open / target=_blank，改为在主窗口新标签页打开
  contents.setWindowOpenHandler(({ url }) => {
    if (win && !win.isDestroyed()) {
      win.webContents.send('open-new-tab', url)
    }
    return { action: 'deny' }
  })

  contents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return
    if (!input.control && !input.meta && !input.alt && !input.shift) {
      if (input.key === 'F12' || input.key === 'F5' || input.key === 'F11') {
        if (win && !win.isDestroyed()) {
          win.webContents.send('global-keydown', { key: input.key })
        }
        event.preventDefault()
      }
    }
  })

  // ===== 右键菜单 =====
  contents.on('context-menu', (event, params) => {
    event.preventDefault()
    const template = []

    // 输入框/文本框右键 → 编辑菜单
    if (params.isEditable) {
      template.push({
        label: '剪切',
        enabled: params.editFlags.canCut,
        click: () => contents.cut(),
      })
      template.push({
        label: '复制',
        enabled: params.editFlags.canCopy,
        click: () => contents.copy(),
      })
      template.push({
        label: '粘贴',
        enabled: params.editFlags.canPaste,
        click: () => contents.paste(),
      })
      template.push({
        label: '全选',
        enabled: params.editFlags.canSelectAll,
        click: () => contents.selectAll(),
      })

      template.push({ type: 'separator' })

      template.push({
        label: '检查',
        click: () => {
          if (contents.isDevToolsOpened()) {
            contents.closeDevTools()
          } else {
            if (win && !win.isDestroyed() && win.webContents.isDevToolsOpened()) {
              win.webContents.closeDevTools()
            }
            contents.openDevTools({ mode: 'right' })
          }
        },
      })

      const menu = Menu.buildFromTemplate(template)
      menu.popup({ window: win })
      return
    }

    // 通用菜单
    template.push({
      label: '返回',
      enabled: contents.canGoBack(),
      click: () => contents.goBack(),
    })
    template.push({
      label: '刷新',
      click: () => contents.reload(),
    })

    template.push({ type: 'separator' })

    // 图片右键
    if (params.mediaType === 'image') {
      template.push({
        label: '查看图像',
        click: () => {
          if (win && !win.isDestroyed()) {
            win.webContents.send('context-action', { action: 'open-url', url: params.srcURL })
          }
        },
      })
      template.push({
        label: '复制图片',
        click: () => contents.copyImageAt(params.x, params.y),
      })
      template.push({
        label: '复制图片链接',
        click: () => clipboard.writeText(params.srcURL),
      })
    }

    template.push({ type: 'separator' })

    template.push({
      label: '打印',
      click: () => contents.print({ silent: true, printBackground: true }),
    })

    template.push({
      label: '截图',
      click: async () => {
        const image = await contents.capturePage()
        if (win && !win.isDestroyed()) {
          win.webContents.send('context-action', { action: 'screenshot', dataUrl: image.toDataURL() })
        }
      },
    })

    template.push({
      label: '查看源码',
      click: () => {
        if (win && !win.isDestroyed()) {
          win.webContents.send('context-action', { action: 'view-source', url: contents.getURL() })
        }
      },
    })

    const menu = Menu.buildFromTemplate(template)
    menu.popup({ window: win })
  })
})

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    show: true,
    paintWhenInitiallyDrawn: true,
    backgroundColor: '#1e1e1e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      backgroundThrottling: false,
      spellcheck: false,
    },
  })

  // 主窗口输入框右键菜单（地址栏、搜索框等）
  win.webContents.on('context-menu', (event, params) => {
    if (!params.isEditable) {
      event.preventDefault()
      return
    }
    event.preventDefault()
    const template = [
      {
        label: '剪切',
        enabled: params.editFlags.canCut,
        click: () => win.webContents.cut(),
      },
      {
        label: '复制',
        enabled: params.editFlags.canCopy,
        click: () => win.webContents.copy(),
      },
      {
        label: '粘贴',
        enabled: params.editFlags.canPaste,
        click: () => win.webContents.paste(),
      },
      {
        label: '全选',
        enabled: params.editFlags.canSelectAll,
        click: () => win.webContents.selectAll(),
      },
      { type: 'separator' },
      {
        label: '检查',
        click: () => {
          if (win && !win.isDestroyed()) {
            if (win.webContents.isDevToolsOpened()) {
              win.webContents.closeDevTools()
            } else {
              win.webContents.openDevTools({ mode: 'right' })
            }
          }
        },
      },
    ]
    const menu = Menu.buildFromTemplate(template)
    menu.popup({ window: win })
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }
}

ipcMain.on('set-window-title', (_event, title) => {
  if (win && !win.isDestroyed()) {
    win.setTitle(title)
  }
})

ipcMain.on('window-minimize', () => {
  if (win && !win.isDestroyed()) win.minimize()
})

ipcMain.on('window-maximize', () => {
  if (win && !win.isDestroyed()) {
    if (win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }
  }
})

ipcMain.on('window-close', () => {
  if (win && !win.isDestroyed()) win.close()
})

ipcMain.handle('window-is-maximized', () => {
  if (win && !win.isDestroyed()) return win.isMaximized()
  return false
})

ipcMain.handle('window-is-fullscreen', () => {
  if (win && !win.isDestroyed()) return win.isFullScreen()
  return false
})

ipcMain.on('toggle-fullscreen', () => {
  if (win && !win.isDestroyed()) {
    win.setFullScreen(!win.isFullScreen())
  }
})

ipcMain.handle('read-file-as-base64', (_e, filePath) => {
  const data = fs.readFileSync(filePath)
  const base64 = data.toString('base64')
  const ext = path.extname(filePath).toLowerCase()
  const mimeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' }
  const mimeType = mimeMap[ext] || 'application/octet-stream'
  return `data:${mimeType};base64,${base64}`
})

ipcMain.handle('fetch-suggestions', async (_e, url) => {
  try {
    const res = await fetch(url)
    const data = await res.json()
    return data
  } catch (e) {
    return null
  }
})

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(win, { properties: ['openDirectory'] })
  if (result.canceled) return null
  return result.filePaths[0]
})

ipcMain.handle('select-file', async (_e, filters) => {
  const result = await dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters: filters || [{ name: 'JSON', extensions: ['json'] }],
  })
  if (result.canceled) return null
  return result.filePaths[0]
})

ipcMain.handle('write-file', async (_e, filePath, content) => {
  fs.writeFileSync(filePath, content, 'utf-8')
  return true
})

ipcMain.handle('read-file', async (_e, filePath) => {
  return fs.readFileSync(filePath, 'utf-8')
})

ipcMain.handle('show-item-in-folder', (_e, filePath) => {
  shell.showItemInFolder(filePath)
})

ipcMain.handle('download:pause', (_e, id) => {
  const item = activeDownloads.get(id)
  if (item) item.pause()
})

ipcMain.handle('download:resume', (_e, id) => {
  const item = activeDownloads.get(id)
  if (item && item.canResume()) item.resume()
})

ipcMain.handle('download:cancel', (_e, id) => {
  const item = activeDownloads.get(id)
  if (item) item.cancel()
})

ipcMain.handle('set-default-browser', () => {
  app.setAsDefaultProtocolClient('http')
  app.setAsDefaultProtocolClient('https')
  return true
})

ipcMain.handle('adblock-toggle', (_e, enabled) => {
  setAdBlockEnabled(enabled, session.defaultSession)
  return true
})

ipcMain.handle('adblock-status', () => {
  return isAdBlockEnabled()
})

ipcMain.handle('parse-bookmarks-html', async (_e, filePath) => {
  const html = fs.readFileSync(filePath, 'utf-8')
  const bookmarks = []
  const regex = /<A[^>]+HREF="([^"]+)"[^>]*>([^<]+)<\/A>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    const url = match[1]
    const title = match[2].trim()
    if (url && url.startsWith('http')) {
      bookmarks.push({ title, url })
    }
  }
  return bookmarks
})

ipcMain.handle('capture-page', async (_e) => {
  if (!win || win.isDestroyed()) return null
  const image = await win.webContents.capturePage()
  return image.toDataURL()
})

ipcMain.handle('save-screenshot', async (_e, dataUrl, filePath) => {
  const base64 = dataUrl.replace(/^data:image\/png;base64,/, '')
  fs.writeFileSync(filePath, Buffer.from(base64, 'base64'))
  return filePath
})

ipcMain.handle('open-incognito', () => {
  const incognitoWin = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    title: '🕵️ Incognito - YOCIM NEXUS',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      partition: 'persist:incognito',
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    incognitoWin.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    incognitoWin.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  incognitoWin.on('closed', () => {
    session.fromPartition('persist:incognito').clearStorageData()
  })

  return true
})

ipcMain.handle('open-pip', (_e, videoUrl) => {
  const pipWin = new BrowserWindow({
    width: 480,
    height: 270,
    frame: false,
    alwaysOnTop: true,
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })
  pipWin.loadURL(videoUrl)
  return true
})

ipcMain.handle('clear-partition', (_e, partitionName) => {
  session.fromPartition(partitionName).clearStorageData()
  return true
})

ipcMain.handle('clear-all-data', async () => {
  try {
    // 清除默认 session：cookie、缓存、IndexedDB、localStorage、service worker 等
    await session.defaultSession.clearStorageData({
      storages: [
        'cookies', 'filesystem', 'indexdb', 'localstorage',
        'websql', 'serviceworkers', 'cachestorage',
      ],
    })
    await session.defaultSession.clearCache()
    await session.defaultSession.clearCodeCaches()
    // 也清一下各 webview 分区（persist:tab-*）— 用通配清不掉，但 reload 后旧分区会被 GC
    // 关键是默认 session 清干净 + 前端 reload，确保全新启动
  } catch (_) {
    // 忽略清理错误
  }
  return true
})

ipcMain.handle('check-update', async () => {
  try {
    const res = await fetch('https://api.github.com/repos/YOCIM888/YOCIM-NEXUS/releases/latest')
    if (!res.ok) return null
    const data = await res.json()
    const latestVersion = data.tag_name.replace(/^v/, '')
    const currentVersion = app.getVersion()
    if (latestVersion !== currentVersion) {
      return { version: latestVersion, url: data.html_url }
    }
    return null
  } catch (e) {
    return null
  }
})

ipcMain.handle('open-release-page', (_e, url) => {
  shell.openExternal(url)
})

// ===== 开发者工具 =====
ipcMain.handle('get-webview-preload-path', () => {
  return path.join(__dirname, 'webview-preload.js')
})

ipcMain.handle('toggle-devtools', () => {
  if (win && !win.isDestroyed()) {
    const allWc = webContents.getAllWebContents()
    for (const wc of allWc) {
      if (wc.getType() === 'webview' && wc.isDevToolsOpened()) {
        wc.closeDevTools()
      }
    }
    if (win.webContents.isDevToolsOpened()) {
      win.webContents.closeDevTools()
    } else {
      win.webContents.openDevTools({ mode: 'right' })
    }
    return win.webContents.isDevToolsOpened()
  }
  return false
})

ipcMain.handle('close-shell-devtools', () => {
  if (win && !win.isDestroyed() && win.webContents.isDevToolsOpened()) {
    win.webContents.closeDevTools()
  }
  return true
})

ipcMain.handle('is-devtools-opened', () => {
  if (win && !win.isDestroyed()) {
    return win.webContents.isDevToolsOpened()
  }
  return false
})

// ===== 标签页冻结 =====
ipcMain.handle('set-tab-background-throttling', (_e, tabId, shouldThrottle) => {
  const allWc = webContents.getAllWebContents()
  for (const wc of allWc) {
    if (wc.getType() === 'webview' && wc.id === tabId) {
      wc.setBackgroundThrottling(shouldThrottle)
      break
    }
  }
  return true
})

ipcMain.handle('get-tab-memory-info', () => {
  try {
    return process.getProcessMemoryInfo()
  } catch (_) {
    return null
  }
})

// ===== 扩展管理 =====
ipcMain.handle('extensions:install', async (_e) => {
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory'],
    title: '选择扩展目录 (解压后的 Chrome 扩展)',
  })
  if (result.canceled || !result.filePaths[0]) return null
  const extInfo = await loadExtension(result.filePaths[0])
  if (extInfo) {
    win?.webContents.send('extension:installed', extInfo)
  }
  return extInfo
})

ipcMain.handle('extensions:list', () => {
  const list = []
  for (const [, ext] of installedExtensions) {
    list.push({ id: ext.id, name: ext.name, version: ext.version, path: ext.path, enabled: ext.enabled })
  }
  return list
})

ipcMain.handle('extensions:remove', async (_e, extId) => {
  const ext = installedExtensions.get(extId)
  if (ext) {
    try {
      await session.defaultSession.removeExtension(extId)
    } catch (_) {}
    installedExtensions.delete(extId)
    saveExtensionsList()
  }
  return true
})

ipcMain.handle('extensions:toggle', async (_e, extId, enabled) => {
  const ext = installedExtensions.get(extId)
  if (ext) {
    ext.enabled = enabled
    if (enabled) {
      await loadExtension(ext.path)
    } else {
      try {
        await session.defaultSession.removeExtension(extId)
      } catch (_) {}
    }
    saveExtensionsList()
  }
  return true
})

ipcMain.handle('set-download-path', (_e, dir) => {
  downloadPath = dir
  return true
})

ipcMain.handle('get-download-path', () => {
  return downloadPath
})

// ===== Cookie 管理 =====
ipcMain.handle('get-cookies', async (_e, domain) => {
  try {
    const cookies = await session.defaultSession.cookies.get({ domain: domain || '' })
    return cookies.map(c => ({
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path,
      secure: c.secure,
      httpOnly: c.httpOnly,
      expirationDate: c.expirationDate,
    }))
  } catch (_) {
    return []
  }
})

ipcMain.handle('delete-cookie', async (_e, { name, url }) => {
  try {
    await session.defaultSession.cookies.remove(url, name)
    return true
  } catch (_) {
    return false
  }
})

// ===== 站点权限 =====
ipcMain.handle('get-site-permissions', async () => {
  try {
    const perms = []
    const types = ['media', 'geolocation', 'notifications', 'midiSysex', 'pointerLock', 'fullscreen', 'openExternal']
    return types.map(type => ({ type, status: 'ask' }))
  } catch (_) {
    return []
  }
})

app.whenReady().then(() => {
  Menu.setApplicationMenu(null)
  loadExtensions()
  createWindow()
  setupAdBlocker(session.defaultSession)

  // 主页面下载
  setupDownloadHandler(session.defaultSession)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
