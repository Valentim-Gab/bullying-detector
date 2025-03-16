import { Module } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { PrismaUtil } from 'src/utils/prisma.util'
import { BullyingPhraseController } from './bullying-phrase.controller'
import { BullyingPhraseService } from './bullying-phrase.service'
import { AudioModule } from '../audio/audio.module'

@Module({
  imports: [AudioModule],
  controllers: [BullyingPhraseController],
  providers: [BullyingPhraseService, PrismaService, PrismaUtil],
  exports: [BullyingPhraseService],
})
export class BullyingPhraseModule {}
