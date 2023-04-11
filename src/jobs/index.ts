import { CronJob } from "cron";
import * as dotenv from "dotenv";
import Axios from "axios";
import { appendFileSync } from "fs";
import GameController from "../controllers/game";
import Game from "../entity/Game";
import PlayerController from "../controllers/player";

dotenv.config();

const GET_SCHEDULE = process.env.GET_SCHEDULE || "https://statsapi.web.nhl.com/api/v1/schedule/";
const GET_GAME = process.env.GET_GAME || "https://statsapi.web.nhl.com/api/v1/game/ID/boxscore/";
export default class NHLCronManager {
  private jobs: { [key: string]: CronJob } = {};
  private gameController: GameController;
  private playerController: PlayerController;

  constructor() {
    this.gameController = new GameController();
    this.playerController = new PlayerController();
    this.addJob("monitorSchedule", "*/2 * * * * *", this.monitorSchedule.bind(this));
  }

  async monitorSchedule() {
    try {
      const { data } = await Axios.get(GET_SCHEDULE);

      const games = data.dates.reduce((list: any, date: any) => {
        return [
          ...list,
          ...date.games.map(({ gamePk, gameDate, status: { abstractGameState } }: any) => ({
            id: gamePk,
            date: gameDate,
            state: abstractGameState,
          })),
        ];
      }, []);

      const prevGames: { [key: string]: Game } = (
        await this.gameController.getGames(games.map((game: any) => game.gamePk))
      ).reduce((gamesObj, game) => {
        return { ...gamesObj, [game.id]: game };
      }, {});

      for (let game of games) {
        const currentState = game.state;

        if (prevGames[game.id] && prevGames[game.id].state === currentState) {
          continue;
        }

        const jobName = `ingest-${game.id}`;

        if (currentState === "Live" && !this.jobs[jobName]) {
          this.addJob(jobName, "*/10 * * * * *", this.ingestGame.bind(this, game.id)); // Tried to check every second but looked like there was rate limit
          this.jobs[jobName].start();
          appendFileSync("output.log", `Game ${game.id} has started` + "\n");
        } else if (currentState === "Final" && this.jobs[jobName]) {
          this.removeJob(jobName);
          appendFileSync("output.log", `Game ${game.id} has finished` + "\n");
        }
      }

      await this.gameController.saveGames(games);
    } catch (e) {
      console.log(`Monitoring schedule failed:` + (e as Error).message);
    }
  }

  async ingestGame(id: string) {
    try {
      const { data } = await Axios.get(GET_GAME.replace("ID", id));

      const gameInfos = Object.values<any>({ ...data.teams.away.players, ...data.teams.home.players })
        .filter((player) => player.position.code !== "N/A")
        .map((player) => ({
          player: { id: player.person.id, name: player.person.fullName },
          playerId: player.person.id,
          gameId: Number(id),
          teamId: player.person.currentTeam.id,
          teamName: player.person.currentTeam.name,
          playerAge: player.person.currentAge,
          playerNumber: player.jerseyNumber,
          playerPosition: player.position.name,
          assists: player.stats?.skaterStats?.assists,
          goals: player.stats?.skaterStats?.goals,
          points: player.stats?.skaterStats?.points,
          penaltyMinutes: player.stats?.skaterStats?.penaltyMinutes,
        }));

      const players = gameInfos.map(({ player }) => player);

      await this.playerController.savePlayers(players);
      this.gameController.ingestGameData(gameInfos);
    } catch (e) {
      console.log(`Ingesting game-${id} failed:` + (e as Error).message);
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
