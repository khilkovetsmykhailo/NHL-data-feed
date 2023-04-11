import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Player from "./Player";
import Game from "./Game";

@Entity("GamePlayer")
@Index(["playerId", "gameId"], { unique: true })
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

  @Column({ nullable: true })
  assists: number;

  @Column()
  playerNumber: number;

  @Column()
  playerPosition: string;

  @Column()
  playerAge: number;

  @Column({ nullable: true })
  goals: number;

  @Column({ nullable: true })
  points: number;

  @Column({ nullable: true })
  penaltyMinutes: number;

  @ManyToOne(() => Player, (player) => player.playerGames)
  player: Player;

  @ManyToOne(() => Game, (game) => game.gameInfos)
  game: Game;
}
