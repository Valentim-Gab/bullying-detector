import { Module } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { PrismaUtil } from 'src/utils/prisma.util'
import { DetectionController } from './detection.controller'
import { DetectionService } from './detection.service'
import { FileUtil } from 'src/utils/file.util'
import { ConfigService } from '@nestjs/config'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [HttpModule],
  controllers: [DetectionController],
  providers: [
    DetectionService,
    PrismaService,
    PrismaUtil,
    FileUtil,
    ConfigService,
  ],
  exports: [DetectionService],
})
export class DetectionModule {}
