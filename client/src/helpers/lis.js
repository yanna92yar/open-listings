// DEFINED ALIASES FOR SOME COMMON LONG NAMED FUNCTIONS
export const LIS = {
    id: function (id) {
        return document.getElementById(id)
    },
    elements: function (className, parent) {
        return parent ? parent.querySelectorAll(`.${className}`) : document.querySelectorAll(`.${className}`)
    },
    remove: function (id) {
        document.getElementById(id).parentNode.removeChild(document.getElementById(id))
    },
    classExists: function (classNames) {
        return classNames.every((className) => {
            return document.getElementsByClassName(className).length > 0
        })
    },
    anyClassExists: function (classNames) {
        return classNames.some((className) => {
            return document.getElementsByClassName(className).length > 0
        })
    },
}
