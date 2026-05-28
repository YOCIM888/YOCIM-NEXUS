<template>
  <div class="settings-page">
    <div class="settings-sidebar">
      <div
        v-for="item in menuItems"
        :key="item.key"
        :class="['menu-item', { active: activeSection === item.key }]"
        @click="activeSection = item.key"
      >
        {{ item.label }}
      </div>
    </div>
    <div class="settings-content">
      <!-- ===== 基础设置 ===== -->
      <div v-if="activeSection === 'basic'" class="section">
        <h2>{{ t('basicSettings') }}</h2>

        <div class="setting-row">
          <span>{{ t('defaultBrowser') }}</span>
          <button class="btn" @click="setDefaultBrowser">{{ t('setDefault') }}</button>
        </div>

        <div :class="['setting-row', { 'highlight-row': highlightLang }]">
          <span>{{ t('language') }}</span>
          <select v-model="currentLang" @change="changeLanguage" class="select-input">
            <option value="zh">{{ t('chinese') }}</option>
            <option value="en">{{ t('english') }}</option>
            <option value="es">{{ t('spanish') }}</option>
            <option value="fr">{{ t('french') }}</option>
            <option value="ja">{{ t('japanese') }}</option>
            <option value="ko">{{ t('korean') }}</option>
            <option value="ar">{{ t('arabic') }}</option>
          </select>
        </div>

        <div class="setting-row">
          <span>{{ t('searchEngine') }}</span>
          <select v-model="currentSearchEngine" @change="changeSearchEngine" class="select-input">
            <option value="google">{{ t('google') }}</option>
            <option value="bing">{{ t('bing') }}</option>
            <option value="baidu">{{ t('baidu') }}</option>
            <option value="sogou">{{ t('sogou') }}</option>
            <option value="yandex">{{ t('yandex') }}</option>
            <option value="naver">{{ t('naver') }}</option>
          </select>
        </div>

        <div class="setting-row">
          <span>{{ t('startupPage') }}</span>
          <div class="setting-actions">
            <label class="radio-label"><input type="radio" v-model="startupMode" value="default" @change="changeStartupPage" /> {{ t('startupPageDefault') }}</label>
            <label class="radio-label"><input type="radio" v-model="startupMode" value="custom" @change="changeStartupPage" /> {{ t('startupPageCustom') }}</label>
          </div>
        </div>
        <div v-if="startupMode === 'custom'" class="setting-row">
          <span>{{ t('startupUrl') }}</span>
          <input class="text-input" v-model="startupUrl" @change="changeStartupUrl" :placeholder="'https://'" />
        </div>

        <div class="setting-row">
          <span>{{ t('newTabPage') }}</span>
          <div class="setting-actions">
            <label class="radio-label"><input type="radio" v-model="newTabMode" value="default" @change="changeNewTabPage" /> {{ t('newTabPageDefault') }}</label>
            <label class="radio-label"><input type="radio" v-model="newTabMode" value="custom" @change="changeNewTabPage" /> {{ t('newTabPageCustom') }}</label>
          </div>
        </div>
        <div v-if="newTabMode === 'custom'" class="setting-row">
          <span>{{ t('newTabUrl') }}</span>
          <input class="text-input" v-model="newTabUrl" @change="changeNewTabUrl" :placeholder="'https://'" />
        </div>
      </div>

      <!-- ===== 工具设置 ===== -->
      <div v-if="activeSection === 'tools'" class="section">
        <h2>{{ t('toolSettings') }}</h2>
        <p class="section-desc">{{ t('toolSettingsDesc') }}</p>

        <div class="setting-row">
          <div class="setting-info">
            <span>{{ t('ai') }}</span>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="toolbarAI" @change="changeToolbarAI" />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <span>{{ t('extensions') }}</span>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="toolbarExtensions" @change="changeToolbarExtensions" />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <span>{{ t('bookmarks') }}</span>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="toolbarBookmarks" @change="changeToolbarBookmarks" />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <span>{{ t('history') }}</span>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="toolbarHistory" @change="changeToolbarHistory" />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <span>{{ t('downloads') }}</span>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="toolbarDownloads" @change="changeToolbarDownloads" />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <span>{{ t('readingList') }}</span>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="toolbarReadingList" @change="changeToolbarReadingList" />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <span>{{ t('notes') }}</span>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="toolbarNotes" @change="changeToolbarNotes" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <!-- ===== 外观设置 ===== -->
      <div v-if="activeSection === 'appearance'" class="section">
        <h2>{{ t('appearanceSection') }}</h2>

        <div class="setting-row">
          <span>{{ t('theme') }}</span>
          <select v-model="currentTheme" @change="changeTheme" class="select-input">
            <option value="light">{{ t('light') }}</option>
            <option value="dark">{{ t('dark') }}</option>
            <option value="custom">{{ t('customTheme') }}</option>
          </select>
        </div>

        <div v-if="currentTheme === 'custom'" class="custom-theme-panel">
          <p class="panel-label">{{ t('customThemeColors') }}</p>
          <div class="color-row">
            <span>{{ t('themePrimary') }}</span>
            <input type="color" v-model="customColors['--bg-primary']" @change="changeCustomColor" />
          </div>
          <div class="color-row">
            <span>{{ t('themeSecondary') }}</span>
            <input type="color" v-model="customColors['--bg-secondary']" @change="changeCustomColor" />
          </div>
          <div class="color-row">
            <span>{{ t('themeText') }}</span>
            <input type="color" v-model="customColors['--text-primary']" @change="changeCustomColor" />
          </div>
          <div class="color-row">
            <span>{{ t('themeAccent') }}</span>
            <input type="color" v-model="customColors['--accent']" @change="changeCustomColor" />
          </div>
        </div>

        <div class="setting-row">
          <span>{{ t('tabsPosition') }}</span>
          <select v-model="tabsPosition" @change="changeTabsPosition" class="select-input">
            <option value="top">{{ t('tabsPositionTop') }}</option>
            <option value="left">{{ t('tabsPositionLeft') }}</option>
          </select>
        </div>

        <div class="setting-row">
          <span>{{ t('background') }}</span>
          <div class="setting-actions">
            <button class="btn" @click="selectBackgroundImage">{{ t('selectImage') }}</button>
            <button v-if="settings.background" class="btn btn-secondary" @click="resetBackground">{{ t('resetBg') }}</button>
          </div>
        </div>
        <div v-if="settings.background" class="bg-preview">
          <img :src="settings.background" alt="bg" />
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <span>{{ t('hideLogo') }}</span>
            <span class="setting-desc">{{ t('hideLogoDesc') }}</span>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="hideLogo" @change="changeHideLogo" />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <span>{{ t('hideIcons') }}</span>
            <span class="setting-desc">{{ t('hideIconsDesc') }}</span>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="hideIcons" @change="changeHideIcons" />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <!-- 面板样式 -->
        <h3 class="sub-heading">{{ t('bookmarkPanelStyle') }}</h3>
        <div class="setting-row">
          <span>{{ t('panelWidth') }}</span>
          <div class="setting-actions">
            <input type="range" min="260" max="500" step="10" v-model.number="bookmarkPanelWidth" @change="changeBookmarkPanelWidth" class="zoom-slider" />
            <span class="zoom-value">{{ bookmarkPanelWidth }}px</span>
          </div>
        </div>
        <div class="setting-row">
          <span>{{ t('panelBgColor') }}</span>
          <input type="color" :value="bookmarkPanelBg || '#3a3a3a'" @input="e => { bookmarkPanelBg = e.target.value; changeBookmarkPanelBg() }" />
        </div>

        <h3 class="sub-heading">{{ t('readingListPanelStyle') }}</h3>
        <div class="setting-row">
          <span>{{ t('panelWidth') }}</span>
          <div class="setting-actions">
            <input type="range" min="260" max="500" step="10" v-model.number="readingListPanelWidth" @change="changeReadingListPanelWidth" class="zoom-slider" />
            <span class="zoom-value">{{ readingListPanelWidth }}px</span>
          </div>
        </div>
        <div class="setting-row">
          <span>{{ t('panelBgColor') }}</span>
          <input type="color" :value="readingListPanelBg || '#3a3a3a'" @input="e => { readingListPanelBg = e.target.value; changeReadingListPanelBg() }" />
        </div>

        <h3 class="sub-heading">{{ t('historyPanelStyle') }}</h3>
        <div class="setting-row">
          <span>{{ t('panelWidth') }}</span>
          <div class="setting-actions">
            <input type="range" min="260" max="500" step="10" v-model.number="historyPanelWidth" @change="changeHistoryPanelWidth" class="zoom-slider" />
            <span class="zoom-value">{{ historyPanelWidth }}px</span>
          </div>
        </div>
        <div class="setting-row">
          <span>{{ t('panelBgColor') }}</span>
          <input type="color" :value="historyPanelBg || '#3a3a3a'" @input="e => { historyPanelBg = e.target.value; changeHistoryPanelBg() }" />
        </div>

        <h3 class="sub-heading">{{ t('downloadPanelStyle') }}</h3>
        <div class="setting-row">
          <span>{{ t('panelWidth') }}</span>
          <div class="setting-actions">
            <input type="range" min="260" max="500" step="10" v-model.number="downloadPanelWidth" @change="changeDownloadPanelWidth" class="zoom-slider" />
            <span class="zoom-value">{{ downloadPanelWidth }}px</span>
          </div>
        </div>
        <div class="setting-row">
          <span>{{ t('panelBgColor') }}</span>
          <input type="color" :value="downloadPanelBg || '#3a3a3a'" @input="e => { downloadPanelBg = e.target.value; changeDownloadPanelBg() }" />
        </div>

        <h3 class="sub-heading">{{ t('notesPanelStyle') }}</h3>
        <div class="setting-row">
          <span>{{ t('panelWidth') }}</span>
          <div class="setting-actions">
            <input type="range" min="260" max="500" step="10" v-model.number="notesPanelWidth" @change="changeNotesPanelWidth" class="zoom-slider" />
            <span class="zoom-value">{{ notesPanelWidth }}px</span>
          </div>
        </div>
        <div class="setting-row">
          <span>{{ t('panelBgColor') }}</span>
          <input type="color" :value="notesPanelBg || '#3a3a3a'" @input="e => { notesPanelBg = e.target.value; changeNotesPanelBg() }" />
        </div>

        <h3 class="sub-heading">{{ t('extensionsPanelStyle') }}</h3>
        <div class="setting-row">
          <span>{{ t('panelWidth') }}</span>
          <div class="setting-actions">
            <input type="range" min="260" max="500" step="10" v-model.number="extensionsPanelWidth" @change="changeExtensionsPanelWidth" class="zoom-slider" />
            <span class="zoom-value">{{ extensionsPanelWidth }}px</span>
          </div>
        </div>
        <div class="setting-row">
          <span>{{ t('panelBgColor') }}</span>
          <input type="color" :value="extensionsPanelBg || '#3a3a3a'" @input="e => { extensionsPanelBg = e.target.value; changeExtensionsPanelBg() }" />
        </div>

        <h3 class="sub-heading">{{ t('aiPanelStyle') }}</h3>
        <div class="setting-row">
          <span>{{ t('panelWidth') }}</span>
          <div class="setting-actions">
            <input type="range" min="280" max="600" step="10" v-model.number="aiPanelWidth" @change="changeAiPanelWidth" class="zoom-slider" />
            <span class="zoom-value">{{ aiPanelWidth }}px</span>
          </div>
        </div>
        <div class="setting-row">
          <span>{{ t('panelBgColor') }}</span>
          <input type="color" :value="aiPanelBg || '#3a3a3a'" @input="e => { aiPanelBg = e.target.value; changeAiPanelBg() }" />
        </div>
      </div>

      <!-- ===== 隐私安全 ===== -->
      <div v-if="activeSection === 'privacy'" class="section">
        <h2>{{ t('privacySecurity') }}</h2>

        <div class="setting-row">
          <div class="setting-info">
            <span>{{ t('incognitoBrowsing') }}</span>
            <span class="setting-desc">{{ t('incognitoDesc') }}</span>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="incognitoBrowsing" @change="changeIncognito" />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting-row">
          <span>{{ t('passwordManager') }}</span>
          <button class="btn" @click="openPasswordManager">{{ t('openPasswordManager') }}</button>
        </div>

        <div class="setting-row">
          <span>{{ t('manageCookies') }}</span>
          <button class="btn" @click="openCookieManager">{{ t('manageCookies') }}</button>
        </div>

        <div class="setting-row">
          <span>{{ t('sitePermissions') }}</span>
          <button class="btn" @click="openPermissionsManager">{{ t('permissions') }}</button>
        </div>

        <div class="setting-row">
          <span>{{ t('protocolBlock') }}</span>
          <button class="btn" @click="openProtocolDialog">{{ t('configure') }}</button>
        </div>

        <div class="setting-row danger">
          <span>{{ t('clearData') }}</span>
          <button class="btn btn-danger" @click="handleClearData">{{ t('clearData') }}</button>
        </div>
      </div>

      <!-- ===== 储存设置 ===== -->
      <div v-if="activeSection === 'storage'" class="section">
        <h2>{{ t('storageSection') }}</h2>

        <div class="setting-row">
          <span>{{ t('downloadLocation') }}</span>
          <div class="setting-actions">
            <span class="path-text">{{ settings.downloadPath || t('changePath') }}</span>
            <button class="btn" @click="changeDownloadPath">{{ t('changePath') }}</button>
          </div>
        </div>

        <div class="setting-row">
          <span>{{ t('exportData') }}</span>
          <button class="btn" @click="handleExport">{{ t('exportData') }}</button>
        </div>

        <div class="setting-row">
          <span>{{ t('importData') }}</span>
          <button class="btn" @click="handleImport">{{ t('importData') }}</button>
        </div>

        <div class="setting-row">
          <span>{{ t('autoBackup') }}</span>
          <div class="setting-actions">
            <label class="toggle">
              <input type="checkbox" v-model="autoBackupEnabled" @change="toggleAutoBackup" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
        <div v-if="autoBackupEnabled" class="setting-row">
          <span>{{ t('selectBackupPath') }}</span>
          <div class="setting-actions">
            <span class="path-text">{{ settings.autoBackupPath || t('selectBackupPath') }}</span>
            <button class="btn" @click="selectBackupPath">{{ t('selectBackupPath') }}</button>
          </div>
        </div>
        <div v-if="autoBackupEnabled" class="setting-row">
          <span>{{ t('autoBackupInterval') || '备份间隔' }}</span>
          <select v-model.number="autoBackupInterval" @change="changeBackupInterval" class="select-input">
            <option :value="6">6 {{ t('hours') || '小时' }}</option>
            <option :value="12">12 {{ t('hours') || '小时' }}</option>
            <option :value="24">24 {{ t('hours') || '小时' }}</option>
            <option :value="48">48 {{ t('hours') || '小时' }}</option>
            <option :value="168">7 {{ t('days') || '天' }}</option>
          </select>
        </div>
      </div>

      <!-- ===== 辅助功能 ===== -->
      <div v-if="activeSection === 'accessibility'" class="section">
        <h2>{{ t('accessibilitySection') }}</h2>

        <div class="setting-row">
          <div class="setting-info">
            <span>{{ t('pageZoom') }}</span>
            <span class="setting-desc">{{ t('pageZoomDesc') }}</span>
          </div>
          <div class="setting-actions">
            <input type="range" min="50" max="200" step="10" v-model.number="zoomPercent" @change="changePageZoom" class="zoom-slider" />
            <span class="zoom-value">{{ zoomPercent }}%</span>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <span>{{ t('adBlock') }}</span>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="adBlockEnabled" @change="toggleAdBlock" />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <span>{{ t('sessionRestore') }}</span>
          </div>
          <div class="setting-actions">
            <label class="toggle">
              <input type="checkbox" v-model="sessionRestore" @change="changeSessionRestore" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div class="setting-row">
          <span>{{ t('tabFreeze') }}</span>
          <select v-model.number="suspendTimeout" @change="changeSuspendTimeout" class="select-input">
            <option :value="1">1 {{ t('minutes') }}</option>
            <option :value="3">3 {{ t('minutes') }}</option>
            <option :value="5">5 {{ t('minutes') }}</option>
            <option :value="10">10 {{ t('minutes') }}</option>
            <option :value="30">30 {{ t('minutes') }}</option>
            <option :value="0">{{ t('never') }}</option>
          </select>
        </div>

        <div class="setting-row">
          <span>{{ t('keyboardShortcuts') }}</span>
          <button class="btn" @click="showShortcuts = true">{{ t('viewShortcuts') }}</button>
        </div>
      </div>

      <!-- ===== 重置设置 ===== -->
      <div v-if="activeSection === 'reset'" class="section">
        <h2>{{ t('resetSettings') }}</h2>
        <div class="reset-area">
          <p class="reset-desc">{{ t('restoreDefaultsConfirm') }}</p>
          <button class="btn btn-danger btn-lg" @click="handleRestoreDefaults">{{ t('restoreDefaults') }}</button>
        </div>
      </div>

      <!-- ===== 关于 ===== -->
      <div v-if="activeSection === 'about'" class="section">
        <h2>{{ t('about') }}</h2>
        <div class="about-content">
          <img class="about-logo" src="/icon/yocim.jpg" alt="LOGO" />
          <h1 class="about-title">YOCIM NEXUS</h1>
          <p class="about-version">{{ t('version') }}: 0.1.2</p>
          <p class="about-copyright">{{ t('copyright') }}</p>
          <button class="btn" @click="checkForUpdates" style="margin-top: 16px;">{{ t('checkForUpdates') }}</button>
          <div v-if="updateStatus" class="update-status">
            <span>{{ updateStatus }}</span>
            <button v-if="updateUrl" class="btn" style="margin-left: 8px;" @click="goToRelease">{{ t('goToDownload') }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== PIN 验证弹窗 ===== -->
    <Teleport to="body">
      <div v-if="showPinDialog" class="modal-overlay" @click.self="showPinDialog = false">
        <div class="modal pin-modal">
          <h3>{{ pinSetupMode ? t('pinSetupTitle') : t('passwordManager') }}</h3>
          <p v-if="pinSetupMode" class="modal-hint">{{ t('pinSetupDesc') }}</p>
          <p v-else class="modal-hint">{{ t('enterPin') }}</p>
          <input
            type="password"
            v-model="pinInput"
            :placeholder="pinSetupStep === 2 ? t('confirmPin') : t('enterPin')"
            maxlength="6"
            class="pin-input"
            @keyup.enter="handlePinSubmit"
            autofocus
          />
          <p v-if="pinError" class="pin-error">{{ pinError }}</p>
          <div class="modal-actions">
            <button class="btn-cancel" @click="showPinDialog = false">{{ t('cancel') }}</button>
            <button class="btn-confirm" @click="handlePinSubmit">{{ t('confirm') }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== 密码管理弹窗 ===== -->
    <Teleport to="body">
      <div v-if="showPasswordManager" class="modal-overlay" @click.self="showPasswordManager = false">
        <div class="modal password-modal">
          <div class="modal-header">
            <h3>{{ t('passwords') }}</h3>
            <button class="btn" @click="openAddPassword">{{ t('addPasswordEntry') }}</button>
          </div>
          <input
            type="text"
            v-model="passwordSearch"
            class="search-input"
            :placeholder="t('searchPasswords')"
          />
          <div v-if="filteredPasswords.length === 0" class="empty-hint">{{ t('noPasswords') }}</div>
          <div v-for="pwd in filteredPasswords" :key="pwd.id" class="password-item">
            <div class="password-info">
              <span class="password-site">{{ pwd.site }}</span>
              <span class="password-user">{{ pwd.username }}</span>
            </div>
            <div class="password-actions">
              <button class="btn btn-sm" @click="editPasswordEntry(pwd)">{{ t('edit') }}</button>
              <button class="btn btn-sm btn-danger" @click="deletePasswordEntry(pwd.id)">{{ t('delete') }}</button>
            </div>
          </div>
          <div class="modal-actions" style="margin-top: 12px;">
            <button class="btn btn-secondary" @click="showPasswordManager = false">{{ t('cancel') }}</button>
          </div>
        </div>
      </div>

      <!-- ===== 添加/编辑密码弹窗 ===== -->
      <div v-if="showPasswordForm" class="modal-overlay" @click.self="showPasswordForm = false">
        <div class="modal">
          <h3>{{ editingPassword ? t('editPasswordEntry') : t('addPasswordEntry') }}</h3>
          <input v-model="passwordForm.site" :placeholder="t('site')" />
          <input v-model="passwordForm.url" placeholder="URL (可选)" />
          <input v-model="passwordForm.username" :placeholder="t('username')" />
          <input :type="showPasswordField ? 'text' : 'password'" v-model="passwordForm.password" :placeholder="t('password')" />
          <label class="checkbox-label"><input type="checkbox" v-model="showPasswordField" /> {{ showPasswordField ? t('hidePassword') : t('showPassword') }}</label>
          <div class="modal-actions">
            <button class="btn-cancel" @click="showPasswordForm = false">{{ t('cancel') }}</button>
            <button class="btn-confirm" @click="submitPasswordForm">{{ t('save') }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== Cookie 管理弹窗 ===== -->
    <Teleport to="body">
      <div v-if="showCookieManager" class="modal-overlay" @click.self="showCookieManager = false">
        <div class="modal cookie-modal">
          <h3>{{ t('cookies') }}</h3>
          <div v-if="cookies.length === 0" class="empty-hint">{{ t('noCookies') }}</div>
          <div v-for="(c, i) in cookies" :key="i" class="cookie-item">
            <div class="cookie-info">
              <span class="cookie-domain">{{ c.domain }}</span>
              <span class="cookie-name">{{ c.name }}</span>
            </div>
            <button class="btn btn-sm btn-danger" @click="deleteCookieItem(c)">{{ t('deleteCookie') }}</button>
          </div>
          <div class="modal-actions" style="margin-top: 12px;">
            <button class="btn btn-secondary" @click="showCookieManager = false">{{ t('cancel') }}</button>
          </div>
        </div>
      </div>

      <!-- ===== 权限管理弹窗 ===== -->
      <div v-if="showPermissionsManager" class="modal-overlay" @click.self="showPermissionsManager = false">
        <div class="modal">
          <h3>{{ t('permissions') }}</h3>
          <div v-if="permissions.length === 0" class="empty-hint">{{ t('noPermissions') }}</div>
          <div v-for="(p, i) in permissions" :key="i" class="setting-row">
            <span>{{ permissionLabel(p.type) }}</span>
            <select class="select-input" v-model="p.status" @change="changePermission(p)">
              <option value="allow">{{ t('permissionAllowed') }}</option>
              <option value="block">{{ t('permissionBlocked') }}</option>
              <option value="ask">{{ t('permissionAsk') }}</option>
            </select>
          </div>
          <div class="modal-actions" style="margin-top: 12px;">
            <button class="btn btn-secondary" @click="showPermissionsManager = false">{{ t('cancel') }}</button>
          </div>
        </div>
      </div>

      <!-- ===== 快捷键列表弹窗 ===== -->
      <div v-if="showShortcuts" class="modal-overlay" @click.self="showShortcuts = false">
        <div class="modal shortcuts-modal">
          <h3>{{ t('keyboardShortcuts') }}</h3>
          <div class="shortcuts-list">
            <div v-for="s in shortcutsList" :key="s.key" class="shortcut-row">
              <kbd>{{ s.key }}</kbd>
              <span>{{ s.desc }}</span>
            </div>
          </div>
          <div class="modal-actions" style="margin-top: 12px;">
            <button class="btn btn-secondary" @click="showShortcuts = false">{{ t('cancel') }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== 协议拦截配置弹窗 ===== -->
    <Teleport to="body">
      <div v-if="showProtocolDialog" class="modal-overlay" @click.self="showProtocolDialog = false">
        <div class="modal protocol-modal">
          <h3>{{ t('protocolBlock') }}</h3>

          <div class="protocol-mode-section">
            <p class="protocol-section-title">{{ t('protocolBlockMode') }}</p>
            <label class="protocol-radio"><input type="radio" v-model="protocolBlockMode" value="off" /> {{ t('protocolOff') }}</label>
            <p class="protocol-radio-desc">{{ t('protocolOffDesc') }}</p>
            <label class="protocol-radio"><input type="radio" v-model="protocolBlockMode" value="whitelist" /> {{ t('protocolWhitelistMode') }}</label>
            <p class="protocol-radio-desc">{{ t('protocolWhitelistModeDesc') }}</p>
            <label class="protocol-radio"><input type="radio" v-model="protocolBlockMode" value="blacklist" /> {{ t('protocolBlacklistMode') }}</label>
            <p class="protocol-radio-desc">{{ t('protocolBlacklistModeDesc') }}</p>
            <label class="protocol-radio"><input type="radio" v-model="protocolBlockMode" value="both" /> {{ t('protocolBothMode') }}</label>
            <p class="protocol-radio-desc">{{ t('protocolBothModeDesc') }}</p>
          </div>

          <div v-if="protocolBlockMode === 'whitelist' || protocolBlockMode === 'both'" class="protocol-list-section">
            <p class="protocol-section-title">{{ t('protocolWhitelistLabel') }}</p>
            <div class="protocol-tags">
              <span v-for="(p, i) in protocolWhitelist" :key="'w'+i" class="protocol-tag">
                {{ p }}
                <button class="tag-remove" @click="removeProtocol('whitelist', i)">&times;</button>
              </span>
            </div>
            <div class="protocol-add-row">
              <input type="text" v-model="newWhitelistProtocol" :placeholder="t('protocolPlaceholder')" class="protocol-input" @keyup.enter="addProtocol('whitelist')" />
              <button class="btn btn-sm" @click="addProtocol('whitelist')">{{ t('addProtocol') }}</button>
            </div>
            <p v-if="protocolError === 'whitelist-exists'" class="protocol-error">{{ t('protocolExists') }}</p>
            <p v-if="protocolError === 'whitelist-invalid'" class="protocol-error">{{ t('protocolInvalid') }}</p>
          </div>

          <div v-if="protocolBlockMode === 'blacklist' || protocolBlockMode === 'both'" class="protocol-list-section">
            <p class="protocol-section-title">{{ t('protocolBlacklistLabel') }}</p>
            <div class="protocol-tags">
              <span v-for="(p, i) in protocolBlacklist" :key="'b'+i" class="protocol-tag protocol-tag-black">
                {{ p }}
                <button class="tag-remove" @click="removeProtocol('blacklist', i)">&times;</button>
              </span>
            </div>
            <div class="protocol-add-row">
              <input type="text" v-model="newBlacklistProtocol" :placeholder="t('protocolPlaceholder')" class="protocol-input" @keyup.enter="addProtocol('blacklist')" />
              <button class="btn btn-sm" @click="addProtocol('blacklist')">{{ t('addProtocol') }}</button>
            </div>
            <p v-if="protocolError === 'blacklist-exists'" class="protocol-error">{{ t('protocolExists') }}</p>
            <p v-if="protocolError === 'blacklist-invalid'" class="protocol-error">{{ t('protocolInvalid') }}</p>
          </div>

          <div class="modal-actions">
            <button class="btn-cancel" @click="showProtocolDialog = false">{{ t('cancel') }}</button>
            <button class="btn-confirm" @click="saveProtocolSettings">{{ t('confirm') }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { getSettings, updateSettings, exportAllData, importAllData, clearAllData, hasPasswordPin, getPasswordPin, setPasswordPin, verifyPasswordPin, getPasswords, addPassword, updatePasswordItem, removePasswordItem } from '../utils/storage'
import { useI18n } from '../utils/i18n'

const { t, setLocale, getLocale } = useI18n()

const props = defineProps({ highlightLang: Boolean })
const highlightLang = computed(() => props.highlightLang)

const refreshSettings = inject('refreshSettings', () => {})

const activeSection = ref('basic')
const settings = ref(getSettings())
const currentLang = ref(getLocale())
const currentSearchEngine = ref(settings.value.searchEngine || 'bing')
const currentTheme = ref(settings.value.theme || 'light')
const adBlockEnabled = ref(settings.value.adBlockEnabled !== false)
const autoBackupEnabled = ref(settings.value.autoBackupEnabled)
const autoBackupInterval = ref(settings.value.autoBackupInterval || 24)
const suspendTimeout = ref(settings.value.suspendTimeout || 5)
const sessionRestore = ref(settings.value.sessionRestore || false)

// 基础设置
const startupMode = ref(settings.value.startupPage || 'default')
const startupUrl = ref(settings.value.startupUrl || '')
const newTabMode = ref(settings.value.newTabPage || 'default')
const newTabUrl = ref(settings.value.newTabUrl || '')

// 工具设置
const toolbarBookmarks = ref(settings.value.toolbarBookmarks !== false)
const toolbarReadingList = ref(settings.value.toolbarReadingList !== false)
const toolbarHistory = ref(settings.value.toolbarHistory !== false)
const toolbarDownloads = ref(settings.value.toolbarDownloads !== false)
const toolbarNotes = ref(settings.value.toolbarNotes !== false)
const toolbarExtensions = ref(settings.value.toolbarExtensions !== false)
const toolbarAI = ref(settings.value.toolbarAI !== false)

// 外观
const hideLogo = ref(settings.value.hideLogo || false)
const hideIcons = ref(settings.value.hideIcons || false)
const tabsPosition = ref(settings.value.tabsPosition || 'top')
const incognitoBrowsing = ref(settings.value.incognitoBrowsing || false)
const zoomPercent = ref(Math.round((settings.value.pageZoom || 1.0) * 100))
const customColors = ref(settings.value.customTheme || { ...defaultCustomColors() })

// 面板样式
const bookmarkPanelWidth = ref(settings.value.bookmarkPanelWidth || 260)
const bookmarkPanelBg = ref(settings.value.bookmarkPanelBg || '')
const readingListPanelWidth = ref(settings.value.readingListPanelWidth || 260)
const readingListPanelBg = ref(settings.value.readingListPanelBg || '')
const historyPanelWidth = ref(settings.value.historyPanelWidth || 260)
const historyPanelBg = ref(settings.value.historyPanelBg || '')
const downloadPanelWidth = ref(settings.value.downloadPanelWidth || 260)
const downloadPanelBg = ref(settings.value.downloadPanelBg || '')
const notesPanelWidth = ref(settings.value.notesPanelWidth || 260)
const notesPanelBg = ref(settings.value.notesPanelBg || '')
const extensionsPanelWidth = ref(settings.value.extensionsPanelWidth || 260)
const extensionsPanelBg = ref(settings.value.extensionsPanelBg || '')
const aiPanelWidth = ref(settings.value.aiPanelWidth || 380)
const aiPanelBg = ref(settings.value.aiPanelBg || '')

function defaultCustomColors() {
  return {
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#f0f0f0',
    '--text-primary': '#333333',
    '--accent': '#4a90d9',
  }
}

// 密码管理
const showPinDialog = ref(false)
const pinSetupMode = ref(false)
const pinSetupStep = ref(1)
const pinInput = ref('')
const pinFirst = ref('')
const pinError = ref('')
const showPasswordManager = ref(false)
const showPasswordForm = ref(false)
const editingPassword = ref(null)
const passwordForm = ref({ site: '', username: '', password: '', url: '' })
const showPasswordField = ref(false)
const passwords = ref([])
const passwordSearch = ref('')

const filteredPasswords = computed(() => {
  const q = passwordSearch.value.toLowerCase()
  if (!q) return passwords.value
  return passwords.value.filter(p =>
    p.site.toLowerCase().includes(q) || p.username.toLowerCase().includes(q)
  )
})

// Cookie
const showCookieManager = ref(false)
const cookies = ref([])

// 权限
const showPermissionsManager = ref(false)
const permissions = ref([])

// 协议拦截
const showProtocolDialog = ref(false)
const protocolBlockMode = ref(settings.value.protocolBlockMode || 'blacklist')
const protocolWhitelist = ref([...(settings.value.protocolWhitelist || ['http:', 'https:', 'file:', 'blob:', 'data:'])])
const protocolBlacklist = ref([...(settings.value.protocolBlacklist || [])])
const newWhitelistProtocol = ref('')
const newBlacklistProtocol = ref('')
const protocolError = ref('')

function openProtocolDialog() {
  const s = getSettings()
  protocolBlockMode.value = s.protocolBlockMode || 'blacklist'
  protocolWhitelist.value = [...(s.protocolWhitelist || ['http:', 'https:', 'file:', 'blob:', 'data:'])]
  protocolBlacklist.value = [...(s.protocolBlacklist || [])]
  newWhitelistProtocol.value = ''
  newBlacklistProtocol.value = ''
  protocolError.value = ''
  showProtocolDialog.value = true
}

function removeProtocol(list, index) {
  if (list === 'whitelist') {
    protocolWhitelist.value.splice(index, 1)
  } else {
    protocolBlacklist.value.splice(index, 1)
  }
}

function addProtocol(list) {
  protocolError.value = ''
  const input = list === 'whitelist' ? newWhitelistProtocol.value.trim() : newBlacklistProtocol.value.trim()
  if (!input.endsWith(':')) {
    protocolError.value = list + '-invalid'
    return
  }
  const target = list === 'whitelist' ? protocolWhitelist : protocolBlacklist
  if (target.value.includes(input)) {
    protocolError.value = list + '-exists'
    return
  }
  target.value.push(input)
  if (list === 'whitelist') {
    newWhitelistProtocol.value = ''
  } else {
    newBlacklistProtocol.value = ''
  }
}

async function saveProtocolSettings() {
  updateSettings({
    protocolBlockMode: protocolBlockMode.value,
    protocolWhitelist: protocolWhitelist.value,
    protocolBlacklist: protocolBlacklist.value,
  })
  settings.value = getSettings()
  if (window.electronAPI?.updateProtocolSettings) {
    await window.electronAPI.updateProtocolSettings({
      mode: protocolBlockMode.value,
      whitelist: [...protocolWhitelist.value],
      blacklist: [...protocolBlacklist.value],
    })
  }
  showProtocolDialog.value = false
}

// 快捷键
const showShortcuts = ref(false)
const shortcutsList = [
  { key: 'Ctrl+T', desc: t('newTab') },
  { key: 'Ctrl+Shift+T', desc: '恢复关闭的标签页' },
  { key: 'Ctrl+W', desc: '关闭标签页' },
  { key: 'Ctrl+1~8', desc: '切换到第 1~8 个标签页' },
  { key: 'Ctrl+9', desc: '切换到最后一个标签页' },
  { key: 'Ctrl+Tab', desc: '下一标签页' },
  { key: 'Ctrl+Shift+Tab', desc: '上一标签页' },
  { key: 'Ctrl+L', desc: '聚焦地址栏' },
  { key: 'Ctrl+R', desc: t('refresh') },
  { key: 'F5', desc: t('refresh') },
  { key: 'Ctrl+D', desc: t('bookmark') },
  { key: 'Ctrl+H', desc: t('history') },
  { key: 'Ctrl+J', desc: t('downloads') },
  { key: 'Ctrl+B', desc: t('bookmarks') },
  { key: 'Ctrl+F', desc: '页面搜索' },
  { key: 'Ctrl++', desc: '放大' },
  { key: 'Ctrl+-', desc: '缩小' },
  { key: 'Ctrl+0', desc: '重置缩放' },
  { key: 'Esc', desc: '停止加载' },
  { key: 'Ctrl+Shift+N', desc: '隐身窗口' },
  { key: 'Ctrl+Shift+S', desc: t('screenshot') },
  { key: 'Ctrl+Shift+I', desc: t('devTools') },
  { key: 'F12', desc: t('devTools') },
  { key: 'Alt+←', desc: t('back') },
  { key: 'Alt+→', desc: t('forward') },
  { key: 'F11', desc: '全屏' },
]

const menuItems = ref([
  { key: 'basic', label: '' },
  { key: 'tools', label: '' },
  { key: 'appearance', label: '' },
  { key: 'privacy', label: '' },
  { key: 'storage', label: '' },
  { key: 'accessibility', label: '' },
  { key: 'reset', label: '' },
  { key: 'about', label: '' },
])

function updateMenuLabels() {
  menuItems.value[0].label = t('basicSettings')
  menuItems.value[1].label = t('toolSettings')
  menuItems.value[2].label = t('appearanceSection')
  menuItems.value[3].label = t('privacySecurity')
  menuItems.value[4].label = t('storageSection')
  menuItems.value[5].label = t('accessibilitySection')
  menuItems.value[6].label = t('resetSettings')
  menuItems.value[7].label = t('about')
}

function permissionLabel(type) {
  const map = {
    camera: t('permissionCamera'),
    microphone: t('permissionMicrophone'),
    geolocation: t('permissionLocation'),
    notifications: t('permissionNotifications'),
    midiSysex: t('permissionMidi'),
    pointerLock: t('permissionPointerLock'),
    fullscreen: t('permissionFullscreen'),
    openExternal: t('permissionOpenExternal'),
    clipboardRead: t('permissionClipboardRead'),
    idleDetection: t('permissionIdleDetection'),
    serial: t('permissionSerial'),
    sensors: t('permissionSensors'),
    displayCapture: t('permissionDisplayCapture'),
    hid: t('permissionHid'),
    usb: t('permissionUsb'),
    clipboardSanitizedWrite: t('permissionClipboardWrite'),
  }
  return map[type] || type
}

onMounted(() => {
  updateMenuLabels()
})

// ===== 基础设置 =====
function changeLanguage() {
  setLocale(currentLang.value)
  settings.value = updateSettings({ language: currentLang.value })
  updateMenuLabels()
}

function changeSearchEngine() {
  settings.value = updateSettings({ searchEngine: currentSearchEngine.value })
}

function changeStartupPage() {
  settings.value = updateSettings({ startupPage: startupMode.value })
}

function changeStartupUrl() {
  settings.value = updateSettings({ startupUrl: startupUrl.value })
}

function changeNewTabPage() {
  settings.value = updateSettings({ newTabPage: newTabMode.value })
}

function changeNewTabUrl() {
  settings.value = updateSettings({ newTabUrl: newTabUrl.value })
}

// ===== 工具设置 =====
function changeToolbarBookmarks() {
  settings.value = updateSettings({ toolbarBookmarks: toolbarBookmarks.value })
  refreshSettings()
}
function changeToolbarReadingList() {
  settings.value = updateSettings({ toolbarReadingList: toolbarReadingList.value })
  refreshSettings()
}
function changeToolbarHistory() {
  settings.value = updateSettings({ toolbarHistory: toolbarHistory.value })
  refreshSettings()
}
function changeToolbarDownloads() {
  settings.value = updateSettings({ toolbarDownloads: toolbarDownloads.value })
  refreshSettings()
}
function changeToolbarNotes() {
  settings.value = updateSettings({ toolbarNotes: toolbarNotes.value })
  refreshSettings()
}
function changeToolbarExtensions() {
  settings.value = updateSettings({ toolbarExtensions: toolbarExtensions.value })
  refreshSettings()
}
function changeToolbarAI() {
  settings.value = updateSettings({ toolbarAI: toolbarAI.value })
  refreshSettings()
}

// ===== 外观 =====
function changeTheme() {
  const update = { theme: currentTheme.value }
  if (currentTheme.value === 'custom') {
    update.customTheme = customColors.value
  } else {
    update.customTheme = null
  }
  settings.value = updateSettings(update)
  refreshSettings()
}

function changeCustomColor() {
  settings.value = updateSettings({ customTheme: { ...customColors.value } })
  refreshSettings()
}

function changeHideLogo() {
  settings.value = updateSettings({ hideLogo: hideLogo.value })
  refreshSettings()
}

function changeHideIcons() {
  settings.value = updateSettings({ hideIcons: hideIcons.value })
  refreshSettings()
}

function changeTabsPosition() {
  settings.value = updateSettings({ tabsPosition: tabsPosition.value })
  refreshSettings()
}

// 面板样式
function changeBookmarkPanelWidth() {
  settings.value = updateSettings({ bookmarkPanelWidth: bookmarkPanelWidth.value })
  refreshSettings()
}
function changeBookmarkPanelBg() {
  settings.value = updateSettings({ bookmarkPanelBg: bookmarkPanelBg.value })
  refreshSettings()
}
function changeReadingListPanelWidth() {
  settings.value = updateSettings({ readingListPanelWidth: readingListPanelWidth.value })
  refreshSettings()
}
function changeReadingListPanelBg() {
  settings.value = updateSettings({ readingListPanelBg: readingListPanelBg.value })
  refreshSettings()
}
function changeHistoryPanelWidth() {
  settings.value = updateSettings({ historyPanelWidth: historyPanelWidth.value })
  refreshSettings()
}
function changeHistoryPanelBg() {
  settings.value = updateSettings({ historyPanelBg: historyPanelBg.value })
  refreshSettings()
}
function changeDownloadPanelWidth() {
  settings.value = updateSettings({ downloadPanelWidth: downloadPanelWidth.value })
  refreshSettings()
}
function changeDownloadPanelBg() {
  settings.value = updateSettings({ downloadPanelBg: downloadPanelBg.value })
  refreshSettings()
}
function changeNotesPanelWidth() {
  settings.value = updateSettings({ notesPanelWidth: notesPanelWidth.value })
  refreshSettings()
}
function changeNotesPanelBg() {
  settings.value = updateSettings({ notesPanelBg: notesPanelBg.value })
  refreshSettings()
}
function changeExtensionsPanelWidth() {
  settings.value = updateSettings({ extensionsPanelWidth: extensionsPanelWidth.value })
  refreshSettings()
}
function changeExtensionsPanelBg() {
  settings.value = updateSettings({ extensionsPanelBg: extensionsPanelBg.value })
  refreshSettings()
}
function changeAiPanelWidth() {
  settings.value = updateSettings({ aiPanelWidth: aiPanelWidth.value })
  refreshSettings()
}
function changeAiPanelBg() {
  settings.value = updateSettings({ aiPanelBg: aiPanelBg.value })
  refreshSettings()
}

function changeIncognito() {
  settings.value = updateSettings({ incognitoBrowsing: incognitoBrowsing.value })
}

async function selectBackgroundImage() {
  const filePath = await window.electronAPI?.selectFile([{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }])
  if (filePath) {
    settings.value = updateSettings({ background: filePath })
  }
}

function resetBackground() {
  settings.value = updateSettings({ background: '' })
}

// ===== 辅助功能 =====
function changePageZoom() {
  const zoom = zoomPercent.value / 100
  settings.value = updateSettings({ pageZoom: zoom })
}

async function toggleAdBlock() {
  settings.value = updateSettings({ adBlockEnabled: adBlockEnabled.value })
  await window.electronAPI?.adBlockToggle(adBlockEnabled.value)
}

function changeSuspendTimeout() {
  settings.value = updateSettings({ suspendTimeout: suspendTimeout.value })
}

function changeSessionRestore() {
  settings.value = updateSettings({ sessionRestore: sessionRestore.value })
}

// ===== 储存 =====
async function changeDownloadPath() {
  const dir = await window.electronAPI?.selectDirectory()
  if (dir) {
    settings.value = updateSettings({ downloadPath: dir })
    window.electronAPI?.setDownloadPath(dir)
  }
}

async function handleExport() {
  const dir = await window.electronAPI?.selectDirectory()
  if (dir) {
    const data = exportAllData()
    const parsed = JSON.parse(data)
    // 合并外部配置（权限设置、协议设置等）
    const external = await window.electronAPI?.getExternalSettings()
    if (external) parsed._external = external
    // 合并扩展数据
    const extensions = await window.electronAPI?.getExtensionsData()
    if (extensions && extensions.length > 0) parsed._extensions = extensions
    const filePath = dir + '\\yocim-nexus-backup.json'
    await window.electronAPI?.writeFile(filePath, JSON.stringify(parsed, null, 2))
  }
}

async function handleImport() {
  const filePath = await window.electronAPI?.selectFile([{ name: 'JSON', extensions: ['json'] }])
  if (!filePath) return
  const content = await window.electronAPI?.readFile(filePath)
  if (!content) return
  try {
    const parsed = JSON.parse(content)
    // 提取并恢复外部配置
    if (parsed._external) {
      await window.electronAPI?.setExternalSettings(parsed._external)
      delete parsed._external
    }
    // 提取并恢复扩展数据
    if (parsed._extensions) {
      await window.electronAPI?.setExtensionsData(parsed._extensions)
      delete parsed._extensions
    }
    importAllData(JSON.stringify(parsed))
  } catch (e) {
    alert(t('importFailed') || '导入失败：文件格式不正确')
    return
  }
  location.reload()
}

function toggleAutoBackup() {
  settings.value = updateSettings({ autoBackupEnabled: autoBackupEnabled.value })
}

function changeBackupInterval() {
  settings.value = updateSettings({ autoBackupInterval: autoBackupInterval.value })
}

async function selectBackupPath() {
  const dir = await window.electronAPI?.selectDirectory()
  if (dir) {
    settings.value = updateSettings({ autoBackupPath: dir })
  }
}

// ===== 默认浏览器 =====
async function setDefaultBrowser() {
  await window.electronAPI?.setDefaultBrowser()
}

// ===== 密码管理 =====
function openPasswordManager() {
  if (hasPasswordPin()) {
    pinSetupMode.value = false
    pinSetupStep.value = 1
    pinInput.value = ''
    pinError.value = ''
    showPinDialog.value = true
  } else {
    pinSetupMode.value = true
    pinSetupStep.value = 1
    pinInput.value = ''
    pinFirst.value = ''
    pinError.value = ''
    showPinDialog.value = true
  }
}

function handlePinSubmit() {
  const val = pinInput.value.trim()
  if (val.length !== 6 || !/^\d{6}$/.test(val)) {
    pinError.value = t('pinTooShort')
    return
  }

  if (pinSetupMode.value) {
    if (pinSetupStep.value === 1) {
      pinFirst.value = val
      pinInput.value = ''
      pinSetupStep.value = 2
      pinError.value = ''
    } else {
      if (val !== pinFirst.value) {
        pinError.value = t('pinMismatch')
        return
      }
      setPasswordPin(val)
      pinError.value = ''
      showPinDialog.value = false
      openPasswordList()
    }
  } else {
    if (verifyPasswordPin(val)) {
      pinError.value = ''
      showPinDialog.value = false
      openPasswordList()
    } else {
      pinError.value = t('pinIncorrect')
    }
  }
}

function openPasswordList() {
  passwords.value = getPasswords()
  passwordSearch.value = ''
  showPasswordManager.value = true
}

function openAddPassword() {
  editingPassword.value = null
  passwordForm.value = { site: '', username: '', password: '', url: '' }
  showPasswordField.value = false
  showPasswordForm.value = true
}

function editPasswordEntry(pwd) {
  editingPassword.value = pwd
  passwordForm.value = { site: pwd.site, username: pwd.username, password: pwd.password, url: pwd.url || '' }
  showPasswordField.value = false
  showPasswordForm.value = true
}

function submitPasswordForm() {
  const { site, username, password } = passwordForm.value
  if (!site.trim() || !username.trim() || !password.trim()) return
  if (editingPassword.value) {
    passwords.value = updatePasswordItem(editingPassword.value.id, passwordForm.value)
  } else {
    passwords.value = addPassword(passwordForm.value)
  }
  showPasswordForm.value = false
}

function deletePasswordEntry(id) {
  if (confirm(t('clearDataConfirm'))) {
    passwords.value = removePasswordItem(id)
  }
}

// ===== Cookie 管理 =====
async function openCookieManager() {
  cookies.value = await window.electronAPI?.getCookies('') || []
  showCookieManager.value = true
}

async function deleteCookieItem(cookie) {
  const domain = cookie.domain.replace(/^\./, '')
  const url = `https://${domain}${cookie.path}`
  await window.electronAPI?.deleteCookie(cookie.name, url)
  cookies.value = cookies.value.filter(c => c !== cookie)
}

// ===== 权限管理 =====
async function openPermissionsManager() {
  permissions.value = await window.electronAPI?.getSitePermissions() || []
  showPermissionsManager.value = true
}

async function changePermission(p) {
  await window.electronAPI?.updatePermission(p.type, p.status)
}

// ===== 清除数据 =====
async function handleClearData() {
  if (!confirm(t('clearDataConfirm'))) return
  await window.electronAPI?.clearAllData()
  clearAllData()
  location.reload()
}

// ===== 复原默认 =====
async function handleRestoreDefaults() {
  if (!confirm(t('restoreDefaultsConfirm'))) return
  // 清除 localStorage 数据
  clearAllData()
  // 清除主进程数据（settings.json + extensions.json + Session）
  await window.electronAPI?.restoreDefaultSettings()
  location.reload()
}

// ===== 更新 =====
const updateStatus = ref('')
const updateUrl = ref('')

async function checkForUpdates() {
  updateStatus.value = ''
  updateUrl.value = ''
  const result = await window.electronAPI?.checkUpdate()
  if (result) {
    updateStatus.value = t('updateAvailable') + ': v' + result.version
    updateUrl.value = result.url
  } else {
    updateStatus.value = t('noUpdate')
  }
}

function goToRelease() {
  if (updateUrl.value) {
    window.electronAPI?.openReleasePage(updateUrl.value)
  }
}
</script>

<style scoped>
.settings-page {
  display: flex;
  height: 100%;
  background: var(--bg-primary);
}

.settings-sidebar {
  width: 200px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  padding: 16px 0;
  overflow-y: auto;
}

.menu-item {
  padding: 10px 20px;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  transition: background 0.15s;
}

.menu-item:hover {
  background: var(--bg-tertiary);
}

.menu-item.active {
  background: var(--bg-primary);
  color: var(--accent);
  font-weight: 500;
  border-right: 2px solid var(--accent);
}

.settings-content {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
}

.section h2 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--text-primary);
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid var(--border-light);
  font-size: 14px;
  color: var(--text-primary);
  gap: 12px;
}

.setting-row.danger {
  color: var(--danger);
}

.setting-row.highlight-row {
  background: var(--accent);
  color: #fff;
  border-radius: 8px;
  padding: 14px 12px;
  margin: 4px -12px;
  transition: background 0.3s, color 0.3s;
  animation: highlight-pulse 1s ease-in-out 2;
}

@keyframes highlight-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.setting-desc {
  font-size: 12px;
  color: var(--text-muted);
}

.sub-heading {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 16px 0 4px;
  padding-top: 8px;
  border-top: 1px solid var(--border-light);
}

.setting-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.path-text {
  font-size: 12px;
  color: var(--text-muted);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  background: var(--accent);
  color: #fff;
  cursor: pointer;
  border: none;
}

.btn:hover {
  background: var(--accent-hover);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.btn-secondary:hover {
  background: var(--bg-hover);
}

.btn-danger {
  background: var(--danger);
  color: #fff;
}

.btn-danger:hover {
  background: var(--danger-hover);
}

.btn-sm {
  padding: 4px 10px;
  font-size: 12px;
}

.btn-lg {
  padding: 12px 32px;
  font-size: 15px;
}

.select-input {
  padding: 6px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  background: var(--input-bg);
  color: var(--text-primary);
}

.select-input:focus {
  border-color: var(--accent);
}

.text-input {
  padding: 6px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  background: var(--input-bg);
  color: var(--text-primary);
  width: 220px;
}

.text-input:focus {
  border-color: var(--accent);
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
}

.radio-label input {
  cursor: pointer;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
  flex-shrink: 0;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: var(--border-color);
  border-radius: 22px;
  transition: 0.3s;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background: #fff;
  border-radius: 50%;
  transition: 0.3s;
}

.toggle input:checked + .toggle-slider {
  background: var(--accent);
}

.toggle input:checked + .toggle-slider::before {
  transform: translateX(18px);
}

.toggle-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.bg-preview {
  margin-top: 8px;
}

.bg-preview img {
  max-width: 300px;
  max-height: 150px;
  border-radius: 8px;
  object-fit: cover;
}

/* 自定义主题 */
.custom-theme-panel {
  padding: 12px 16px;
  margin: 8px 0;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.panel-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.color-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
  color: var(--text-primary);
}

.color-row input[type="color"] {
  width: 32px;
  height: 28px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
  background: none;
}

/* 缩放 */
.zoom-slider {
  width: 120px;
  accent-color: var(--accent);
}

.zoom-value {
  font-size: 13px;
  color: var(--text-secondary);
  min-width: 40px;
}

/* 重置 */
.reset-area {
  padding: 24px 0;
  text-align: center;
}

.reset-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 20px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

/* 模态弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(2px);
}

.modal {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 24px;
  width: 420px;
  max-height: 70vh;
  overflow-y: auto;
  box-shadow: 0 8px 30px var(--modal-shadow);
}

.modal h3 {
  margin-bottom: 16px;
  font-size: 16px;
  color: var(--text-primary);
}

.modal input[type="text"],
.modal input[type="password"] {
  display: block;
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 10px;
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

.modal-hint {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.btn-cancel {
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 14px;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
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
  border: none;
  cursor: pointer;
}

.btn-confirm:hover {
  background: var(--accent-hover);
}

.pin-input {
  font-size: 20px !important;
  text-align: center;
  letter-spacing: 8px;
  padding: 10px !important;
}

.pin-error {
  color: var(--danger);
  font-size: 13px;
  margin-top: -6px;
  margin-bottom: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  cursor: pointer;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.modal-header h3 {
  margin-bottom: 0;
}

.search-input {
  margin-bottom: 12px !important;
}

.password-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-light);
}

.password-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.password-site {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.password-user {
  font-size: 12px;
  color: var(--text-muted);
}

.password-actions {
  display: flex;
  gap: 6px;
}

.cookie-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-light);
}

.cookie-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cookie-domain {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
}

.cookie-name {
  font-size: 12px;
  color: var(--text-muted);
}

/* 快捷键 */
.shortcuts-modal {
  max-width: 500px;
  max-height: 70vh;
}

.shortcuts-list {
  max-height: 400px;
  overflow-y: auto;
}

.shortcut-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-light);
}

.shortcut-row kbd {
  background: var(--bg-tertiary);
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  min-width: 70px;
  text-align: center;
}

.shortcut-row span {
  font-size: 13px;
  color: var(--text-secondary);
}

.empty-hint {
  text-align: center;
  padding: 24px;
  color: var(--text-muted);
  font-size: 13px;
}

.password-modal {
  max-width: 500px;
}

.cookie-modal {
  max-width: 500px;
}

/* 关于 */
.about-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 40px;
}

.about-logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 16px;
}

