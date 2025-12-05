import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSalesMenus1764322592781 implements MigrationInterface {
  name = 'AddSalesMenus1764322592781';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sales_menu_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "menuId" uuid NOT NULL, "recipeId" uuid, "name" character varying NOT NULL, "price" numeric(10,2) NOT NULL, "category" character varying, "order" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_cde946cff8e87c2229b27c2e1ef" PRIMARY KEY ("id")); COMMENT ON COLUMN "sales_menu_item"."name" IS 'Display name on the menu (defaults to recipe name)'; COMMENT ON COLUMN "sales_menu_item"."price" IS 'Selling price'; COMMENT ON COLUMN "sales_menu_item"."category" IS 'Category (e.g., Starter, Main)'`,
    );
    await queryRunner.query(`COMMENT ON TABLE "sales_menu_item" IS 'Items listed on a sales menu'`);
    await queryRunner.query(
      `CREATE TABLE "sales_menu" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_a10345bfa88317d6e70351d88b3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "sales_menu" IS 'Restaurant sales menus (e.g., Lunch, Dinner)'`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_menu_item" ADD CONSTRAINT "FK_be55a1de27acd727a5b3dadc1c9" FOREIGN KEY ("menuId") REFERENCES "sales_menu"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_menu_item" ADD CONSTRAINT "FK_b2d17b4ceb6e23e7b588339933f" FOREIGN KEY ("recipeId") REFERENCES "recipe"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sales_menu_item" DROP CONSTRAINT "FK_b2d17b4ceb6e23e7b588339933f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_menu_item" DROP CONSTRAINT "FK_be55a1de27acd727a5b3dadc1c9"`,
    );
    await queryRunner.query(`COMMENT ON TABLE "sales_menu" IS NULL`);
    await queryRunner.query(`DROP TABLE "sales_menu"`);
    await queryRunner.query(`COMMENT ON TABLE "sales_menu_item" IS NULL`);
    await queryRunner.query(`DROP TABLE "sales_menu_item"`);
  }
}
