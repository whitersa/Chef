import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePreProcessingStructure1764926215983 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update existing string arrays to object arrays
    // We assume all existing steps are 'mandatory' by default
    await queryRunner.query(`
      UPDATE recipe
      SET "preProcessing" = (
        SELECT jsonb_agg(
          jsonb_build_object(
            'description', elem,
            'type', 'mandatory'
          )
        )
        FROM jsonb_array_elements_text("preProcessing") AS elem
      )
      WHERE "preProcessing" IS NOT NULL 
      AND jsonb_typeof("preProcessing") = 'array' 
      AND jsonb_array_length("preProcessing") > 0
      AND jsonb_typeof("preProcessing"->0) = 'string';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert object arrays back to string arrays
    await queryRunner.query(`
      UPDATE recipe
      SET "preProcessing" = (
        SELECT jsonb_agg(elem->>'description')
        FROM jsonb_array_elements("preProcessing") AS elem
      )
      WHERE "preProcessing" IS NOT NULL 
      AND jsonb_typeof("preProcessing") = 'array' 
      AND jsonb_array_length("preProcessing") > 0
      AND jsonb_typeof("preProcessing"->0) = 'object';
    `);
  }
}
