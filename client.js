import {Cell, Field, Snake} from "./game.js"

class HTMLCell extends Cell {
  #htmlElement

  constructor(t="weed") {
    super(t)
    this.#htmlElement = document.createElement("div")
    this.type = t
  }

  get htmlElement() {
    return this.#htmlElement
  }

  set type(t) {
    super.type = t
    this.#htmlElement.className = "cell " + t
  }

  get type() {
    return super.type
  }
}

class HTMLField extends Field {
  #htmlElement

  constructor(rows, cols) {
    super(rows, cols)
    this.#htmlElement = document.getElementById("field")
    this.forEachCell(cell => 
      this.#htmlElement.append(cell.htmlElement))
  }

  createCell(type) {
    return new HTMLCell(type)
  }
}

window.onload = () => {
  const gameField = new HTMLField(20, 20)
  // const snake = new Snake(2, 2, 5, "bottom")
  const snake = new Snake(1, 1, 3, "right")
  snake.spawn(gameField)

  let interval, running = false
  const stop = () => {
    clearInterval(interval)
    running = false
  }
  const start = () => {
    interval = setInterval(() => snake.move(() => {
      alert("Game over!")
      stop()
      window.location.href = "/"
    }), 100)
    running = true
  }

  window.addEventListener("keydown", event => {
    if (event.code === "ArrowUp") snake.turnUp()
    if (event.code === "ArrowDown") snake.turnDown()
    if (event.code === "ArrowLeft") snake.turnLeft()
    if (event.code === "ArrowRight") snake.turnRight()
    if (event.code === "Space")
      !running ? start() : stop()
  })
}