import { app, BrowserWindow, ipcMain, Menu, dialog, shell, session, webContents, clipboard } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { setupAdBlocker, setAdBlockEnabled, isAdBlockEnabled } from './adblocker.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

process.env.APP_ROOT = path.join(__dirname, '..')

// ===== 安全和性能配置 =====
app.commandLine.appendSwitch('lang', 'zh-CN')
app.commandLine.appendSwitch('enable-sandbox')
app.commandLine.appendSwitch('enable-features', 'OverlayScrollbar,ParallelDownloading,StrictSiteIsolation')
app.commandLine.appendSwitch('enable-gpu-rasterization')
app.commandLine.appendSwitch('enable-zero-copy')
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=512')
app.commandLine.appendSwitch('disable-features', 'AutofillServerCommunication,PasswordManagerOnboarding,IdleDetection')
app.setPath('crashDumps', path.join(app.getPath('temp'), 'yocim-crashes'))

let win
const activeDownloads = new Map()
const installedExtensions = new Map()
let downloadPath = ''
let pendingOpenFile = null

const gotTheLock = app.requestSingleInstanceLock()

function findFileArg(argv) {
  const exts = ['.html', '.htm', '.xhtml', '.svg', '.xml', '.txt', '.pdf', '.mht', '.webp', '.png', '.jpg', '.jpeg', '.gif', '.bmp']
  for (const a of argv) {
    if (!a || a.startsWith('-') || a.startsWith('--')) continue
    const resolved = path.resolve(a)
    if (fs.existsSync(resolved) && exts.some(ext => a.toLowerCase().endsWith(ext))) {
      return resolved
    }
  }
  return null
}

app.on('second-instance', (_event, argv) => {
  if (win && !win.isDestroyed()) {
    if (win.isMinimized()) win.restore()
    win.focus()
    const filePath = findFileArg(argv)
    if (filePath) {
      const fileUrl = 'file:///' + filePath.replace(/\\/g, '/')
      win.webContents.send('open-local-file', fileUrl)
    }
  }
})

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
    let icon = null
    try {
      const manifestPath = path.join(extPath, 'manifest.json')
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
      if (manifest.icons) {
        const sizes = Object.keys(manifest.icons).map(Number).sort((a, b) => a - b)
        const iconFile = String(manifest.icons[sizes[0]])
        const iconPath = path.join(extPath, iconFile)
        if (fs.existsSync(iconPath)) {
          icon = 'data:image/png;base64,' + fs.readFileSync(iconPath).toString('base64')
        }
      }
    } catch (_) {}
    installedExtensions.set(ext.id, { id: ext.id, name: ext.name, version: ext.version, path: extPath, enabled: true, icon })
    saveExtensionsList()
    return { id: ext.id, name: ext.name, version: ext.version, icon }
  } catch (e) {
    return null
  }
}

