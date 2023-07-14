import autoComplete from '@tarekraafat/autocomplete.js'
import { getStateNames } from '../../helpers/get-state-names.js'
import { LIS } from '../../helpers/lis.js'

export const setupDelimitationsKeywords = () => {
    if (!LIS.id('autoComplete-states')) {
        console.log('### function "setupDelimitationsKeywords"  ignored well')
        return
    }
    const names = getStateNames()
    // Autocomplete for governmental divisions
    try {
        window.autoCompleteJS = new autoComplete({
            selector: '#autoComplete-states',
            // placeHolder: 'Divisions...',
            data: {
                src: names,
            },
            resultItem: {
                highlight: {
                    render: true,
                },
            },
        })
        console.log('### function "setupDelimitationsKeywords" run successfully')
    } catch (error) {
        console.error('### function "setupDelimitationsKeywords" failed')
    }
}
