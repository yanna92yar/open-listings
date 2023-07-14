// expects __UXConstraints__

export function markRequiredInputs() {
    if (!window.__UXConstraints__) return
    for (let [formName, constraint] of Object.entries(window.__UXConstraints__)) {
        if (constraint.requiredUXInputs.length === 0) continue
        const form = document.querySelector(`form[name="${formName}"]`)
        if (form) {
            const inputs = form.elements
            for (const element of inputs) {
                if (element.nodeName === 'INPUT' && constraint.requiredUXInputs.indexOf(element.name) > -1) {
                    element.setAttribute('required', 'required')
                }
                if (element.nodeName === 'INPUT' && constraint.minInputs[element.name]) {
                    element.setAttribute('minlength', constraint.minInputs[element.name])
                }
            }
        }
    }
}

export function updatePostPostInputs() {
    if (!window.__formData__) return
    for (let [inputName, value] of Object.entries(window.__formData__)) {
        const input = document.querySelector(`input[name="${inputName}"]`)
        if (input) {
            input.value = value
        }
    }
}
