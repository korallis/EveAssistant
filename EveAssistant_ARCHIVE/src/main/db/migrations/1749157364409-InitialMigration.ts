import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1749157364409 implements MigrationInterface {
    name = 'InitialMigration1749157364409'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "market_groups"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "skills"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "modules"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "ships"`);
        await queryRunner.query(`CREATE TABLE "ships" ("typeID" integer PRIMARY KEY NOT NULL, "typeName" varchar NOT NULL, "groupID" integer NOT NULL, "attributes" text NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "modules" ("typeID" integer PRIMARY KEY NOT NULL, "typeName" varchar NOT NULL, "effects" text NOT NULL, "requirements" text NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "skills" ("typeID" integer PRIMARY KEY NOT NULL, "typeName" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "market_groups" ("marketGroupID" integer PRIMARY KEY NOT NULL, "marketGroupName" varchar NOT NULL, "parentGroupID" integer)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "market_groups"`);
        await queryRunner.query(`DROP TABLE "skills"`);
        await queryRunner.query(`DROP TABLE "modules"`);
        await queryRunner.query(`DROP TABLE "ships"`);
    }

}
