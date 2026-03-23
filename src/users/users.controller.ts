import { Controller , Post, HttpCode, HttpStatus, Body, Get} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import type { ReturnProps } from '../types/type.js';
import { GetUser } from '../auth/decorators/public.decorator.js';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
@Controller('users')
export class UsersController {
    constructor(private usersService : UsersService){}

    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    async signup(@Body() dto: CreateUserDto): Promise<ReturnProps>{
        return this.usersService.create(dto);
    }
@Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@GetUser('userId') userId: string) {
    return this.usersService.findById(userId);
  }
}
