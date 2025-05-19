import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Put,
  Post,
} from '@nestjs/common'
import { VoteService } from './vote.service'
import { JwtAuthGuard } from 'src/security/guards/jwt-auth.guard'
import { RolesGuard } from 'src/security/guards/roles.guard'
import { Roles } from 'src/decorators/roles.decorator'
import { Role } from 'src/enums/Role'
import { ValidationPipe } from 'src/pipes/validation.pipe'
import { CreateVoteDto } from './dto/create-vote.dto'
import { ReqUser } from 'src/decorators/req-user.decorator'
import { Users } from '@prisma/client'
import { UpdateVoteDto } from './dto/update-vote.dto'

@Controller('vote')
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.User)
  @Post()
  async create(
    @ReqUser() user: Users,
    @Body(new ValidationPipe()) createVoteDto: CreateVoteDto,
  ) {
    return this.voteService.create(user.id, createVoteDto)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get()
  findAll() {
    return this.voteService.findAll()
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get(':idVote')
  findOne(@Param('idVote', ParseIntPipe) idVote: number) {
    return this.voteService.findOne(idVote)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin)
  @Get('@me/:id_detection')
  findOneMe(
    @ReqUser() user: Users,
    @Param('id_detection', ParseIntPipe) detectionId: number,
  ) {
    return this.voteService.findByUserDetection(user.id, detectionId)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin)
  @Put(':idVote')
  update(
    @ReqUser() user: Users,
    @Param('idVote', ParseIntPipe) idVote: number,
    @Body(new ValidationPipe()) updateVoteDto: UpdateVoteDto,
  ) {
    return this.voteService.update(idVote, user.id, updateVoteDto)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin)
  @Delete(':idVote')
  deleteMe(
    @ReqUser() user: Users,
    @Param('idVote', ParseIntPipe) idVote: number,
  ) {
    return this.voteService.delete(idVote, user.id)
  }
}
