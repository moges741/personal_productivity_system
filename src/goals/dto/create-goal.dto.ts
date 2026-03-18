import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  IsDateString,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { GoalCategory, GoalStatus, GoalPriority } from '../../generated/prisma-client/enums.js'

export class CreateGoalDto {
  @IsString()
  @IsNotEmpty({ message: 'Goal title must not be empty' })
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsEnum(GoalCategory, {
    message: 'category must be: personal, career, health, finance, learning, or other',
  })
  @IsOptional()
  category?: GoalCategory;

  @IsEnum(GoalStatus, {
    message: 'status must be: not_started, in_progress, completed, or abandoned',
  })
  @IsOptional()
  status?: GoalStatus;

  @IsEnum(GoalPriority, {
    message: 'priority must be: low, medium, or high',
  })
  @IsOptional()
  priority?: GoalPriority;

  @IsDateString({}, { message: 'startDate must be a valid ISO 8601 date string' })
  @IsOptional()
  startDate?: string;

  @IsDateString({}, { message: 'targetDate must be a valid ISO 8601 date string' })
  @IsOptional()
  targetDate?: string;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  progressPercentage?: number;

  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;
}