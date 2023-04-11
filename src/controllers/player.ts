import { Repository } from "typeorm";
import Player from "../entity/Player";
import { AppDataSource } from "../data-source";

export default class PlayerController {
  private playerRepository: Repository<Player> = AppDataSource.getRepository(Player);

  async savePlayers(players: Partial<Player>[]): Promise<void> {
    try {
      await this.playerRepository.upsert(players, ["id"]);
    } catch (e) {
      throw new Error("Saving players failed" + (e as Error).message);
    }
  }
}
