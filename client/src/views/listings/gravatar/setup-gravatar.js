import Avatar from 'avatar-initials'
import { LIS } from '../../../helpers/lis.js'
const __initials__ = window.__initials__
// eslint-disable-next-line max-len
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Avatar @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
export const setupGravatar = () => {
    const gravatar = LIS.id('avatar')
    if (gravatar) {
        gravatar.style.border = '2px solid #3399CC'
        Avatar.from(document.getElementById('avatar'), {
            useGravatar: false,
            initials: __initials__,
        })
    }

    // const messageDialog = LIS.id('message-dialog')
}
