import { forwardRef, Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { PrismaService } from 'nestjs-prisma'
import { BCryptService } from 'src/security/private/bcrypt.service'
import { ImageUtil } from 'src/utils/image-util/image.util'
import { PrismaUtil } from 'src/utils/prisma.util'
import { AuthModule } from 'src/security/auth/auth.module'

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [UserController],
  providers: [UserService, PrismaService, BCryptService, ImageUtil, PrismaUtil],
  exports: [UserService],
})
export class UserModule {}
