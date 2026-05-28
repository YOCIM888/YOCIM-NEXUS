<template>
  <div class="panel bookmark-panel" :style="panelStyle" @click.stop>
    <div class="panel-header">
      <h3>{{ t('bookmarks') }}</h3>
      <div class="header-actions">
        <button class="icon-btn" @click="handleImportBookmarks" :title="t('importBookmarks')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </button>
        <button class="icon-btn" @click="showNewFolder = true" :title="t('newFolder')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
        </button>
        <button class="icon-btn" :class="{ active: showSearch }" @click="toggleSearch" :title="t('searchBookmarks')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
        <button class="close-btn" @click="$emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>

    <div v-if="showSearch" class="search-bar">
      <svg class="search-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input v-model="searchQuery" :placeholder="t('searchBookmarks')" class="search-input" />
    </div>

    <div class="panel-body">
      <template v-if="searchQuery.trim()">
        <div v-if="filteredBookmarks.length === 0" class="empty">{{ t('noBookmarks') }}</div>
        <div
          v-for="item in filteredBookmarks"
          :key="item.bookmark.id"
          class="list-item search-result"
          @click="$emit('navigate', item.bookmark.url)"
          @contextmenu.prevent="handleBookmarkRightClick($event, item.bookmark, item.folderId)"
        >
          <div class="item-info">
            <span class="item-title">{{ item.bookmark.title }}</span>
            <span class="item-url">{{ item.bookmark.url }}</span>
            <span class="item-folder-tag">{{ item.folderName }}</span>
          </div>
        </div>
      </template>

      <template v-else>
        <div v-for="folder in bookmarkData.folders" :key="folder.id" class="folder-group">
          <div
            class="folder-item"
            @click="toggleFolder(folder.id)"
            @contextmenu.prevent="handleFolderRightClick(folder, $event)"
            @dragover.prevent
            @drop="handleDropOnFolder(folder.id)"
          >
            <svg class="expand-arrow" :class="{ expanded: expandedFolderIds.has(folder.id) }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="folder-icon"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            <span class="folder-name">{{ folder.name }}</span>
            <span class="folder-count">{{ folder.bookmarks.length }}</span>
          </div>
          <div v-if="expandedFolderIds.has(folder.id)" class="folder-bookmarks">
            <div v-if="folder.bookmarks.length === 0" class="empty-sm">{{ t('noBookmarks') }}</div>
            <div
              v-for="bm in folder.bookmarks"
              :key="bm.id"
              class="list-item"
              @click="$emit('navigate', bm.url)"
              @contextmenu.prevent="handleBookmarkRightClick($event, bm, folder.id)"
              draggable="true"
              @dragstart="onDragStart(bm.id, folder.id)"
            >
              <div class="item-info">
                <span class="item-title">{{ bm.title }}</span>
                <span class="item-url">{{ bm.url }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div v-if="showNewFolder" class="modal-overlay" @click.self="showNewFolder = false">
      <div class="modal">
        <h3>{{ t('newFolder') }}</h3>
        <input v-model="newFolderName" :placeholder="t('folderName')" @keyup.enter="createFolder" />
        <div class="modal-actions">
          <button class="btn-cancel" @click="showNewFolder = false">{{ t('cancel') }}</button>
          <button class="btn-confirm" @click="createFolder">{{ t('save') }}</button>
        </div>
      </div>
    </div>

    <div v-if="showRenameFolder" class="modal-overlay" @click.self="showRenameFolder = false">
      <div class="modal">
        <h3>{{ t('rename') }}</h3>
        <input v-model="renameValue" @keyup.enter="doRename" />
        <div class="modal-actions">
          <button class="btn-cancel" @click="showRenameFolder = false">{{ t('cancel') }}</button>
          <button class="btn-confirm" @click="doRename">{{ t('save') }}</button>
        </div>
      </div>
    </div>

    <div v-if="showRenameBookmark" class="modal-overlay" @click.self="showRenameBookmark = false">
      <div class="modal">
        <h3>{{ t('renameBookmark') }}</h3>
        <input v-model="renameBookmarkValue" @keyup.enter="doRenameBookmark" />
        <div class="modal-actions">
          <button class="btn-cancel" @click="showRenameBookmark = false">{{ t('cancel') }}</button>
          <button class="btn-confirm" @click="doRenameBookmark">{{ t('save') }}</button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="folderContextMenu.show" class="context-menu" :style="{ left: folderContextMenu.x + 'px', top: folderContextMenu.y + 'px' }" @click="closeFolderContextMenu">
        <button @click="startRename">{{ t('rename') }}</button>
        <button v-if="folderContextMenu.folderId !== 'default'" @click="doDeleteFolder">{{ t('delete') }}</button>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="bookmarkContextMenu.show" class="context-menu" :style="{ left: bookmarkContextMenu.x + 'px', top: bookmarkContextMenu.y + 'px' }" @click="closeBookmarkContextMenu">
        <button @click="openBookmarkInNewTab">{{ t('openInNewTab') }}</button>
        <button @click="openBookmarkInNewWindow">{{ t('openInNewWindow') }}</button>
        <button @click="startRenameBookmark">{{ t('renameBookmark') }}</button>
        <button @click="copyBookmarkLink">{{ t('copyLink') }}</button>
        <button @click="deleteBookmark">{{ t('delete') }}</button>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { getBookmarks, removeBookmark, addFolder, removeFolder, renameFolder, renameBookmark, moveBookmarkToFolder, addBookmark } from '../utils/storage'
import { useI18n } from '../utils/i18n'

const { t } = useI18n()
const emit = defineEmits(['close', 'navigate', 'openInNewWindow'])
defineProps({ panelStyle: { type: Object, default: () => ({}) } })

const bookmarkData = ref({ folders: [] })
const expandedFolderIds = reactive(new Set(['default']))
const showNewFolder = ref(false)
const newFolderName = ref('')
const showRenameFolder = ref(false)
const renameValue = ref('')
const renameFolderId = ref(null)
const folderContextMenu = ref({ show: false, x: 0, y: 0, folderId: null })
const dragBookmark = ref({ bookmarkId: null, fromFolderId: null })

const showSearch = ref(false)
const searchQuery = ref('')

const showRenameBookmark = ref(false)
const renameBookmarkValue = ref('')
const renameBookmarkId = ref(null)
const renameBookmarkFolderId = ref(null)
const bookmarkContextMenu = ref({ show: false, x: 0, y: 0, bookmark: null, folderId: null })

onMounted(() => {
  bookmarkData.value = getBookmarks()
  document.addEventListener('click', closeAllContextMenus)
})

onUnmounted(() => {
  document.removeEventListener('click', closeAllContextMenus)
})

const filteredBookmarks = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  const results = []
  for (const folder of bookmarkData.value.folders) {
    for (const bm of folder.bookmarks) {
      if (bm.title.toLowerCase().includes(q) || bm.url.toLowerCase().includes(q)) {
        results.push({ bookmark: bm, folderId: folder.id, folderName: folder.name })
      }
    }
  }
  return results
})

