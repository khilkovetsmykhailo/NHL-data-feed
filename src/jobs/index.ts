import { CronJob } from "cron";
import * as dotenv from "dotenv";
import Axios from "axios";
import { appendFileSync } from "fs";
import GameController from "../controllers/game";
import Game from "../entity/Game";
import PlayerController from "../controllers/player";
import { NHLGameInfoResponse, NHLScheduleResponse, NHLSeason } from "./types";

dotenv.config();

const GET_SCHEDULE = process.env.GET_SCHEDULE || "https://statsapi.web.nhl.com/api/v1/schedule/";
const GET_GAME = process.env.GET_GAME || "https://statsapi.web.nhl.com/api/v1/game/ID/boxscore/";
const GET_SEASONS = process.env.GET_SEASONS || "https://statsapi.web.nhl.com/api/v1/seasons";
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
      const res = await Axios.get<NHLScheduleResponse>(GET_SCHEDULE);

      const data = res.data;
      const games = data.dates.reduce<Game[]>((list, date) => {
        return [
          ...list,
          ...date.games.map(({ gamePk, gameDate, status: { abstractGameState } }) => ({
            id: gamePk,
            date: gameDate,
            state: abstractGameState,
          })),
        ];
      }, []);

      const prevGames: { [key: string]: Game } = (
        await this.gameController.getGames(games.map((game) => game.id))
      ).reduce((gamesObj, game) => {
        return { ...gamesObj, [game.id]: game };
      }, {});

      for (let game of games) {
        const currentState = game.state;
        const jobName = `ingest-${game.id}`;

        if (currentState === "Live" && !this.jobs[jobName]) {
          this.addJob(jobName, "*/5 * * * * *", this.ingestGame.bind(this, game.id));
          this.jobs[jobName].start();
          appendFileSync("output.log", `Game ${game.id} has started` + "\n");
        }

        if (prevGames[game.id] && prevGames[game.id].state === currentState) {
          continue;
        } else if (currentState === "Final" && this.jobs[jobName]) {
          this.removeJob(jobName);
          appendFileSync("output.log", `Game ${game.id} has finished` + "\n");
        }
      }

      await this.gameController.saveGames(games);
    } catch (e) {
      appendFileSync("output.log", `Monitoring schedule failed:` + (e as Error).message + "\n");
    }
  }

  async ingestGame(id: number) {
    try {
      const { data } = await Axios.get<NHLGameInfoResponse>(GET_GAME.replace("ID", id.toString()));

      const gameInfos = Object.values({ ...data.teams.away.players, ...data.teams.home.players })
        .filter((player) => player.position.code !== "N/A")
        .map((player) => ({
          player: { id: player.person.id, name: player.person.fullName },
          playerId: player.person.id,
          gameId: id,
          teamId: player.person.currentTeam.id,
          teamName: player.person.currentTeam.name,
          playerAge: player.person.currentAge,
          playerNumber: Number(player.jerseyNumber),
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
      appendFileSync("output.log", `Ingesting game-${id} failed:` + (e as Error).message);
    }
  }

  async reloadSeason(season: string) {
    try {
      const { data: seasonData } = await Axios.get<{ seasons: NHLSeason[] }>(GET_SEASONS + season);

      const { data: schedules } = await Axios.get<NHLScheduleResponse>(GET_SCHEDULE, {
        params: {
          startDate: seasonData.seasons[0].regularSeasonStartDate,
          endDate: seasonData.seasons[0].seasonEndDate,
        },
      });

      let games: Game[] = [];

      for (let date of schedules.dates) {
        for (let game of date.games) {
          games.push({ id: game.gamePk, date: game.gameDate, state: game.status.abstractGameState });
          this.ingestGame(game.gamePk);
        }
      }

      this.gameController.saveGames(games);
    } catch (e) {
      appendFileSync("output.log", `Reloading season-${season} failed:` + (e as Error).message + "\n");
    }
  }

  async reloadGame(id: number) {
    this.ingestGame(id);
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