function saveExtensionsList() {
  const list = []
  for (const [, ext] of installedExtensions) {
    list.push({ id: ext.id, name: ext.name, version: ext.version, path: ext.path, enabled: ext.enabled, icon: ext.icon })
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

const downloadSessions = new Set()

function setupDownloadHandler(sessionObj) {
  if (downloadSessions.has(sessionObj)) return
  downloadSessions.add(sessionObj)

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

const DEFAULT_PROTOCOL_BLACKLIST = [
  'shell:', 'explorer:', 'cmd:', 'powershell:', 'pwsh:', 'regedit:',
  'control:', 'ms-settings:', 'ms-windows-store:', 'ms-edge:',
  'ms-excel:', 'ms-word:', 'ms-powerpoint:', 'ms-outlook:', 'ms-teams:',
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
]

let protocolSettings = {
  mode: 'blacklist',
  whitelist: ['http:', 'https:', 'file:', 'blob:', 'data:'],
  blacklist: [...DEFAULT_PROTOCOL_BLACKLIST],
}

function saveProtocolSettings() {
  try {
    const settingsPath = path.join(app.getPath('userData'), 'settings.json')
    const existing = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath, 'utf-8')) : {}
    existing.protocolBlockMode = protocolSettings.mode
    existing.protocolWhitelist = protocolSettings.whitelist
    existing.protocolBlacklist = protocolSettings.blacklist
    fs.writeFileSync(settingsPath, JSON.stringify(existing, null, 2), 'utf-8')
  } catch (_) {}
}

function loadProtocolSettings() {
  try {
    const settingsPath = path.join(app.getPath('userData'), 'settings.json')
    if (fs.existsSync(settingsPath)) {
      const raw = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'))
      protocolSettings = {
        mode: raw.protocolBlockMode || 'blacklist',
        whitelist: raw.protocolWhitelist || ['http:', 'https:', 'file:', 'blob:', 'data:'],
        blacklist: raw.protocolBlacklist || [...DEFAULT_PROTOCOL_BLACKLIST],
      }
    }
  } catch (_) {}
}

// ===== 权限管理系统 =====
let permissionSettings = {
  camera: 'ask',
  microphone: 'ask',
  geolocation: 'ask',
  notifications: 'ask',
  midiSysex: 'block',
  pointerLock: 'ask',
  fullscreen: 'ask',
  openExternal: 'ask',
  clipboardRead: 'ask',
  clipboardSanitizedWrite: 'ask',
  idleDetection: 'block',
  serial: 'block',
  sensors: 'block',
  displayCapture: 'ask',
  hid: 'block',
  usb: 'block',
}

// Chromium 权限名 → 内部权限名的映射
const PERMISSION_KEY_MAP = {
  // 摄像头
  video_capture: 'camera',
  videoCapture: 'camera',
  camera: 'camera',
  // 麦克风
  audio_capture: 'microphone',
  audioCapture: 'microphone',
  microphone: 'microphone',
  // 显示捕获
  display_capture: 'displayCapture',
  displayCapture: 'displayCapture',
  // 剪贴板写入
  clipboard_sanitized_write: 'clipboardSanitizedWrite',
  clipboardSanitizedWrite: 'clipboardSanitizedWrite',
  // 传感器
  motion_sensors: 'sensors',
  orientation_sensors: 'sensors',
  ambient_light_sensor: 'sensors',
  sensor: 'sensors',
  sensors: 'sensors',
}

function getPermissionStatus(permission) {
  const key = PERMISSION_KEY_MAP[permission] || permission
  const setting = permissionSettings[key]
  if (setting === 'block') return false
  if (setting === 'allow') return true
  return undefined
}

function loadPermissionSettings() {
  try {
    const settingsPath = path.join(app.getPath('userData'), 'settings.json')
    if (fs.existsSync(settingsPath)) {
      const raw = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'))
      if (raw.permissionSettings) {
        permissionSettings = { ...permissionSettings, ...raw.permissionSettings }
      }
    }
  } catch (_) {}
}

function savePermissionSettings() {
  try {
    const settingsPath = path.join(app.getPath('userData'), 'settings.json')
    const existing = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath, 'utf-8')) : {}
    existing.permissionSettings = permissionSettings
    fs.writeFileSync(settingsPath, JSON.stringify(existing, null, 2), 'utf-8')
  } catch (_) {}
}

const PERMISSION_LABELS = {
  camera: '摄像头',
  microphone: '麦克风',
  media: '摄像头/麦克风',
  geolocation: '位置信息',
  notifications: '桌面通知',
  midiSysex: 'MIDI 设备',
  pointerLock: '指针锁定',
  fullscreen: '全屏',
  openExternal: '打开外部应用',
  clipboardRead: '读取剪贴板',
  idleDetection: '空闲检测',
  serial: '串口设备',
  sensors: '传感器',
  displayCapture: '屏幕录制',
  hid: 'HID 设备',
  usb: 'USB 设备',
  clipboardSanitizedWrite: '写入剪贴板',
}

function getPermissionKey(permission) {
  return PERMISSION_KEY_MAP[permission] || permission
}

// 待处理的权限请求队列
let permRequestId = 0
const pendingPermRequests = new Map()

function showPermissionDialog(permission) {
  if (!win || win.isDestroyed()) return Promise.resolve(false)
  const id = ++permRequestId
  const key = getPermissionKey(permission)
  const label = PERMISSION_LABELS[key] || permission
  return new Promise((resolve) => {
    pendingPermRequests.set(id, { resolve, key })
    win.webContents.send('permission-request', { id, permission, label })
  })
}

ipcMain.handle('permission-response', (_e, { id, allowed, remember }) => {
  const pending = pendingPermRequests.get(id)
  if (!pending) return false
  pendingPermRequests.delete(id)
  if (remember) {
    permissionSettings[pending.key] = allowed ? 'allow' : 'block'
    savePermissionSettings()
  }
  pending.resolve(allowed)
  return true
})

function setupPermissionHandlers(sessionObj) {
  sessionObj.setPermissionRequestHandler((_webContents, permission, callback) => {
    const status = getPermissionStatus(permission)
    if (status === true) {
      // 允许
      callback(true)
    } else if (status === false) {
      // 拒绝
      callback(false)
    } else {
      // 询问 — 弹出授权对话框
      if (!win || win.isDestroyed()) {
        callback(false)
        return
      }
      // setPermissionRequestHandler 支持异步 callback
      showPermissionDialog(permission).then(allowed => {
        callback(allowed)
      })
    }
  })

  sessionObj.setPermissionCheckHandler((_webContents, permission) => {
    const status = getPermissionStatus(permission)
    if (status !== undefined) return status
    return undefined
  })
}

