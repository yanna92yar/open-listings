import { setupPell } from './editor/setup-pell.js'
import { setupGravatar } from './gravatar/setup-gravatar.js'
import { setupImageModal } from './modals/setup-image-modal.js'
import { undrawOutput } from './undraw-output/undraw-output.js'

setupGravatar()
setupImageModal()
undrawOutput()
setupPell()
