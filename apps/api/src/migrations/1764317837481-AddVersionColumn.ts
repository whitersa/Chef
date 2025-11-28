import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVersionColumn1764317837481 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ingredient" ADD COLUMN IF NOT EXISTS "version" integer NOT NULL DEFAULT '1'`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipe" ADD COLUMN IF NOT EXISTS "version" integer NOT NULL DEFAULT '1'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "recipe" DROP COLUMN "version"`);
    await queryRunner.query(`ALTER TABLE "ingredient" DROP COLUMN "version"`);
  }
}
