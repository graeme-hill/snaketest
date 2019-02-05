import {
  TestCase,
  TestResult,
  Direction,
  GameState,
  Turn,
  Snake,
  Coord,
} from '../model/models'
import { TestClient } from '../io/client'

function getSnake(state: GameState, id: string) {
  return state.you.id === id ? state.you : state.enemies.find(e => e.id === id)
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

function equalCoords(a: Coord, b: Coord) {
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

function moveSnake(state: GameState, snake: Snake, direction: Direction) {
  const next = nextCoord(head(snake), direction)
  const foodEaten = state.food.find(f => equalCoords(f, next))
  if (foodEaten) {
    // remove this food from the board
    state.food = state.food.filter(f => f !== foodEaten)
  } else {
    // didn't eat so remove last tail part
    snake.body.pop()
  }

  // move head into new spot
  snake.body.push(next)
}

function advanceGameState(state: GameState, turn: Turn) {
  for (const snakeId of Object.keys(turn)) {
    const dir = turn[snakeId]
    const snake = getSnake(state, snakeId)
    moveSnake(state, snake, dir)
  }
}

export class TestContext {
  tc: TestCase

  constructor(tc: TestCase) {
    this.tc = tc
  }

  advance(dir: Direction) {}

  result() {}
}

export async function runTest(
  tc: TestCase,
  baseUrl: string,
  client: TestClient
): Promise<TestResult> {
  const context = new TestContext(tc)
  while (!context.done()) {
    const direction = await client.move(baseUrl, tc.startState)
    context.advance(direction)
  }
  return context.result()
}
