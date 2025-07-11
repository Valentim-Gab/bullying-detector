import { Injectable } from '@nestjs/common'
import { Avaliation } from 'prisma/generated/clientUfsm'
import { PrismaUfsmService } from 'src/connections/prisma-ufsm/prisma-ufsm.service'

@Injectable()
export class AvaliationService {
  constructor(private prismaUfsm: PrismaUfsmService) {}

  async getAll(): Promise<Avaliation[]> {
    return await this.prismaUfsm.avaliation.findMany()
  }
}
