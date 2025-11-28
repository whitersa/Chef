import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1764307254190 implements MigrationInterface {
  name = 'InitialSchema1764307254190';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "recipe" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "steps" jsonb, "preProcessing" jsonb, CONSTRAINT "PK_e365a2fedf57238d970e07825ca" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "ingredient" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "price" numeric(10,2) NOT NULL, "unit" character varying NOT NULL, "nutrition" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6f1e945604a0b59f56a57570e98" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "recipe_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" numeric(10,2) NOT NULL, "yieldRate" numeric(5,2) NOT NULL DEFAULT '1', "recipeId" uuid, "ingredientId" uuid, "childRecipeId" uuid, CONSTRAINT "PK_bbaf66acc7e7c6dc3d1bc42a247" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "processing_method" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, CONSTRAINT "PK_55a498c2cd13da1f2978ffb807f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "menu" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "path" character varying, "icon" character varying, "order" integer NOT NULL DEFAULT '0', "parentId" uuid, CONSTRAINT "PK_35b2a8f47d153ff7a41860cceeb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "username" character varying, "password" character varying, "role" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'Active', "hireDate" TIMESTAMP NOT NULL, "preferences" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
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
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "menu"`);
    await queryRunner.query(`DROP TABLE "processing_method"`);
    await queryRunner.query(`DROP TABLE "recipe_item"`);
    await queryRunner.query(`DROP TABLE "ingredient"`);
    await queryRunner.query(`DROP TABLE "recipe"`);
  }
}
