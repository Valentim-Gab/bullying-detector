import { Module } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { PrismaUtil } from 'src/utils/prisma.util'
import { VoteService } from './vote.service'
import { VoteController } from './vote.controller'
import { DetectionModule } from '../detection/detection.module'

@Module({
  imports: [DetectionModule],
  controllers: [VoteController],
  providers: [VoteService, PrismaService, PrismaUtil],
})
export class VoteModule {}
