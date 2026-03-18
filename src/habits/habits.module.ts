import { Module } from '@nestjs/common';
import { HabitsService } from './habits.service.js';
import { HabitsController } from './habits.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';
@Module({
  imports:[],
  providers: [HabitsService, PrismaService],
  controllers: [HabitsController],
  exports: [HabitsService]
})
export class HabitsModule {}
