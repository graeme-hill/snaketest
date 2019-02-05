import { GameState, Direction } from '../model/models'

export interface TestClient {
  move(baseUrl: string, state: GameState): Promise<Direction>
}
