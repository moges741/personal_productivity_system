import { Module } from '@nestjs/common';
import { HabitsService } from './habits.service.js';
import { HabitsController } from './habits.controller.js';

@Module({
  providers: [HabitsService],
  controllers: [HabitsController]
})
export class HabitsModule {}
