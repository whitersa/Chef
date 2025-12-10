import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePluginConfig1765274098346 implements MigrationInterface {
  name = 'CreatePluginConfig1765274098346';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "plugin_config" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pluginName" character varying NOT NULL, "baseFontFamily" character varying NOT NULL DEFAULT 'Serif', "titleFontFamily" character varying NOT NULL DEFAULT 'Sans', "titleColor" character varying NOT NULL DEFAULT '#2c3e50', "accentColor" character varying NOT NULL DEFAULT '#e67e22', "secondaryColor" character varying NOT NULL DEFAULT '#3498db', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_eb9f8936de4cdbf276721614838" UNIQUE ("pluginName"), CONSTRAINT "PK_5f7fe06e96e8d2c13f022245b6b" PRIMARY KEY ("id")); COMMENT ON COLUMN "plugin_config"."pluginName" IS 'Name of the plugin (e.g., com.chefos.pdf)'; COMMENT ON COLUMN "plugin_config"."baseFontFamily" IS 'Base font family for body text'; COMMENT ON COLUMN "plugin_config"."titleFontFamily" IS 'Font family for titles'; COMMENT ON COLUMN "plugin_config"."titleColor" IS 'Color for titles'; COMMENT ON COLUMN "plugin_config"."accentColor" IS 'Accent color for borders and highlights'; COMMENT ON COLUMN "plugin_config"."secondaryColor" IS 'Secondary color for context boxes'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "plugin_config" IS 'Configuration for DITA-OT plugins'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMENT ON TABLE "plugin_config" IS NULL`);
    await queryRunner.query(`DROP TABLE "plugin_config"`);
  }
}
