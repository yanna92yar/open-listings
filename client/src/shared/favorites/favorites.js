// Define the modal (for the image onclick) behavior
import { LIS } from '../../helpers/lis.js'

export const setupFavorites = async () => {
    if (!document.querySelector('.ca-listings')) {
        return '### function "setupFavorites" ignored well'
    }
    // get favorites from local storage or empty array
    const favorites = JSON.parse(localStorage.getItem('favorites')) || []
    // add class 'favorites' to each favorite
    favorites.forEach(function (favorite) {
        const elem = LIS.id(favorite)
        if (elem) {
            elem.className = 'ca-listing favorites'
        }
    })
    // register click event listener
    document.querySelector('.ca-listings').addEventListener('click', function (e) {
        const id = e.target.id,
            item = e.target,
            index = favorites.indexOf(id)
        // return if target doesn't have an id (shouldn't happen)
        if (!id) return
        // item is not favorite
        if (index === -1) {
            favorites.push(id)
            item['className'] = 'ca-listing favorites'
            // item is already favorite
        } else {
            favorites.splice(index, 1)
            item['className'] = 'ca-listing'
        }
        // store array in local storage
        localStorage.setItem('favorites', JSON.stringify(favorites))
    })
    // local storage stores strings so we use JSON to stringify for storage and parse to get out of storage
    return '### function "setupFavorites" run successfully'
}
