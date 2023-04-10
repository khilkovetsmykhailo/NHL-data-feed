import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export default class Game {
  @PrimaryColumn()
  id: number;

  @Column("date")
  date: string;

  @Column({ enum: ["Preview", "Live", "Final"] })
  state: string;
}
