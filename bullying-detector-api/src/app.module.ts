import { Module } from '@nestjs/common'
import { UserModule } from './entities/user/user.module'
import { AuthModule } from './security/auth/auth.module'
import { PrismaModule } from 'nestjs-prisma'
import { ConfigModule } from '@nestjs/config'
import { HttpModule } from '@nestjs/axios'
import { AvaliationModule } from './entities/avaliation/avaliation.module'
import { PrismaUfsmModule } from './connections/prisma-ufsm/prisma-ufsm.module'
import { DetectionModule } from './entities/detection/detection.module'
import { BullyingPhraseModule } from './entities/bullying-phrase/bullying-phrase.module'
import { VoteModule } from './entities/vote/vote.module'
import configuration from './config/configuration'

@Module({
  imports: [
    AuthModule,
    UserModule,
    DetectionModule,
    BullyingPhraseModule,
    VoteModule,
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
