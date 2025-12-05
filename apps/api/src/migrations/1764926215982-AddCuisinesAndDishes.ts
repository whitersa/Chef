import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCuisinesAndDishes1764926215982 implements MigrationInterface {
  name = 'AddCuisinesAndDishes1764926215982';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_recipe_steps"`);
    await queryRunner.query(
      `CREATE TABLE "cuisine" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, CONSTRAINT "UQ_8f8b44f48e1c6b86cd61428822b" UNIQUE ("name"), CONSTRAINT "PK_d4c1e9427b94335350fecaf238e" PRIMARY KEY ("id")); COMMENT ON COLUMN "cuisine"."name" IS 'Name of the cuisine'; COMMENT ON COLUMN "cuisine"."description" IS 'Description of the cuisine'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "cuisine" IS 'Culinary traditions or styles (e.g., Sichuan, Cantonese)'`,
    );
    await queryRunner.query(
      `CREATE TABLE "dish" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "imageUrl" character varying, "cuisineId" uuid, CONSTRAINT "PK_59ac7b35af39b231276bfc4c00c" PRIMARY KEY ("id")); COMMENT ON COLUMN "dish"."name" IS 'Name of the dish'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "dish" IS 'Abstract dishes (e.g., Kung Pao Chicken) that can have multiple recipe variations'`,
    );
    await queryRunner.query(`ALTER TABLE "recipe" ADD "dishId" uuid`);
    await queryRunner.query(`COMMENT ON COLUMN "recipe"."dishId" IS 'ID of the parent dish'`);
    await queryRunner.query(
      `ALTER TABLE "recipe" ADD "variantName" character varying NOT NULL DEFAULT 'Standard'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe"."variantName" IS 'Variation name (e.g., Spicy, Homestyle)'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe"."name" IS 'Name of the recipe (can be auto-generated from Dish + Variant)'`,
    );
    await queryRunner.query(
      `ALTER TABLE "dish" ADD CONSTRAINT "FK_075f9d6aca759f7d85e2277f153" FOREIGN KEY ("cuisineId") REFERENCES "cuisine"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipe" ADD CONSTRAINT "FK_fadcc51eb25213e201317956859" FOREIGN KEY ("dishId") REFERENCES "dish"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS "recipe_costs"`);
    await queryRunner.query(
      `CREATE MATERIALIZED VIEW "recipe_costs" AS SELECT "r"."id" AS "recipeId", "r"."name" AS "recipeName", SUM("ri"."quantity" * "i"."price") AS "totalCost" FROM "recipe" "r" INNER JOIN "recipe_item" "ri" ON "r"."id" = "ri"."recipeId"  INNER JOIN "ingredient" "i" ON  "ri"."ingredientId" = "i"."id" AND "i"."deletedAt" IS NULL WHERE ( "r"."deletedAt" IS NULL ) AND ( "r"."deletedAt" IS NULL ) GROUP BY "r"."id", "r"."name"`,
    );
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'MATERIALIZED_VIEW',
        'recipe_costs',
        'SELECT "r"."id" AS "recipeId", "r"."name" AS "recipeName", SUM("ri"."quantity" * "i"."price") AS "totalCost" FROM "recipe" "r" INNER JOIN "recipe_item" "ri" ON "r"."id" = "ri"."recipeId"  INNER JOIN "ingredient" "i" ON  "ri"."ingredientId" = "i"."id" AND "i"."deletedAt" IS NULL WHERE ( "r"."deletedAt" IS NULL ) AND ( "r"."deletedAt" IS NULL ) GROUP BY "r"."id", "r"."name"',
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['MATERIALIZED_VIEW', 'recipe_costs', 'public'],
    );
    await queryRunner.query(`DROP MATERIALIZED VIEW "recipe_costs"`);
    await queryRunner.query(
      `ALTER TABLE "recipe" DROP CONSTRAINT "FK_fadcc51eb25213e201317956859"`,
    );
    await queryRunner.query(`ALTER TABLE "dish" DROP CONSTRAINT "FK_075f9d6aca759f7d85e2277f153"`);
    await queryRunner.query(`COMMENT ON COLUMN "recipe"."name" IS 'Name of the recipe'`);
    await queryRunner.query(
      `COMMENT ON COLUMN "recipe"."variantName" IS 'Variation name (e.g., Spicy, Homestyle)'`,
    );
    await queryRunner.query(`ALTER TABLE "recipe" DROP COLUMN "variantName"`);
    await queryRunner.query(`COMMENT ON COLUMN "recipe"."dishId" IS 'ID of the parent dish'`);
    await queryRunner.query(`ALTER TABLE "recipe" DROP COLUMN "dishId"`);
    await queryRunner.query(`COMMENT ON TABLE "dish" IS NULL`);
    await queryRunner.query(`DROP TABLE "dish"`);
    await queryRunner.query(`COMMENT ON TABLE "cuisine" IS NULL`);
    await queryRunner.query(`DROP TABLE "cuisine"`);
    await queryRunner.query(`CREATE INDEX "idx_recipe_steps" ON "recipe" ("steps") `);
  }
}