function toggleFolder(id) {
  if (expandedFolderIds.has(id)) {
    expandedFolderIds.delete(id)
  } else {
    expandedFolderIds.add(id)
  }
}

function toggleSearch() {
  showSearch.value = !showSearch.value
  if (!showSearch.value) searchQuery.value = ''
}

function createFolder() {
  if (!newFolderName.value.trim()) return
  bookmarkData.value = addFolder(newFolderName.value.trim())
  newFolderName.value = ''
  showNewFolder.value = false
}

function handleFolderRightClick(folder, e) {
  folderContextMenu.value = { show: true, x: e.clientX, y: e.clientY, folderId: folder.id }
}

function closeFolderContextMenu() {
  folderContextMenu.value.show = false
}

function closeBookmarkContextMenu() {
  bookmarkContextMenu.value.show = false
}

function closeAllContextMenus() {
  folderContextMenu.value.show = false
  bookmarkContextMenu.value.show = false
}

function startRename() {
  renameFolderId.value = folderContextMenu.value.folderId
  const folder = bookmarkData.value.folders.find(f => f.id === renameFolderId.value)
  renameValue.value = folder ? folder.name : ''
  showRenameFolder.value = true
  folderContextMenu.value.show = false
}

function doRename() {
  if (!renameValue.value.trim()) return
  bookmarkData.value = renameFolder(renameFolderId.value, renameValue.value.trim())
  showRenameFolder.value = false
}

function doDeleteFolder() {
  bookmarkData.value = removeFolder(folderContextMenu.value.folderId)
  expandedFolderIds.delete(folderContextMenu.value.folderId)
  folderContextMenu.value.show = false
}

function onDragStart(bookmarkId, fromFolderId) {
  dragBookmark.value = { bookmarkId, fromFolderId }
}

function handleDropOnFolder(toFolderId) {
  if (!dragBookmark.value.bookmarkId || dragBookmark.value.fromFolderId === toFolderId) return
  bookmarkData.value = moveBookmarkToFolder(dragBookmark.value.fromFolderId, dragBookmark.value.bookmarkId, toFolderId)
  dragBookmark.value = { bookmarkId: null, fromFolderId: null }
}

async function handleImportBookmarks() {
  const filePath = await window.electronAPI?.selectFile([{ name: 'HTML', extensions: ['html', 'htm'] }])
  if (!filePath) return
  const imported = await window.electronAPI?.parseBookmarksHtml(filePath)
  if (imported && imported.length > 0) {
    for (const bm of imported) {
      bookmarkData.value = addBookmark({ title: bm.title, url: bm.url, folderId: 'default' })
    }
  }
}

function handleBookmarkRightClick(e, bm, folderId) {
  bookmarkContextMenu.value = { show: true, x: e.clientX, y: e.clientY, bookmark: bm, folderId }
}

