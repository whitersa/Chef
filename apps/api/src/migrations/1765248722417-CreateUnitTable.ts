import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUnitTable1765248722417 implements MigrationInterface {
  name = 'CreateUnitTable1765248722417';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "unit" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "abbreviation" character varying, "description" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_5618100486bb99d78de022e5829" UNIQUE ("name"), CONSTRAINT "PK_4252c4be609041e559f0c80f58a" PRIMARY KEY ("id")); COMMENT ON COLUMN "unit"."name" IS 'Name of the unit (e.g., Kilogram, Piece)'; COMMENT ON COLUMN "unit"."abbreviation" IS 'Abbreviation (e.g., kg, pcs)'; COMMENT ON COLUMN "unit"."description" IS 'Description of the unit'`,
    );
    await queryRunner.query(`COMMENT ON TABLE "unit" IS 'Units of measurement'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMENT ON TABLE "unit" IS NULL`);
    await queryRunner.query(`DROP TABLE "unit"`);
  }
}
