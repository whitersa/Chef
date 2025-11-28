import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSalesMenuItemDto {
  @ApiProperty({ description: 'Recipe ID to link to' })
  @IsUUID()
  @IsOptional()
  recipeId?: string;

  @ApiProperty({ description: 'Display name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Selling price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Category (Starter, Main, etc.)' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ description: 'Display order' })
  @IsNumber()
  @IsOptional()
  order?: number;
}

export class CreateSalesMenuDto {
  @ApiProperty({ example: 'Lunch Menu' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty({ type: [CreateSalesMenuItemDto], required: false })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateSalesMenuItemDto)
  items?: CreateSalesMenuItemDto[];
}