function openBookmarkInNewTab() {
  if (bookmarkContextMenu.value.bookmark) {
    emit('navigate', bookmarkContextMenu.value.bookmark.url)
  }
  bookmarkContextMenu.value.show = false
}

function openBookmarkInNewWindow() {
  if (bookmarkContextMenu.value.bookmark) {
    emit('openInNewWindow', bookmarkContextMenu.value.bookmark.url)
  }
  bookmarkContextMenu.value.show = false
}

function startRenameBookmark() {
  renameBookmarkId.value = bookmarkContextMenu.value.bookmark?.id
  renameBookmarkFolderId.value = bookmarkContextMenu.value.folderId
  renameBookmarkValue.value = bookmarkContextMenu.value.bookmark?.title || ''
  showRenameBookmark.value = true
  bookmarkContextMenu.value.show = false
}

function doRenameBookmark() {
  if (!renameBookmarkValue.value.trim()) return
  bookmarkData.value = renameBookmark(renameBookmarkFolderId.value, renameBookmarkId.value, renameBookmarkValue.value.trim())
  showRenameBookmark.value = false
}

function copyBookmarkLink() {
  if (bookmarkContextMenu.value.bookmark) {
    navigator.clipboard.writeText(bookmarkContextMenu.value.bookmark.url)
  }
  bookmarkContextMenu.value.show = false
}

function deleteBookmark() {
  if (bookmarkContextMenu.value.bookmark) {
    bookmarkData.value = removeBookmark(bookmarkContextMenu.value.folderId, bookmarkContextMenu.value.bookmark.id)
  }
  bookmarkContextMenu.value.show = false
}
</script>

<style scoped>
.panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 360px;
  height: 100%;
  background: var(--bg-primary);
  border-left: 1px solid var(--border-color);
  z-index: 50;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}

.panel-header h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  color: var(--text-muted);
  padding: 4px;
  border-radius: 4px;
}

.icon-btn svg {
  width: 18px;
  height: 18px;
}

.icon-btn:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.icon-btn.active {
  color: var(--accent);
  background: var(--accent-bg);
}

.close-btn {
  color: var(--text-muted);
  padding: 4px;
}

.close-btn svg {
  width: 18px;
  height: 18px;
}

.close-btn:hover {
  color: var(--text-primary);
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  gap: 8px;
  border-bottom: 1px solid var(--border-color);
}

.search-icon-sm {
  width: 16px;
  height: 16px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 13px;
  background: transparent;
  color: var(--text-primary);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.folder-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.15s;
  gap: 8px;
}

.folder-item:hover {
  background: var(--bg-tertiary);
}

.expand-arrow {
  width: 14px;
  height: 14px;
  color: var(--text-muted);
  flex-shrink: 0;
  transition: transform 0.15s;
  transform: rotate(0deg);
}

.expand-arrow.expanded {
  transform: rotate(90deg);
}

.folder-icon {
  width: 16px;
  height: 16px;
  color: var(--accent);
  flex-shrink: 0;
}

.folder-name {
  flex: 1;
  font-size: 13px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folder-count {
  font-size: 11px;
  color: var(--text-muted);
  background: var(--bg-tertiary);
  padding: 1px 6px;
  border-radius: 8px;
}

.folder-bookmarks {
  padding-left: 24px;
}

.empty {
  padding: 40px 16px;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
}

.empty-sm {
  padding: 12px 16px;
  text-align: center;
  color: var(--text-muted);
  font-size: 12px;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.15s;
}

.list-item:hover {
  background: var(--bg-tertiary);
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  display: block;
  font-size: 13px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-url {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
}

.search-result .item-folder-tag {
  display: inline-block;
  font-size: 10px;
  color: var(--accent);
  background: var(--accent-bg);
  padding: 1px 6px;
  border-radius: 4px;
  margin-top: 2px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 24px;
  width: 320px;
  box-shadow: 0 8px 30px var(--modal-shadow);
}

.modal h3 {
  margin-bottom: 16px;
  font-size: 16px;
  color: var(--text-primary);
}

.modal input {
  display: block;
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: var(--input-bg);
  color: var(--text-primary);
}

.modal input:focus {
  border-color: var(--accent);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-cancel {
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 14px;
  color: var(--text-secondary);
}

.btn-cancel:hover {
  background: var(--bg-tertiary);
}

.btn-confirm {
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 14px;
  background: var(--accent);
  color: #fff;
}

.btn-confirm:hover {
  background: var(--accent-hover);
}

.context-menu {
  position: fixed;
  background: var(--bg-primary);
  border-radius: 8px;
  box-shadow: 0 4px 16px var(--modal-shadow);
  z-index: 200;
  overflow: hidden;
  min-width: 80px;
}

.context-menu button {
  display: block;
  width: 100%;
  padding: 8px 20px;
  font-size: 13px;
  color: var(--text-primary);
  text-align: left;
}

.context-menu button:hover {
  background: var(--bg-tertiary);
}

.context-menu button:last-child:hover {
  color: var(--danger);
}
</style>
