import { IsArray, IsNumber, IsUUID, ValidateNested, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ProcurementItemDto {
  @ApiProperty({ description: 'ID of the recipe to cook' })
  @IsUUID()
  recipeId!: string;

  @ApiProperty({ description: 'Number of batches to cook' })
  @IsNumber()
  @Min(0.1)
  quantity!: number;
}

export class SalesMenuRequestDto {
  @ApiProperty({ description: 'ID of the sales menu' })
  @IsUUID()
  menuId!: string;

  @ApiProperty({ description: 'Number of menus to sell' })
  @IsNumber()
  @Min(1)
  quantity!: number;
}

export class CreateProcurementListDto {
  @ApiProperty({ type: [ProcurementItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProcurementItemDto)
  items!: ProcurementItemDto[];

  @ApiProperty({ type: [SalesMenuRequestDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalesMenuRequestDto)
  @IsOptional()
  salesMenus?: SalesMenuRequestDto[];
}
