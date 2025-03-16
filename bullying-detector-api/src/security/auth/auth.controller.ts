import {
  Controller,
  Post,
  UseGuards,
  Res,
  Head,
  Patch,
  Param,
  Body,
  ValidationPipe,
} from '@nestjs/common'
import { LocalAuthGuard } from '../guards/local-auth.guard'
import { AuthService } from './auth.service'
import { ReqUser } from 'src/decorators/req-user.decorator'
import { Response } from 'express'
import { UserService } from 'src/entities/user/user.service'
import { Payload } from './auth.interface'
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard'
import { Users } from '@prisma/client'
import { Role } from 'src/enums/Role'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { RolesGuard } from '../guards/roles.guard'
import { Roles } from 'src/decorators/roles.decorator'
import { ChangePasswordDto } from './dtos/change-password.dto'

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  public login(@Res() res: Response, @ReqUser() user: Users) {
    const tokens = this.authService.jwtSign(user)

    res.json({ user, tokens })
  }

  @Post('/refresh')
  @UseGuards(JwtRefreshGuard)
  public async refresh(@Res() res: Response, @ReqUser() payload: Payload) {
    const user = await this.userService.findOne(payload.id)

    this.login(res, user)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin)
  @Head('/check')
  public check() {
    return
  }

  @Patch('/confirm/:token')
  async confirmEmail(@Param('token') token: string) {
    return await this.authService.confirmEmail(token)
  }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.User, Role.Admin)
  // @Post('/send-verify-email')
  // async sendVerifyEmail(
  //   @ReqUser() user: Payload,
  // ): Promise<{ message: string }> {
  //   return await this.authService.sendVerifyEmail(user.username)
  // }

  // @Post('/send-recover-email')
  // async sendRecoverPasswordEmail(
  //   @Body('email') email: string,
  // ): Promise<{ message: string }> {
  //   await this.authService.sendRecoverPasswordEmail(email)

  //   return {
  //     message: 'Foi enviado um email com instruções para resetar sua senha',
  //   }
  // }

  @Patch('/reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body(ValidationPipe) changePasswordDto: ChangePasswordDto,
  ) {
    await this.authService.resetPassword(token, changePasswordDto)

    return {
      message: 'Senha resetada com sucesso',
    }
  }
}
