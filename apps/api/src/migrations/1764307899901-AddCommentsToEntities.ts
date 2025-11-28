import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommentsToEntities1764307899901 implements MigrationInterface {
  name = 'AddCommentsToEntities1764307899901';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON TABLE "ingredient" IS 'Raw ingredients used in recipes'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "recipe_item" IS 'Items (ingredients or sub-recipes) included in a recipe'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "recipe" IS 'Recipes containing instructions and ingredients'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "processing_method" IS 'Methods used for processing ingredients (e.g., Chopping, Boiling)'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "menu" IS 'Application navigation menu items'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "user" IS 'System users including chefs and staff'`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipe_item" DROP CONSTRAINT "FK_d796c97b5f39989242bbdb98020"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "ingredient"."id" IS 'Unique identifier for the ingredient'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "ingredient"."name" IS 'Name of the ingredient'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "ingredient"."price" IS 'Cost price per unit'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "ingredient"."unit" IS 'Unit of measurement (e.g., kg, g, ml)'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "ingredient"."nutrition" IS 'Nutritional information (e.g., protein, carbs)'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "ingredient"."createdAt" IS 'Record creation timestamp'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "ingredient"."updatedAt" IS 'Record last update timestamp'`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipe_item" DROP CONSTRAINT "FK_ca55b4103acde77f1261a7375a4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipe_item" DROP CONSTRAINT "FK_04f0905a5083aa0b63e1f7c7fa4"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe_item"."id" IS 'Unique identifier for the recipe item'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe_item"."quantity" IS 'Quantity required'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe_item"."yieldRate" IS 'Yield rate (e.g., 0.8 means 20% loss)'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe_item"."recipeId" IS 'Unique identifier for the recipe'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe_item"."ingredientId" IS 'Unique identifier for the ingredient'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe_item"."childRecipeId" IS 'Unique identifier for the recipe'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe"."id" IS 'Unique identifier for the recipe'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe"."name" IS 'Name of the recipe'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe"."steps" IS 'Step-by-step cooking instructions'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe"."preProcessing" IS 'Pre-processing steps required before cooking'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "processing_method"."id" IS 'Unique identifier for the processing method'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "processing_method"."name" IS 'Name of the processing method'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "processing_method"."description" IS 'Description of the processing technique'`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu" DROP CONSTRAINT "FK_23ac1b81a7bfb85b14e86bd23a5"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "menu"."id" IS 'Unique identifier for the menu item'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "menu"."title" IS 'Display title of the menu item'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "menu"."path" IS 'Navigation path/route'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "menu"."icon" IS 'Icon name for the menu item'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "menu"."order" IS 'Display order of the menu item'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "menu"."parentId" IS 'Unique identifier for the menu item'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "user"."id" IS 'Unique identifier for the user'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "user"."name" IS 'Full name of the user'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "user"."username" IS 'Unique username for login'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "user"."password" IS 'Hashed password'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "user"."role" IS 'User role (e.g., Head Chef, Sous Chef)'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "user"."status" IS 'Current status of the user (Active, On Leave, Terminated)'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "user"."hireDate" IS 'Date when the user was hired'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "user"."preferences" IS 'User UI preferences'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "user"."createdAt" IS 'Record creation timestamp'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "user"."updatedAt" IS 'Record last update timestamp'`,
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
    await queryRunner.query(
      `ALTER TABLE "menu" ADD CONSTRAINT "FK_23ac1b81a7bfb85b14e86bd23a5" FOREIGN KEY ("parentId") REFERENCES "menu"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "menu" DROP CONSTRAINT "FK_23ac1b81a7bfb85b14e86bd23a5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipe_item" DROP CONSTRAINT "FK_04f0905a5083aa0b63e1f7c7fa4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipe_item" DROP CONSTRAINT "FK_d796c97b5f39989242bbdb98020"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipe_item" DROP CONSTRAINT "FK_ca55b4103acde77f1261a7375a4"`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "user"."updatedAt" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."createdAt" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."preferences" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."hireDate" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."status" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."role" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."password" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."username" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."name" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."id" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "menu"."parentId" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "menu"."order" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "menu"."icon" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "menu"."path" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "menu"."title" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "menu"."id" IS NULL`);
    await queryRunner.query(
      `ALTER TABLE "menu" ADD CONSTRAINT "FK_23ac1b81a7bfb85b14e86bd23a5" FOREIGN KEY ("parentId") REFERENCES "menu"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "processing_method"."description" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "processing_method"."name" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "processing_method"."id" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe"."preProcessing" IS NULL`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "recipe"."steps" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "recipe"."name" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "recipe"."id" IS NULL`);
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe_item"."childRecipeId" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe_item"."ingredientId" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe_item"."recipeId" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe_item"."yieldRate" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe_item"."quantity" IS NULL`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "recipe_item"."id" IS NULL`);
    await queryRunner.query(
      `ALTER TABLE "recipe_item" ADD CONSTRAINT "FK_04f0905a5083aa0b63e1f7c7fa4" FOREIGN KEY ("childRecipeId") REFERENCES "recipe"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipe_item" ADD CONSTRAINT "FK_ca55b4103acde77f1261a7375a4" FOREIGN KEY ("recipeId") REFERENCES "recipe"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "ingredient"."updatedAt" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "ingredient"."createdAt" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "ingredient"."nutrition" IS NULL`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "ingredient"."unit" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "ingredient"."price" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "ingredient"."name" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "ingredient"."id" IS NULL`);
    await queryRunner.query(
      `ALTER TABLE "recipe_item" ADD CONSTRAINT "FK_d796c97b5f39989242bbdb98020" FOREIGN KEY ("ingredientId") REFERENCES "ingredient"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`COMMENT ON TABLE "user" IS NULL`);
    await queryRunner.query(`COMMENT ON TABLE "menu" IS NULL`);
    await queryRunner.query(`COMMENT ON TABLE "processing_method" IS NULL`);
    await queryRunner.query(`COMMENT ON TABLE "recipe" IS NULL`);
    await queryRunner.query(`COMMENT ON TABLE "recipe_item" IS NULL`);
    await queryRunner.query(`COMMENT ON TABLE "ingredient" IS NULL`);
  }
}
