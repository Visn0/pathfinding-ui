import { IAlgorithm, ICoordinate, BoardPath, compareCoords, ManhattanDistance, validCoord, getPath } from './IAlgorithm'
import Board from '../Board'
import PriorityQueue from 'ts-priority-queue'
import AnimationManager from '../AnimationManager'
import { CellType, MOVES } from '../constants'

export class AStar implements IAlgorithm {
  #memoization: Array<Array<number>> = []
  #bestPath: BoardPath = []
  #animationDelay: number

  constructor () { }

  #init(board: Board) {
    this.#bestPath = []
    this.#memoization = new Array<Array<number>>()
    for (let r = 0; r < board.height; ++r)
    {
      this.#memoization.push(new Array<number>(board.width).fill(Number.MAX_SAFE_INTEGER))
    }
  }

  #isCellPromising (coord: ICoordinate): boolean {
    return coord.pathLength < this.#memoization[coord.row][coord.col]
      && (coord.bound < this.#bestPath.length || this.#bestPath.length === 0)
  }

  #solve(board: Board) {
    let pq = new PriorityQueue({ comparator: (a: ICoordinate, b: ICoordinate) => { return a.bound - b.bound } })
    let bound: number = ManhattanDistance(board.begin, board.exit)
    let coord: ICoordinate = { ...board.begin, bound: bound, pathLength: 0, prev: null }

    pq.queue(coord)

    while (pq.length !== 0)  {
      let coord: ICoordinate = pq.dequeue()

      let currentCell: CellType = board.getCellType(coord)
      // Render expanded nodes
      if (currentCell !== CellType.BEGIN && currentCell !== CellType.EXIT && this.#memoization[coord.row][coord.col] === Number.MAX_SAFE_INTEGER) {
        AnimationManager.setExploredCell(coord, this.#animationDelay)
      }

      // Check if coord is still promising
      if (!this.#isCellPromising(coord)) continue

      this.#memoization[coord.row][coord.col] = coord.pathLength
      if (board.getCellType(coord) === CellType.EXIT) {
        if (coord.pathLength < this.#bestPath.length || this.#bestPath.length === 0) {
          this.#bestPath = getPath(coord)
        }
        continue
      }

      // Explore surrounding cells
      for (let m of MOVES) {
        let newCoord: ICoordinate = {
          row: coord.row + m.row,
          col: coord.col + m.col,
          pathLength: coord.pathLength + 1,
          prev: coord,
        }

        // Check if coord is inside the board
        if (!validCoord(newCoord, board.height, board.width)) continue
        if (board.getCellType(newCoord) === CellType.WALL) continue

        // Optimistic bound
        newCoord.bound = coord.pathLength + ManhattanDistance(newCoord, board.exit) + 1
        if (this.#isCellPromising(newCoord)) {
          pq.queue(newCoord)
        }
      }
    }
  }

  findPath(board: Board, animationDelay: number): BoardPath {
    this.#init(board)
    this.#animationDelay = animationDelay
    this.#solve(board)

    return this.#bestPath
  }
}

export default AStar