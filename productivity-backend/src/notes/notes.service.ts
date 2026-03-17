import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateNoteDto } from './dto/create-note.dto.js';
import { UpdateNoteDto } from './dto/update-note.dto.js';
import { join } from 'path';
import { promises as fs } from 'fs';
import { CreateAttachmentDto } from './dto/create-attachment.dto.js';
@Injectable()
export class NotesService {
    private readonly uploadDir = join(process.cwd(), 'uploads/notes');
    constructor(private prisma: PrismaService){
        fs.mkdir(this.uploadDir, { recursive: true }).catch(() => {});
    }

    async create(userId: string, dto : CreateNoteDto){
        return this.prisma.note.create({
            data: {
                ...dto,
                ownerId : userId
            },
        });
    }
    async findAll(userId: string){
        return this.prisma.note.findMany({
            where: {
                ownerId: userId,
                isDeleted: false,
            },
            orderBy: [
                {isPinned: 'desc'},
               { updatedAt: 'desc'},
            ],
        });
    };

    async findOne(userId: string, noteId: string){
        const note = await this.prisma.note.findUnique({
            where: {id: noteId},
        })
        if(!note){
            throw new NotFoundException('Note not found');
        }
        if(note.ownerId !== userId){
            throw new ForbiddenException('You do not own this note');
    
    }
    if(note.isDeleted){
        throw new NotFoundException('Note has been deleted');

    }
return note;
}

async update(userId: string, noteId: string, dto: UpdateNoteDto){
    await this.findOne(userId, noteId);

    return this.prisma.note.update({
        where: {id: noteId},
        data: dto,
    });
}
async softDelete(userId: string, noteId: string) {
    await this.findOne(userId, noteId);

    return this.prisma.note.update({
      where: { id: noteId },
      data: { isDeleted: true },
    });
  }
  async addAttachment(
  userId: string,
  noteId: string,
  file: Express.Multer.File,
  dto: CreateAttachmentDto = {},
) {
  // Check note exists + ownership
  await this.findOne(userId, noteId);

  if (!file) {
    throw new BadRequestException('No file uploaded');
  }

  const fileName = `${Date.now()}-${file.originalname}`;
  const path = join(this.uploadDir, fileName);

  // Save file to disk
  await fs.writeFile(path, file.buffer);

  return this.prisma.attachment.create({
    data: {
      fileName,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path,
      noteId,
      // description: dto.description, // if you added it
    },
  });
}

async getAttachment(userId: string, attachmentId: string) {
  const attachment = await this.prisma.attachment.findUnique({
    where: { id: attachmentId },
    include: { note: { select: { ownerId: true } } },
  });

  if (!attachment) {
    throw new NotFoundException('Attachment not found');
  }

  if (attachment.note.ownerId !== userId) {
    throw new ForbiddenException('Not authorized');
  }

  return attachment;
}

async deleteAttachment(userId: string, attachmentId: string) {
  const attachment = await this.getAttachment(userId, attachmentId);

  // Delete from disk
  await fs.unlink(attachment.path).catch(() => {});

  // Delete from DB
  await this.prisma.attachment.delete({
    where: { id: attachmentId },
  });
}
}