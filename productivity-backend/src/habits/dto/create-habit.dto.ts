import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  IsBoolean,
  IsArray,
  IsHexColor,
  Min,
  Max,
  MaxLength,
  Matches,
  ArrayMaxSize,
} from 'class-validator';
import { HabitFrequency, HabitCategory }  from '../../generated/prisma-client/enums.js';

export class CreateHabitDto {
  @IsString()
  @IsNotEmpty({ message: 'Habit name must not be empty' })
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsEnum(HabitFrequency, {
    message: 'frequency must be: daily, weekly, or custom',
  })
  @IsOptional()
  frequency?: HabitFrequency;

  // Array of weekday numbers: 0 (Sun) through 6 (Sat)
  @IsArray()
  @IsInt({ each: true })       // validate every element is an integer
  @Min(0, { each: true })      // each element >= 0
  @Max(6, { each: true })      // each element <= 6
  @ArrayMaxSize(7)
  @IsOptional()
  customDays?: number[];

  @IsInt()
  @Min(1, { message: 'targetCount must be at least 1' })
  @Max(100)
  @IsOptional()
  targetCount?: number;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'reminderTime must be in HH:MM format (e.g. "07:30")',
  })
  @IsOptional()
  reminderTime?: string;

  @IsHexColor({ message: 'color must be a valid hex color e.g. #ff5733' })
  @IsOptional()
  color?: string;

  @IsString()
  @MaxLength(10)   
  @IsOptional()
  icon?: string;

  @IsEnum(HabitCategory, {
    message: `category must be one of: health, fitness, productivity, 
    learning, mindfulness, finance, social, creativity, other`,
  })
  @IsOptional()
  category?: HabitCategory;

  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;
}