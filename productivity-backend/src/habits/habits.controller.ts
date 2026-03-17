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
import { HabitsService } from './habits.service.js';
import { GetUser } from '../auth/decorators/public.decorator.js';
import { CreateHabitDto } from './dto/create-habit.dto.js';
import { UpdateHabitDto } from './dto/update-habit.dto.js';
import { MarkHabitDoneDto } from './dto/mark-habit-done.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
@Controller('habits')
@UseGuards(JwtAuthGuard)
export class HabitsController {
    constructor(private habitsService: HabitsService){}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(
        @GetUser('userId') userId: string,
        @Body() dto: CreateHabitDto,
    ){
        return this.habitsService.create(userId, dto);
    }

    @Get()
    findAll(@GetUser('userId') userId: string){
        return this.habitsService.findAll(userId);
    }

  @Get(':id')
  findOne(
    @GetUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.habitsService.findOne(userId, id);
  }

    @Patch(':id')
    update(
        @GetUser('userId') userId: string,
        @Param('id') id: string,
        @Body() dto: UpdateHabitDto,
    ) {
        return this.habitsService.update(userId, id, dto);
    }

    @Post(':id/done')
    @HttpCode(HttpStatus.OK)
    markDone(
        @GetUser('userId') userId: string,
        @Param('id') id: string,
        @Body() dto: MarkHabitDoneDto,
    ){
        return this.habitsService.markDone(userId, id, dto);
    }
    
      @Delete(':id')
        @HttpCode(HttpStatus.NO_CONTENT)
        softDelete(
        @GetUser('userId') userId: string,
        @Param('id') id: string,
  ) {
    return this.habitsService.softDelete(userId, id);
  }

}
