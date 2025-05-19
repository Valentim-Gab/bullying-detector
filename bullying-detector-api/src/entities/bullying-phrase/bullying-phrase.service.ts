import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { PrismaUtil } from 'src/utils/prisma.util'
import { CreateBullyingPhraseDto } from './dto/create-bullying-phrase.dto'
import { bullyingPhrase } from '@prisma/client'

@Injectable()
export class BullyingPhraseService {
  constructor(
    private prisma: PrismaService,
    private prismaUtil: PrismaUtil,
  ) {}

  async create(createBullyingPhraseDto: CreateBullyingPhraseDto) {
    const newPhrase: Partial<bullyingPhrase> = {
      phrase: createBullyingPhraseDto.phrase,
      userDetect: true,
    }

    return await this.prismaUtil.performOperation(
      'Não foi possível criar a frase de assédio moral',
      async () => {
        return await this.prisma.bullyingPhrase.create({
          data: newPhrase,
        })
      },
    )
  }

  // async update(updatePhrase: UpdateBullyingPhraseDto, idPhrase: number) {
  //   const detection = await this.prisma.bullyingPhrase.findUnique({
  //     where: { idPhrase: idPhrase },
  //   })

  //   if (!detection) {
  //     throw new Error('Detecção não encontrada.')
  //   }

  //   const data: Partial<BullyingPhrase> = {
  //     approveUserList: updatePhrase.approve
  //       ? [...(detection.approveUserList || []), updatePhrase.username]
  //       : detection.approveUserList,
  //     rejectUserList: !updatePhrase.approve
  //       ? [...(detection.rejectUserList || []), updatePhrase.username]
  //       : detection.rejectUserList,
  //   }

  //   const newPhrase = await this.prismaUtil.performOperation(
  //     'Não foi possível atualizar a frase de assédio moral',
  //     async () => {
  //       return await this.prisma.bullyingPhrase.update({
  //         data: data,
  //         where: { idPhrase: idPhrase },
  //       })
  //     },
  //   )

  //   if (!newPhrase) {
  //     throw new BadRequestException(
  //       'Não foi possível atualizar a frase de assédio moral',
  //     )
  //   }

  //   return await this.audioService.updateUsername(
  //     updatePhrase.idDetection,
  //     idPhrase,
  //     updatePhrase.username,
  //     updatePhrase.approve,
  //   )
  // }
}
