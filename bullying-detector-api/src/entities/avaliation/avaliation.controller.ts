import { Controller, Get } from '@nestjs/common'
import { AvaliationService } from './avaliation.service'

@Controller('avaliation')
export class AvaliationController {
  constructor(private readonly avaliationService: AvaliationService) {}

  @Get()
  getAll() {
    return this.avaliationService.getAll()
  }
}
