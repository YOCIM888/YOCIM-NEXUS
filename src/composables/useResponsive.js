import { ref, computed, watch } from 'vue'

export const DEVICE_PRESETS = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12/13', width: 390, height: 844 },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'iPad Pro', width: 1024, height: 1366 },
  { name: 'Desktop 1080p', width: 1920, height: 1080 },
  { name: 'Desktop 1440p', width: 2560, height: 1440 },
]

export function useResponsive() {
  const responsiveEnabled = ref(false)
  const selectedPresetName = ref('')
  const customWidth = ref(375)
  const customHeight = ref(667)
  const zoomMode = ref('fit')
  const rotated = ref(false)

  // 画布显示尺寸（独立 ref，由 watch 或用户输入驱动）
  const displayWidth = ref(375)
  const displayHeight = ref(667)

  const selectedPreset = computed(() => {
    if (!selectedPresetName.value) return null
    return DEVICE_PRESETS.find(d => d.name === selectedPresetName.value) || null
  })

  // 当选中的预设变化时，同步显示尺寸
  watch(selectedPreset, (preset) => {
    if (preset) {
      displayWidth.value = preset.width
      displayHeight.value = preset.height
    }
  })

  const deviceWidth = computed(() => rotated.value ? displayHeight.value : displayWidth.value)
  const deviceHeight = computed(() => rotated.value ? displayWidth.value : displayHeight.value)

  function selectPreset(preset) {
    selectedPresetName.value = preset ? preset.name : ''
  }

  function setDisplayWidth(val) {
    displayWidth.value = val
    customWidth.value = val
    selectedPresetName.value = ''
  }

  function setDisplayHeight(val) {
    displayHeight.value = val
    customHeight.value = val
    selectedPresetName.value = ''
  }

  function rotateDevice() {
    rotated.value = !rotated.value
  }

  function toggleResponsive() {
    responsiveEnabled.value = !responsiveEnabled.value
  }

  return {
    responsiveEnabled,
    selectedPresetName,
    selectedPreset,
    customWidth, customHeight,
    zoomMode, rotated,
    displayWidth, displayHeight, deviceWidth, deviceHeight,
    selectPreset, setDisplayWidth, setDisplayHeight, rotateDevice, toggleResponsive,
  }
}
