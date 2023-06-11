const wrapper = document.querySelector('.wrapper svg')
const btnDraw = document.querySelector('.btn-draw')
const btnErase = document.querySelector('.btn-erase')

// We are only adding and removing the 'active' class,
// the entire animation is defined in the CSS code
function draw() {
    wrapper.classList.add('active')
}

function erase() {
    wrapper.classList.remove('active')
}

// Add handlers to our buttons
btnDraw.addEventListener('click', draw, false)
btnErase.addEventListener('click', erase, false)

// Play draw animation once
setTimeout(draw, 300)
