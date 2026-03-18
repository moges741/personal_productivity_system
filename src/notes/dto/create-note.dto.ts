import { IsString, IsOptional, IsBoolean, IsHexColor } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsHexColor()
  @IsOptional()
  color?: string;

  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;
}