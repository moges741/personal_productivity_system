import { Module } from '@nestjs/common';
import { NotesService } from './notes.service.js';
import { NotesController } from './notes.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  providers: [NotesService, PrismaService],
  controllers: [NotesController, ]
})
export class NotesModule {}
