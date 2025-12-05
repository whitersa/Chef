import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Chef John' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Head Chef' })
  @IsString()
  @IsNotEmpty()
  role!: string;

  @ApiProperty({ example: 'Active', required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  hireDate!: string;

  @ApiProperty({
    example: { theme: 'dark', density: 'compact' },
    required: false,
  })
  @IsOptional()
  preferences?: {
    theme?: 'light' | 'dark';
    density?: 'compact' | 'default' | 'loose';
  };
}
