import * as express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import { AppDataSource } from "./data-source";
import { Routes } from "./routes";
import * as dotenv from "dotenv";
import NHLCronManager from "./jobs";

dotenv.config();

const port = process.env.PORT || 3000;

const nhlJobManager = new NHLCronManager();

AppDataSource.initialize()
  .then(async () => {
    nhlJobManager.start();

    // create express app
    const app = express();
    app.use(bodyParser.json());

    // register express routes from defined application routes
    Routes.forEach((route) => {
      (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
        const result = new (route.controller as any)()[route.action](req, res, next);
        if (result instanceof Promise) {
          result.then((result) => (result !== null && result !== undefined ? res.send(result) : undefined));
        } else if (result !== null && result !== undefined) {
          res.json(result);
        }
      });
    });

    app.get("/jobs", (req, res) => {
      res.json(nhlJobManager.listJobs());
    });

    app.get("/reload/season/:seasonId", (req, res) => {
      const season = req.params.seasonId;

      nhlJobManager.reloadSeason(season);

      res.json("Reloading started");
    });

    app.get("/reload/game/:gameId", (req, res) => {
      const game = req.params.gameId;

      nhlJobManager.reloadGame(parseInt(game));

      res.json("Reloading started");
    });

    app.listen(port);

    console.log(`Express server has started on port ${port}.`);
  })
  .catch((error) => console.log(error));
