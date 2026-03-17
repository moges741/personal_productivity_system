import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {  GoalStatus} from '../generated/prisma-client/enums.js';
import { CreateGoalDto } from './dto/create-goal.dto.js';
import { Goal } from '../generated/prisma-client/client.js';
import { UpdateGoalDto } from './dto/update-goal.dto.js';
import { UpdateGoalProgressDto } from './dto/update-goal-progress.dto.js';


type GoalWithRelations = Goal & {
  milestones: { id: string; title: string; isCompleted: boolean; order: number }[];
  _count: { progressHistory: number };
};
@Injectable()
export class GoalsService {
    constructor(private prisma: PrismaService) {}
    async create(userId: string, dto: CreateGoalDto): Promise<Goal> {
        if(dto.startDate && dto.targetDate){
            const start = new Date(dto.startDate);
            const target = new Date(dto.targetDate);
            if(target <= start){
                throw new BadRequestException('targetDate must be after startDate');
            }
        }
        return this.prisma.goal.create({
            data: {
                title: dto.title,
                description: dto.description,
                category: dto.category,
                status: dto.status,
                priority: dto.priority,
                progressPercentage: dto.progressPercentage ?? 0,
                startDate: dto.startDate? new Date(dto.startDate) : null,
                targetDate: dto.targetDate? new Date(dto.targetDate) : null,
                isPinned: dto.isPinned ?? false,
                userId,
            }
        });
    }


    async findAll(userId: string): Promise<GoalWithRelations[]> {
        return this.prisma.goal.findMany({
        where: { userId, isDeleted: false },
        include: {
            milestones: {
            where: { },
            orderBy: { order: 'asc' },
            select: { id: true, title: true, isCompleted: true, order: true },
            },
        
            _count: {
            select: { progressHistory: true },
            },
        },
        orderBy: [
            { isPinned: 'desc' },         
            { priority: 'desc' },         
            { targetDate: 'asc' },        
        ],
        }) ;
    }

    async findOne(userId: string, goalId: string): Promise<GoalWithRelations>{
        const goal = await this.prisma.goal.findUnique({
            where: {id: goalId},
            include: {
                milestones: {
                    orderBy: {order: "asc"},
                    take: 10,
                },
                _count: {
                    select: {progressHistory: true},
                }
            }
        })
        if(!goal || goal.isDeleted){
            throw new NotFoundException(`Goal with id ${goalId} not found`);
        }
    if (goal.userId !== userId) {
      throw new ForbiddenException('You do not have access to this goal');
    }

    return goal as GoalWithRelations;

    }

    async update(
        userId: string,
        goalId: string,
        dto: UpdateGoalDto,
    ):Promise<Goal>{
        const goal = await this.findOne(userId, goalId);

        if(
            goal.status === GoalStatus.completed ||
            goal.status === GoalStatus.abandoned
        ){
        }
    const newStartDate = dto.startDate
    ? new Date(dto.startDate)
    : goal.startDate;

    const newTargetDate = dto.targetDate
    ? new Date(dto.targetDate)
    : goal.targetDate;

    if(newStartDate && newTargetDate && newTargetDate <= newStartDate){
        throw new BadRequestException('targetDate must be after startDate')

    }
    return this.prisma.goal.update({
      where: { id: goalId },
      data: {
        ...dto,
        startDate: dto.startDate !== undefined
          ? dto.startDate ? new Date(dto.startDate) : null
          : undefined,
        targetDate: dto.targetDate !== undefined
          ? dto.targetDate ? new Date(dto.targetDate) : null
          : undefined,
      },
    });
    }
     async updateProgress(
    userId: string,
    goalId: string,
    dto: UpdateGoalProgressDto,
  ): Promise<Goal> {
    if (dto.progressPercentage === undefined && dto.status === undefined) {
      throw new BadRequestException(
        'Provide at least one of: progressPercentage or status',
      );
    }

    const goal = await this.findOne(userId, goalId);

    if (
      goal.status === GoalStatus.completed ||
      goal.status === GoalStatus.abandoned
    ) {
      throw new BadRequestException(
        `Cannot update progress of a ${goal.status} goal. ` +
        `Use PATCH /goals/${goalId} to reopen it first.`,
      );
    }

    const now = new Date();

    let resolvedStatus = dto.status ?? goal.status;
    let resolvedPercentage = dto.progressPercentage ?? goal.progressPercentage;

    if (resolvedPercentage === 100 && resolvedStatus !== GoalStatus.abandoned) {
      resolvedStatus = GoalStatus.completed;
    }

    if (
      resolvedPercentage > 0 &&
      resolvedStatus === GoalStatus.not_started
    ) {
      resolvedStatus = GoalStatus.in_progress;
    }

    const completedAt =
      resolvedStatus === GoalStatus.completed ? now : goal.completedAt;
    const abandonedAt =
      resolvedStatus === GoalStatus.abandoned ? now : goal.abandonedAt;

    const [updatedGoal] = await this.prisma.$transaction([
      this.prisma.goal.update({
        where: { id: goalId },
        data: {
          progressPercentage: resolvedPercentage,
          status: resolvedStatus,
          completedAt,
          abandonedAt,
        },
      }),
      this.prisma.goalProgressEntry.create({
        data: {
          goalId,
          percentage: resolvedPercentage,
          note: dto.note,
        },
      }),
    ]);

    return updatedGoal;
  }

  // ── Soft Delete ───────────────────────────────────────────────────────────

  async softDelete(
    userId: string,
    goalId: string,
  ): Promise<{ message: string }> {
    await this.findOne(userId, goalId);

    await this.prisma.goal.update({
      where: { id: goalId },
      data: { isDeleted: true },
    });

    return { message: 'Goal deleted successfully' };
  }

}
