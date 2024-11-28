import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { PrismaUtil } from 'src/utils/prisma.util'
import { UpdateHarassmentPhraseDto } from './dto/update-harasment-phrase.dto'
import { AudioService } from '../audio/audio.service'
import { harassmentPhrase } from '@prisma/client'
import { CreateHarassmentPhraseDto } from './dto/create-harasment-phrase.dto'

@Injectable()
export class HarassmentPhraseService {
  constructor(
    private prisma: PrismaService,
    private prismaUtil: PrismaUtil,
    private audioService: AudioService,
  ) {}

  async create(createHarassmentPhraseDto: CreateHarassmentPhraseDto) {
    const newPhrase: Partial<harassmentPhrase> = {
      phrase: createHarassmentPhraseDto.phrase,
      approveUserList: [createHarassmentPhraseDto.username],
      userDetect: true,
    }

    const phrase = await this.prismaUtil.performOperation(
      'Não foi possível criar a frase de assédio moral',
      async () => {
        return await this.prisma.harassmentPhrase.create({
          data: newPhrase,
        })
      },
    )

    if (!phrase) {
      throw new BadRequestException(
        'Não foi possível criar a frase de assédio moral',
      )
    }

    return await this.audioService.updateUsername(
      createHarassmentPhraseDto.idDetection,
      phrase.idPhrase,
      createHarassmentPhraseDto.username,
      true,
    )
  }

  async update(updatePhrase: UpdateHarassmentPhraseDto, idPhrase: number) {
    const detection = await this.prisma.harassmentPhrase.findUnique({
      where: { idPhrase: idPhrase },
    })

    if (!detection) {
      throw new Error('Detecção não encontrada.')
    }

    const data: Partial<harassmentPhrase> = {
      approveUserList: updatePhrase.approve
        ? [...(detection.approveUserList || []), updatePhrase.username]
        : detection.approveUserList,
      rejectUserList: !updatePhrase.approve
        ? [...(detection.rejectUserList || []), updatePhrase.username]
        : detection.rejectUserList,
    }

    const newPhrase = await this.prismaUtil.performOperation(
      'Não foi possível atualizar a frase de assédio moral',
      async () => {
        return await this.prisma.harassmentPhrase.update({
          data: data,
          where: { idPhrase: idPhrase },
        })
      },
    )

    if (!newPhrase) {
      throw new BadRequestException(
        'Não foi possível atualizar a frase de assédio moral',
      )
    }

    return await this.audioService.updateUsername(
      updatePhrase.idDetection,
      idPhrase,
      updatePhrase.username,
      updatePhrase.approve,
    )
  }
}
