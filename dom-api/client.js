import {AbstractCell, AbstractField, AbstractSnake, Game} from "../game.js"
import HasPseudoclassPolyfill from "./polyfill.js"

const DELAY = 150
const SIZE = 20

class HTMLCell extends AbstractCell {
  #htmlElement
  #animationDirection = null

  constructor(x, y, t) {
    super(x, y, t)
    this.#htmlElement = document.createElement("div")
  }

  get htmlElement() {
    return this.#htmlElement
  }

  render() {
    this.#htmlElement.replaceChildren()
    this.#htmlElement.className = "cell " + this._type
  }

  animate(spec) {
    const segment = document.createElement("div")
    segment.className = `segment ${spec === "head" ? "grow" : "reduce"} ${this.#animationDirection}`
    this.#htmlElement.append(segment)
    requestAnimationFrame(addAnimation(segment))
  }

  set animationDirection(d) {
    if (this.isSnake()) {
      if (AbstractSnake.isAvailableDirection(d))
        this.#animationDirection = d
      else {
        throw new Error(
          `This animation direction (${d}) is not available` +
          `Available: ${AbstractSnake.availableDirections}`
        )
      }
    } else if (d === null) this.#animationDirection = null
    else {
      throw new Error(
        "If cell type isn't 'snake' animationDirection must be null"
      )
    }
  }

  get animationDirection() {
    return this.#animationDirection
  }
}

function addAnimation(d) {
  const end = DELAY
  const initial = SIZE

  const decrease = (elapsed) => {
    return (initial*((end - elapsed) / end)).toFixed(2) + "px"
  }

  const increase = (elapsed) => {
    return (initial*(elapsed / end)).toFixed(2) + "px"
  }

  const [e, method, direction] = d.classList

  if (method === "grow") {
    if (["top", "bottom"].includes(direction)) {
      d.style.height = "0px"
    } else {
      d.style.width = "0px"
    }
  }

  let start

  const animate = timeStamp => {
    if (start === undefined) {
      start = timeStamp
      return requestAnimationFrame(animate)
    }
    const elapsed = timeStamp - Number(start)
    if (elapsed >= end) {
      if (method === "grow") {
        d.style.height = SIZE + "px"
        d.style.width = SIZE + "px"

      }
      return
    }

    if (method === "reduce") {
      if (["top", "bottom"].includes(direction)) {
        d.style.height = decrease(elapsed)
      } else {
        d.style.width = decrease(elapsed)
      }
    } else {
      if (["top", "bottom"].includes(direction)) {
        d.style.height = increase(elapsed)
      } else {
        d.style.width = increase(elapsed)
      }
    }

    requestAnimationFrame(animate)
  }

  return animate
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
  browserCheck() {
    const polyfill = new HasPseudoclassPolyfill()
    polyfill.checkBrowser()
    this.usePolyfill = polyfill.getFn()
  }

  createCell(x, y) {
    return new HTMLCell(x, y, "snake")
  }
  move() {
    const status =  super.move()
    super.head.animationDirection = this.direction
    super.head.animate("head")

    const [x, y] = this.body.at(1)
    const preTail = this.field.getCell(x, y)

    if (preTail.animationDirection !== super.tail.animationDirection)
      super.tail.animationDirection = preTail.animationDirection

    super.tail.animate("tail")
    this.body.forEach((cell, index) => {
      if (index !== 0 && index !== this.body.length - 1)
        this.field.getCell(cell[0], cell[1]).render()
    })

    this.usePolyfill()

    return status
  }
  spawn() {
    this.body.forEach(cell => {
      const segment = this.field.getCell(cell[0], cell[1])
      segment.type = "snake"
      segment.animationDirection = this.direction
      segment.render()
    })
  }
}

window.onload = () => {
  const gameField = new HTMLField(SIZE, SIZE)
  const snake = new HTMLSnake(1, 1, 3, "right", gameField)
  snake.browserCheck()
  const game = new Game(gameField, snake)
  game.frameDelay = DELAY

  const scoreCounter = document.getElementById("score")
  game.onScoreChange = score => {
    scoreCounter.textContent = score
  }

  game.execInGameOver = () => {
    alert("Game over! Score: " + scoreCounter.textContent)
    window.location.href = "/"
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