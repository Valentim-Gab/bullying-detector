import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { PrismaUtil } from 'src/utils/prisma.util'
import { CreateHarassmentPhraseDto } from './dto/create-harasment-phrase.dto'

@Injectable()
export class HarassmentPhraseService {
  constructor(
    private prisma: PrismaService,
    private prismaUtil: PrismaUtil,
  ) {}

  async create(createHarassmentPhraseDto: CreateHarassmentPhraseDto) {
    return this.prismaUtil.performOperation(
      'Não foi possível criar a frase de assédio moral',
      async () => {
        return await this.prisma.harassmentPhrase.create({
          data: createHarassmentPhraseDto,
        })
      },
    )
  }
}
