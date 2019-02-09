import {
  TestCase,
  TestResult,
  Direction,
  GameState,
  Turn,
  Snake,
  Size,
  Coord,
  Sequence,
} from '../model/models'
import { TestClient } from '../io/client'

type Grid = { [key: number]: Cell }

interface Cell {
  coord: Coord
  snakes: Snake[]
  food: Coord | null
}

interface Cache {
  state: GameState
  cells: Grid
}

function cellIndex(boardSize: Size, coord: Coord) {
  return coord.y * boardSize.width + coord.x
}

function allSnakes(state: GameState) {
  return [state.you].concat(state.enemies)
}

function addSnake(snakes: Snake[], snake: Snake) {
  if (!~snakes.indexOf(snake)) {
    snakes.push(snake)
  }
}

function makeCache(state: GameState) {
  const cells: Grid = {}

  // Initialize empty cell for every valid coordinate
  for (let x = 0; x < state.boardSize.width; x++) {
    for (let y = 0; y < state.boardSize.height; y++) {
      const coord = { x, y }
      cells[cellIndex(state.boardSize, coord)] = emptyCell(coord)
    }
  }

  // Mark food spots
  for (const f of state.food) {
    cells[cellIndex(state.boardSize, f)].food = f
  }

  // Mark snake spots
  for (const s of allSnakes(state)) {
    for (const part of s.body) {
      const cell = cells[cellIndex(state.boardSize, part)]
      addSnake(cell.snakes, s)
    }
  }

  // Deep copy state so that future mutations don't have bad side effects
  return {
    state: deepCopy(state),
    cells,
  }
}

function deepCopy(state: GameState) {
  return JSON.parse(JSON.stringify(state)) as GameState
}

function getSnake(state: GameState, id: string) {
  return allSnakes(state).find(e => e.id === id)
}

function head(snake: Snake) {
  return snake.body[0]
}

function oob(state: GameState, coord: Coord) {
  return (
    coord.x >= state.boardSize.width ||
    coord.x < 0 ||
    coord.y >= state.boardSize.height ||
    coord.y < 0
  )
}

function coordsEqual(a: Coord, b: Coord) {
  return a.x === b.x && a.y === b.y
}

function nextCoord(coord: Coord, direction: Direction) {
  switch (direction) {
    case Direction.Up:
      return { x: coord.x, y: coord.y - 1 }
    case Direction.Down:
      return { x: coord.x, y: coord.y + 1 }
    case Direction.Left:
      return { x: coord.x - 1, y: coord.y }
    default:
      return { x: coord.x + 1, y: coord.y }
  }
}

function emptyCell(coord: Coord): Cell {
  return {
    coord,
    snakes: [],
    food: null,
  }
}

function cell(cache: Cache, coord: Coord) {
  return (
    cache.cells[cellIndex(cache.state.boardSize, coord)] || emptyCell(coord)
  )
}

function removeFood(cache: Cache, food: Coord) {
  cache.state.food = cache.state.food.filter(f => !coordsEqual(f, food))
  cell(cache, food).food = null
}

function removeTail(cache: Cache, snake: Snake) {
  const removed = snake.body.pop()
  uncacheSnakePart(cache, snake, removed)
}

function uncacheSnakePart(cache: Cache, snake: Snake, part: Coord) {
  const c = cell(cache, part)
  c.snakes = c.snakes.filter(s => s !== snake)
}

function addHead(cache: Cache, snake: Snake, newHead: Coord) {
  snake.body.push(newHead)
  addSnake(cell(cache, newHead).snakes, snake)
}

function moveSnake(cache: Cache, snake: Snake, direction: Direction) {
  const state = cache.state
  const next = nextCoord(head(snake), direction)
  const foodEaten = cell(cache, next).food
  if (foodEaten) {
    removeFood(cache, foodEaten)
  } else {
    removeTail(cache, snake)
  }

  addHead(cache, snake, next)
}

function moveSnakesForward(cache: Cache, turn: Turn) {
  for (const snakeId of Object.keys(turn)) {
    const dir = turn[snakeId]
    const snake = getSnake(cache.state, snakeId)
    if (!snake.dead) {
      moveSnake(cache, snake, dir)
    }
  }
}

function markDead(cache: Cache, snake: Snake) {
  if (!snake.dead) {
    snake.dead = true
    for (const part of snake.body) {
      uncacheSnakePart(cache, snake, part)
    }
  }
}

function markDeadSnakes(cache: Cache) {
  for (const snake of allSnakes(cache.state)) {
    if (snake.dead) {
      continue
    }

    for (const part of snake.body) {
      const c = cell(cache, part)
      if (cellContainsAnotherSnakesTail(cache, snake, c)) {
        markDead(cache, snake)
        break
      }

      const eatenSnakes = getSmallerSnakeHeads(cache, snake, c)
      for (const eaten of eatenSnakes) {
        markDead(cache, eaten)
      }
    }
  }
}

function isHead(c: Cell, snake: Snake) {
  return coordsEqual(c.coord, head(snake))
}

function getSmallerSnakeHeads(cache: Cache, snake: Snake, c: Cell) {
  return c.snakes.filter(other => other !== snake && isHead(c, other))
}

function cellContainsAnotherSnakesTail(
  cache: Cache,
  thisSnake: Snake,
  c: Cell
) {
  return c.snakes.some(other => other !== thisSnake && !isHead(c, other))
}

function advanceGame(cache: Cache, turn: Turn) {
  moveSnakesForward(cache, turn)
  markDeadSnakes(cache)
}

enum TestStatus {
  Pending = 'pending',
  Fail = 'fail',
  Success = 'success',
}

export class TestContext {
  tc: TestCase
  cache: Cache
  step = 0
  currentStatus = TestStatus.Pending
  client: TestClient
  viableSequences: Sequence[]

  constructor(tc: TestCase, client: TestClient) {
    this.tc = tc
    this.client = client
    this.cache = makeCache(this.tc.startState)
    this.viableSequences = this.tc.acceptableSequences
  }

  async advance() {
    if (this.done()) {
      throw new Error(
        'Cannot advance a test case that is already passed or failed'
      )
    }

    const yourActualMove = await this.client.move(this.cache.state)
    const turn = this.step++
    this.viableSequences = this.viableSequences.filter(
      seq => seq[turn][this.cache.state.you.id] === yourActualMove
    )

    if (this.viableSequences.length === 0) {
      // There are no matching acceptable sequences, so the test fails!
      this.currentStatus = TestStatus.Fail
      return
    }

    if (this.viableSequences.some(sv => sv.length === this.step)) {
      // One of the acceptable sequences has been satisfied, so the test passes!
      this.currentStatus = TestStatus.Success
      return
    }
  }

  done() {
    return this.currentStatus !== TestStatus.Pending
  }

  result() {
    return this.currentStatus
  }
}

export async function runTest(
  tc: TestCase,
  client: TestClient
): Promise<TestResult> {
  if (!tc.acceptableSequences.some(s => s.length > 0)) {
    throw new Error('Must have at least one sequence of non-zero length')
  }
  const context = new TestContext(tc, client)
  while (!context.done()) {
    await context.advance()
  }
  return { passed: context.result() === TestStatus.Success }
}
