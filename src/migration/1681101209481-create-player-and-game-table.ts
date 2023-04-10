import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePlayerAndGameTable1681101209481 implements MigrationInterface {
    name = 'CreatePlayerAndGameTable1681101209481'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "player" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_65edadc946a7faf4b638d5e8885" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "game" ("id" integer NOT NULL, "date" date NOT NULL, "state" character varying NOT NULL, CONSTRAINT "PK_352a30652cd352f552fef73dec5" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "game"`);
        await queryRunner.query(`DROP TABLE "player"`);
    }

}
