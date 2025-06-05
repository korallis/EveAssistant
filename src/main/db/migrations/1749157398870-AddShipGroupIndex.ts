import { MigrationInterface, QueryRunner } from "typeorm";

export class AddShipGroupIndex1749157398870 implements MigrationInterface {
    name = 'AddShipGroupIndex1749157398870'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ships" ("typeID" integer PRIMARY KEY NOT NULL, "typeName" varchar NOT NULL, "groupID" integer NOT NULL, "attributes" text NOT NULL)`);
        await queryRunner.query(`CREATE INDEX "IDX_8e973f656d1e841c6cd8457d59" ON "ships" ("groupID") `);
        await queryRunner.query(`CREATE TABLE "modules" ("typeID" integer PRIMARY KEY NOT NULL, "typeName" varchar NOT NULL, "effects" text NOT NULL, "requirements" text NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "skills" ("typeID" integer PRIMARY KEY NOT NULL, "typeName" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "market_groups" ("marketGroupID" integer PRIMARY KEY NOT NULL, "marketGroupName" varchar NOT NULL, "parentGroupID" integer)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "market_groups"`);
        await queryRunner.query(`DROP TABLE "skills"`);
        await queryRunner.query(`DROP TABLE "modules"`);
        await queryRunner.query(`DROP INDEX "IDX_8e973f656d1e841c6cd8457d59"`);
        await queryRunner.query(`DROP TABLE "ships"`);
    }

}
