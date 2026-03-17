import { IsString, IsOptional, MaxLength } from 'class-validator';

export class MarkHabitDoneDto {

  @IsString()
  @IsOptional()
  @MaxLength(300)
  note?: string;
}