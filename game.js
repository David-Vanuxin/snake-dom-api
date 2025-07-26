export class AbstractCell {
  static availableTypes = ["weed", "apple", "snake", "wall"]
  static isAvailableType(t) {
    return AbstractCell.availableTypes.includes(t)
  }

  _type
  _x
  _y

  constructor(x, y, t="weed") {
    this._x = x
    this._y = y
    this._type = t
  }

  get type() {
    return this._type
  }

  set type(t) {
    if (t === this._type) return
    if (AbstractCell.isAvailableType(t)) {
      this._type = t
    } else throw new Error(
      `Not such cell type: ${t}, available types: ${AbstractCell.availableTypes}`
    )
  }

  render() {}

  isWall() {
    return this.type === "wall"
  }

  isSnake() {
    return this.type === "snake"
  }

  isApple() {
    return this.type === "apple"
  }
}

export class AbstractField {
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

        const cell = this.createCell(j, i, currentCellType)
        cell.render()
        row.push(cell)
      }
      this.#cells.push(row)
    }
  }

  createCell(x, y, type) {
    return new AbstractCell(x, y, type)
  }

  forEachCell(cb) {
    this.#cells.forEach( row => row.forEach(cb) )
  }

  getCell(x, y) {
    return this.#cells[y][x]
  }

  spawnApple() {
    while (1) {
      const x = Math.floor(Math.random() * this.#colsCount)
      const y = Math.floor(Math.random() * this.#rowsCount)
      const cell = this.getCell(x, y)

      if (cell.isSnake() || cell.isWall()) continue
      cell.type = "apple"
      return cell.render()
    }
  }
}

export class AbstractSnake {
  #body = []
  #direction
  #turnBlock = false

  static availableDirections = ["top", "left", "right", "bottom"]
  static isAvailableDirection(direction) {
    return AbstractSnake.availableDirections.includes(direction)
  }
  static exclusiveDirectionPairs = {
    "top": "bottom",
    "bottom": "top",
    "left": "right",
    "right": "left",
  }

  constructor(headX=1, headY=1, length=3, direction="right", field) {
    this.#direction = direction
    this.field = field

    let x = headX, y = headY, fnX = () => headX, fnY = () => headY
    if (direction === "right") fnX = () => x++
    if (direction === "left") fnX = () => x--
    if (direction === "top") fnY = () => y--
    if (direction === "bottom") fnY = () => y++

    for (let i = length; i > 0; i--) {
      this.#body.push([fnX(), fnY()])
    }
  }

  spawn() {
    this.#body.forEach(cell => {
      const segment = this.field.getCell(cell[0], cell[1])
      segment.type = "snake"
      segment.render()
    })
  }

  hasExclusivePair(direction) {
    const exclusivePair = AbstractSnake.exclusiveDirectionPairs[this.#direction]
    return direction === exclusivePair 
  }

  set direction(direction) {
    if (this.#turnBlock) return
    if (this.#direction === direction) return
    if (!AbstractSnake.isAvailableDirection(direction)) 
      throw new Error(
        `No such direction: ${direction}. Available: ${AbstractSnake.availableDirections}`
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

    const nextCell = this.field.getCell(x, y)
    if (nextCell.isWall() || nextCell.isSnake())
      return "GAME_OVER"

    let status = "APPLE"

    if (!nextCell.isApple(x, y)) {
      const [delX, delY] = this.#body.shift()
      const deleted = this.field.getCell(delX, delY)
      deleted.type = "weed"
      deleted.render()
      status = "NOTHIG"
    }

    this.#body.push([x, y])
    nextCell.type = "snake"
    nextCell.render()
    this.#turnBlock = false

    return status
  }

  find(cb) {
    return this.#body.find(cb)
  }

  get head() {
    const [x, y] = this.#body.at(-1)
    return this.field.getCell(x, y)
  }

  get tail() {
    const [x, y] = this.#body.at(0)
    return this.field.getCell(x, y)
  }

  get direction() {
    return this.#direction
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
    this.#snake.spawn()
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