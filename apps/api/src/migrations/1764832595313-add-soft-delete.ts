import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSoftDelete1764832595313 implements MigrationInterface {
  name = 'AddSoftDelete1764832595313';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "recipe" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe"."deletedAt" IS 'Deletion timestamp for soft delete'`,
    );
    await queryRunner.query(
      `ALTER TABLE "ingredient" ADD "deletedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "ingredient"."deletedAt" IS 'Deletion timestamp for soft delete'`,
    );
    await queryRunner.query(
      `ALTER TABLE "processing_method" ADD "deletedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "processing_method"."deletedAt" IS 'Deletion timestamp for soft delete'`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_menu" ADD "deletedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "sales_menu"."deletedAt" IS 'Deletion timestamp for soft delete'`,
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(
      `COMMENT ON COLUMN "user"."deletedAt" IS 'Deletion timestamp for soft delete'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "user"."deletedAt" IS 'Deletion timestamp for soft delete'`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deletedAt"`);
    await queryRunner.query(
      `COMMENT ON COLUMN "sales_menu"."deletedAt" IS 'Deletion timestamp for soft delete'`,
    );
    await queryRunner.query(`ALTER TABLE "sales_menu" DROP COLUMN "deletedAt"`);
    await queryRunner.query(
      `COMMENT ON COLUMN "processing_method"."deletedAt" IS 'Deletion timestamp for soft delete'`,
    );
    await queryRunner.query(
      `ALTER TABLE "processing_method" DROP COLUMN "deletedAt"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "ingredient"."deletedAt" IS 'Deletion timestamp for soft delete'`,
    );
    await queryRunner.query(`ALTER TABLE "ingredient" DROP COLUMN "deletedAt"`);
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe"."deletedAt" IS 'Deletion timestamp for soft delete'`,
    );
    await queryRunner.query(`ALTER TABLE "recipe" DROP COLUMN "deletedAt"`);
  }
}
