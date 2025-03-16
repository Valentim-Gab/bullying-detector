import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpModule } from '@nestjs/axios'
import { PrismaUfsmService } from 'src/connections/prisma-ufsm/prisma-ufsm.service'
import { AvaliationService } from './avaliation.service'
import { AvaliationController } from './avaliation.controller'

@Module({
  imports: [HttpModule],
  controllers: [AvaliationController],
  providers: [AvaliationService, PrismaUfsmService, ConfigService],
  exports: [AvaliationService],
})
export class AvaliationModule {}
