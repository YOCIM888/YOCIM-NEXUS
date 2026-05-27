<div align="center">

# YOCIM NEXUS

**轻量 · 极简 · 高效桌面浏览器**

[🌐English MD](./README.md)

[![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Electron](https://img.shields.io/badge/Electron-42-47848f?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## 简介

YOCIM NEXUS 是一款基于 **Electron + Vue 3** 构建的轻量级桌面浏览器，采用 **Vite** 构建工具链。追求极简设计与高效体验，提供无框窗口、多标签页、深浅色主题、广告拦截、密码管理等现代浏览器核心功能，绿色便携——无需安装，开箱即用。

## 功能特性

### 核心浏览

- **多标签页** — 基于 Electron `webview` 实现进程隔离，每个标签页独立运行
- **地址栏自动补全** — 智能匹配书签与历史记录
- **搜索引擎切换** — 支持 Google / Bing / Baidu / Sogou / Yandex / Naver
- **搜索建议** — 接入百度搜索建议 API，输入实时联想
- **无框全屏** — F11 沉浸式全屏，长按 ESC 退出
- **启动页自定义** — 默认主页或自定义 URL
- **新标签页自定义** — 可设置任意 URL 作为新标签页

### 标签管理

- **拖拽排序** — 自由调整标签顺序
- **标签静音** — 一键静音/取消静音正在播放音频的标签
- **自动休眠** — 长时间未活动的标签自动释放内存（可配置超时时间）
- **冻结/解冻** — 手动冻结标签释放资源，点击恢复
- **固定标签** — 将重要标签固定在左侧
- **复制标签** — 右键复制到右侧新标签页
- **恢复关闭** — Ctrl+Shift+T 恢复最近关闭的标签页
- **隐身窗口** — 独立会话分区，Ctrl+Shift+N 新建

### 收藏与记录

- **书签管理** — 支持文件夹分类，可从 Chrome/Firefox/Edge 导入 HTML 书签
- **快捷收藏** — Ctrl+D 一键收藏/取消收藏当前页面
- **历史记录** — 全文搜索，自动记录浏览历史
- **阅读列表** — 保存稍后阅读的网页
- **快速笔记** — 随时记录想法，自动保存

### 隐私与安全

- **密码管理** — 本地加密存储，6 位 PIN 码保护；支持添加、编辑、删除、搜索密码
- **广告拦截** — 内置 EasyList 规则，一键开关
- **无痕浏览** — 可选模式，所有链接在无痕窗口中打开
- **Cookie 管理** — 查看和按域名删除 Cookie
- **站点权限** — 管理各站点权限（位置、摄像头、麦克风、通知）
- **清除数据** — 一键清除所有浏览数据（Cookie、缓存、localStorage、IndexedDB）

### 外观与个性化

- **浅色 / 深色 / 自定义主题** — 切换主题或自定义调色板
- **主页自定义背景** — 可设置任意图片为壁纸
- **隐藏标识 / 图标** — 极简模式：隐藏主页 LOGO 和导航图标区域
- **面板样式自定义** — 为每个侧边栏面板独立调节宽度和背景色：
  - 书签栏
  - 历史栏
  - 下载栏
  - 阅读栏
  - 笔记栏
- **多语言** — English / 中文，首次启动弹窗选择
- **页面缩放** — 设置所有页面的默认缩放比例（50%~200%）

### 实用工具

- **下载管理器** — 实时进度、速度显示、打开文件/文件夹
- **页面内搜索** — Ctrl+F 高亮匹配，显示匹配数量
- **分屏浏览** — 双标签并排对比
- **截图工具** — 全页截图（Ctrl+Shift+S）
- **画中画** — 视频弹出小窗，始终置顶
- **扩展管理** — 安装 Chrome 扩展目录
- **检查更新** — 检测 GitHub 最新版本

### 数据管理

- **导出数据** — 一键导出所有设置、书签、历史、密码、下载记录为 JSON
- **导入数据** — 从备份文件恢复
- **自动备份** — 可配置间隔（6h / 12h / 24h / 48h / 7d）
- **复原默认设置** — 二次确认后恢复出厂设置

### 快捷键

| 快捷键 | 功能 |
|----------|------|
| `Ctrl+T` | 新建标签页 |
| `Ctrl+Shift+T` | 恢复关闭的标签页 |
| `Ctrl+W` | 关闭当前标签页 |
| `Ctrl+1~8` | 切换到第 1~8 个标签页 |
| `Ctrl+9` | 切换到最后一个标签页 |
| `Ctrl+Tab` | 下一标签页 |
| `Ctrl+Shift+Tab`| 上一标签页 |
| `Ctrl+L` | 聚焦地址栏 |
| `Ctrl+R` / `F5` | 刷新 |
| `Ctrl+D` | 收藏/取消收藏 |
| `Ctrl+H` | 历史面板 |
| `Ctrl+J` | 下载面板 |
| `Ctrl+B` | 书签面板 |
| `Ctrl+F` | 页面搜索 |
| `Ctrl++` / `Ctrl+-` | 放大 / 缩小 |
| `Ctrl+0` | 重置缩放 |
| `Esc` | 停止加载 |
| `Ctrl+Shift+N` | 新建隐身窗口 |
| `Ctrl+Shift+S` | 截图 |
| `Ctrl+Shift+I` / `F12` | 开发者工具 |
| `Alt+←` | 后退 |
| `Alt+→` | 前进 |
| `F11` | 全屏切换 |

## 项目结构

```
Yocim-Browser/
├── electron/
│   ├── main.js          # 主进程（窗口管理、IPC、下载、Cookie）
│   ├── preload.js       # 预加载脚本（安全桥接）
│   └── adblocker.js     # 广告拦截模块
├── src/
│   ├── App.vue          # 核心架构（标签栏、导航栏、快捷键、下载 IPC）
│   ├── main.js          # Vue 入口
│   ├── style.css        # 全局样式 & CSS 自定义属性
│   ├── components/
│   │   ├── HomePage.vue         # 主页（LOGO、搜索、导航网格、右键菜单）
│   │   ├── SettingsPage.vue     # 设置页（7 大分类）
│   │   ├── BookmarkPanel.vue    # 书签面板
│   │   ├── HistoryPanel.vue     # 历史面板
│   │   ├── DownloadPanel.vue    # 下载管理面板
│   │   ├── ReadingListPanel.vue # 阅读列表面板
│   │   ├── NotesPanel.vue       # 快速笔记面板
│   │   └── FindBar.vue          # 页面搜索栏
│   └── utils/
│       ├── i18n.js      # 国际化模块（中/英）
│       └── storage.js   # 数据持久化 & 密码管理
├── public/icon/         # 应用图标
├── package.json
└── vite.config.js
```

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 开发

```bash
npm install
npm run electron:dev
```

### 构建

```bash
# 构建绿色便携版（输出到 release/ 目录）
npm run electron:build
```

直接运行 `release/win-unpacked/YOCIM NEXUS.exe`，无需安装。

## 许可证

[MIT License](LICENSE)
