import { PartialType } from '@nestjs/mapped-types'
import { CreateUserDto } from './create-user.dto'
import { IsBoolean } from 'class-validator'

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsBoolean()
  verified_email: boolean
}
