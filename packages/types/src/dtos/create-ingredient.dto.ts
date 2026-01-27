import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateIngredientDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsString()
  unit: string;

  @IsOptional()
  nutrition?: Record<string, any>;
}
