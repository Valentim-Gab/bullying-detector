import { Controller, Get, UseGuards } from '@nestjs/common'
import { AvaliationService } from './avaliation.service'
import { Roles } from 'src/decorators/roles.decorator'
import { Role } from 'src/enums/Role'
import { JwtAuthGuard } from 'src/security/guards/jwt-auth.guard'
import { RolesGuard } from 'src/security/guards/roles.guard'

@Controller('avaliation')
export class AvaliationController {
  constructor(private readonly avaliationService: AvaliationService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin)
  @Get()
  getAll() {
    return this.avaliationService.getAll()
  }
}
