import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStockQuantity1764578622108 implements MigrationInterface {
  name = 'AddStockQuantity1764578622108';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "procurement_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" numeric(10,3) NOT NULL, "unit" character varying NOT NULL, "cost" numeric(10,2) NOT NULL, "procurementId" uuid, "ingredientId" uuid, CONSTRAINT "PK_58dd75ddfa3fb86cad02d0dea32" PRIMARY KEY ("id")); COMMENT ON COLUMN "procurement_item"."ingredientId" IS 'Unique identifier for the ingredient'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."procurement_status_enum" AS ENUM('PENDING', 'COMPLETED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "procurement" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."procurement_status_enum" NOT NULL DEFAULT 'PENDING', "totalPrice" numeric(10,2) NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d76214d11b86be19052e0118179" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "ingredient" ADD "stockQuantity" numeric(10,3) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "ingredient"."stockQuantity" IS 'Current stock quantity'`,
    );
    await queryRunner.query(`ALTER TABLE "ingredient" ADD "stockUnit" character varying`);
    await queryRunner.query(
      `COMMENT ON COLUMN "ingredient"."stockUnit" IS 'Unit for stock (usually same as unit)'`,
    );
    await queryRunner.query(
      `ALTER TABLE "procurement_item" ADD CONSTRAINT "FK_311d4701d13912088320e99066b" FOREIGN KEY ("procurementId") REFERENCES "procurement"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "procurement_item" ADD CONSTRAINT "FK_5d3039f48b3cdbdbbf0fb7139d4" FOREIGN KEY ("ingredientId") REFERENCES "ingredient"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "procurement_item" DROP CONSTRAINT "FK_5d3039f48b3cdbdbbf0fb7139d4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "procurement_item" DROP CONSTRAINT "FK_311d4701d13912088320e99066b"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "ingredient"."stockUnit" IS 'Unit for stock (usually same as unit)'`,
    );
    await queryRunner.query(`ALTER TABLE "ingredient" DROP COLUMN "stockUnit"`);
    await queryRunner.query(
      `COMMENT ON COLUMN "ingredient"."stockQuantity" IS 'Current stock quantity'`,
    );
    await queryRunner.query(`ALTER TABLE "ingredient" DROP COLUMN "stockQuantity"`);
    await queryRunner.query(`DROP TABLE "procurement"`);
    await queryRunner.query(`DROP TYPE "public"."procurement_status_enum"`);
    await queryRunner.query(`DROP TABLE "procurement_item"`);
  }
}
