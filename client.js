class Cell {
  static availableTypes = ["weed", "eat", "snake", "wall"]
  static isAvailableType(t) {
    return Cell.availableTypes.includes(t)
  }

  #htmlElement
  #type

  constructor(t="weed") {
    this.#htmlElement = document.createElement("div")
    this.type = t
  }

  get type() {
    return this.#type
  }

  set type(t) {
    if (Cell.isAvailableType(t)) {
      this.#type = t
      if (this.#htmlElement) {
        this.#htmlElement.className = "cell " + t
      }
    } else throw new Error("Not such cell type: " + t)
  }

  get html() {
    return this.#htmlElement
  }
}

class Field {
  #htmlElement
  #cells
  constructor(rows, cols) {
    this.#htmlElement = document.getElementById("field")
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
        const cell = new Cell(currentCellType)
        row.push(cell)
      }
      this.#cells.push(row)
    }

    this.forEachCell(cell => this.#htmlElement.append(cell.html))    
  }

  forEachCell(cb) {
    this.#cells.forEach( row => row.forEach(cb) )
  }

  render(x, y, cellType) {
    this.#cells[y][x].type = cellType
  }
}

class Snake {
  #body = []
  #direction
  #field

  static directions = ["top", "left", "right", "bottom"]

  constructor(headX=1, headY=1, length=3, direction="right") {
    this.#direction = direction

    let x = headX, y = headY, fnX = () => headX, fnY = () => headY
    if (direction === "right") fnX = () => ++x
    if (direction === "left") fnX = () => --x
    if (direction === "top") fnY = () => --y
    if (direction === "bottom") fnY = () => ++y

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
}

console.dir(Cell.availableTypes)
const gameField = new Field(20, 20)
const snake = new Snake(2, 2, 5, "bottom")
// const snake2 = new Snake(12, 10, 4, "left")
snake.spawn(gameField)
// snake2.spawn(gameField)