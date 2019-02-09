export interface Coord {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Snake {
  id: string
  body: Coord[]
  health: number
  dead: boolean
}

export interface GameState {
  you: Snake
  enemies: Snake[]
  boardSize: Size
  food: Coord[]
}

export enum Direction {
  Up = 'up',
  Down = 'down',
  Left = 'left',
  Right = 'right',
}

export type Turn = { [key: string]: Direction }

export type Sequence = Turn[]

export interface TestCase {
  key: string
  startState: GameState
  acceptableSequences: Sequence[]
}

export interface TestResult {
  passed: boolean
}
