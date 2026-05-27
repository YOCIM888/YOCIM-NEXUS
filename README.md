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

### Core Browsing

- **Multi-tab** — Process isolation via Electron `webview`, each tab runs independently
- **Address bar autocomplete** — Smart matching from history and bookmarks
- **Search engine switching** — Google / Bing / Baidu / Sogou / Yandex / Naver
- **Search suggestions** — Real-time suggestions powered by Baidu API
- **Frameless fullscreen** — Press F11 for immersive mode, long-press ESC to exit
- **Startup page customization** — Default homepage or custom URL
- **New tab page customization** — Set any URL as your new tab page

### Tab Management

- **Drag & drop reorder** — Freely rearrange tabs
- **Tab mute** — One-click mute/unmute tabs playing audio
- **Auto-suspend** — Inactive tabs automatically release memory (configurable timeout)
- **Freeze/Thaw** — Manually freeze tabs to free resources, click to restore
- **Pin tabs** — Pin important tabs to the left
- **Duplicate tabs** — Right-click to duplicate to the right
- **Restore closed tabs** — Ctrl+Shift+T to reopen recently closed tabs
- **Incognito window** — Independent session partition, Ctrl+Shift+N

### Bookmarks & Records

- **Bookmark management** — Folder organization, import from Chrome/Firefox/Edge HTML
- **Quick bookmark toggle** — Ctrl+D to bookmark/unbookmark current page
- **History** — Full-text search, auto-recorded
- **Reading list** — Save pages to read later
- **Quick notes** — Jot down ideas anytime, auto-save

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
- **Panel style customization** — Adjust width and background color for each sidebar panel individually:
  - Bookmark panel
  - History panel
  - Download panel
  - Reading list panel
  - Notes panel
- **Language** — English / Chinese, select on first launch
- **Page zoom** — Set default zoom level for all pages (50%–200%)

### Tools

- **Download manager** — Real-time progress, speed display, open file/folder
- **In-page search** — Ctrl+F with match count
- **Split view** — Two tabs side by side for comparison
- **Screenshot** — Full page capture (Ctrl+Shift+S)
- **Picture-in-Picture** — Pop out video, always on top
- **Extensions** — Install Chrome extension directories
- **Update checker** — Detect latest release from GitHub

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
│   ├── main.js          # Main process (window, IPC, downloads, cookies)
│   ├── preload.js       # Preload script (context bridge)
│   └── adblocker.js     # Ad blocker module
├── src/
│   ├── App.vue          # Core: tab bar, navbar, shortcuts, download IPC
│   ├── main.js          # Vue entry
│   ├── style.css        # Global styles & CSS custom properties
│   ├── components/
│   │   ├── HomePage.vue         # Homepage (logo, search, nav grid, context menus)
│   │   ├── SettingsPage.vue     # Settings (7 sections)
│   │   ├── BookmarkPanel.vue    # Bookmark panel
│   │   ├── HistoryPanel.vue     # History panel
│   │   ├── DownloadPanel.vue    # Download manager
│   │   ├── ReadingListPanel.vue # Reading list
│   │   ├── NotesPanel.vue       # Quick notes
│   │   └── FindBar.vue          # In-page search
│   └── utils/
│       ├── i18n.js      # Internationalization (zh/en)
│       └── storage.js   # Data persistence & password management
├── public/icon/         # App icons
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
