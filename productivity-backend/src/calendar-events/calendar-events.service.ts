import { 
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
 } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto.js';
import { CalendarEvent } from '../generated/prisma-client/browser.js';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto.js';



interface EventFilters {
  from?: string;   // ISO date — only return events starting after this
  to?: string;     // ISO date — only return events starting before this
}
@Injectable()
export class CalendarEventsService {
       constructor( private readonly prisma: PrismaService) {}

       async create(
              userid: string,
              dto: CreateCalendarEventDto,
       ): Promise<CalendarEvent>{
        const startDateTime  = new Date(dto.startDateTime);
        const endDateTime = new Date(dto.endDateTime);
        this.assertValidTimeRange(startDateTime, endDateTime, dto.isAllDay);

        if(dto.isRecurring && !dto.recurrenceRule) {
            throw new BadRequestException('recurrenceRule is required when isRecurring is true');
        }  
        
        if(!dto.isRecurring && dto.recurrenceRule) {
            throw new BadRequestException('recurrenceRule must be empty when isRecurring is false');
        }

        const overlaps = await this.findOverlappingEvents(
            userid,
            startDateTime,
            endDateTime,
        )

        return this.prisma.calendarEvent.create({
            data: {
                title: dto.title,
                description: dto.description,
                location: dto.location,
                startDateTime,
                endDateTime,
                isAllDay: dto.isAllDay ?? false,
                isRecurring: dto.isRecurring ?? false,
                recurrenceRule: dto.recurrenceRule ?? null ,
                color: dto.color ?? null,
                status: dto.status,
                category: dto.category,
                reminderMinutesBefore: dto.reminderMinutesBefore ?? null,
                linkedTaskId: dto.linkedTaskId ?? null,
                linkedGoalId: dto.linkedGoalId ?? null,
                isPinned: dto.isPinned ?? false,
                userId: userid,
            }
        }).then((event) => {
         return { ...event, overlappingEventCount: overlaps.length } as CalendarEvent;
    });
}

 async findAll(
    userId: string,
    filters: EventFilters = {},
 ): Promise<CalendarEvent[]> {


    const dateFilter = this.buildDateFilter(filters);

    return this.prisma.calendarEvent.findMany({
        where: {
            userId,
            isArchived: false,
            ...dateFilter,
        },
        orderBy:[
            {isPinned: 'desc'},
            {startDateTime: 'asc'}
        ]
     });
 }
async findOne(userId: string, eventId: string): Promise<CalendarEvent> {
    const event = await this.prisma.calendarEvent.findUnique({
      where: { id: eventId },
    });

    if (!event || event.isDeleted) {
      throw new NotFoundException(`CalendarEvent with id "${eventId}" not found`);
    }

    if (event.userId !== userId) {
      throw new ForbiddenException('You do not have access to this event');
    }

    return event;
  }
   async update(
    userId: string,
    eventId: string,
    dto: UpdateCalendarEventDto,
  ): Promise<CalendarEvent> {
    const event = await this.findOne(userId, eventId);

  
    const newStart = dto.startDateTime
      ? new Date(dto.startDateTime)
      : event.startDateTime;

    const newEnd = dto.endDateTime
      ? new Date(dto.endDateTime)
      : event.endDateTime;

    const isAllDay = dto.isAllDay !== undefined ? dto.isAllDay : event.isAllDay;
    this.assertValidTimeRange(newStart, newEnd, isAllDay);

    const willBeRecurring = dto.isRecurring !== undefined
      ? dto.isRecurring
      : event.isRecurring;

    const newRule = dto.recurrenceRule !== undefined
      ? dto.recurrenceRule
      : event.recurrenceRule;

    if (willBeRecurring && !newRule) {
      throw new BadRequestException(
        'recurrenceRule is required when isRecurring is true',
      );
    }

    if (!willBeRecurring && newRule) {
      throw new BadRequestException(
        'Clear recurrenceRule when setting isRecurring to false',
      );
    }

    return this.prisma.calendarEvent.update({
      where: { id: eventId },
      data: {
        ...dto,
        // Convert date strings → Date objects for Prisma
        startDateTime: dto.startDateTime ? new Date(dto.startDateTime) : undefined,
        endDateTime: dto.endDateTime ? new Date(dto.endDateTime) : undefined,
      },
    });
  }


    async softDelete(
    userId: string,
    eventId: string,
  ): Promise<{ message: string }> {
    await this.findOne(userId, eventId);

    await this.prisma.calendarEvent.update({
      where: { id: eventId },
      data: { isDeleted: true },
    });

    return { message: 'Calendar event deleted successfully' };
  }


   private assertValidTimeRange(
    start: Date,
    end: Date,
    isAllDay?: boolean,
  ): void {
    if (isAllDay) {
     
      if (end < start) {
        throw new BadRequestException(
          'endDateTime must not be before startDateTime for all-day events',
        );
      }
      return;
    }

    if (end <= start) {
      throw new BadRequestException(
        'endDateTime must be after startDateTime',
      );
    }

    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    if (end.getTime() - start.getTime() > thirtyDaysMs) {
      throw new BadRequestException(
        'Event duration cannot exceed 30 days. ' +
        'For longer periods, use isRecurring with a recurrenceRule.',
      );
    }
  }

  private async findOverlappingEvents(
    userId: string,
    start: Date,
    end: Date,
    excludeEventId?: string,   
  ): Promise<CalendarEvent[]> {
    return this.prisma.calendarEvent.findMany({
      where: {
        userId,
        isDeleted: false,
        isAllDay: false,       
        startDateTime: { lt: end },
        endDateTime:   { gt: start },
        ...(excludeEventId ? { NOT: { id: excludeEventId } } : {}),
      },
    });
  }

    private buildDateFilter(filters: EventFilters) {
    const filter: Record<string, unknown> = {};

    if (filters.from) {
      filter.startDateTime = {
        ...(filter.startDateTime as object ?? {}),
        gte: new Date(filters.from),
      };
    }

    if (filters.to) {
      filter.startDateTime = {
        ...(filter.startDateTime as object ?? {}),
        lt: new Date(filters.to),
      };
    }

    return filter;
  }

}
