export class Cell {
  static availableTypes = ["weed", "apple", "snake", "wall"]
  static isAvailableType(t) {
    return Cell.availableTypes.includes(t)
  }

  _type

  constructor(t="weed") {
    this._type = t
  }

  get type() {
    return this._type
  }

  set type(t) {
    if (t === this._type) return
    if (Cell.isAvailableType(t)) {
      this._type = t
    } else throw new Error(
      `Not such cell type: ${t}, available types: ${Cell.availableTypes}`
    )
  }
}

export class Field {
  #cells
  #rowsCount
  #colsCount

  constructor(rows, cols) {
    this.#cells = []
    this.#rowsCount = rows
    this.#colsCount = cols
    
    for (let i = 0; i < rows; i++) {
      const row = []
      for (let j = 0; j < cols; j++) {
        let currentCellType = "weed"
        const isTopOrBot = i === 0 || i+1 === rows
        const isSide = j === 0 || j+1 === cols
        if (isTopOrBot || isSide) {
          currentCellType = "wall"
        }

        const cell = this.createCell(currentCellType)
        row.push(cell)
      }
      this.#cells.push(row)
    }
  }

  createCell(type) {
    return new Cell(type)
  }

  forEachCell(cb) {
    this.#cells.forEach( row => row.forEach(cb) )
  }

  render(x, y, cellType) {
    this.#cells[y][x].type = cellType
  }

  isWall(x, y) {
    return this.#cells[y][x].type === "wall"
  }

  isSnake(x, y) {
    return this.#cells[y][x].type === "snake"
  }

  isApple(x, y) {
    return this.#cells[y][x].type === "apple"
  }

  spawnApple() {
    while (1) {
      const x = Math.floor(Math.random() * this.#colsCount)
      const y = Math.floor(Math.random() * this.#rowsCount)

      if (this.isSnake(x, y) || this.isWall(x, y)) continue

      return this.render(x, y, "apple")
    }
  }
}

export class Snake {
  #body = []
  #direction
  #field
  #turnBlock = false

  static availableDirections = ["top", "left", "right", "bottom"]
  static isAvailableDirection(direction) {
    return Snake.availableDirections.includes(direction)
  }
  static exclusiveDirectionPairs = {
    "top": "bottom",
    "bottom": "top",
    "left": "right",
    "right": "left",
  }

  constructor(headX=1, headY=1, length=3, direction="right") {
    this.#direction = direction

    let x = headX, y = headY, fnX = () => headX, fnY = () => headY
    if (direction === "right") fnX = () => x++
    if (direction === "left") fnX = () => x--
    if (direction === "top") fnY = () => y--
    if (direction === "bottom") fnY = () => y++

    for (let i = length; i > 0; i--) {
      this.#body.push([fnX(), fnY()])
    }
  }

  spawn(field) {
    this.#field = field
    this.#body.forEach(coors => {
      const [x, y] = coors

      this.#field.render(x, y, "snake")
    })
  }

  hasExclusivePair(direction) {
    const exclusivePair = Snake.exclusiveDirectionPairs[this.#direction]
    return direction === exclusivePair 
  }

  set direction(direction) {
    if (this.#turnBlock) return
    if (this.#direction === direction) return
    if (!Snake.isAvailableDirection(direction)) 
      throw new Error(
        `No such direction: ${direction}. Available: ${Snake.availableDirections}`
      )

    if (this.hasExclusivePair(direction)) return

    this.#direction = direction
    this.#turnBlock = true
  }

  turnUp() {
    this.direction = "top"
  }

  turnDown() {
    this.direction = "bottom"
  }

  turnLeft() {
    this.direction = "left"
  }

  turnRight() {
    this.direction = "right"
  }

  move() {
    let [x, y] = this.#body.at(-1)

    if (this.#direction === "right") ++x
    if (this.#direction === "left") --x
    if (this.#direction === "top") --y
    if (this.#direction === "bottom") ++y

    if (this.#field.isWall(x, y) || this.#field.isSnake(x, y))
      return "GAME_OVER"
      // return gameOverCallback()

    let status = "APPLE"

    if (!this.#field.isApple(x, y)) {
      const deleted = this.#body.shift()
      this.#field.render(deleted[0], deleted[1], "weed")
      status = "NOTHIG"
    }

    this.#body.push([x, y])
    this.#field.render(x, y, "snake")
    this.#turnBlock = false

    return status
  }

  find(cb) {
    return this.#body.find(cb)
  }
}

export class Game {
  #interval
  #paused = true
  #snake
  #field
  #score = 0

  constructor(field, snake) {
    this.#field = field
    this.#snake = snake
    this.#snake.spawn(this.#field)
    this.#field.spawnApple()

    this.execInGameOver = () => {}
    this.onScoreChange = () => {}
    this.frameDelay = 200
  }

  start() {
    this.#interval = setInterval(() => {
      const status = this.#snake.move()

      if (status === "GAME_OVER") {
        this.stop()
        this.execInGameOver()
      }

      if (status === "APPLE") {
        this.#score++
        this.onScoreChange(this.#score)
        this.#field.spawnApple()
      }

    }, this.frameDelay)
    this.#paused = false
  }

  stop() {
    clearInterval(this.#interval)
    this.#paused = true
  }

  get paused() {
    return this.#paused
  }
}