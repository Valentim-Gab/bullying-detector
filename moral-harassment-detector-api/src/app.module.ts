import { Module } from '@nestjs/common'
import { UserModule } from './routers/user/user.module'
import { AuthModule } from './security/auth/auth.module'
import { PrismaModule } from 'nestjs-prisma'
import { ConfigModule } from '@nestjs/config'
import { AudioModule } from './routers/audio/audio.module'
import configuration from './config/configuration'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [
    AuthModule,
    UserModule,
    AudioModule,
    HttpModule,
    PrismaModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
  ],
})
export class AppModule {}
