import { CronJob } from "cron";
import * as dotenv from "dotenv";
import Axios from "axios";
import { appendFileSync } from "fs";
import GameController from "../controllers/game";
import Game from "../entity/Game";

dotenv.config();

const GET_SCHEDULE = process.env.GET_SCHEDULE || "https://statsapi.web.nhl.com/api/v1/schedule/";
const GET_GAME = process.env.GET_GAME || "https://statsapi.web.nhl.com/api/v1/game/ID/boxscore/";
export default class NHLCronManager {
  private jobs: { [key: string]: CronJob } = {};
  private gameController: GameController;

  constructor() {
    this.gameController = new GameController();
    this.addJob("monitorSchedule", "*/2 * * * * *", this.monitorSchedule.bind(this));
  }

  async monitorSchedule() {
    try {
      const { data } = await Axios.get(GET_SCHEDULE);

      const games = data.dates.reduce((list: any, date: any) => {
        return [...list, ...date.games];
      }, []);

      const prevGames: { [key: string]: Game } = (
        await this.gameController.getGames(games.map((game: any) => game.gamePk))
      ).reduce((gamesObj, game) => {
        return { ...gamesObj, [game.id]: game };
      }, {});

      let newGames = [];

      for (let game of games) {
        const currentState = game.status.abstractGameState;

        if (!prevGames[game["gamePk"]]) {
          newGames.push({ id: game["gamePk"], state: currentState, date: game["gameDate"] });
        } else {
          const currentState = game.status.abstractGameState;

          if (prevGames[game["gamePk"]].state === currentState) {
            continue;
          }
        }

        if (currentState === "Live" && !this.jobs[`ingest-${game["gamePk"]}`]) {
          this.addJob(`ingest-${game["gamePk"]}`, "*/2 * * * * *", this.ingestGame.bind(this, game["gamePk"])); // Tried to check every second but looked like there was rate limit
          this.jobs[`ingest-${game["gamePk"]}`].start();
          appendFileSync("output.log", `Game ${game["gamePk"]} has started` + "\n");
        } else if (currentState === "Final") {
          this.removeJob(`ingest-${game["gamePk"]}`);
          appendFileSync("output.log", `Game ${game["gamePk"]} has finished` + "\n");
        }
      }

      await this.gameController.saveGames(newGames);
    } catch (e) {
      console.log(e);
    }
  }

  async ingestGame(id: string) {
    try {
      const { data } = await Axios.get(GET_GAME.replace("ID", id));

      const gameInfos = [...data.teams.away.players, ...data.teams.home.players]
        .filter((player) => player.position.code !== "N/A")
        .map((player) => ({
          playerId: player.person.id,
          gameId: Number(id),
          teamId: player.person.currentTeam.id,
          teamName: player.person.currentTeam.name,
          playerAge: player.person.currentAge,
          playerNumber: player.jerseyNumber,
          playerPosition: player.position.name,
          assists: player.stats.skaterStats.assists,
          goals: player.stats.skaterStats.goals,
          points: player.stats.skaterStats.points,
          penaltyMinutes: player.stats.skaterStats.penaltyMinutes,
        }));

      this.gameController.ingestGameData(gameInfos);
    } catch (e) {
      throw e;
    }
  }

  private addJob(name: string, schedule: string, callback: () => void): void {
    const job = new CronJob(schedule, callback);
    this.jobs[name] = job;
  }

  private removeJob(name: string): void {
    const job: CronJob = this.jobs[name];
    if (job) {
      job.stop();
      delete this.jobs[name];
    }
  }

  public listJobs(): { name: string; schedule: string }[] {
    const jobs = [];
    for (const name in this.jobs) {
      const job = this.jobs[name];
      jobs.push({ name, schedule: job.nextDate().toLocaleString() });
    }

    return jobs;
  }

  public start(): void {
    this.jobs["monitorSchedule"].start();
  }

  public stop(): void {
    for (const name in this.jobs) {
      this.jobs[name].stop();
    }
  }
}
