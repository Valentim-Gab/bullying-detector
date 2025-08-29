import { Injectable } from '@nestjs/common'
import { Avaliation } from 'prisma/generated/clientUfsm'
import { PrismaUfsmService } from 'src/connections/prisma-ufsm/prisma-ufsm.service'

@Injectable()
export class AvaliationService {
  constructor(private prismaUfsm: PrismaUfsmService) {}

  async getAll(): Promise<Avaliation[]> {
    return await this.prismaUfsm.avaliation.findMany()
  }

  async getAllPagination(
    page = 1,
    perPage = 10,
  ): Promise<{
    data: Avaliation[]
    total: number
    page: number
    perPage: number
    lastPage: number
  }> {
    const skip = (page - 1) * perPage

    const [data, total] = await this.prismaUfsm.$transaction([
      this.prismaUfsm.avaliation.findMany({
        skip,
        take: perPage,
        orderBy: { idAvaliation: 'asc' },
      }),
      this.prismaUfsm.avaliation.count(),
    ])

    return {
      data,
      total,
      page,
      perPage,
      lastPage: Math.ceil(total / perPage),
    }
  }
}
