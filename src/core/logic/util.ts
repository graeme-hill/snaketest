import {
  GameState,
  Snake,
  Coord,
  Direction,
  TestCase,
  Size,
  Turn,
} from '../model/models'

type CoordTranslation = (coord: Coord, size: Size) => Coord
type SizeTranslation = (size: Size) => Size

export function deepCopy(state: GameState) {
  return JSON.parse(JSON.stringify(state)) as GameState
}

export function allSnakes(state: GameState) {
  return [state.you].concat(state.enemies)
}

export function variations(normal0: TestCase) {
  const normal90 = rotate(normal0)
  const normal180 = rotate(normal90)
  const normal270 = rotate(normal180)
  const mirrored0 = mirror(normal0)
  const mirrored90 = rotate(mirrored0)
  const mirrored180 = rotate(mirrored90)
  const mirrored270 = rotate(mirrored180)

  return [
    normal0,
    normal90,
    normal180,
    normal270,
    mirrored0,
    mirrored90,
    mirrored180,
    mirrored270,
  ]
}

function replaceDirections(turn: Turn, map: { [key: string]: Direction }) {
  const result = { ...turn }
  for (const id in result) {
    result[id] = map[result[id]]
  }
  return result
}

function mutate(
  tc: TestCase,
  dirMap: { [key: string]: Direction },
  translateCoord: CoordTranslation,
  translateSize: SizeTranslation
) {
  const newState = deepCopy(tc.startState)
  for (const snake of allSnakes(newState)) {
    snake.body = snake.body.map(part =>
      translateCoord(part, tc.startState.boardSize)
    )
  }
  newState.food = newState.food.map(f =>
    translateCoord(f, tc.startState.boardSize)
  )
  newState.boardSize = translateSize(newState.boardSize)

  const newSequences = tc.acceptableSequences.map(s =>
    s.map(t => replaceDirections(t, dirMap))
  )

  return {
    key: tc.key,
    startState: newState,
    acceptableSequences: newSequences,
  }
}

// Rotates the given board and turn sequences 90 degrees clockwise
function rotate(tc: TestCase) {
  const dirMap = {
    [Direction.Up]: Direction.Right,
    [Direction.Right]: Direction.Down,
    [Direction.Down]: Direction.Left,
    [Direction.Left]: Direction.Up,
  }

  const translateCoord = (coord: Coord, size: Size) => ({
    x: size.height - coord.y - 1,
    y: coord.x,
  })

  const translateSize = (size: Size) => ({
    width: size.height,
    height: size.width,
  })

  return mutate(tc, dirMap, translateCoord, translateSize)
}

// Mirrors the given board and turn sequences over y axis (ie: flip such that
// the things that were on the left pointing right are now on the right
// pointing left).
function mirror(tc: TestCase) {
  const dirMap = {
    [Direction.Up]: Direction.Up,
    [Direction.Right]: Direction.Left,
    [Direction.Down]: Direction.Down,
    [Direction.Left]: Direction.Right,
  }

  const translateCoord = (coord: Coord, size: Size) => ({
    x: size.width - coord.x - 1,
    y: coord.y,
  })

  const translateSize = (size: Size) => ({ ...size })

  return mutate(tc, dirMap, translateCoord, translateSize)
}

export function fromAscii(ascii: string) {
  const lines = ascii
    .split('\n')
    .map(l => l.replace(/\s/g, '').toLowerCase())
    .filter(l => l.length > 0)

  if (lines.length === 0) {
    throw new Error('board must have at least one row')
  }

  const width = Math.max.apply(null, lines.map(l => l.length))
  const height = lines.length

  if (lines.some(l => l.length !== width)) {
    throw new Error('all rows in board must be the same width')
  }

  const snakes: { [key: string]: Snake } = {}
  const food: Coord[] = []

  function buildSnakeBody(body: Coord[]): Coord[] {
    const coord = body[body.length - 1]
    const up = coord.y > 0 && lines[coord.y - 1][coord.x]
    const down = coord.y < lines.length - 1 && lines[coord.y + 1][coord.x]
    const left = lines[coord.y][coord.x - 1]
    const right = lines[coord.y][coord.x + 1]

    if (up === 'v') {
      body.push({ x: coord.x, y: coord.y - 1 })
    } else if (down === '^') {
      body.push({ x: coord.x, y: coord.y + 1 })
    } else if (left === '>') {
      body.push({ x: coord.x - 1, y: coord.y })
    } else if (right === '<') {
      body.push({ x: coord.x + 1, y: coord.y })
    } else {
      return body
    }

    return buildSnakeBody(body)
  }

  function buildSnake(id: string, coord: Coord) {
    const body = buildSnakeBody([coord])
    return {
      body,
      id,
      health: 100,
      dead: false,
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const ch = lines[y][x]
      if (!~'_<>v^*'.indexOf(ch)) {
        snakes[ch] = buildSnake(ch, { x, y })
      } else if (ch === '*') {
        food.push({ x, y })
      }
    }
  }

  if (!snakes[0]) {
    throw new Error('must have a snake with ID 0')
  }

  return {
    you: snakes[0],
    enemies: Object.keys(snakes)
      .filter(id => id !== '0')
      .map(id => snakes[id]),
    boardSize: { width, height },
    food,
  }
}
