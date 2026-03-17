import { Controller , Post, HttpCode, HttpStatus, Body} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import type { ReturnProps } from '../types/type.js';

@Controller('users')
export class UsersController {
    constructor(private usersService : UsersService){}

    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    async signup(@Body() dto: CreateUserDto): Promise<ReturnProps>{
        return this.usersService.create(dto);
    }
  // GET /users/me → protected with JwtAuthGuard (next step)
}
