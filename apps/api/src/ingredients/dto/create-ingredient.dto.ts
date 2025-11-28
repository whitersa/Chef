import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIngredientDto {
  @ApiProperty({ example: 'Tomato', description: 'The name of the ingredient' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 5.0, description: 'Cost price per unit' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'kg', description: 'Unit of measurement' })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({
    example: { protein: 0.9, fat: 0.2, carbs: 3.9 },
    description: 'Nutritional information per unit',
    required: false,
  })
  @IsOptional()
  @IsObject()
  nutrition?: Record<string, number>;
}