.about-title {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 3px;
  background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.about-version {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.about-copyright {
  font-size: 12px;
  color: var(--text-muted);
}

.update-status {
  display: block;
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.protocol-modal {
  width: 520px;
  max-height: 80vh;
  overflow-y: auto;
}

.protocol-mode-section {
  margin-bottom: 16px;
}

.protocol-section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.protocol-radio {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  margin-bottom: 2px;
}

.protocol-radio input[type="radio"] {
  accent-color: var(--accent);
}

.protocol-radio-desc {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0 0 8px 22px;
}

.protocol-list-section {
  margin-bottom: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--border-light);
}

.protocol-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
  max-height: 150px;
  overflow-y: auto;
}

.protocol-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 12px;
  background: rgba(74, 144, 217, 0.15);
  color: var(--accent);
  border: 1px solid rgba(74, 144, 217, 0.3);
}

.protocol-tag-black {
  background: rgba(220, 53, 69, 0.12);
  color: #dc3545;
  border-color: rgba(220, 53, 69, 0.3);
}

.tag-remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  color: inherit;
  opacity: 0.7;
  padding: 0 2px;
}

.tag-remove:hover {
  opacity: 1;
}

.protocol-add-row {
  display: flex;
  gap: 8px;
}

.protocol-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  background: var(--input-bg);
  color: var(--text-primary);
}

.protocol-input:focus {
  border-color: var(--accent);
}

.protocol-error {
  font-size: 12px;
  color: #dc3545;
  margin: 4px 0 0;
}
</style>
