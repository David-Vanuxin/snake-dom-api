import {Cell, Field, Snake, Game} from "./game.js"

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
  #subscribeAction

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
  const snake = new Snake(1, 1, 3, "right")
  const game = new Game(gameField, snake)
  game.frameDelay = 100
  game.execInGameOver = () => {
    alert("Game over!")
    window.location.href = "/"
  }

  const scoreCounter = document.getElementById("score")
  game.onScoreChange = score => {
    scoreCounter.textContent = score
  }

  window.addEventListener("keydown", event => {
    if (event.code.search("Arrow") > -1 && game.paused)
      game.start()

    if (event.code === "ArrowUp") snake.turnUp()
    if (event.code === "ArrowDown") snake.turnDown()
    if (event.code === "ArrowLeft") snake.turnLeft()
    if (event.code === "ArrowRight") snake.turnRight()

    if (event.code === "Space") 
      game.paused ? game.start() : game.stop()
  })
}