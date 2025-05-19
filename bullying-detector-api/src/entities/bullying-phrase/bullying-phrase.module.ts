import { Module } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { PrismaUtil } from 'src/utils/prisma.util'
import { BullyingPhraseController } from './bullying-phrase.controller'
import { BullyingPhraseService } from './bullying-phrase.service'
import { DetectionModule } from '../detection/detection.module'

@Module({
  imports: [DetectionModule],
  controllers: [BullyingPhraseController],
  providers: [BullyingPhraseService, PrismaService, PrismaUtil],
  exports: [BullyingPhraseService],
})
export class BullyingPhraseModule {}
