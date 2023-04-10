import { Request, Response } from "express";
import { Repository } from "typeorm";
import Game from "entity/Game";
import { AppDataSource } from "data-source";

export default class GameController {
  private gameRepository: Repository<Game> = AppDataSource.getRepository(Game);

  async saveGames(games: Game[]): Promise<void> {
    try {
      await this.gameRepository.save(games);
    } catch (e) {
      console.log(e.message);
    }
  }

  async getGames(req: Request, res: Response): Promise<void> {
    try {
      const games = await this.gameRepository.find();

      res.json(games);
    } catch (e) {
      console.log(e.message);
    }
  }
}
