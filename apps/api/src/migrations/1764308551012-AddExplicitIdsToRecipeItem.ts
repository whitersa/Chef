import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExplicitIdsToRecipeItem1764308551012
  implements MigrationInterface
{
  name = 'AddExplicitIdsToRecipeItem1764308551012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "recipe_item" DROP CONSTRAINT "FK_ca55b4103acde77f1261a7375a4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipe_item" DROP CONSTRAINT "FK_d796c97b5f39989242bbdb98020"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipe_item" DROP CONSTRAINT "FK_04f0905a5083aa0b63e1f7c7fa4"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe_item"."recipeId" IS 'ID of the parent recipe'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe_item"."ingredientId" IS 'ID of the ingredient (if applicable)'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe_item"."childRecipeId" IS 'ID of the child recipe (if applicable)'`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipe_item" ADD CONSTRAINT "FK_ca55b4103acde77f1261a7375a4" FOREIGN KEY ("recipeId") REFERENCES "recipe"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipe_item" ADD CONSTRAINT "FK_d796c97b5f39989242bbdb98020" FOREIGN KEY ("ingredientId") REFERENCES "ingredient"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipe_item" ADD CONSTRAINT "FK_04f0905a5083aa0b63e1f7c7fa4" FOREIGN KEY ("childRecipeId") REFERENCES "recipe"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "recipe_item" DROP CONSTRAINT "FK_04f0905a5083aa0b63e1f7c7fa4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipe_item" DROP CONSTRAINT "FK_d796c97b5f39989242bbdb98020"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipe_item" DROP CONSTRAINT "FK_ca55b4103acde77f1261a7375a4"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe_item"."childRecipeId" IS 'Unique identifier for the recipe'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe_item"."ingredientId" IS 'Unique identifier for the ingredient'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe_item"."recipeId" IS 'Unique identifier for the recipe'`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipe_item" ADD CONSTRAINT "FK_04f0905a5083aa0b63e1f7c7fa4" FOREIGN KEY ("childRecipeId") REFERENCES "recipe"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipe_item" ADD CONSTRAINT "FK_d796c97b5f39989242bbdb98020" FOREIGN KEY ("ingredientId") REFERENCES "ingredient"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipe_item" ADD CONSTRAINT "FK_ca55b4103acde77f1261a7375a4" FOREIGN KEY ("recipeId") REFERENCES "recipe"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
