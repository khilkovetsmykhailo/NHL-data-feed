import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateGamePlayerTable1681153307331 implements MigrationInterface {
    name = 'CreateGamePlayerTable1681153307331'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Game" ("id" integer NOT NULL, "date" date NOT NULL, "state" character varying NOT NULL, CONSTRAINT "PK_cce0ee17147c1830d09c19d4d56" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "GamePlayer" ("id" SERIAL NOT NULL, "playerId" integer NOT NULL, "gameId" integer NOT NULL, "teamId" integer NOT NULL, "teamName" character varying NOT NULL, "assists" integer NOT NULL, "playerNumber" integer NOT NULL, "playerPosition" character varying NOT NULL, "playerAge" integer NOT NULL, "goals" integer NOT NULL, "points" integer NOT NULL, "penaltyMinutes" integer NOT NULL, "opponentTeam" jsonb NOT NULL, CONSTRAINT "PK_6af35127303a1226cfb04d274cc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Player" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_c390d9968607986a5f038e3305e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "GamePlayer" ADD CONSTRAINT "FK_16a1c32c74d39d8e213dcb05fe3" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "GamePlayer" ADD CONSTRAINT "FK_cd85cdfbd45d83f38b487de6e35" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "GamePlayer" DROP CONSTRAINT "FK_cd85cdfbd45d83f38b487de6e35"`);
        await queryRunner.query(`ALTER TABLE "GamePlayer" DROP CONSTRAINT "FK_16a1c32c74d39d8e213dcb05fe3"`);
        await queryRunner.query(`DROP TABLE "Player"`);
        await queryRunner.query(`DROP TABLE "GamePlayer"`);
        await queryRunner.query(`DROP TABLE "Game"`);
    }

}
