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

@Injectable()
export class HabitsService {
    constructor( private readonly prisma: PrismaService) {}

    async create(userId: string, dto: CreateHabitDto): Promise<Habit>{
        if(dto.frequency !== HabitFrequency.custom && dto.customDays?.length){
            throw new BadRequestException('customDays should only be provided for custom frequency');
        }
        if(dto.frequency === HabitFrequency.custom && !dto.customDays?.length){
            throw new BadRequestException('customDays is required for custom frequency');
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
        dto: CreateHabitDto,
    ){
        const habit = await this.findOne(userId, habitId);
        const newFrequency = dto.frequency ?? habit.frequency;
        const newCustomDays = dto.customDays ?? habit.customDays;
        if(newFrequency !== HabitFrequency.custom && newCustomDays.length > 0){
            throw new BadRequestException('customDays must be empty when frequency is not custom');
        }
        if(newFrequency === HabitFrequency.custom && newCustomDays.length === 0){
            throw new BadRequestException('customDays is required when frequency is custom');
        }
        return this.prisma.habit.update({
            where: {id: habitId},
            data: {
                ...dto,
            }
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
    frequency:  HabitFrequency,
    now : Date,
): number{
    if(!lastCompletedAt) return 1; 

    const today = this.toMidnightUTC(now);
    const lastDay = this.toMidnightUTC(lastCompletedAt);

    const diffDays = Math.round(
        (today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24),
    );

    if(frequency === HabitFrequency.daily){
        if(diffDays === 0){
            return currentStreak; // already completed today, no change
        }
        if(diffDays === 1){
            return currentStreak + 1; // streak continues
        }
        return 1; // streak resets
    }
    if(frequency === HabitFrequency.weekly){
        if(diffDays === 0){
            return currentStreak; // already completed this week, no change
        }
        if(diffDays > 0 && diffDays <= 7){
            return currentStreak + 1; // streak continues
        }
        return 1; // streak resets
    }
    if(frequency === HabitFrequency.custom){
        if(diffDays === 0){
            return currentStreak; // already completed today, no change
        }
        if(diffDays === 1){ 
            return currentStreak + 1; // streak continues
        }
        return 1; // streak resets
    }
    return currentStreak; // default case, should not happen
}

  private toMidnightUTC(date: Date): Date {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
  }

}
