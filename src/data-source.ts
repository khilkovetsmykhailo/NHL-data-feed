import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import Player from "./entity/Player";
import Game from "./entity/Game";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "test",
  synchronize: true,
  logging: false,
  entities: [Player, Game],
  migrations: [__dirname + "/migration/**/*.ts"],
  subscribers: [],
});
