import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './users/users.module.js';
import { ConfigModule } from '@nestjs/config'; 
import { AuthModule } from './auth/auth.module.js';
import { NotesModule } from './notes/notes.module.js';
import { TasksModule } from './tasks/tasks.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',

    })
,   
  UsersModule,
  AuthModule,
  NotesModule,
  TasksModule,
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
