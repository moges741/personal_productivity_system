import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  IsDateString,
  IsHexColor,
  MaxLength,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { EventStatus, EventCategory } from '../../generated/prisma-client/enums.js';
export class CreateCalendarEventDto {
  @IsString()
  @IsNotEmpty({ message: 'Event title must not be empty' })
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  location?: string;

  
  @IsDateString({}, { message: 'startDateTime must be a valid ISO 8601 UTC string' })
  startDateTime!: string;

  @IsDateString({}, { message: 'endDateTime must be a valid ISO 8601 UTC string' })
  endDateTime!: string;

  @IsBoolean()
  @IsOptional()
  isAllDay?: boolean;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;


  @ValidateIf((o) => o.isRecurring === true)
  @IsString()
  @IsNotEmpty({ message: 'recurrenceRule is required when isRecurring is true' })
  @MaxLength(500)
  recurrenceRule?: string;

  @IsHexColor({ message: 'color must be a valid hex color e.g. #3b82f6' })
  @IsOptional()
  color?: string;

  @IsEnum(EventStatus, {
    message: 'status must be: tentative, confirmed, or cancelled',
  })
  @IsOptional()
  status?: EventStatus;

  @IsEnum(EventCategory, {
    message: 'category must be: personal, work, health, family, or other',
  })
  @IsOptional()
  category?: EventCategory;


  @IsInt()
  @Min(0)
  @Max(20160) // 2 weeks in minutes
  @IsOptional()
  reminderMinutesBefore?: number;

  @IsString()
  @IsOptional()
  linkedTaskId?: string;

  @IsString()
  @IsOptional()
  linkedGoalId?: string;

  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;
}