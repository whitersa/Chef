import { IsString, IsHexColor } from 'class-validator';

export class PluginConfigDto {
  @IsString()
  baseFontFamily!: string;

  @IsString()
  titleFontFamily!: string;

  @IsHexColor()
  titleColor!: string;

  @IsHexColor()
  accentColor!: string; // Used for title border and ingredients

  @IsHexColor()
  secondaryColor!: string; // Used for preparation context
}
