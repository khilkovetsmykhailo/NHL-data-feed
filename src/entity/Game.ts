import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import GamePlayer from "./GamePlayer";

@Entity("Game")
export default class Game {
  @PrimaryColumn()
  id: number;

  @Column({ type: "timestamp", nullable: true })
  date: string;

  @Column({ enum: ["Preview", "Live", "Final"] })
  state: string;

  @OneToMany(() => GamePlayer, (gamePlayer) => gamePlayer.game, { nullable: true })
  gameInfos?: GamePlayer[];
}
