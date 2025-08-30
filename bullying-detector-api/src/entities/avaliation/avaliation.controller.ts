import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common'
import { AvaliationService } from './avaliation.service'
import { Roles } from 'src/decorators/roles.decorator'
import { Role } from 'src/enums/Role'
import { JwtAuthGuard } from 'src/security/guards/jwt-auth.guard'
import { RolesGuard } from 'src/security/guards/roles.guard'
import { AvaliationDetectionDto } from './dto/avaliation-detection.dto'

@Controller('avaliation')
export class AvaliationController {
  constructor(private readonly avaliationService: AvaliationService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin)
  @Get()
  getAll() {
    return this.avaliationService.getAll()
  }

  @Get('pagination')
  async getAllPagination(
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
    @Query('search') search?: string,
  ) {
    const pageNumber = Number(page)
    const perPageNumber = Number(perPage)

    if (
      isNaN(pageNumber) ||
      isNaN(perPageNumber) ||
      pageNumber < 1 ||
      perPageNumber < 1
    ) {
      throw new BadRequestException(
        'A página e o limite por página devem ser números maiores que zero.',
      )
    }

    return this.avaliationService.getAllPagination(
      pageNumber,
      perPageNumber,
      search,
    )
  }

  @Patch('detection')
  async updateDetection(
    @Body(new ValidationPipe()) avaliationDetection: AvaliationDetectionDto,
  ) {
    return await this.avaliationService.updateDetection(avaliationDetection)
  }

  @Patch('detection/batch')
  async updateDetectionBatch(
    @Body(new ValidationPipe()) avaliationDetections: AvaliationDetectionDto[],
  ) {
    return await this.avaliationService.updateDetectionBatch(
      avaliationDetections,
    )
  }
}
