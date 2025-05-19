import { Module } from '@nestjs/common'
import { PrismaUfsmService } from './prisma-ufsm.service'

@Module({
  providers: [PrismaUfsmService],
  exports: [PrismaUfsmService],
})
export class PrismaUfsmModule {}
