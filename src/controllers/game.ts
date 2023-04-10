import { Request, Response } from "express";
import { Repository, In } from "typeorm";
import { AppDataSource } from "../data-source";
import Game from "../entity/Game";

export default class GameController {
  private gameRepository: Repository<Game> = AppDataSource.getRepository(Game);

  constructor() {}

  async saveGames(games: Game[]): Promise<void> {
    try {
      await this.gameRepository.save(games);
    } catch (e) {
      console.log(e);
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
      throw e;
    }
  }

  async handleGetGames(req: Request, res: Response): Promise<void> {
    const games = await this.getGames();

    res.json(games);
  }
}
