import { 
    Controller,
    Post,
    Body,
    Req, 
    Get, 
    Param, 
    Patch, 
    HttpStatus, 
    HttpCode, 
    Delete,
    UseInterceptors,
    UploadedFile,
    ParseFilePipeBuilder,
    UseGuards,
 } from '@nestjs/common';
 import { FileInterceptor } from '@nestjs/platform-express';
import { NotesService } from './notes.service.js';
import { CreateNoteDto } from './dto/create-note.dto.js';
import { UpdateNoteDto } from './dto/update-note.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';


@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
    constructor( private readonly notesService: NotesService){}


    @Post()
    async create(@Req() req, @Body() createNoteDto: CreateNoteDto){
        console.log('Current user from JWT:', req.user);         
        console.log('Received DTO:', createNoteDto);
        return this.notesService.create(req.user.userId, createNoteDto);


    }

    @Get()
    async findAll(@Req() req){
        return this.notesService.findAll(req.user.userId);
    }

    @Get(':id')
    async findOne(@Req() req, @Param('id') id: string){
        return this.notesService.findOne(req.user.userId, id);
    }

    @Patch(':id')
    async update(
        @Req() req,
        @Param('id') id: string,
        @Body() updateNoteDto: UpdateNoteDto){
        return this.notesService.update(req.user.userId, id, updateNoteDto);
    }
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Req() req, @Param('id') id: string) {
        await this.notesService.softDelete(req.user.userId, id);
  }
  @Post(':noteId/attachments')
@UseInterceptors(FileInterceptor('file'))
async uploadAttachment(
  @Req() req,
  @Param('noteId') noteId: string,
  @UploadedFile(
    new ParseFilePipeBuilder()
      .addMaxSizeValidator({ maxSize: 10 * 1024 * 1024 }) // 10MB limit
      .addFileTypeValidator({ fileType: /(image|pdf|text)/ })
      .build({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
  )
  file: Express.Multer.File,
) {
  return this.notesService.addAttachment(req.user.userId, noteId, file);
}

@Get('attachments/:id')
async getAttachment(@Req() req, @Param('id') id: string) {
  const attachment = await this.notesService.getAttachment(req.user.userId, id);
  return attachment;
  // Later: stream file or return signed URL
}

@Delete('attachments/:id')
@HttpCode(HttpStatus.NO_CONTENT)
async deleteAttachment(@Req() req, @Param('id') id: string) {
  await this.notesService.deleteAttachment(req.user.userId, id);
}
}
