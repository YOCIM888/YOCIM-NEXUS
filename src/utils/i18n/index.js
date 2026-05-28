import { ref } from 'vue'
import common from './common.js'
import bookmarks from './bookmarks.js'
import downloads from './downloads.js'
import history from './history.js'
import tabs from './tabs.js'
import panels from './panels.js'
import settings from './settings.js'
import appearance from './appearance.js'
import ai from './ai.js'
import privacy from './privacy.js'

const messages = {}

const locales = ["zh","en","es","fr","ja","ko","ar"]

for (const locale of locales) {
  messages[locale] = {
      ...common[locale],
      ...bookmarks[locale],
      ...downloads[locale],
      ...history[locale],
      ...tabs[locale],
      ...panels[locale],
      ...settings[locale],
      ...appearance[locale],
      ...ai[locale],
      ...privacy[locale]
  }
}

const currentLocale = ref('en')

export function useI18n() {
  function t(key) {
    return messages[currentLocale.value]?.[key] || messages.zh[key] || key
  }

  function setLocale(lang) {
    currentLocale.value = lang
  }

  function getLocale() {
    return currentLocale.value
  }

  return { t, setLocale, getLocale, currentLocale }
}
