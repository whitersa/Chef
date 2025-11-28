import { ApiProperty } from '@nestjs/swagger';

export class NutritionDto {
  @ApiProperty({ description: 'Total calories (kcal)' })
  calories: number;

  @ApiProperty({ description: 'Protein (g)' })
  protein: number;

  @ApiProperty({ description: 'Fat (g)' })
  fat: number;

  @ApiProperty({ description: 'Carbohydrates (g)' })
  carbs: number;

  @ApiProperty({ description: 'Total weight of the recipe output (g)' })
  totalWeight: number;
}
