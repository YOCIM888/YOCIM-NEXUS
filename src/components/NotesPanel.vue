<template>
  <div class="panel notes-panel" :style="panelStyle" @click.stop>
    <div class="panel-header">
      <h3>{{ t('notes') }}</h3>
      <div class="header-actions">
        <button class="icon-btn" @click="createNote" :title="t('addNote')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        </button>
        <button class="close-btn" @click="$emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    <div class="panel-body">
      <div v-if="sortedNotes.length === 0" class="empty">{{ t('noNotes') }}</div>
      <div
        v-for="note in sortedNotes"
        :key="note.id"
        :class="['note-item', { active: activeNoteId === note.id, 'drag-over': dragOverNoteId === note.id }]"
        draggable="true"
        @click="selectNote(note.id)"
        @contextmenu.prevent="handleContextMenu($event, note.id)"
        @dragstart="onDragStart($event, note.id)"
        @dragover.prevent="onDragOver(note.id)"
        @drop="onDrop(note.id)"
        @dragend="onDragEnd"
      >
        <div class="note-main">
          <div class="note-preview">{{ note.title || note.content.slice(0, 50) || t('emptyNote') }}</div>
          <div class="note-meta">
            <span class="note-time">{{ formatTime(note.time) }}</span>
            <span v-if="note.pinned" class="pin-icon">📌</span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="activeNoteId" class="note-editor">
      <input class="note-title-input" v-model="editTitle" @input="autoSave" :placeholder="t('noteTitle')" />
      <textarea v-model="editContent" @input="autoSave" :placeholder="t('noteContent')"></textarea>
    </div>

    <Teleport to="body">
      <div v-if="contextMenu.show" class="context-menu" :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }" @click="closeContextMenu">
        <button @click="togglePin">{{ contextMenuNote?.pinned ? t('unpinNote') : t('pinNote') }}</button>
        <button @click="startRename">{{ t('renameTitle') }}</button>
        <button @click="copyContent">{{ t('copyContent') }}</button>
        <button @click="deleteNote">{{ t('delete') }}</button>
      </div>
    </Teleport>

    <div v-if="showRenameModal" class="modal-overlay" @click.self="showRenameModal = false">
      <div class="modal">
        <h3>{{ t('renameTitle') }}</h3>
        <input v-model="renameValue" @keyup.enter="doRename" />
        <div class="modal-actions">
          <button class="btn-cancel" @click="showRenameModal = false">{{ t('cancel') }}</button>
          <button class="btn-confirm" @click="doRename">{{ t('save') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getNotes, addNote, updateNote, updateNoteMeta, reorderNotes, removeNote } from '../utils/storage'
import { useI18n } from '../utils/i18n'

const { t } = useI18n()
const emit = defineEmits(['close'])
defineProps({ panelStyle: { type: Object, default: () => ({}) } })

const notes = ref([])
const activeNoteId = ref(null)
const editTitle = ref('')
const editContent = ref('')
let saveTimer = null

const contextMenu = ref({ show: false, x: 0, y: 0, noteId: null })
const showRenameModal = ref(false)
const renameValue = ref('')
const renameNoteId = ref(null)
const dragNoteId = ref(null)
const dragOverNoteId = ref(null)

onMounted(() => {
  notes.value = getNotes()
  document.addEventListener('click', closePopups)
})

onUnmounted(() => {
  document.removeEventListener('click', closePopups)
})

const contextMenuNote = computed(() => {
  if (!contextMenu.value.noteId) return null
  return notes.value.find(n => n.id === contextMenu.value.noteId)
})

const sortedNotes = computed(() => {
  const withDefaults = notes.value.map(n => ({
    ...n,
    pinned: n.pinned || false,
    color: n.color || '',
    order: n.order ?? n.time
  }))
  const pinned = withDefaults.filter(n => n.pinned).sort((a, b) => a.order - b.order || b.time - a.time)
  const unpinned = withDefaults.filter(n => !n.pinned).sort((a, b) => a.order - b.order || b.time - a.time)
  return [...pinned, ...unpinned]
})

function formatTime(ts) {
  return new Date(ts).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function createNote() {
  notes.value = addNote({ title: '', content: '' })
  activeNoteId.value = notes.value[0].id
  editTitle.value = ''
  editContent.value = ''
}

function selectNote(id) {
  activeNoteId.value = id
  const note = notes.value.find(n => n.id === id)
  editTitle.value = note ? (note.title || '') : ''
  editContent.value = note ? note.content : ''
}

function autoSave() {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    if (activeNoteId.value) {
      notes.value = updateNote(activeNoteId.value, { title: editTitle.value, content: editContent.value })
    }
  }, 500)
}