function shouldBlockUrl(url) {
  if (protocolSettings.mode === 'off') return false
  let protocol
  try {
    protocol = new URL(url).protocol.toLowerCase()
  } catch (_) {
    // 自定义协议（如 bytedance://、taobao://）在 URL 解析时会抛出异常
    // 用字符串方式提取协议，确保黑名单/白名单检查仍然生效
    const match = url.match(/^([a-zA-Z][a-zA-Z0-9+\-.]*):/)
    if (match) {
      protocol = match[1].toLowerCase() + ':'
    } else {
      return false
    }
  }
  if (protocolSettings.mode === 'whitelist') {
    return !protocolSettings.whitelist.includes(protocol)
  }
  if (protocolSettings.mode === 'blacklist') {
    return protocolSettings.blacklist.includes(protocol)
  }
  if (protocolSettings.mode === 'both') {
    return !protocolSettings.whitelist.includes(protocol) || protocolSettings.blacklist.includes(protocol)
  }
  return false
}

function setupProtocolWebRequest(sessionObj) {
  sessionObj.webRequest.onBeforeRequest((details, callback) => {
    if (shouldBlockUrl(details.url)) {
      callback({ cancel: true })
    } else {
      callback({})
    }
  })
}

app.on('web-contents-created', (_event, contents) => {
  const isWebview = contents.getType() === 'webview'
  if (!isWebview) return

  // webview 下载也走统一处理器
  setupDownloadHandler(contents.session)

  // webview 协议拦截
  setupProtocolWebRequest(contents.session)

  // 权限控制
  setupPermissionHandlers(contents.session)

  // 拦截 window.open / target=_blank
  contents.setWindowOpenHandler(({ url }) => {
    if (shouldBlockUrl(url)) return { action: 'deny' }
    if (win && !win.isDestroyed()) {
      win.webContents.send('open-new-tab', url)
    }
    return { action: 'deny' }
  })

  // 拦截主框架导航到危险协议
  contents.on('will-navigate', (event, url) => {
    if (shouldBlockUrl(url)) {
      event.preventDefault()
    }
  })

  // 拦截服务端重定向到危险协议
  contents.on('will-redirect', (event, url) => {
    if (shouldBlockUrl(url)) {
      event.preventDefault()
    }
  })

  // 拦截所有框架（含子框架/iframe）的导航
  contents.on('did-start-navigation', (event, url, isInPlace, isMainFrame, frameProcessId, frameRoutingId) => {
    if (shouldBlockUrl(url)) {
      if (isMainFrame) {
        contents.stop()
      } else {
        try {
          const frame = contents.frameForId(frameProcessId, frameRoutingId)
          if (frame) frame.executeJavaScript('window.stop()')
        } catch (_) {}
      }
    }
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
      sandbox: true,
      enableRemoteModule: false,
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

  win.webContents.on('did-finish-load', () => {
    if (pendingOpenFile) {
      win.webContents.send('open-local-file', pendingOpenFile)
      pendingOpenFile = null
    }
  })
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
      sandbox: true,
      enableRemoteModule: false,
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
    // 清除已知的 webview 分区
    for (const partitionName of ['persist:incognito']) {
      try {
        const partition = session.fromPartition(partitionName)
        await partition.clearStorageData()
        await partition.clearCache()
      } catch (_) {}
    }
  } catch (_) {
    // 忽略清理错误
  }
  return true
})

// 复原默认设置：清除所有数据，包括 settings.json、extensions.json、Session 数据
ipcMain.handle('restore-default-settings', async () => {
  try {
    // 1. 清除 Session 数据
    await session.defaultSession.clearStorageData({
      storages: [
        'cookies', 'filesystem', 'indexdb', 'localstorage',
        'websql', 'serviceworkers', 'cachestorage',
      ],
    })
    await session.defaultSession.clearCache()
    await session.defaultSession.clearCodeCaches()
    // 清除已知的 webview 分区
    for (const partitionName of ['persist:incognito']) {
      try {
        const partition = session.fromPartition(partitionName)
        await partition.clearStorageData()
        await partition.clearCache()
      } catch (_) {}
    }

    // 2. 卸载所有扩展
    for (const [extId] of installedExtensions) {
      try {
        await session.defaultSession.removeExtension(extId)
      } catch (_) {}
    }
    installedExtensions.clear()

    // 3. 删除持久化文件
    const settingsPath = path.join(app.getPath('userData'), 'settings.json')
    const extensionsPath = path.join(app.getPath('userData'), 'extensions.json')
    try { if (fs.existsSync(settingsPath)) fs.unlinkSync(settingsPath) } catch (_) {}
    try { if (fs.existsSync(extensionsPath)) fs.unlinkSync(extensionsPath) } catch (_) {}

    // 4. 重置内存中的设置
    protocolSettings = {
      mode: 'blacklist',
      whitelist: ['http:', 'https:', 'file:', 'blob:', 'data:'],
      blacklist: [...DEFAULT_PROTOCOL_BLACKLIST],
    }
    permissionSettings = {
      camera: 'ask', microphone: 'ask', geolocation: 'ask',
      notifications: 'ask', midiSysex: 'block', pointerLock: 'ask',
      fullscreen: 'ask', openExternal: 'ask', clipboardRead: 'ask',
      clipboardSanitizedWrite: 'ask', idleDetection: 'block',
      serial: 'block', sensors: 'block', displayCapture: 'ask',
      hid: 'block', usb: 'block',
    }
  } catch (_) {
    // 忽略清理错误
  }
  return true
})

// 扩展数据导出/导入
ipcMain.handle('get-extensions-data', async () => {
  try {
    const extensionsPath = path.join(app.getPath('userData'), 'extensions.json')
    if (fs.existsSync(extensionsPath)) {
      return JSON.parse(fs.readFileSync(extensionsPath, 'utf-8'))
    }
    return []
  } catch (_) {
    return []
  }
})

ipcMain.handle('set-extensions-data', async (_e, data) => {
  try {
    if (!Array.isArray(data)) return false
    const extensionsPath = path.join(app.getPath('userData'), 'extensions.json')
    fs.writeFileSync(extensionsPath, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (_) {
    return false
  }
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
    list.push({ id: ext.id, name: ext.name, version: ext.version, path: ext.path, enabled: ext.enabled, icon: ext.icon })
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
    const filter = domain ? { domain } : {}
    const cookies = await session.defaultSession.cookies.get(filter)
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
  return Object.entries(permissionSettings).map(([type, status]) => ({ type, status }))
})

ipcMain.handle('update-permission', async (_e, { type, status }) => {
  if (permissionSettings.hasOwnProperty(type)) {
    permissionSettings[type] = status
    savePermissionSettings()
    return true
  }
  return false
})

// 导出/导入外部配置（不在 localStorage 中的数据）
ipcMain.handle('get-external-settings', async () => {
  return { permissionSettings, protocolSettings }
})

ipcMain.handle('set-external-settings', async (_e, data) => {
  try {
    if (data.permissionSettings) {
      permissionSettings = { ...permissionSettings, ...data.permissionSettings }
      savePermissionSettings()
    }
    if (data.protocolSettings) {
      protocolSettings = { ...protocolSettings, ...data.protocolSettings }
      saveProtocolSettings()
    }
    return true
  } catch (_) {
    return false
  }
})

ipcMain.handle('get-protocol-settings', async () => {
  return protocolSettings
})

ipcMain.handle('update-protocol-settings', async (_e, data) => {
  protocolSettings = {
    mode: data.mode || 'blacklist',
    whitelist: data.whitelist || ['http:', 'https:', 'file:', 'blob:', 'data:'],
    blacklist: data.blacklist || [],
  }
  saveProtocolSettings()
  return true
})

app.whenReady().then(() => {
  if (!gotTheLock) {
    app.quit()
    return
  }
  Menu.setApplicationMenu(null)
  loadExtensions()
  loadProtocolSettings()
  loadPermissionSettings()
  createWindow()
  setupAdBlocker(session.defaultSession)
  setupProtocolWebRequest(session.defaultSession)
  setupPermissionHandlers(session.defaultSession)

  // 主页面下载
  setupDownloadHandler(session.defaultSession)

  // 处理首次启动时命令行中的文件参数
  const filePath = findFileArg(process.argv)
  if (filePath) {
    pendingOpenFile = 'file:///' + filePath.replace(/\\/g, '/')
  }

  // macOS open-file 事件
  app.on('open-file', (_event, filePath) => {
    _event.preventDefault()
    if (win && !win.isDestroyed()) {
      const fileUrl = 'file:///' + filePath.replace(/\\/g, '/')
      win.webContents.send('open-local-file', fileUrl)
      if (win.isMinimized()) win.restore()
      win.focus()
    } else {
      pendingOpenFile = 'file:///' + filePath.replace(/\\/g, '/')
    }
  })
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
