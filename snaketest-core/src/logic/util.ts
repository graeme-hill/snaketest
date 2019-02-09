import { Snake, Coord } from '../model/models'

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
