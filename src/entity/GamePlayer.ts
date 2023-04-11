import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Player from "./Player";
import Game from "./Game";

@Entity("GamePlayer")
export default class GamePlayer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  playerId: number;

  @Column()
  gameId: number;

  @Column()
  teamId: number;

  @Column()
  teamName: string;

  @Column()
  assists: number;

  @Column()
  playerNumber: number;

  @Column()
  playerPosition: string;

  @Column()
  playerAge: number;

  @Column()
  goals: number;

  @Column()
  points: number;

  @Column()
  penaltyMinutes: number;

  @ManyToOne(() => Player, (player) => player.playerGames)
  player: Player;

  @ManyToOne(() => Game, (game) => game.gameInfos)
  game: Game;
}
