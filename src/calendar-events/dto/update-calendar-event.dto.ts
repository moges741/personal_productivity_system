import { PartialType } from "@nestjs/mapped-types";
import { IsBoolean, IsOptional } from "class-validator";
 import { CreateCalendarEventDto } from "./create-calendar-event.dto.js";

 export class UpdateCalendarEventDto extends PartialType(CreateCalendarEventDto) {
    @IsBoolean()
    @IsOptional()
    isArchived?: boolean;

 }