import { Direction } from '../model/models'
import { fromAscii, variations } from './util'

describe('variations', () => {
  it('non-square board', () => {
    const normal0 = {
      key: 'asdf',
      acceptableSequences: [
        [
          { '0': Direction.Right, '1': Direction.Up },
          { '0': Direction.Up, '1': Direction.Up },
        ],
        [
          { '0': Direction.Down, '1': Direction.Up },
          { '0': Direction.Left, '1': Direction.Left },
        ],
      ],
      startState: fromAscii(`
_ v < _ _ _
_ > > v _ _
_ _ _ 0 v 1
_ _ _ _ > ^`),
    }

    const normal90 = {
      key: 'asdf',
      acceptableSequences: [
        [
          { '0': Direction.Down, '1': Direction.Right },
          { '0': Direction.Right, '1': Direction.Right },
        ],
        [
          { '0': Direction.Left, '1': Direction.Right },
          { '0': Direction.Up, '1': Direction.Up },
        ],
      ],
      startState: fromAscii(`
_ _ _ _
_ _ v <
_ _ v ^
_ 0 < _
v < _ _
> 1 _ _`),
    }

    const normal180 = {
      key: 'asdf',
      acceptableSequences: [
        [
          { '0': Direction.Left, '1': Direction.Down },
          { '0': Direction.Down, '1': Direction.Down },
        ],
        [
          { '0': Direction.Up, '1': Direction.Down },
          { '0': Direction.Right, '1': Direction.Right },
        ],
      ],
      startState: fromAscii(`
v < _ _ _ _
1 ^ 0 _ _ _
_ _ ^ < < _
_ _ _ > ^ _`),
    }

    const normal270 = {
      key: 'asdf',
      acceptableSequences: [
        [
          { '0': Direction.Up, '1': Direction.Left },
          { '0': Direction.Left, '1': Direction.Left },
        ],
        [
          { '0': Direction.Right, '1': Direction.Left },
          { '0': Direction.Down, '1': Direction.Down },
        ],
      ],
      startState: fromAscii(`
_ _ 1 <
_ _ > ^
_ > 0 _
v ^ _ _
> ^ _ _
_ _ _ _`),
    }

    const mirror0 = {
      key: 'asdf',
      acceptableSequences: [
        [
          { '0': Direction.Left, '1': Direction.Up },
          { '0': Direction.Up, '1': Direction.Up },
        ],
        [
          { '0': Direction.Down, '1': Direction.Up },
          { '0': Direction.Right, '1': Direction.Right },
        ],
      ],
      startState: fromAscii(`
_ _ _ > v _
_ _ v < < _
1 v 0 _ _ _
^ < _ _ _ _`),
    }

    const mirror90 = {
      key: 'asdf',
      acceptableSequences: [
        [
          { '0': Direction.Up, '1': Direction.Right },
          { '0': Direction.Right, '1': Direction.Right },
        ],
        [
          { '0': Direction.Left, '1': Direction.Right },
          { '0': Direction.Down, '1': Direction.Down },
        ],
      ],
      startState: fromAscii(`
> 1 _ _
^ < _ _
_ 0 < _
_ _ ^ v
_ _ ^ <
_ _ _ _`),
    }
    const mirror180 = {
      key: 'asdf',
      acceptableSequences: [
        [
          { '0': Direction.Right, '1': Direction.Down },
          { '0': Direction.Down, '1': Direction.Down },
        ],
        [
          { '0': Direction.Up, '1': Direction.Down },
          { '0': Direction.Left, '1': Direction.Left },
        ],
      ],
      startState: fromAscii(`
_ _ _ _ > v
_ _ _ 0 ^ 1
_ > > ^ _ _
_ ^ < _ _ _`),
    }
    const mirror270 = {
      key: 'asdf',
      acceptableSequences: [
        [
          { '0': Direction.Down, '1': Direction.Left },
          { '0': Direction.Left, '1': Direction.Left },
        ],
        [
          { '0': Direction.Right, '1': Direction.Left },
          { '0': Direction.Up, '1': Direction.Up },
        ],
      ],
      startState: fromAscii(`
_ _ _ _
> v _ _
^ v _ _
_ > 0 _
_ _ > v
_ _ 1 <`),
    }

    const myVariations = variations(normal0)
    expect(myVariations).toEqual([
      normal0,
      normal90,
      normal180,
      normal270,
      mirror0,
      mirror90,
      mirror180,
      mirror270,
    ])
  })
})

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
