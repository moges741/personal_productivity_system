import { PartialType } from "@nestjs/mapped-types";
import { IsBoolean, IsOptional } from "class-validator";
import { CreateGoalDto } from "./create-goal.dto.js";


export class UpdateGoalDto extends PartialType(CreateGoalDto) {
    @IsBoolean()
    @IsOptional()
    isArchived?: boolean;
}