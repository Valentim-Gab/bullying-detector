import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { PrismaUtil } from 'src/utils/prisma.util'
import { CreateHarassmentPhraseDto } from './dto/create-harasment-phrase.dto'
import { AudioService } from '../audio/audio.service'

@Injectable()
export class HarassmentPhraseService {
  constructor(
    private prisma: PrismaService,
    private prismaUtil: PrismaUtil,
    private audioService: AudioService,
  ) {}

  async create(createHarassmentPhraseDto: CreateHarassmentPhraseDto) {
    const newPhrase = {
      phrase: createHarassmentPhraseDto.phrase,
      username: createHarassmentPhraseDto.username,
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
      phrase.username,
    )
  }
}
