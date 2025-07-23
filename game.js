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
  constructor(rows, cols) {
    this.#cells = []
    
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

  isEat(x, y) {
    return this.#cells[y][x].type === "apple"
  }
}

export class Snake {
  #body = []
  #direction
  #field

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
    if (this.#direction === direction) return
    if (!Snake.isAvailableDirection(direction)) 
      throw new Error(
        `No such direction: ${direction}. Available: ${Snake.availableDirections}`
      )

    if (this.hasExclusivePair(direction)) return

    this.#direction = direction
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

  move(gameOverCallback) {
    const deleted = this.#body.shift()
    this.#field.render(deleted[0], deleted[1], "weed")

    let [x, y] = this.#body.at(-1)

    if (this.#direction === "right") ++x
    if (this.#direction === "left") --x
    if (this.#direction === "top") --y
    if (this.#direction === "bottom") ++y

    if (this.#field.isWall(x, y) || this.#field.isSnake(x, y))
      return gameOverCallback()

    this.#body.push([x, y])
    this.#field.render(x, y, "snake")
  }

  grow() {}
}