function handleContextMenu(e, noteId) {
  contextMenu.value = { show: true, x: e.clientX, y: e.clientY, noteId }
}

function closeContextMenu() {
  contextMenu.value.show = false
}

function closePopups() {
  contextMenu.value.show = false
}

function togglePin() {
  const note = contextMenuNote.value
  if (note) {
    notes.value = updateNoteMeta(note.id, { pinned: !note.pinned })
  }
  contextMenu.value.show = false
}

function startRename() {
  renameNoteId.value = contextMenu.value.noteId
  const note = notes.value.find(n => n.id === renameNoteId.value)
  renameValue.value = note ? (note.title || '') : ''
  showRenameModal.value = true
  contextMenu.value.show = false
}

function doRename() {
  if (renameNoteId.value) {
    notes.value = updateNoteMeta(renameNoteId.value, { title: renameValue.value })
  }
  showRenameModal.value = false
}

function copyContent() {
  const note = contextMenuNote.value
  if (note) navigator.clipboard.writeText(note.content)
  contextMenu.value.show = false
}

function deleteNote() {
  if (contextMenu.value.noteId) {
    notes.value = removeNote(contextMenu.value.noteId)
    if (activeNoteId.value === contextMenu.value.noteId) {
      activeNoteId.value = null
      editTitle.value = ''
      editContent.value = ''
    }
  }
  contextMenu.value.show = false
}

function onDragStart(e, noteId) {
  dragNoteId.value = noteId
  e.dataTransfer.effectAllowed = 'move'
}

function onDragOver(noteId) {
  dragOverNoteId.value = noteId
}

function onDrop(targetId) {
  if (!dragNoteId.value || dragNoteId.value === targetId) {
    onDragEnd()
    return
  }
  const dragNote = notes.value.find(n => n.id === dragNoteId.value)
  const targetNote = notes.value.find(n => n.id === targetId)
  if (!dragNote || !targetNote || dragNote.pinned !== targetNote.pinned) {
    onDragEnd()
    return
  }
  const group = sortedNotes.value.filter(n => n.pinned === dragNote.pinned)
  const ids = group.map(n => n.id)
  const fromIdx = ids.indexOf(dragNoteId.value)
  const toIdx = ids.indexOf(targetId)
  if (fromIdx === -1 || toIdx === -1) { onDragEnd(); return }
  ids.splice(fromIdx, 1)
  ids.splice(toIdx, 0, dragNoteId.value)
  notes.value = reorderNotes(ids)
  onDragEnd()
}

function onDragEnd() {
  dragNoteId.value = null
  dragOverNoteId.value = null
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
.panel-body {
  flex: 1;
  overflow-y: auto;
}
.empty {
  padding: 40px 16px;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
}
.note-item {
  display: flex;
  padding: 10px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-light);
  transition: background 0.15s;
}
.note-item:hover {
  background: var(--bg-tertiary);
}
.note-item.active {
  background: var(--accent-bg);
}
.note-item.drag-over {
  border-top: 2px solid var(--accent);
}
.note-main {
  flex: 1;
  min-width: 0;
}
.note-preview {
  font-size: 13px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}
.note-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.note-time {
  font-size: 11px;
  color: var(--text-muted);
}
.pin-icon {
  font-size: 12px;
}
.note-editor {
  border-top: 1px solid var(--border-color);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.note-title-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
  background: var(--input-bg);
  color: var(--text-primary);
  font-family: inherit;
}
.note-title-input:focus {
  border-color: var(--accent);
}
.note-editor textarea {
  width: 100%;
  height: 100px;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  resize: none;
  background: var(--input-bg);
  color: var(--text-primary);
  font-family: inherit;
  box-sizing: border-box;
}
.note-editor textarea:focus {
  border-color: var(--accent);
}
.context-menu {
  position: fixed;
  background: var(--bg-primary);
  border-radius: 8px;
  box-shadow: 0 4px 16px var(--modal-shadow);
  z-index: 200;
  overflow: hidden;
  min-width: 120px;
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
</style>
