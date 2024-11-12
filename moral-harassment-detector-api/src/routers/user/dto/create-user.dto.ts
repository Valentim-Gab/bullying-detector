import {
  IsArray,
  IsDate,
  IsISO8601,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
} from 'class-validator'

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  last_name: string

  @IsString()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  password: string

  @IsDate()
  @IsISO8601()
  date_birth: Date

  @IsPhoneNumber()
  phone_nmber: string

  @IsArray()
  @IsNotEmpty()
  role: string[]
}
