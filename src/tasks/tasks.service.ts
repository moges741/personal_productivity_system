import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { Task } from '../generated/prisma-client/client.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

@Injectable()
export class TasksService {
constructor(private readonly prisma: PrismaService){}



  async create(userId: string, dto: CreateTaskDto): Promise<Task>{
    return this.prisma.task.create({
        data: {
            title: dto.title,
            description: dto.description,
            status: dto.status,
            priority: dto.priority,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
            isPinned: dto.isPinned ?? false,
            userId,
        },
    });

  }
  
  async findAll(userId: string): Promise<Task[]>{
    return this.prisma.task.findMany({
        where: {
            userId,
            isDeleted: false,
        },
        orderBy: [
            {createdAt: 'desc'},
            {isPinned: 'desc'}
        ],
    });
  }
async findOne(userId: string, taskId: string): Promise<Task>{
    const task = await this.prisma.task.findUnique({
        where: {id: taskId},
    });
    if(!task || task.isDeleted ){
        throw new NotFoundException(`Task with id ${taskId} not found`);
    }
    if( task.userId !== userId){
        throw new ForbiddenException(`You do not have access to this task`);
    }
    return task;
}
 async update(
    userId: string,
    taskId: string,
    dto: UpdateTaskDto,
 ):Promise<Task>{
    await this.findOne(userId, taskId);
    return this.prisma.task.update({
        where: {id: taskId},
        data: {
            ...dto,
            dueDate: dto.dueDate !== undefined ? dto.dueDate ? new Date(dto.dueDate) : null : undefined,
        },
    });
 }

 async softDelete(userId: string, taskId: string): Promise<{
    message: string;
 }> {
    await this.findOne(userId, taskId);
    await this.prisma.task.update({
        where: { id: taskId },
        data: {isDeleted: true },
    })
 return {message:  "Task deleted successfully"   } ;
 }

   private async assertOwnership(userId: string, task: Task): Promise<void> {
    if (task.userId !== userId) {
      throw new ForbiddenException('You do not have access to this task');
    }
  }
}