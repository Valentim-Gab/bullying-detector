import { PrismaService } from 'nestjs-prisma'
import { PrismaUtil } from 'src/utils/prisma.util'
import { CreateVoteDto } from './dto/create-vote.dto'
import { UpdateVoteDto } from './dto/update-vote.dto'
import { Injectable } from '@nestjs/common'
import { DetectionService } from '../detection/detection.service'

@Injectable()
export class VoteService {
  constructor(
    private prisma: PrismaService,
    private prismaUtil: PrismaUtil,
    private detectionService: DetectionService,
  ) {}

  async create(userId: number, createVoteDto: CreateVoteDto) {
    return this.prismaUtil.performOperation(
      'Não foi possível cadastrar voto',
      async () => {
        await this.prisma.vote.create({
          data: {
            ...createVoteDto,
            userId,
          },
        })

        await this.detectionService.updateVote(
          createVoteDto.detectionId,
          createVoteDto.vote ? 1 : 0,
          !createVoteDto.vote ? 1 : 0,
        )

        return { message: 'Voto cadastrado com sucesso' }
      },
    )
  }

  async findAll() {
    return this.prismaUtil.performOperation(
      'Não foi possível buscar pelos votos',
      async () => {
        return await this.prisma.vote.findMany()
      },
    )
  }

  async findOne(idVote: number) {
    return this.prismaUtil.performOperation(
      'Não foi possível buscar pelo voto',
      async () => {
        return this.prisma.vote.findUnique({
          where: { idVote: idVote },
        })
      },
    )
  }

  findByUserDetection(userId: number, detectionId: number) {
    return this.prismaUtil.performOperation(
      'Não foi possível buscar pelo voto',
      async () => {
        return this.prisma.vote.findFirst({ where: { userId, detectionId } })
      },
    )
  }

  async update(idVote: number, userId: number, updateVoteDto: UpdateVoteDto) {
    return this.prismaUtil.performOperation(
      'Não foi porrível atualizar o voto',
      async () => {
        const previousVote = await this.findOne(idVote)

        await this.prisma.vote.update({
          where: { idVote },
          data: {
            ...updateVoteDto,
            userId,
          },
        })

        await this.detectionService.updateVote(
          updateVoteDto.detectionId,
          (updateVoteDto.vote ? 1 : 0) - (previousVote?.vote ? 1 : 0),
          (!updateVoteDto.vote ? 1 : 0) - (!previousVote?.vote ? 1 : 0),
        )

        return { message: 'Voto atualizado com sucesso' }
      },
    )
  }

  async delete(idVote: number, userId: number) {
    return this.prismaUtil.performOperation(
      'Não foi possível deletar o voto',
      async () => {
        const vote = await this.prisma.vote.delete({
          where: { idVote, userId },
        })

        await this.detectionService.updateVote(
          vote.detectionId,
          vote.vote ? -1 : 0,
          !vote.vote ? -1 : 0,
        )

        return { message: 'Voto deletado com sucesso' }
      },
    )
  }
}
