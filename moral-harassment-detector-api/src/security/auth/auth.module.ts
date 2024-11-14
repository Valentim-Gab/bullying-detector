import { forwardRef, Global, Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UserModule } from 'src/entities/user/user.module'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { BCryptService } from '../private/bcrypt.service'
import { LocalStrategy } from './strategies/local.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { ConfigService } from '@nestjs/config'
import { AuthConstants } from 'src/constants/auth.constant'
import JwtRefreshStrategy from './strategies/jwt-refresh.stratey'

@Global()
@Module({
  imports: [
    forwardRef(() => UserModule),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get('secret'),
        signOptions: { expiresIn: AuthConstants.ACCESS_TOKEN_EXPIRES },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    BCryptService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
