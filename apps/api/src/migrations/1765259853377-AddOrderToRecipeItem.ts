import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderToRecipeItem1765259853377 implements MigrationInterface {
  name = 'AddOrderToRecipeItem1765259853377';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "recipe_item" ADD "order" integer NOT NULL DEFAULT '0'`);
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe_item"."order" IS 'Display order of the item'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe_item"."order" IS 'Display order of the item'`,
    );
    await queryRunner.query(`ALTER TABLE "recipe_item" DROP COLUMN "order"`);
  }
}
