import { Module } from '@nestjs/common';
import { CalendarEventsService } from './calendar-events.service.js';
import { CalendarEventsController } from './calendar-events.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  providers: [CalendarEventsService,  PrismaService],
  controllers: [CalendarEventsController],
  exports: [CalendarEventsService]
})
export class CalendarEventsModule {}
