import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { DetectionService } from './detection.service'
import { Response } from 'express'
import { ReqUser } from 'src/decorators/req-user.decorator'
import { JwtAuthGuard } from 'src/security/guards/jwt-auth.guard'
import { RolesGuard } from 'src/security/guards/roles.guard'
import { Role } from 'src/enums/Role'
import { Roles } from 'src/decorators/roles.decorator'
import { Users } from '@prisma/client'
import { DetectionBaseDto } from './dto/detection-base-dto'

@Controller('detection')
export class DetectionController {
  constructor(private readonly detectionService: DetectionService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin)
  @Post('audio')
  @UseInterceptors(
    FileInterceptor('audio', {
      limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB
    }),
  )
  detectMoralHarassment(
    @UploadedFile() audio: Express.Multer.File,
    @ReqUser() user: Users,
  ) {
    return this.detectionService.saveFile(audio, user.id)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin)
  @Post()
  detectMoralHarassmentText(
    @Body(new ValidationPipe()) detection: DetectionBaseDto,
    @ReqUser() user: Users,
  ) {
    return this.detectionService.save(detection, user.id)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin)
  @Get()
  getAllAudio() {
    return this.detectionService.getAll()
  }

  @Get(':id')
  getAudio(@Param('id', ParseIntPipe) id: number) {
    return this.detectionService.getOne(id)
  }

  @Get('download/:filename')
  downloadAudio(@Param('filename') filename: string, @Res() res: Response) {
    return this.detectionService.download(filename, res)
  }
}
