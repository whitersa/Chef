import {
  IsArray,
  IsNumber,
  IsUUID,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ProcurementItemDto {
  @ApiProperty({ description: 'ID of the recipe to cook' })
  @IsUUID()
  recipeId: string;

  @ApiProperty({ description: 'Number of batches to cook' })
  @IsNumber()
  @Min(0.1)
  quantity: number;
}

export class CreateProcurementListDto {
  @ApiProperty({ type: [ProcurementItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProcurementItemDto)
  items: ProcurementItemDto[];
}
