import { Module } from '@nestjs/common';
import { GoalsService } from './goals.service.js';
import { GoalsController } from './goals.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  providers: [GoalsService, PrismaService],
  controllers: [GoalsController],
  exports: [GoalsService]
})
export class GoalsModule {}
