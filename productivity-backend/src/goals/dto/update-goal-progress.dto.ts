import {
  IsInt,
  IsOptional,
  IsString,
  IsEnum,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { GoalStatus } from '../../generated/prisma-client/enums.js';


export class UpdateGoalProgressDto {
  @IsInt({ message: 'progressPercentage must be a whole number' })
  @Min(0, { message: 'progressPercentage cannot be less than 0' })
  @Max(100, { message: 'progressPercentage cannot exceed 100' })
  @IsOptional()
  progressPercentage?: number;


  @IsEnum(GoalStatus, {
    message: 'status must be: not_started, in_progress, completed, or abandoned',
  })
  @IsOptional()
  status?: GoalStatus;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  note?: string;
}