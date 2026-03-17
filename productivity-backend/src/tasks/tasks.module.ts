import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import { TasksController } from './tasks.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';
@Module({
  providers: [TasksService, PrismaService],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}
