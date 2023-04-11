import { Entity, PrimaryGeneratedColumn, Column, OneToMany, PrimaryColumn } from "typeorm";
import GamePlayer from "./GamePlayer";

@Entity("Player")
export default class Player {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => GamePlayer, (gamePlayer) => gamePlayer.player)
  playerGames?: GamePlayer[];
}
