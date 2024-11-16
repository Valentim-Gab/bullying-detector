import { Body, Controller, Post } from '@nestjs/common'
import { HarassmentPhraseService } from './harasment-phrase.service'
import { ValidationPipe } from 'src/pipes/validation.pipe'
import { CreateHarassmentPhraseDto } from './dto/create-harasment-phrase.dto'

@Controller('harassment-phrase')
export class HarassmentPhraseController {
  constructor(
    private readonly harassmentPhraseService: HarassmentPhraseService,
  ) {}

  @Post()
  async create(
    @Body(new ValidationPipe())
    createHarassmentPhraseDto: CreateHarassmentPhraseDto,
  ) {
    return this.harassmentPhraseService.create(createHarassmentPhraseDto)
  }
}
