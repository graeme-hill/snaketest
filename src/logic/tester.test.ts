import { TestContext, runTest } from './tester'
import { Direction, GameState } from '../model/models'
import { fromAscii } from './util'

class MockClient {
  directions: Direction[]
  turn: number

  constructor(directions: Direction[]) {
    this.directions = directions
    this.turn = 0
  }

  move(state: GameState): Promise<Direction> {
    const dir = this.directions[this.turn++]
    return Promise.resolve(dir)
  }
}

describe('runTest', () => {
  it('should succeed with valid moves', done => {
    const client = new MockClient([Direction.Up, Direction.Left])
    runTest(
      {
        key: 'asdf',
        startState: fromAscii('__\n>0'),
        acceptableSequences: [[{ '0': Direction.Up }, { '0': Direction.Left }]],
      },
      client
    ).then(
      res => {
        expect(res.passed).toBe(true)
        done()
      },
      err => {
        throw err
      }
    )
  })
  it('should throw with empty test case', done => {
    const client = new MockClient([])
    const run = runTest(
      {
        key: 'asdf',
        startState: fromAscii('__0'),
        acceptableSequences: [],
      },
      client
    ).then(
      () => {
        throw new Error('should have thrown an exception')
      },
      () => done()
    )
  })
})
