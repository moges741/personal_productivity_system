import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateTaskDto } from './create-task.dto.js';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  // isArchived is only ever set via update, not on creation
  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;
}