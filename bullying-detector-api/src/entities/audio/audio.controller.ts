import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { AudioService } from './audio.service'
import { Response } from 'express'
import { ReqUser } from 'src/decorators/req-user.decorator'
import { JwtAuthGuard } from 'src/security/guards/jwt-auth.guard'
import { RolesGuard } from 'src/security/guards/roles.guard'
import { Role } from 'src/enums/Role'
import { Roles } from 'src/decorators/roles.decorator'
import { Users } from '@prisma/client'

@Controller('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin)
  @Post('detect')
  @UseInterceptors(
    FileInterceptor('record', {
      limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB
    }),
  )
  detectMoralHarassment(
    @UploadedFile() audio: Express.Multer.File,
    @ReqUser() user: Users,
  ) {
    return this.audioService.save(audio, user.id)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin)
  @Get()
  getAllAudio() {
    console.log('chegou aqui')

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
