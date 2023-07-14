import { setupColorPicker } from './color-picker/setup-color-picker.js'
import { loadIllustrations } from './load-illustrations/load-illustrations.js'

setupColorPicker()
const selectElement = document.querySelector('#autoComplete-illu')

selectElement.addEventListener('selection', (event) => {
    const value = event.detail.selection.value
    loadIllustrations(value)
})
