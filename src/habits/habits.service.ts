import { 
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException

 } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateHabitDto } from './dto/create-habit.dto.js';
import { HabitFrequency } from '../generated/prisma-client/enums.js';
import { Habit } from '../generated/prisma-client/browser.js';
import { MarkHabitDoneDto } from './dto/mark-habit-done.dto.js';
import { UpdateHabitDto } from './dto/update-habit.dto.js';

@Injectable()
export class HabitsService {
    constructor( private readonly prisma: PrismaService) {}

 async create(userId: string, dto: CreateHabitDto): Promise<Habit> {
  if (dto.frequency === HabitFrequency.custom) {
    if (!dto.customDays || dto.customDays.length === 0) {
      throw new BadRequestException('customDays must be a non-empty array when frequency is "custom"');
    }
  } else {
    if (dto.customDays && dto.customDays.length > 0) {
      throw new BadRequestException('customDays can only be provided when frequency is "custom"');
    }
  }

  return this.prisma.habit.create({
    data: {
      name: dto.name,
      description: dto.description,
      frequency: dto.frequency,
      customDays: dto.customDays ?? [], 
      targetCount: dto.targetCount ?? 1,
      reminderTime: dto.reminderTime,
      color: dto.color ?? '#6366f1',
      icon: dto.icon,
      category: dto.category,
      userId,
    },
  });
}
    async findAll(userId: string): Promise<Habit[]> {
        return this.prisma.habit.findMany({
            where: { userId, isDeleted: false },
            orderBy: [
                {currentStreak: 'desc'},
                {createdAt: 'desc'},
            ]
        });
    }
    async findOne(userId: string, habitId: string ): Promise<Habit> {
        const habit = await this.prisma.habit.findUnique({
            where: {id: habitId}
        });
        if(!habit || habit.isDeleted){
            throw new NotFoundException(`Habit with id ${habitId} not found`);
        }
        if(habit.userId !== userId){
            throw new ForbiddenException(`You do not have access to this habit`);
        }
        return habit;

    }
   async update(
  userId: string,
  habitId: string,
  dto: UpdateHabitDto,
): Promise<Habit> {
  const habit = await this.findOne(userId, habitId);

  const newFrequency = dto.frequency ?? habit.frequency;
  let newCustomDays = dto.customDays;

  if (newFrequency === HabitFrequency.custom) {
    if (newCustomDays === undefined) {
      newCustomDays = habit.customDays;
    }

    if (newCustomDays.length === 0) {
      throw new BadRequestException('customDays must be non-empty when frequency is "custom"');
    }
  } else {
    newCustomDays = [];
  }

  return this.prisma.habit.update({
    where: { id: habitId },
    data: {
      ...dto,
      frequency: newFrequency,
      customDays: newCustomDays,
    },
  });
}

// ── Mark as Done (streak logic lives here) ────────────────────────────────
   async markDone(
    userId: string,
    habitId: string,
    dto: MarkHabitDoneDto
   ): Promise<Habit> {
    const habit = await this.findOne(userId, habitId);
    const now = new Date();

    const newStreak = this.calculateNewStreak(
        habit.currentStreak,
        habit.lastCompletedAt,
        habit.frequency,
        habit.customDays,
        now,
    );
    const [updatedHabit] = await this.prisma.$transaction([
      this.prisma.habit.update({
        where: { id: habitId },
        data: {
          currentStreak: newStreak,
          bestStreak: Math.max(newStreak, habit.bestStreak),
          lastCompletedAt: now,
        },
      }),
      this.prisma.habitCompletion.create({
        data: {
          habitId,
          note: dto.note,
          completedAt: now,
        },
      }),
    ]);

    return updatedHabit;

   }

async softDelete(userId: string, habitId: string): Promise<{
    message: string;}>{
        await this.findOne(userId, habitId);
        await this.prisma.habit.update({
            where: {id: habitId},
            data: {isDeleted: true},
        });
        return { message: `Habit with id ${habitId} has been deleted`};
    }
   
private calculateNewStreak(
  currentStreak: number,
  lastCompletedAt: Date | null,
  frequency: HabitFrequency,
  customDays: number[], // 0=Sun, 1=Mon, ... 6=Sat
  now: Date,
): number {
  if (!lastCompletedAt) return 1;

  const today = this.toMidnightUTC(now);
  const lastDay = this.toMidnightUTC(lastCompletedAt);

  const diffDays = Math.round((today.getTime() - lastDay.getTime()) / (86400000));

  if (diffDays <= 0) return currentStreak; // same day or future (shouldn't happen)

  if (frequency === HabitFrequency.daily) {
    return diffDays === 1 ? currentStreak + 1 : 1;
  }

  if (frequency === HabitFrequency.custom) {
    // Check if today is a valid custom day
    const todayDay = today.getUTCDay();
    if (!customDays.includes(todayDay)) {
      return currentStreak; // today not required → streak stays
    }

    // Check if last completion was on a previous required day
    const expectedLastDay = this.getPreviousRequiredDay(today, customDays);
    if (lastDay.getTime() === expectedLastDay.getTime()) {
      return currentStreak + 1;
    }

    return 1; // streak breaks
  }

  // weekly, etc. → add later
  return currentStreak;
}

private getPreviousRequiredDay(today: Date, customDays: number[]): Date {
  // Find the most recent previous day that is in customDays
  for (let i = 1; i <= 7; i++) {
    const candidate = new Date(today);
    candidate.setUTCDate(today.getUTCDate() - i);
    if (customDays.includes(candidate.getUTCDay())) {
      return candidate;
    }
  }
  return today; // fallback
}

  private toMidnightUTC(date: Date): Date {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
  }

}
