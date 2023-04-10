import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export default class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
