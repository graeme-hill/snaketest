import { GameState, Direction } from '../model/models'

export interface TestClient {
  move(state: GameState): Promise<Direction>
}
