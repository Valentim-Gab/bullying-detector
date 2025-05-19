import { Body, Controller, Post } from '@nestjs/common'
import { BullyingPhraseService } from './bullying-phrase.service'
import { ValidationPipe } from 'src/pipes/validation.pipe'
import { CreateBullyingPhraseDto } from './dto/create-bullying-phrase.dto'

@Controller('Bullying-phrase')
export class BullyingPhraseController {
  constructor(private readonly bullyingPhraseService: BullyingPhraseService) {}

  @Post()
  async create(
    @Body(new ValidationPipe())
    createBullyingPhraseDto: CreateBullyingPhraseDto,
  ) {
    return this.bullyingPhraseService.create(createBullyingPhraseDto)
  }

  // @Patch(':id')
  // async update(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() updatePhrase: UpdateBullyingPhraseDto,
  // ) {
  //   return this.bullyingPhraseService.update(updatePhrase, id)
  // }
}
