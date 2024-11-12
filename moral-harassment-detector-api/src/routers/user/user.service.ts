import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { PrismaService } from 'nestjs-prisma'
import { BCryptService } from 'src/security/private/bcrypt.service'
import { users } from '@prisma/client'
import { Role } from 'src/enums/Role'
import { UpdateUserDto } from './dto/update-user.dto'
import { PrismaUtil } from 'src/utils/prisma.util'
import { ImageUtil } from 'src/utils/image-util/image.util'
import { CompressImageSaveStrategy } from 'src/utils/image-util/strategies/compress-image-save.strategy'
import { DefaultImageSaveStrategy } from 'src/utils/image-util/strategies/default-image-save.strategy'
import { Response } from 'express'

@Injectable()
export class UserService {
  private selectedColumns = {
    id: true,
    name: true,
    last_name: true,
    email: true,
    date_birth: true,
    phone_number: true,
    role: true,
    avatar: true,
    verified_email: true,
  }

  constructor(
    private prisma: PrismaService,
    private bcrypt: BCryptService,
    private prismaUtil: PrismaUtil,
    private imageUtil: ImageUtil,
  ) {}

  async create(createUserDto: CreateUserDto) {
    return this.prismaUtil.performOperation(
      'Não foi possível cadastrar usuário',
      async () => {
        const encryptPassword = await this.bcrypt.encrypt(
          createUserDto.password,
        )

        const date_birth = createUserDto.date_birth
          ? new Date(createUserDto.date_birth)
          : null

        const userDto = {
          ...createUserDto,
          password: encryptPassword,
          date_birth: date_birth,
          role: [Role.User],
        }

        const user = await this.prisma.users.create({
          data: userDto,
          select: this.selectedColumns,
        })

        return user
      },
    )
  }

  async findAll(): Promise<users[]> {
    return this.prismaUtil.performOperation(
      'Não foi possível buscar pelos usuários',
      async () => {
        return await this.prisma.users.findMany({
          select: this.selectedColumns,
        })
      },
    )
  }

  async findOne(idUser: number) {
    return this.prismaUtil.performOperation(
      'Não foi possível buscar pelo usuário',
      async () => {
        return this.prisma.users.findUnique({
          where: { id: idUser },
          select: this.selectedColumns,
        })
      },
    )
  }

  findByEmail(email: string) {
    return this.prismaUtil.performOperation(
      'Não foi possível buscar pelo usuário',
      async () => {
        return this.prisma.users.findFirst({ where: { email } })
      },
    )
  }

  async update(idUser: number, updateUserDto: UpdateUserDto) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...data } = updateUserDto

    return this.prismaUtil.performOperation(
      'Não foi porrível atualizar o usuário',
      async () => {
        return this.prisma.users.update({
          where: { id: idUser },
          data: data,
          select: this.selectedColumns,
        })
      },
    )
  }

  async updatePassword(idUser: number, password: string) {
    return this.prismaUtil.performOperation(
      'Não foi possível atualizar a senha do usuário',
      async () => {
        const encryptPassword = await this.bcrypt.encrypt(password)

        return this.prisma.users.update({
          where: { id: idUser },
          data: { password: encryptPassword },
          select: this.selectedColumns,
        })
      },
    )
  }

  async delete(userId: number) {
    return this.prismaUtil.performOperation(
      'Não foi possível deletar o usuário',
      async () => {
        return this.prisma.users.delete({
          where: { id: userId },
          select: this.selectedColumns,
        })
      },
    )
  }

  async findImg(user: users, res: Response) {
    const userDB: users = await this.findOne(user.id)

    try {
      const bytes = await this.imageUtil.get(userDB.avatar, 'user')

      res.setHeader('Content-Type', 'avatar/*')
      res.send(bytes)
    } catch (error) {
      throw new BadRequestException(`Foto não encontrada`)
    }
  }

  async updateImg(image: Express.Multer.File, user: users) {
    const userId = user.id
    const strategy =
      image.size > 1_000_000
        ? new CompressImageSaveStrategy(this.imageUtil)
        : new DefaultImageSaveStrategy(this.imageUtil)

    this.imageUtil.setSaveStrategy(strategy)

    const filename = await this.imageUtil.save(image, userId, 'user')

    return this.prismaUtil.performOperation(
      'Não foi possível atualizar seu avatar',
      async () => {
        return this.prisma.users.update({
          where: { id: userId },
          data: { avatar: filename },
          select: this.selectedColumns,
        })
      },
    )
  }
}
