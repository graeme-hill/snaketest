import { fromAscii } from './util'

describe('fromAscii', () => {
  it('should fail on non-square board', () => {
    expect(() => {
      fromAscii(`
_  _  _
_  _  _  _
_  _  _`)
    }).toThrow()
  })

  it('should fail on empty board', () => {
    expect(() => {
      fromAscii(``)
    }).toThrow()
  })

  it('should fail with no snakes', () => {
    expect(() => {
      fromAscii(`
_  _  _
_  _  _
_  _  _`)
    }).toThrow()
  })

  it('should fail with no you', () => {
    expect(() => {
      fromAscii(`
_  _  v
_  _  1
_  _  _`)
    }).toThrow()
  })

  it('should load with only you', () => {
    const state = fromAscii(`
_  _  v
_  _  0
_  _  _
_  _  _`)
    expect(state).toEqual({
      you: {
        body: [{ x: 2, y: 1 }, { x: 2, y: 0 }],
        id: '0',
        health: 100,
        dead: false,
      },
      enemies: [],
      boardSize: { width: 3, height: 4 },
      food: [],
    })
  })

  it('should load with multiple snakes', () => {
    const state = fromAscii(`
_  _  v
>  v  0
_  v  _
_  >  a`)
    expect(state).toEqual({
      you: {
        body: [{ x: 2, y: 1 }, { x: 2, y: 0 }],
        id: '0',
        health: 100,
        dead: false,
      },
      enemies: [
        {
          body: [
            { x: 2, y: 3 },
            { x: 1, y: 3 },
            { x: 1, y: 2 },
            { x: 1, y: 1 },
            { x: 0, y: 1 },
          ],
          id: 'a',
          health: 100,
          dead: false,
        },
      ],
      boardSize: { width: 3, height: 4 },
      food: [],
    })
  })

  it('should load food', () => {
    const state = fromAscii(`
_  *  _
0  <  _
_  _  _
_  _  *`)
    expect(state).toEqual({
      you: {
        body: [{ x: 0, y: 1 }, { x: 1, y: 1 }],
        id: '0',
        health: 100,
        dead: false,
      },
      enemies: [],
      boardSize: { width: 3, height: 4 },
      food: [{ x: 1, y: 0 }, { x: 2, y: 3 }],
    })
  })
})
