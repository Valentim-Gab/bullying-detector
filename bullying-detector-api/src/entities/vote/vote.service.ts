import { PrismaService } from 'nestjs-prisma'
import { PrismaUtil } from 'src/utils/prisma.util'
import { UpsertVoteDto } from './dto/upsert-vote.dto'
import { Injectable } from '@nestjs/common'
import { DetectionService } from '../detection/detection.service'
import { BullyingPhraseService } from '../bullying-phrase/bullying-phrase.service'
import { Detection } from '@prisma/client'

@Injectable()
export class VoteService {
  constructor(
    private prisma: PrismaService,
    private prismaUtil: PrismaUtil,
    private detectionService: DetectionService,
    private bullyingPhraseService: BullyingPhraseService,
  ) {}

  async upsert(userId: number, upsertVoteDto: UpsertVoteDto) {
    return this.prismaUtil.performOperation(
      'Não foi possível cadastrar avaliação',
      async () => {
        const previousVote = await this.findByUserDetection(
          userId,
          upsertVoteDto.detectionId,
        )

        const payload = {
          detectionId: upsertVoteDto.detectionId,
          voteClassification: upsertVoteDto.voteClassification,
          userId,
        }

        await this.prisma.vote.upsert({
          where: {
            userId: payload.userId,
            detectionId: payload.detectionId,
            idVote: previousVote?.idVote ?? 0,
          },
          create: payload,
          update: {
            voteClassification: payload.voteClassification,
          },
        })

        const detection = await this.detectionService.updateVote(
          upsertVoteDto.detectionId,
        )

        if (!detection) {
          throw new Error('Detecção não encontrada.')
        }

        return detection
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

  // async update(idVote: number, userId: number, updateVoteDto: UpdateVoteDto) {
  //   return this.prismaUtil.performOperation(
  //     'Não foi porrível atualizar o voto',
  //     async () => {
  //       const previousVote = await this.findOne(idVote)

  //       await this.prisma.vote.update({
  //         where: { idVote },
  //         data: {
  //           ...updateVoteDto,
  //           userId,
  //         },
  //       })

  //       await this.detectionService.updateVote(
  //         updateVoteDto.detectionId,
  //         (updateVoteDto.vote ? 1 : 0) - (previousVote?.vote ? 1 : 0),
  //         (!updateVoteDto.vote ? 1 : 0) - (!previousVote?.vote ? 1 : 0),
  //       )

  //       return { message: 'Voto atualizado com sucesso' }
  //     },
  //   )
  // }

  async delete(idVote: number, userId: number) {
    return this.prismaUtil.performOperation(
      'Não foi possível deletar a avaliação',
      async () => {
        const vote = await this.prisma.vote.delete({
          where: {
            idVote,
            userId,
          },
        })

        await this.detectionService.updateVote(vote.detectionId)

        return { message: 'Avaliação deletada com sucesso' }
      },
    )
  }
}
