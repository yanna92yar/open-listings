// eslint-disable-next-line max-len

/**
 * getAllIndexes
 * @param {Array} arr
 * @param {number} val
 * @return {Array} indexes
 */
export function getAllIndexes(arr, val) {
    const indexes = []
    let i
    for (i = 0; i < arr.length; i++) {
        if (arr[i] === val) {
            indexes.push(i)
        }
    }
    return indexes
}
