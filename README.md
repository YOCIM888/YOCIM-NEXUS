<div align="center">

# YOCIM NEXUS

**Lightweight · Minimal · Efficient Desktop Browser**

[🌐中文文档](./README_zh.md)

[![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Electron](https://img.shields.io/badge/Electron-42-47848f?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## Introduction

YOCIM NEXUS is a lightweight desktop browser built with **Electron + Vue 3** and powered by **Vite**. It pursues minimalist design and efficient experience, providing frameless window, multi-tab browsing, dark/light modes, ad blocking, password manager, and many other modern browser features — all in a portable package with no installation required.

## Features

### AI Assistant

YOCIM NEXUS integrates a powerful AI assistant with browser control capabilities. Configure your own API keys for OpenAI, Claude, DeepSeek, Groq, or any OpenAI-compatible endpoint (e.g. Ollama local models).

**Chat Interface**

- **Multi-model support** — Switch between multiple configured models; streaming responses with real-time display
- **Chat bubbles** — AI messages on the left, user messages on the right; distinct visual styling for clarity
- **Code rendering** — Code blocks are displayed in bordered containers with syntax highlighting headers and a copy-to-clipboard button
- **Memory system** — AI summarizes conversations into long-term memories; configurable retention range (3/7/15/30 days or forever)

**Browser Commands** (type `/` to show the command popover)

| Command | Description |
|---------|-------------|
| `/fav` | **AI Bookmark Management** — AI reads your bookmark titles, creates categorized folders, and organizes bookmarks automatically. Confirm before executing. |
| `/set` | **AI Settings Control** — Change browser settings by chatting (theme, ad block, language, search engine, zoom, tabs position, hide logo/icons, incognito, session restore). Confirm before executing. |
| `/exp` | **AI Extension Management** — Enable, disable, or remove Chrome extensions via natural language. Confirm before executing. |
| `/his` | **AI History Management** — View, search, or delete browsing history entries by time range. Confirm before executing. |
| `/mem` | **Summarize & Remember** — AI summarizes the current conversation and saves it as a memory for future context. (Alias for `/memory`) |

**Privacy**
- All commands execute with a **confirmation step** — no automatic changes to your browser
- **URLs are never sent** to AI providers — only bookmark/history titles are used for context
- All AI processing happens through your own API keys; no data passes through third-party servers beyond your configured AI provider

---

### Core Browsing

- **Multi-tab** — Process isolation via Electron `webview`, each tab runs independently
- **Address bar autocomplete** — Smart matching from history and bookmarks
- **Search engine switching** — Google / Bing / Baidu / Sogou / Yandex / Naver
- **Search suggestions** — Real-time suggestions powered by Baidu API
- **Frameless fullscreen** — Press F11 for immersive mode, long-press ESC to exit
- **Startup page customization** — Default homepage or custom URL
- **New tab page customization** — Set any URL as your new tab page
- **Default browser** — Set YOCIM NEXUS as the system default browser

### Tab Management

- **Drag & drop reorder** — Freely rearrange tabs
- **Tab mute** — One-click mute/unmute tabs playing audio
- **Auto-suspend** — Inactive tabs automatically release memory (configurable timeout)
- **Freeze/Thaw** — Manually freeze tabs to free resources, click to restore
- **Pin tabs** — Pin important tabs to the left
- **Duplicate tabs** — Right-click to duplicate to the right
- **Restore closed tabs** — Ctrl+Shift+T to reopen recently closed tabs
- **Incognito window** — Independent session partition, Ctrl+Shift+N
- **Tab bar position** — Switch between top (horizontal) and left (vertical) layout
- **Sidebar collapse** — Collapse the vertical sidebar to icon-only mode
- **Crash recovery** — Auto-detect and reload crashed tabs
- **Session restore** — Reopen tabs from the previous session on startup

### Bookmarks & Records

- **Bookmark management** — Folder organization, import from Chrome/Firefox/Edge HTML
- **Quick bookmark toggle** — Ctrl+D to bookmark/unbookmark current page
- **History** — Full-text search, auto-recorded
- **Reading list** — Save pages to read later
- **Quick notes** — Jot down ideas anytime, auto-save; supports pinning, color labels, and drag reorder

### Privacy & Security

- **Password manager** — Locally stored with 6-digit PIN protection; add, edit, delete, and search saved credentials
- **Ad blocker** — Built-in EasyList rules, toggle on/off
- **Incognito browsing** — Optional mode to open all links in incognito windows
- **Cookie manager** — View and delete cookies by domain
- **Site permissions** — Manage per-site permissions (location, camera, microphone, notifications)
- **Clear data** — One-click clear all browsing data (cookies, cache, localStorage, IndexedDB)

### Appearance & Customization

- **Light / Dark / Custom themes** — Switch themes or build your own color palette
- **Custom homepage background** — Set any image as wallpaper
- **Hide logo / icons** — Minimalist mode: hide homepage logo and navigation grid
- **Navigation grid** — Add, edit, delete, and drag-reorder shortcut cards on homepage
- **Panel style customization** — Adjust width and background color for each sidebar panel:
  - Bookmark panel
  - History panel
  - Download panel
  - Reading list panel
  - Notes panel
- **Language** — English / Chinese, select on first launch
- **Page zoom** — Set default zoom level for all pages (50%–200%)

### Tools

- **Download manager** — Real-time progress, speed display, pause/resume, open file/folder
- **In-page search** — Ctrl+F with match count
- **Split view** — Two tabs side by side for comparison
- **Screenshot** — Full page capture (Ctrl+Shift+S)
- **Print** — Print current page directly
- **Picture-in-Picture** — Pop out video, always on top
- **Extensions** — Install and manage Chrome extension directories
- **Toolbar customization** — Toggle individual tool buttons in settings
- **Update checker** — Detect latest release from GitHub
- **Context menu** — Right-click for navigation, image actions, print, screenshot

### Data Management

- **Export data** — Export all settings, bookmarks, history, passwords, downloads as JSON
- **Import data** — Restore from a backup file
- **Auto backup** — Configurable interval (6h / 12h / 24h / 48h / 7d)
- **Reset to defaults** — Restore factory settings with confirmation

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+T` | New tab |
| `Ctrl+Shift+T` | Restore closed tab |
| `Ctrl+W` | Close current tab |
| `Ctrl+1~8` | Switch to tab 1–8 |
| `Ctrl+9` | Switch to last tab |
| `Ctrl+Tab` | Next tab |
| `Ctrl+Shift+Tab`| Previous tab |
| `Ctrl+L` | Focus address bar |
| `Ctrl+R` / `F5` | Reload |
| `Ctrl+D` | Toggle bookmark |
| `Ctrl+H` | History panel |
| `Ctrl+J` | Downloads panel |
| `Ctrl+B` | Bookmarks panel |
| `Ctrl+F` | Find in page |
| `Ctrl++` / `Ctrl+-` | Zoom in / out |
| `Ctrl+0` | Reset zoom |
| `Esc` | Stop loading |
| `Ctrl+Shift+N` | New incognito window |
| `Ctrl+Shift+S` | Screenshot |
| `Ctrl+Shift+I` / `F12` | Developer Tools |
| `Alt+←` | Back |
| `Alt+→` | Forward |
| `F11` | Toggle fullscreen |

## Project Structure

```
Yocim-Browser/
├── electron/
│   ├── main.js              # Main process (window, IPC, downloads, cookies, extensions)
│   ├── preload.js           # Preload script (context bridge)
│   ├── webview-preload.js   # Webview preload (F5/F11/F12 key forwarding)
│   └── adblocker.js         # Ad blocker module
├── src/
│   ├── App.vue              # Root component (layout orchestration)
│   ├── main.js              # Vue entry
│   ├── style.css            # Global styles & CSS custom properties
│   ├── components/
│   │   ├── HomePage.vue         # Homepage (logo, search, nav grid, context menus)
│   │   ├── SettingsPage.vue     # Settings (7 sections)
│   │   ├── NavBar.vue           # Navigation bar (address bar, toolbar buttons)
│   │   ├── AiPanel.vue          # AI chat panel (multi-model, streaming, browser commands)
│   │   ├── ExtensionsPanel.vue  # Extensions manager
│   │   ├── TabBar.vue           # Tab bar (drag reorder, audio, freeze, split view)
│   │   ├── TabContextMenu.vue   # Tab right-click context menu
│   │   ├── VerticalTitleBar.vue # Vertical layout title bar
│   │   ├── LangDialog.vue       # First-launch language selection dialog
│   │   ├── BookmarkPanel.vue    # Bookmark panel
│   │   ├── HistoryPanel.vue     # History panel
│   │   ├── DownloadPanel.vue    # Download manager
│   │   ├── ReadingListPanel.vue # Reading list
│   │   ├── NotesPanel.vue       # Quick notes
│   │   └── FindBar.vue          # In-page search
│   ├── composables/
│   │   ├── useSettings.js       # Global settings & theme management
│   │   ├── useTabs.js           # Tab lifecycle & state management
│   │   ├── useWebview.js        # Webview interaction & navigation
│   │   ├── useKeyboard.js       # Keyboard shortcuts handler
│   │   ├── useDownloads.js      # Download management
│   │   └── useAi.js             # AI model config, streaming API, browser commands
│   └── utils/
│       ├── i18n.js              # Internationalization (zh/en)
│       └── storage.js           # Data persistence & password management
├── public/icon/             # App icons
├── package.json
└── vite.config.js
```

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Development

```bash
npm install
npm run electron:dev
```

### Build

```bash
# Build portable executable (output to release/)
npm run electron:build
```

Run `release/win-unpacked/YOCIM NEXUS.exe` directly — no installation needed.

## License

[MIT License](LICENSE)
