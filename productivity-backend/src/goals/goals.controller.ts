import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { GoalsService } from './goals.service.js';
import { CreateGoalDto } from './dto/create-goal.dto.js';
import { UpdateGoalDto } from './dto/update-goal.dto.js';
import { UpdateGoalProgressDto } from './dto/update-goal-progress.dto.js';
import { GetUser } from '../auth/decorators/public.decorator.js';

@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @GetUser('userId') userId: string,
    @Body() dto: CreateGoalDto,
  ) {
    return this.goalsService.create(userId, dto);
  }

  @Get()
  findAll(@GetUser('userId') userId: string) {
    return this.goalsService.findAll(userId);
  }

  @Get(':id')
  findOne(
    @GetUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.goalsService.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @GetUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateGoalDto,
  ) {
    return this.goalsService.update(userId, id, dto);
  }

  @Patch(':id/progress')
  @HttpCode(HttpStatus.OK)
  updateProgress(
    @GetUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateGoalProgressDto,
  ) {
    return this.goalsService.updateProgress(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  softDelete(
    @GetUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.goalsService.softDelete(userId, id);
  }
}