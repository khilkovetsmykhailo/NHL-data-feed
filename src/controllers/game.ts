import { Request, Response } from "express";
import { Repository, In } from "typeorm";
import { AppDataSource } from "../data-source";
import Game from "../entity/Game";
import GamePlayer from "../entity/GamePlayer";

export default class GameController {
  private gameRepository: Repository<Game> = AppDataSource.getRepository(Game);
  private gamePlayerRepository: Repository<GamePlayer> = AppDataSource.getRepository(GamePlayer);

  constructor() {}

  async saveGames(games: Partial<Game>[]): Promise<void> {
    try {
      await this.gameRepository.upsert(games, ["id"]);
    } catch (e) {
      throw new Error("Saving games failed: " + (e as Error).message);
    }
  }

  async ingestGameData(gameInfos: Partial<GamePlayer>[]): Promise<void> {
    try {
      await this.gamePlayerRepository.upsert(gameInfos, ["playerId", "gameId"]);
    } catch (e) {
      throw new Error("Ingesting game info failed: " + (e as Error).message);
    }
  }

  async getGames(ids?: number[]): Promise<Game[]> {
    try {
      if (ids) {
        return await this.gameRepository.find({ where: { id: In(ids) } });
      } else {
        return await this.gameRepository.find();
      }
    } catch (e) {
      throw new Error("Getting games failed: " + (e as Error).message);
    }
  }

  async handleGetGames(req: Request, res: Response): Promise<void> {
    try {
      const games = await this.getGames();

      res.json(games);
    } catch (e) {
      console.log((e as Error).message);
    }
  }

  async handleGetGame(req: Request<{ id: number }>, res: Response): Promise<void> {
    const id = req.params.id;

    try {
      const game =
        (await this.gameRepository.findOne({ where: { id }, relations: { gameInfos: { player: true } } })) || {};

      res.json(game);
    } catch (e) {
      console.error((e as any).message);
    }
  }
}
