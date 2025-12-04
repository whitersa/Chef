import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdvancedDbFeatures1764835157553 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create Materialized View for Recipe Costs
    // Calculates the total cost of a recipe based on its ingredients
    await queryRunner.query(`
            CREATE MATERIALIZED VIEW "recipe_costs" AS
            SELECT
                r.id AS "recipeId",
                r.name AS "recipeName",
                SUM(ri.quantity * i.price) AS "totalCost"
            FROM
                "recipe" r
            JOIN
                "recipe_item" ri ON r.id = ri."recipeId"
            JOIN
                "ingredient" i ON ri."ingredientId" = i.id
            WHERE
                r."deletedAt" IS NULL
            GROUP BY
                r.id, r.name
        `);

    // 2. Create GIN Index for Recipe Steps
    // Optimizes searching within the JSONB 'steps' column
    await queryRunner.query(`
            CREATE INDEX "idx_recipe_steps" ON "recipe" USING GIN ("steps")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop GIN Index
    await queryRunner.query(`DROP INDEX "idx_recipe_steps"`);

    // Drop Materialized View
    await queryRunner.query(`DROP MATERIALIZED VIEW "recipe_costs"`);
  }
}
