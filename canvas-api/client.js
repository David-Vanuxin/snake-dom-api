import {AbstractCell, AbstractField, AbstractSnake, Game} from "../game.js"

class CanvasCell extends AbstractCell {
  #context
  #width
  #height

  static styles = {
    "weed":"rgb(95 158 168)",
    "apple":"rgb(220 20 60)",
    "snake":"rgb(138 43 226)",
    "wall":"rgb(105 105 105)",
  }

  constructor(x, y, t, ctx, w, h) {
    super(x, y, t)
    this.#context = ctx
    this.#width = w
    this.#height = h
  }

  render() {
    this.#context.fillStyle = CanvasCell.styles[this.type]
    this.#context.fillRect(
      this._x * this.#width, 
      this._y * this.#height, 
      this.#width, 
      this.#height,
    )
  }
}

const canvas = document.getElementById("field")
const context = canvas.getContext("2d")
canvas.width = 400
canvas.height = 400
const rows = 20
const cols = 20
const cellWidth = canvas.width / cols
const cellHight = canvas.height / rows

class CanvasField extends AbstractField {
  constructor() {
    super(rows, cols)
  }

  createCell(x, y, type) {
    return new CanvasCell(
      x, y, type, 
      context,
      cellWidth,
      cellHight,
    )
  }
}

class CanvasSnake extends AbstractSnake {
  createCell(x, y) {
    return new CanvasCell(
      x, y, "snake", 
      CanvasField.context,
      CanvasField.cellWidth,
      CanvasField.cellHight,
    )
  }
}

window.onload = () => {
  const gameField = new CanvasField()
  const snake = new CanvasSnake(1, 1, 3, "right", gameField)
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