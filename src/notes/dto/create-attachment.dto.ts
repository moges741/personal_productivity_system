import { IsString, IsOptional } from 'class-validator';

export class CreateAttachmentDto {
  @IsString()
  @IsOptional()
  description?: string; 
}