import { Request, Response } from "express";
import { Repository } from "typeorm";
import Player from "../entity/Player";
import { AppDataSource } from "../data-source";
import GamePlayer from "../entity/GamePlayer";

export default class PlayerController {
  private playerRepository: Repository<Player> = AppDataSource.getRepository(Player);
  private gamePlayerRepository: Repository<GamePlayer> = AppDataSource.getRepository(GamePlayer);

  async savePlayers(players: Partial<Player>[]): Promise<void> {
    try {
      await this.playerRepository.upsert(players, ["id"]);
    } catch (e) {
      throw new Error("Saving players failed" + (e as Error).message);
    }
  }

  async handleGetPlayerGames(req: Request<{ id: number }>, res: Response): Promise<void> {
    const id = req.params.id;

    try {
      const games = await this.playerRepository.findOne({ where: { id }, relations: { playerGames: { game: true } } });

      res.json(games);
    } catch (e) {
      console.log((e as any).message);
    }
  }

  async handleGetPlayerGame(req: Request<{ playerId: number; gameId: number }>, res: Response): Promise<void> {
    const playerId = req.params.playerId;
    const gameId = req.params.gameId;

    try {
      const play = await this.gamePlayerRepository.findOne({
        where: { playerId: playerId, gameId: gameId },
        relations: { game: true, player: true },
      });

      res.json(play);
    } catch (e) {
      console.log((e as any).message);
    }
  }
}
