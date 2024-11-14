import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { AudioService } from './audio.service'
import { Response } from 'express'

@Controller('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Post('detect')
  @UseInterceptors(
    FileInterceptor('record', {
      limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB
    }),
  )
  detectMoralHarassment(@UploadedFile() audio: Express.Multer.File) {
    return this.audioService.save(audio)
  }

  @Get()
  getAllAudio() {
    return this.audioService.getAll()
  }

  @Get(':id')
  getAudio(@Param('id', ParseIntPipe) id: number) {
    return this.audioService.getOne(id)
  }

  @Get('download/:filename')
  downloadAudio(@Param('filename') filename: string, @Res() res: Response) {
    return this.audioService.download(filename, res)
  }
}
