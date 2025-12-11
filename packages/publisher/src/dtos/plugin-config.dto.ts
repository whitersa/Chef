import { IsString, IsHexColor, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class LayoutDto {
  @IsString()
  pageWidth!: string;

  @IsString()
  pageHeight!: string;

  @IsString()
  bleed!: string;
}

class TypographyDto {
  @IsString()
  baseFont!: string;

  @IsString()
  titleFont!: string;
}

class PaletteDto {
  @IsHexColor()
  title!: string;

  @IsHexColor()
  accent!: string;

  @IsHexColor()
  secondary!: string;
}

class CoverDto {
  @IsOptional()
  @IsString()
  image?: string;
}

class TocDto {
  @IsString()
  title!: string;
}

class ComponentsDto {
  @ValidateNested()
  @Type(() => CoverDto)
  cover!: CoverDto;

  @ValidateNested()
  @Type(() => TocDto)
  toc!: TocDto;
}

export class PluginConfigDto {
  @ValidateNested()
  @Type(() => LayoutDto)
  layout!: LayoutDto;

  @ValidateNested()
  @Type(() => TypographyDto)
  typography!: TypographyDto;

  @ValidateNested()
  @Type(() => PaletteDto)
  palette!: PaletteDto;

  @ValidateNested()
  @Type(() => ComponentsDto)
  components!: ComponentsDto;
}
