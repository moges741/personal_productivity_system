import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { TasksService } from './tasks.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { GetUser } from '../auth/decorators/public.decorator.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
    constructor( private readonly tasksService: TasksService){}

@Post()
@HttpCode(HttpStatus.CREATED)
create(
  @GetUser('userId') userId: string,
  @Body() dto: CreateTaskDto,
) {
  return this.tasksService.create(userId, dto);
}
  @Get()
  findAll(
    @GetUser('userId') userId: string,
  ) {
    return this.tasksService.findAll(userId);
  }
@Get(':id')
findOne(
  @GetUser('userId') userId: string,
  @Param('id') id: string,
) {
  return this.tasksService.findOne(userId, id);
}


@Patch(':id')
update(
  @GetUser('userId') userId: string,
  @Param('id') id: string,
  @Body() dto: UpdateTaskDto,
) {
  return this.tasksService.update(userId, id, dto);
}
@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT)
remove(
  @GetUser('userId') userId: string,
  @Param('id') id: string,
) {
  return this.tasksService.softDelete(userId, id);
}
}
