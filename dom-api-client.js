import {AbstractCell, AbstractField, AbstractSnake, Game} from "./game.js"

class HTMLCell extends AbstractCell {
  #htmlElement

  constructor(x, y, t) {
    super(x, y, t)
    this.#htmlElement = document.createElement("div")
  }

  get htmlElement() {
    return this.#htmlElement
  }

  render() {
    this.#htmlElement.className = "cell " + this._type
  }
}

class HTMLField extends AbstractField {
  #htmlElement
  #subscribeAction

  constructor(rows, cols) {
    super(rows, cols)
    this.#htmlElement = document.getElementById("field")
    this.forEachCell(cell => {
      this.#htmlElement.append(cell.htmlElement)
    })
  }

  createCell(x, y, type) {
    return new HTMLCell(x, y, type)
  }
}

class HTMLSnake extends AbstractSnake {
  createCell(x, y) {
    return new HTMLCell(x, y, "snake")
  } 
}

window.onload = () => {
  const gameField = new HTMLField(20, 20)
  const snake = new HTMLSnake(1, 1, 3, "right", gameField)
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