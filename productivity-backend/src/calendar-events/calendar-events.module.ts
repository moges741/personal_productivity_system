import { Module } from '@nestjs/common';
import { CalendarEventsService } from './calendar-events.service.js';
import { CalendarEventsController } from './calendar-events.controller.js';

@Module({
  providers: [CalendarEventsService],
  controllers: [CalendarEventsController]
})
export class CalendarEventsModule {}
