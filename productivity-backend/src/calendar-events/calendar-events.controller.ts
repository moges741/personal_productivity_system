import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CalendarEventsService } from './calendar-events.service.js';
import { GetUser } from '../auth/decorators/public.decorator.js';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto.js';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto.js';
@Controller('calendar-events')
@UseGuards(JwtAuthGuard)
export class CalendarEventsController {
   constructor(private readonly calendarEventsService: CalendarEventsService){}

   @Post()
   @HttpCode(HttpStatus.CREATED)
   create(
    @GetUser('userId') userId: string,
    @Body() dto: CreateCalendarEventDto,
   ){
    return this.calendarEventsService.create(userId, dto);
   }

  @Get()
  findAll(
    @GetUser('userId') userId: string,
    @Query('from') from?: string,   // @Query extracts ?from= from the URL
    @Query('to') to?: string,       // @Query extracts ?to= from the URL
  ) {
    return this.calendarEventsService.findAll(userId, { from, to });
  }

    @Get(':id')
  findOne(
    @GetUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.calendarEventsService.findOne(userId, id);
  }

    @Patch(':id')
  update(
    @GetUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCalendarEventDto,
  ) {
    return this.calendarEventsService.update(userId, id, dto);
  }

    @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  softDelete(
    @GetUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.calendarEventsService.softDelete(userId, id);
  }


}
