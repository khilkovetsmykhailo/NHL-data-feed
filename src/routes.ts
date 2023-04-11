import GameController from "./controllers/game";
import PlayerController from "./controllers/player";

export const Routes: Array<{ method: string; route: string; controller: any; action: string }> = [
  {
    route: "/games",
    method: "get",
    controller: GameController,
    action: "handleGetGames",
  },
  {
    route: "/games/:id",
    method: "get",
    controller: GameController,
    action: "handleGetGame",
  },
  {
    route: "/players/:id/games",
    method: "get",
    controller: PlayerController,
    action: "handleGetPlayerGames",
  },
  {
    route: "/players/:playerId/games/:gameId/",
    method: "get",
    controller: PlayerController,
    action: "handleGetPlayerGame",
  },
  {
    route: "/games/:gameId/players/:playerId/",
    method: "get",
    controller: PlayerController,
    action: "handleGetPlayerGame",
  },
];
