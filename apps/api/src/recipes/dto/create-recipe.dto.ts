import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  Min,
  ValidateNested,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ProcessingStep, ProcessingStepType } from '@chefos/types';

export class ProcessingStepDto implements ProcessingStep {
  @ApiProperty({ example: 'Wash vegetables', description: 'Description of the step' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    example: 'mandatory',
    description: 'Type of the step',
    enum: ['recommended', 'mandatory', 'optional'],
  })
  @IsEnum(['recommended', 'mandatory', 'optional'])
  type!: ProcessingStepType;
}

export class CreateRecipeItemDto {
  @ApiProperty({ example: 1.5, description: 'Quantity required' })
  @IsNumber()
  @Min(0)
  quantity!: number;

  @ApiProperty({
    example: 1.0,
    description: 'Yield rate (e.g., 0.8 means 20% loss)',
    required: false,
    default: 1.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01) // Yield rate shouldn't be 0
  yieldRate?: number;

  @ApiProperty({
    example: 'uuid-of-ingredient',
    description: 'ID of the ingredient (if applicable)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  ingredientId?: string;

  @ApiProperty({
    example: 'uuid-of-child-recipe',
    description: 'ID of the child recipe (if applicable)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  childRecipeId?: string;
}

export class CreateRecipeDto {
  @ApiProperty({ example: 'Tomato Soup', description: 'Name of the recipe' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: ['Chop tomatoes', 'Boil water'],
    description: 'Step-by-step cooking instructions',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  steps?: string[];

  @ApiProperty({
    type: [ProcessingStepDto],
    description: 'Pre-processing steps required before cooking',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProcessingStepDto)
  preProcessing?: ProcessingStepDto[];

  @ApiProperty({
    example: 4,
    description: 'Quantity produced by this recipe',
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  yieldQuantity?: number;

  @ApiProperty({
    example: 'portion',
    description: 'Unit of the yield (e.g., portion, kg)',
    required: false,
    default: 'portion',
  })
  @IsOptional()
  @IsString()
  yieldUnit?: string;

  @ApiProperty({
    example: 15.0,
    description: 'Estimated labor cost',
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  laborCost?: number;

  @ApiProperty({
    type: [CreateRecipeItemDto],
    description: 'List of ingredients or sub-recipes',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRecipeItemDto)
  items?: CreateRecipeItemDto[];
}
