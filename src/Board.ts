import { type } from "os"
import { ICoordinate } from "./algorithms/IAlgorithm"
import AnimationManager from './AnimationManager'
import { CellType } from "./constants"

class Board {
  #element: HTMLElement = null
  #rows: number = null
  #columns: number = null
  #table: Array<Array<CellType>> = []
  #begin: ICoordinate = null
  #exit: ICoordinate = null

  constructor(height: number, width: number) {
    this.#element = document.getElementById('board')
    this.#rows = height
    this.#columns = width
  }

  get height(): number {
    return this.#rows
  }

  get width(): number {
    return this.#columns
  }

  get isThereBegin(): boolean {
    return !!this.#begin
  }

  get isThereExit(): boolean {
    return !!this.#exit
  }

  get begin(): ICoordinate {
    return { ...this.#begin }
  }

  get exit(): ICoordinate {
    return { ...this.#exit }
  }

  getCellType(coord: ICoordinate): CellType {
    return this.#table[coord.row][coord.col]
  }

  init() {
    let result = this.#tableToHTML()
    this.#element.innerHTML = result

    this.#table = new Array<Array<CellType>>()
    for (let r = 0; r < this.#rows; ++r)
    {
      this.#table.push(new Array<CellType>(this.#columns).fill(CellType.EMPTY))
    }

    this.#begin = null
    this.#exit = null
  }

  clear() {
    for (let r = 0; r < this.#rows; r++)
    {
      for (let c = 0; c < this.#columns; c++)
      {
        AnimationManager.setEmptyCell({ row: r, col: c })
        this.#table[r][c] = CellType.EMPTY
      }
    }

    this.#begin = null
    this.#exit = null
  }

  fillWalls() {
    for (let r = 0; r < this.#rows; r++)
    {
      for (let c = 0; c < this.#columns; c++)
      {
        AnimationManager.setWallCell({ row: r, col: c })
        this.#table[r][c] = CellType.WALL
      }
    }

    this.#begin = null
    this.#exit = null
  }

  clearExploredNodes() {
    for (let r = 0; r < this.#rows; r++)
    {
      for (let c = 0; c < this.#columns; c++)
      {
        if (this.#table[r][c] === CellType.BEGIN || this.#table[r][c] === CellType.EXIT || this.#table[r][c] === CellType.WALL)
          continue

        AnimationManager.setEmptyCell({ row: r, col: c })
        this.#table[r][c] = CellType.EMPTY
      }
    }
  }

  setTableCellType(row: number, column: number, type: CellType, animationDelay: number = 0) {
    AnimationManager.setCellStyle({ row: row, col: column }, type, animationDelay)
    this.#table[row][column] = type
  }

  setCellType(row: number, column: number, type: CellType) {
    if (type == this.#table[row][column])
    {
      return
    }
    if (type == CellType.BEGIN)
    {
      // Only one begin cell is allowed
      if (this.#begin)
      {
        AnimationManager.setCellStyle({ row: this.#begin.row, col: this.#begin.col }, CellType.EMPTY)
        this.#table[this.#begin.row][this.#begin.col] = CellType.EMPTY
      }
      this.#begin = { row: row, col: column }
    }
    else if (type == CellType.EXIT)
    {
      // Only one exit cell is allowed
      if (this.#exit)
      {
        AnimationManager.setCellStyle({ row: this.#exit.row, col: this.#exit.col }, CellType.EMPTY)
        this.#table[this.#exit.row][this.#exit.col] = CellType.EMPTY
      }
      this.#exit = { row: row, col: column }
    }
    else // wall or clear
    {
      const oldType = this.#table[row][column]
      if (oldType === CellType.BEGIN)
      {
        this.#begin = null
      } else if (oldType === CellType.EXIT)
      {
        this.#exit = null
      }
    }
    AnimationManager.setCellStyle({ row: row, col: column }, type)
    this.#table[row][column] = type
  }

  resize(rows, columns) {
    this.#rows = rows
    this.#columns = columns
    this.init()
  }

  #tableToHTML() {
    let result = ""

    for (let ir = 0; ir < this.#rows; ir++)
    {
      let htmlrow = `<tr id="row${ir}">\n`
      for (let ic = 0; ic < this.#columns; ic++)
      {
        let htmlcell = `\t
        <td id="cell${ir}_${ic}"
          onclick="onCellClick(event, ${ir}, ${ic})"
          ondragstart="onCellDragStart(event)"
          ondrag="onCellDrag(event, ${ir}, ${ic})"
          ondragover="onCellOver(event, ${ir}, ${ic})"
          draggable="true">
        </td>\n`
        htmlrow += htmlcell
      }
      result += htmlrow + "</tr>\n"
    }

    return result
  }
}

export default Board;