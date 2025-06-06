import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCommonFitTable1749204019916 implements MigrationInterface {
    name = 'AddCommonFitTable1749204019916'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "common_fit" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "description" varchar NOT NULL, "shipId" integer NOT NULL, "modules" text NOT NULL, "activityProfileId" varchar NOT NULL)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "common_fit"`);
    }

}
