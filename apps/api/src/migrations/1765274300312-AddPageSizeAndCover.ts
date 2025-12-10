import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPageSizeAndCover1765274300312 implements MigrationInterface {
  name = 'AddPageSizeAndCover1765274300312';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "plugin_config" ADD "pageWidth" character varying NOT NULL DEFAULT '210mm'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "plugin_config"."pageWidth" IS 'Page width (e.g., 210mm)'`,
    );
    await queryRunner.query(
      `ALTER TABLE "plugin_config" ADD "pageHeight" character varying NOT NULL DEFAULT '297mm'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "plugin_config"."pageHeight" IS 'Page height (e.g., 297mm)'`,
    );
    await queryRunner.query(`ALTER TABLE "plugin_config" ADD "coverImage" character varying`);
    await queryRunner.query(
      `COMMENT ON COLUMN "plugin_config"."coverImage" IS 'Filename of the cover image'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "plugin_config"."coverImage" IS 'Filename of the cover image'`,
    );
    await queryRunner.query(`ALTER TABLE "plugin_config" DROP COLUMN "coverImage"`);
    await queryRunner.query(
      `COMMENT ON COLUMN "plugin_config"."pageHeight" IS 'Page height (e.g., 297mm)'`,
    );
    await queryRunner.query(`ALTER TABLE "plugin_config" DROP COLUMN "pageHeight"`);
    await queryRunner.query(
      `COMMENT ON COLUMN "plugin_config"."pageWidth" IS 'Page width (e.g., 210mm)'`,
    );
    await queryRunner.query(`ALTER TABLE "plugin_config" DROP COLUMN "pageWidth"`);
  }
}
