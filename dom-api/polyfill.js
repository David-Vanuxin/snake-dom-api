export default class HasPseudoclassPolyfill {
  #fn = () => {}

  constructor() {}

  checkBrowser() {
    if (CSS.supports('selector(:has(div))')) return

    this.#fn = polyfill
    console.warn("CSS selector :has() not supported")
  }

  getFn() {
    return this.#fn
  }
}

function polyfill() {
  document
    .querySelectorAll(".cell")
    .forEach(cell => cell.style.backgroundColor = "")

  changeFlexProps(".segment.grow")
  changeFlexProps(".segment.reduce")
}

function changeFlexProps(className) {
  const element = document.querySelector(className)
  if (!element) return
  const [seg, type, dir] = element.classList
  styles[type][dir](element.parentNode)

  // Firefox doesn't draw grow and reduce animation if background color is #5f9ea0 (cadetblue for Firefox)
  // I think it's optimisation 
  element.parentNode.style.backgroundColor = "#5f9ea1"
}

const styles = {
  "grow": {
    ["top"]: e => e.style.alignItems = "end",
    ["left"]: e => e.style.justifyContent = "end",
    ["right"]: e => e.style.justifyContent = "start",
    ["bottom"]: e => e.style.justifyContent = "start",
  },
  "reduce": {
    ["top"]: e => e.style.alignItems = "start",
    ["left"]: e => e.style.justifyContent = "start",
    ["right"]: e => e.style.justifyContent = "end",
    ["bottom"]: e => e.style.alignItems = "end",
  }
}