import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import GamePlayer from "./GamePlayer";

@Entity("Player")
export default class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => GamePlayer, (gamePlayer) => gamePlayer.player)
  playerGames: GamePlayer[];
}
