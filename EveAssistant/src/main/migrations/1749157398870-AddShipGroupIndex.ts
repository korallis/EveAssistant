import { MigrationInterface, QueryRunner } from "typeorm";

export class AddShipGroupIndex1749157398870 implements MigrationInterface {
    name = 'AddShipGroupIndex1749157398870'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_8e973f656d1e841c6cd8457d59" ON "ships" ("groupID") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_8e973f656d1e841c6cd8457d59"`);
    }

}
