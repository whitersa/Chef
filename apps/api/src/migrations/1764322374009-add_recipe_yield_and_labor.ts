import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRecipeYieldAndLabor1764322374009 implements MigrationInterface {
  name = 'AddRecipeYieldAndLabor1764322374009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "recipe" ADD "yieldQuantity" numeric(10,4) NOT NULL DEFAULT '1'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe"."yieldQuantity" IS 'Quantity produced by this recipe (e.g., 4 portions, 2 kg)'`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipe" ADD "yieldUnit" character varying NOT NULL DEFAULT 'portion'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe"."yieldUnit" IS 'Unit of the yield (e.g., portion, kg, l)'`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipe" ADD "laborCost" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe"."laborCost" IS 'Estimated labor cost for this recipe'`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipe_version" ADD "yieldQuantity" numeric(10,4)`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipe_version" ADD "yieldUnit" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipe_version" ADD "laborCost" numeric(10,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "recipe_version" DROP COLUMN "laborCost"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipe_version" DROP COLUMN "yieldUnit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipe_version" DROP COLUMN "yieldQuantity"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe"."laborCost" IS 'Estimated labor cost for this recipe'`,
    );
    await queryRunner.query(`ALTER TABLE "recipe" DROP COLUMN "laborCost"`);
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe"."yieldUnit" IS 'Unit of the yield (e.g., portion, kg, l)'`,
    );
    await queryRunner.query(`ALTER TABLE "recipe" DROP COLUMN "yieldUnit"`);
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe"."yieldQuantity" IS 'Quantity produced by this recipe (e.g., 4 portions, 2 kg)'`,
    );
    await queryRunner.query(`ALTER TABLE "recipe" DROP COLUMN "yieldQuantity"`);
  }
}
