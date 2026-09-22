import { Injectable } from '@nestjs/common'
import { Avaliation, Prisma } from 'prisma/generated/clientUfsm'
import { PrismaUfsmService } from 'src/connections/prisma-ufsm/prisma-ufsm.service'
import { AvaliationDetectionDto } from './dto/avaliation-detection.dto'

@Injectable()
export class AvaliationService {
  constructor(private prismaUfsm: PrismaUfsmService) {}

  async getAll(): Promise<Avaliation[]> {
    return await this.prismaUfsm.avaliation.findMany()
  }

  async getAllPagination(
    page = 1,
    perPage = 10,
    search?: string,
    detected?: boolean,
  ): Promise<{
    data: Avaliation[]
    total: number
    page: number
    perPage: number
    lastPage: number
  }> {
    const skip = (page - 1) * perPage

    const where: Prisma.AvaliationWhereInput = search
      ? {
          mainText: {
            contains: search,
            mode: 'insensitive',
          },
        }
      : {}

    if (detected != null) {
      where.detected = detected || null
    }

    const [data, total] = await this.prismaUfsm.$transaction([
      this.prismaUfsm.avaliation.findMany({
        skip,
        take: perPage,
        where,
        orderBy: { idAvaliation: 'desc' },
      }),
      this.prismaUfsm.avaliation.count({ where }),
    ])

    return {
      data,
      total,
      page,
      perPage,
      lastPage: Math.ceil(total / perPage),
    }
  }

  async updateDetection(
    avaliationDetection: AvaliationDetectionDto,
  ): Promise<Avaliation> {
    return await this.prismaUfsm.avaliation.update({
      where: { idAvaliation: avaliationDetection.id },
      data: {
        detected: true,
        bullyingClassification: avaliationDetection.avaliation,
      },
    })
  }

  async updateDetectionBatch(
    avaliationDetections: AvaliationDetectionDto[],
  ): Promise<Avaliation[]> {
    await this.prismaUfsm.$transaction(
      avaliationDetections.map((d) =>
        this.prismaUfsm.avaliation.update({
          where: { idAvaliation: d.id },
          data: {
            detected: true,
            bullyingClassification: d.avaliation,
          },
        }),
      ),
    )

    return this.prismaUfsm.avaliation.findMany({
      where: {
        idAvaliation: { in: avaliationDetections.map((d) => d.id) },
      },
    })
  }
}
