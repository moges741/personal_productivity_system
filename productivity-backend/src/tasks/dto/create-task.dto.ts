import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsDateString, MaxLength } from "class-validator";
import { TaskStatus, TaskPriority } from "../../generated/prisma-client/enums.js";

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty({message: "Title must not be empty"})
    @MaxLength(255)
    title!: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsOptional()
    status?: TaskStatus;

    @IsEnum(TaskPriority, {
        message: "priority must be one of: low, medium, high",
    })
    @IsOptional()
    priority?: TaskPriority;


    @IsDateString({}, {message: "dueDate must be a valid ISO 8601 date string"})
    @IsOptional()
    dueDate?: string;

    @IsBoolean()
    @IsOptional()
    isPinned?: boolean;

}