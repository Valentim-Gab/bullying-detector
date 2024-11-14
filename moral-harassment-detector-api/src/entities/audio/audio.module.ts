import { Module } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { PrismaUtil } from 'src/utils/prisma.util'
import { AudioController } from './audio.controller'
import { AudioService } from './audio.service'
import { FileUtil } from 'src/utils/file.util'
import { ConfigService } from '@nestjs/config'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [HttpModule],
  controllers: [AudioController],
  providers: [AudioService, PrismaService, PrismaUtil, FileUtil, ConfigService],
  exports: [AudioService],
})
export class AudioModule {}
