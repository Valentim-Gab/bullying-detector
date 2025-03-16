import { Module } from '@nestjs/common'
import { UserModule } from './entities/user/user.module'
import { AuthModule } from './security/auth/auth.module'
import { PrismaModule } from 'nestjs-prisma'
import { ConfigModule } from '@nestjs/config'
import { AudioModule } from './entities/audio/audio.module'
import { HttpModule } from '@nestjs/axios'
import { BullyingPhraseModule } from './entities/harasment-phrase/bullying-phrase.module'
import { AvaliationModule } from './entities/avaliation/avaliation.module'
import { PrismaUfsmModule } from './connections/prisma-ufsm/prisma-ufsm.module'
import configuration from './config/configuration'

@Module({
  imports: [
    AuthModule,
    UserModule,
    AudioModule,
    BullyingPhraseModule,
    AvaliationModule,
    PrismaUfsmModule,
    HttpModule,
    PrismaModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
  ],
})
export class AppModule {}
